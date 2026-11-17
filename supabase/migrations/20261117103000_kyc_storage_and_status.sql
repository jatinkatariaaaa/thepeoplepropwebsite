-- ── Identity documents ───────────────────────────────────────────────
-- Private bucket for identity documents. A trader can upload into and read
-- their own folder (<user id>/...); admins can read every folder. Nothing is public.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('kyc-documents', 'kyc-documents', false, 8388608, array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'application/pdf'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "kyc upload own folder" on storage.objects;
create policy "kyc upload own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'kyc-documents' and (storage.foldername(name))[1] = (select auth.uid())::text);

drop policy if exists "kyc read own or admin" on storage.objects;
create policy "kyc read own or admin" on storage.objects
  for select to authenticated
  using (bucket_id = 'kyc-documents' and ((storage.foldername(name))[1] = (select auth.uid())::text or private.is_admin()));

-- ── One vocabulary for profiles.kyc_status ───────────────────────────
-- It defaulted to 'pending', so every trader looked "under review" before
-- submitting anything and the upload form never showed.
-- none (nothing submitted), pending (documents in review), approved, rejected.
alter table public.profiles alter column kyc_status set default 'none';

update public.profiles p set kyc_status = 'none'
 where p.kyc_status = 'pending'
   and not exists (select 1 from public.kyc_documents d where d.user_id = p.id and d.status = 'pending');

update public.profiles set kyc_status = 'approved' where kyc_status = 'verified';
