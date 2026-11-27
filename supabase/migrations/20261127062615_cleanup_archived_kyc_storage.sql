alter table public.kyc_documents
  add column storage_cleanup_requested_at timestamptz,
  add column storage_cleanup_completed_at timestamptz,
  add constraint kyc_storage_cleanup_requires_approval check (
    (storage_cleanup_requested_at is null and storage_cleanup_completed_at is null)
    or (storage_cleanup_requested_at is not null and status = 'approved')
  );

-- Keep the cleanup reservation until all the archived paths are gone. Serialize
-- new references and reservations for one user, without locking during API calls.
create function private.guard_kyc_storage_cleanup()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_previous_paths text[] := array[]::text[];
  v_cleanup_changed boolean;
  v_path text;
begin
  if tg_op = 'DELETE' then
    if old.storage_cleanup_requested_at is not null and old.storage_cleanup_completed_at is null
      and current_user in ('anon', 'authenticated') then
      raise exception 'KYC storage cleanup is in progress' using errcode = '42501';
    end if;
    return old;
  end if;

  if tg_op = 'INSERT' then
    v_cleanup_changed := new.storage_cleanup_requested_at is not null
      or new.storage_cleanup_completed_at is not null;
  else
    v_previous_paths := array[old.front_image_url, old.back_image_url, old.selfie_image_url];
    v_cleanup_changed := new.storage_cleanup_requested_at is distinct from old.storage_cleanup_requested_at
      or new.storage_cleanup_completed_at is distinct from old.storage_cleanup_completed_at;
    if old.storage_cleanup_requested_at is not null
      and (new.user_id is distinct from old.user_id
        or array[new.front_image_url, new.back_image_url, new.selfie_image_url] is distinct from v_previous_paths)
      and not (new.user_id = old.user_id and new.storage_cleanup_completed_at is not null
        and new.front_image_url is null and new.back_image_url is null and new.selfie_image_url is null) then
      raise exception 'KYC storage cleanup has reserved these attachments' using errcode = '23514';
    end if;
  end if;

  if v_cleanup_changed and current_user in ('anon', 'authenticated') then
    raise exception 'Only the server may manage KYC storage cleanup' using errcode = '42501';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(new.user_id::text, 20261127));

  for v_path in
    select f.path
    from unnest(array[new.front_image_url, new.back_image_url, new.selfie_image_url]) f(path)
    where f.path is not null and not coalesce(f.path = any(v_previous_paths), false)
  loop
    if v_path like 'https://%' or v_path like 'http://%' then
      -- Retain compatibility with old records that used externally hosted links.
      continue;
    end if;

    if v_path not like (new.user_id::text || '/%') or strpos(v_path, '..') > 0
      or not exists (
        select 1 from storage.objects o
        where o.bucket_id = 'kyc-documents' and o.name = v_path and o.owner_id = new.user_id::text
      ) or exists (
        select 1 from public.kyc_documents d
        where d.user_id = new.user_id and d.id <> new.id
          and d.storage_cleanup_requested_at is not null and d.storage_cleanup_completed_at is null
          and v_path in (d.front_image_url, d.back_image_url, d.selfie_image_url)
      ) then
      raise exception 'KYC attachment is unavailable for submission' using errcode = '23514';
    end if;
  end loop;

  return new;
end;
$$;

create trigger trg_guard_kyc_storage_cleanup
before insert or delete or update of user_id, front_image_url, back_image_url, selfie_image_url,
  storage_cleanup_requested_at, storage_cleanup_completed_at
on public.kyc_documents for each row execute function private.guard_kyc_storage_cleanup();

create function public.approve_kyc_batch_archived(
  p_document_ids uuid[], p_admin_id uuid, p_admin_email text, p_admin_notes text default null
)
returns table (id uuid, reviewed_at timestamptz)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_approved_ids uuid[];
begin
  select array_agg(a.id) into v_approved_ids
  from public.approve_kyc_batch(p_document_ids, p_admin_id, p_admin_email) a;

  return query
    update public.kyc_documents d
    set storage_cleanup_requested_at = d.reviewed_at,
        admin_notes = case when cardinality(p_document_ids) = 1
          then coalesce(p_admin_notes, d.admin_notes) else d.admin_notes end
    where d.id = any(v_approved_ids) and d.status = 'approved'
    returning d.id, d.reviewed_at;
end;
$$;

create function public.kyc_cleanup_candidates(p_document_ids uuid[])
returns table (document_id uuid, path text)
language sql
stable
security invoker
set search_path = ''
as $$
  select distinct d.id, o.name
  from public.kyc_documents d
  join storage.objects o on o.bucket_id = 'kyc-documents' and o.owner_id = d.user_id::text
    and o.name in (d.front_image_url, d.back_image_url, d.selfie_image_url)
  join storage.buckets b on b.id = o.bucket_id
  where d.id = any(p_document_ids) and d.status = 'approved'
    and d.storage_cleanup_requested_at is not null and d.storage_cleanup_completed_at is null
    and coalesce(to_jsonb(b)->>'versioning_status', 'DISABLED') = 'DISABLED'
    and o.name like (d.user_id::text || '/%') and strpos(o.name, '..') = 0
    and not exists (
      select 1 from public.kyc_documents other
      where other.id <> d.id and o.name in (other.front_image_url, other.back_image_url, other.selfie_image_url)
    );
$$;

create function public.complete_kyc_storage_cleanup(p_document_ids uuid[])
returns table (id uuid)
language plpgsql
security invoker
set search_path = ''
as $$
begin
  update public.kyc_documents d
  set front_image_url = null, back_image_url = null, selfie_image_url = null,
      storage_cleanup_completed_at = statement_timestamp()
  where d.id = any(p_document_ids) and d.status = 'approved'
    and d.storage_cleanup_requested_at is not null and d.storage_cleanup_completed_at is null
    and exists (
      select 1 from storage.buckets b where b.id = 'kyc-documents'
        and coalesce(to_jsonb(b)->>'versioning_status', 'DISABLED') = 'DISABLED'
    )
    and not exists (
      select 1 from unnest(array[d.front_image_url, d.back_image_url, d.selfie_image_url]) f(path)
      where f.path is not null and (
        f.path not like (d.user_id::text || '/%') or strpos(f.path, '..') > 0
        or exists (select 1 from storage.objects o where o.bucket_id = 'kyc-documents' and o.name = f.path)
      )
    );

  return query
    select d.id from public.kyc_documents d
    where d.id = any(p_document_ids) and d.status = 'approved'
      and d.storage_cleanup_requested_at is not null and d.storage_cleanup_completed_at is not null;
end;
$$;

revoke all on function private.guard_kyc_storage_cleanup() from public, anon, authenticated;
revoke all on function public.approve_kyc_batch_archived(uuid[], uuid, text, text) from public, anon, authenticated;
revoke all on function public.kyc_cleanup_candidates(uuid[]) from public, anon, authenticated;
revoke all on function public.complete_kyc_storage_cleanup(uuid[]) from public, anon, authenticated;
grant execute on function public.approve_kyc_batch_archived(uuid[], uuid, text, text) to service_role;
grant execute on function public.kyc_cleanup_candidates(uuid[]) to service_role;
grant execute on function public.complete_kyc_storage_cleanup(uuid[]) to service_role;
