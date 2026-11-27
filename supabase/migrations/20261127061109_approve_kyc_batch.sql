create or replace function public.approve_kyc_batch(
  p_document_ids uuid[],
  p_admin_id uuid,
  p_admin_email text
)
returns table (id uuid, reviewed_at timestamptz)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_reviewed_at timestamptz := statement_timestamp();
begin
  if coalesce(cardinality(p_document_ids), 0) not between 1 and 200 then
    raise exception 'Invalid KYC batch size' using errcode = '22023';
  end if;

  -- Serialize review status changes in a consistent user order. A fresh snapshot
  -- after acquiring the locks lets us recheck the latest submitted document.
  perform p.id
  from public.profiles p
  where p.kyc_status = 'pending'
    and exists (
      select 1 from public.kyc_documents d
      where d.id = any(p_document_ids) and d.user_id = p.id and d.status = 'pending'
    )
  order by p.id
  for update of p;

  return query
  with eligible as materialized (
    select d.id
    from public.kyc_documents d
    join public.profiles p on p.id = d.user_id and p.kyc_status = 'pending'
    cross join lateral (
      select case when d.document_type = 'passport'
        then array[d.front_image_url, d.selfie_image_url]
        else array[d.front_image_url, d.back_image_url, d.selfie_image_url]
      end as paths
    ) required_files
    where d.id = any(p_document_ids)
      and d.status = 'pending'
      and (d.expires_at is null or d.expires_at > v_reviewed_at)
      and d.document_type in ('passport', 'national_id', 'driving_license')
      and d.id = (
        select latest.id from public.kyc_documents latest
        where latest.user_id = d.user_id
        order by latest.created_at desc nulls last, latest.id desc
        limit 1
      )
      and cardinality(required_files.paths) = (
        select count(distinct o.name)
        from storage.objects o
        where o.bucket_id = 'kyc-documents'
          and o.owner_id = d.user_id::text
          and split_part(o.name, '/', 1) = d.user_id::text
          and o.name = any(required_files.paths)
      )
    order by d.id
    for update of d
  ), approved as (
    update public.kyc_documents d
      set status = 'approved', reviewed_by = p_admin_id, reviewed_at = v_reviewed_at,
          rejection_reason = null
      from eligible e
      where d.id = e.id and d.status = 'pending'
      returning d.id as document_id, d.user_id, d.reviewed_at as decision_time
  ), profiles_updated as (
    update public.profiles p set kyc_status = 'approved'
      from approved a where p.id = a.user_id
  ), sessions_updated as (
    update public.kyc_verification_sessions s
      set overall_status = 'approved', approved_at = v_reviewed_at
      from approved a where s.user_id = a.user_id
  ), audit_written as (
    insert into public.payment_activity_logs (
      admin_id, admin_email, action, entity_type, entity_id, old_value, new_value
    )
    select p_admin_id, p_admin_email, 'kyc_bulk_approve', 'kyc_document', a.document_id::text,
      jsonb_build_object('status', 'pending'),
      jsonb_build_object('status', 'approved', 'reviewed_by', p_admin_id, 'reviewed_at', a.decision_time)
    from approved a
  ), notifications_written as (
    insert into public.user_notifications (user_id, type, title, body, link)
    select a.user_id, 'kyc', 'Identity verified',
      'Your identity is verified. Payouts can now be sent to you.', '/dashboard/settings'
    from approved a
  )
  select a.document_id, a.decision_time from approved a;
end;
$$;

revoke all on function public.approve_kyc_batch(uuid[], uuid, text) from public, anon, authenticated;
grant execute on function public.approve_kyc_batch(uuid[], uuid, text) to service_role;
