-- One kind of admin.
--
-- Admin access used to live in two places: a row in admin_roles (with its role), or only
-- profiles.is_admin, which the Roles page labelled "Legacy" and every check treated as super_admin.
-- The two could disagree: setting is_admin from the Users page made a "legacy" admin, and turning it
-- off there left any admin_roles row (and so the access) in place.
--
-- From here admin_roles is where access lives and profiles.is_admin mirrors it for RLS
-- (private.is_admin) and older checks. Legacy accounts get their super_admin row now, and triggers
-- keep the pair in step whichever side is written: the Roles page, the Users page toggle, or SQL.

alter table public.admin_roles alter column user_id set not null;

insert into public.admin_roles (user_id, role)
select p.id, 'super_admin' from public.profiles p
where p.is_admin is true
on conflict (user_id) do nothing;

update public.profiles p set is_admin = true
where p.is_admin is not true
  and exists (select 1 from public.admin_roles r where r.user_id = p.id);

-- admin_roles -> profiles.is_admin
create or replace function private.admin_roles_sync_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    -- Nothing to do when the account itself is being deleted: the profile goes with it.
    update public.profiles set is_admin = false
    where id = old.user_id and is_admin is true
      and exists (select 1 from auth.users u where u.id = old.user_id);
    return null;
  end if;

  if tg_op = 'UPDATE' and old.user_id is distinct from new.user_id then
    update public.profiles set is_admin = false
    where id = old.user_id and is_admin is true;
  end if;

  update public.profiles set is_admin = true
  where id = new.user_id and is_admin is not true;
  return null;
end $$;

drop trigger if exists trg_admin_roles_sync_profile on public.admin_roles;
create trigger trg_admin_roles_sync_profile
after insert or delete or update of user_id on public.admin_roles
for each row execute function private.admin_roles_sync_profile();

-- profiles.is_admin -> admin_roles
create or replace function private.profiles_sync_admin_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.is_admin is true then
    -- Made an admin outside the Roles page: full access, which is what is_admin always meant.
    insert into public.admin_roles (user_id, role) values (new.id, 'super_admin')
    on conflict (user_id) do nothing;
  else
    delete from public.admin_roles where user_id = new.id;
  end if;
  return null;
end $$;

drop trigger if exists trg_profiles_sync_admin_role_insert on public.profiles;
create trigger trg_profiles_sync_admin_role_insert
after insert on public.profiles
for each row when (new.is_admin is true)
execute function private.profiles_sync_admin_role();

-- Signed-in users cannot change is_admin (private.protect_profile_columns puts it back first),
-- so this only fires for the service role and SQL.
drop trigger if exists trg_profiles_sync_admin_role_update on public.profiles;
create trigger trg_profiles_sync_admin_role_update
after update of is_admin on public.profiles
for each row when (old.is_admin is distinct from new.is_admin)
execute function private.profiles_sync_admin_role();

-- Trigger functions do not need EXECUTE to fire.
revoke all on function private.admin_roles_sync_profile() from public, anon, authenticated;
revoke all on function private.profiles_sync_admin_role() from public, anon, authenticated;
