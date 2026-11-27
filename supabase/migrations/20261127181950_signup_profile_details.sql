alter table public.profiles
  add column phone_number text,
  add column signup_details_pending boolean not null default false,
  add constraint profiles_phone_number_format check (
    phone_number is null or phone_number ~ '^[+][1-9][0-9]{6,14}$'
  );

-- Existing profiles bypass onboarding. Auth-created profiles use the new default.
alter table public.profiles alter column signup_details_pending set default true;

create or replace function private.protect_profile_columns()
returns trigger
language plpgsql
set search_path to 'public', 'pg_temp'
as $$
begin
  if current_user in ('anon', 'authenticated') then
    new.is_admin               := old.is_admin;
    new.kyc_status             := old.kyc_status;
    new.status                 := old.status;
    new.suspended_reason       := old.suspended_reason;
    new.global_rank            := old.global_rank;
    new.email                  := old.email;
    new.affiliate_code         := old.affiliate_code;
    new.phone_number           := old.phone_number;
    new.signup_details_pending := old.signup_details_pending;
  end if;
  return new;
end;
$$;
