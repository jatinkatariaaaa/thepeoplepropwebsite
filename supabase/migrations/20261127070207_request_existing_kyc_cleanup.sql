create function public.request_kyc_storage_cleanup(
  p_document_id uuid, p_admin_id uuid, p_admin_email text
)
returns table (id uuid, storage_cleanup_completed_at timestamptz)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_document public.kyc_documents%rowtype;
  v_paths text[];
  v_requested_at timestamptz := statement_timestamp();
begin
  select d.* into v_document
  from public.kyc_documents d
  where d.id = p_document_id and d.status = 'approved'
  for update of d;

  if not found then
    return;
  end if;

  if v_document.storage_cleanup_requested_at is null then
    -- Use the same lock as the trigger that guards new document attachments.
    perform pg_advisory_xact_lock(hashtextextended(v_document.user_id::text, 20261127));
    v_paths := array_remove(array[
      v_document.front_image_url, v_document.back_image_url, v_document.selfie_image_url
    ], null);

    if cardinality(v_paths) = 0 or exists (
      select 1 from unnest(v_paths) f(path)
      where f.path not like (v_document.user_id::text || '/%') or strpos(f.path, '..') > 0
    ) then
      raise exception 'This request has no eligible private attachments for removal.' using errcode = '22023';
    end if;

    if not exists (
      select 1 from storage.buckets b where b.id = 'kyc-documents' and b.public = false
        and coalesce(to_jsonb(b)->>'versioning_status', 'DISABLED') = 'DISABLED'
    ) then
      raise exception 'Permanent removal is unavailable for this storage bucket.' using errcode = '22023';
    end if;

    if exists (
      select 1 from storage.objects o where o.bucket_id = 'kyc-documents' and o.name = any(v_paths)
        and o.owner_id is distinct from v_document.user_id::text
    ) then
      raise exception 'The stored files could not be matched to this request.' using errcode = '22023';
    end if;

    if exists (
      select 1 from public.kyc_documents other
      where other.id <> p_document_id
        and array[other.front_image_url, other.back_image_url, other.selfie_image_url] && v_paths
    ) then
      raise exception 'A file is also linked to another KYC request.' using errcode = '22023';
    end if;

    update public.kyc_documents d set storage_cleanup_requested_at = v_requested_at
    where d.id = p_document_id;

    insert into public.payment_activity_logs (
      admin_id, admin_email, action, entity_type, entity_id, new_value
    ) values (
      p_admin_id, p_admin_email, 'kyc_archive_cleanup_requested', 'kyc_document', p_document_id::text,
      jsonb_build_object('storage_cleanup_requested_at', v_requested_at)
    );
  end if;

  return query select v_document.id, v_document.storage_cleanup_completed_at;
end;
$$;

revoke all on function public.request_kyc_storage_cleanup(uuid, uuid, text) from public, anon, authenticated;
grant execute on function public.request_kyc_storage_cleanup(uuid, uuid, text) to service_role;
