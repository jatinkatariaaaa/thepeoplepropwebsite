-- Test certificates: issued by staff to staff accounts with any details, for design and
-- dashboard testing. They render with a TEST mark and the public check says they are tests.
alter table public.certificates add column if not exists is_test boolean not null default false;
comment on column public.certificates.is_test is 'Staff test certificate: any details, staff accounts only, shown as a test on the verification page.';
create index if not exists certificates_test_idx on public.certificates (is_test) where is_test;
