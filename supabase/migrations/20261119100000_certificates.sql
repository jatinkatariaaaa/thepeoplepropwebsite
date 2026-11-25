-- Certificates become issued records.
--
-- Until now every certificate was derived on the fly from accounts and payouts, and a
-- "highest payout" award was handed to whichever paid payout was the largest of its month,
-- so a month with a single $100 payout produced a "Highest payout" certificate. Now each
-- certificate is a row: created automatically when the event happens (a phase passed, a
-- funded account issued, a payout paid) or by an admin, and it can be revoked.

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  number text not null unique,
  kind text not null check (kind in ('phase_pass', 'funded', 'payout', 'highest_payout', 'award')),
  status text not null default 'active' check (status in ('active', 'revoked')),
  user_id uuid not null references auth.users (id) on delete cascade,
  trader_name text not null,
  account_id uuid references public.accounts (id) on delete set null,
  trading_account_id uuid references public.trading_accounts (id) on delete set null,
  payout_id uuid references public.payouts (id) on delete set null,
  program_key text,
  account_size numeric,
  phase_index integer,
  amount numeric,
  period_label text,
  title text,
  statement text,
  highlight_label text,
  highlight_value text,
  issued_at timestamptz not null default now(),
  source text not null default 'system' check (source in ('system', 'admin')),
  issued_by uuid,
  revoked_reason text,
  revoked_at timestamptz,
  note text,
  created_at timestamptz not null default now()
);

comment on table public.certificates is 'Issued certificates. Public verification reads them server-side; traders read their own rows.';

-- One live certificate per event; a revoked one can be issued again.
create unique index if not exists certificates_payout_once on public.certificates (payout_id) where kind = 'payout' and status = 'active';
create unique index if not exists certificates_phase_once on public.certificates (trading_account_id) where kind = 'phase_pass' and status = 'active' and trading_account_id is not null;
create unique index if not exists certificates_funded_once on public.certificates (trading_account_id) where kind = 'funded' and status = 'active' and trading_account_id is not null;
create unique index if not exists certificates_terminal_once on public.certificates (account_id, kind) where status = 'active' and trading_account_id is null and account_id is not null and kind in ('phase_pass', 'funded');
create index if not exists certificates_user_idx on public.certificates (user_id, issued_at desc);
create index if not exists certificates_account_idx on public.certificates (account_id);
create index if not exists certificates_trading_account_idx on public.certificates (trading_account_id);
create index if not exists certificates_payout_idx on public.certificates (payout_id);

alter table public.certificates enable row level security;
drop policy if exists "certificates: owners read" on public.certificates;
create policy "certificates: owners read" on public.certificates for select to authenticated using (user_id = (select auth.uid()));
revoke insert, update, delete, truncate on public.certificates from anon, authenticated;
revoke select on public.certificates from anon;

-- Printed reference, from the row id: TPP-3F9A2C7E.
create or replace function private.certificates_set_number()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.number is null or new.number = '' then
    new.number := 'TPP-' || upper(substr(replace(new.id::text, '-', ''), 1, 8));
  end if;
  return new;
end;
$$;

drop trigger if exists certificates_set_number on public.certificates;
create trigger certificates_set_number before insert on public.certificates for each row execute function private.certificates_set_number();

-- The name printed on a certificate: display name, else first and last name.
create or replace function private.certificate_name(p_user uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    nullif(trim(p.display_name), ''),
    nullif(trim(concat_ws(' ', p.first_name, p.last_name)), ''),
    'Valued Trader'
  )
  from public.profiles p
  where p.id = p_user
$$;

-- A paid payout gets its certificate; a payout taken back from "paid" loses it.
create or replace function private.certificates_on_payout()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_program text;
  v_size numeric;
  v_cert uuid;
begin
  if new.status = 'paid' and (tg_op = 'INSERT' or old.status is distinct from 'paid') then
    select coalesce(t.program_key, a.program_key), coalesce(t.starting_balance, a.starting_balance)
      into v_program, v_size
      from public.accounts a
      left join public.trading_accounts t on t.id = new.trading_account_id
     where a.id = new.account_id;

    insert into public.certificates (kind, user_id, trader_name, account_id, trading_account_id, payout_id, program_key, account_size, amount, issued_at)
    values ('payout', new.user_id, coalesce(private.certificate_name(new.user_id), 'Valued Trader'), new.account_id, new.trading_account_id, new.id,
            v_program, v_size, new.amount, coalesce(new.processed_at, now()))
    on conflict do nothing
    returning id into v_cert;

    if v_cert is not null then
      insert into public.user_notifications (user_id, type, title, body, link)
      values (new.user_id, 'certificate', 'Your payout certificate is ready', 'Download it or share its verification link from Certificates.', '/dashboard/certificates');
    end if;
  elsif tg_op = 'UPDATE' and old.status = 'paid' and new.status is distinct from 'paid' then
    update public.certificates
       set status = 'revoked', revoked_reason = 'The payout was reversed', revoked_at = now()
     where payout_id = new.id and status = 'active';
  end if;
  return new;
end;
$$;

drop trigger if exists certificates_on_payout on public.payouts;
create trigger certificates_on_payout after insert or update of status on public.payouts for each row execute function private.certificates_on_payout();

-- A passed phase and a newly issued funded account each get a certificate.
create or replace function private.certificates_on_trading_account()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_kind text;
  v_cert uuid;
begin
  if new.user_id is null then
    return new;
  end if;

  if coalesce(new.phase, '') <> 'funded'
     and (new.passed_at is not null or new.status = 'passed')
     and (tg_op = 'INSERT' or (old.passed_at is null and old.status is distinct from 'passed')) then
    v_kind := 'phase_pass';
  elsif new.phase = 'funded'
     and coalesce(new.status, '') not in ('deleted', 'cancelled')
     and (tg_op = 'INSERT' or old.phase is distinct from 'funded') then
    v_kind := 'funded';
  else
    return new;
  end if;

  insert into public.certificates (kind, user_id, trader_name, account_id, trading_account_id, program_key, account_size, phase_index, issued_at)
  values (v_kind, new.user_id, coalesce(private.certificate_name(new.user_id), 'Valued Trader'), new.terminal_account_id, new.id,
          new.program_key, new.starting_balance,
          case when v_kind = 'phase_pass' then nullif(new.phase_index, 99) end,
          case when v_kind = 'phase_pass' then coalesce(new.passed_at, now()) else coalesce(new.created_at, now()) end)
  on conflict do nothing
  returning id into v_cert;

  if v_cert is not null then
    insert into public.user_notifications (user_id, type, title, body, link)
    values (new.user_id, 'certificate',
            case when v_kind = 'phase_pass' then 'Certificate unlocked: phase passed' else 'Certificate unlocked: funded trader' end,
            'Download it or share its verification link from Certificates.', '/dashboard/certificates');
  end if;
  return new;
end;
$$;

drop trigger if exists certificates_on_trading_account on public.trading_accounts;
create trigger certificates_on_trading_account after insert or update of status, passed_at, phase on public.trading_accounts for each row execute function private.certificates_on_trading_account();

revoke all on function private.certificates_set_number() from public, anon, authenticated;
revoke all on function private.certificate_name(uuid) from public, anon, authenticated;
revoke all on function private.certificates_on_payout() from public, anon, authenticated;
revoke all on function private.certificates_on_trading_account() from public, anon, authenticated;

-- Backfill: every certificate traders could see before, except the automatic
-- "highest payout" awards, which admins now award on purpose.
insert into public.certificates (kind, user_id, trader_name, account_id, trading_account_id, payout_id, program_key, account_size, amount, issued_at)
select 'payout', p.user_id, coalesce(private.certificate_name(p.user_id), 'Valued Trader'), p.account_id, p.trading_account_id, p.id,
       coalesce(t.program_key, a.program_key), coalesce(t.starting_balance, a.starting_balance), p.amount, coalesce(p.processed_at, p.created_at)
  from public.payouts p
  left join public.trading_accounts t on t.id = p.trading_account_id
  left join public.accounts a on a.id = p.account_id
 where p.status = 'paid'
on conflict do nothing;

insert into public.certificates (kind, user_id, trader_name, account_id, trading_account_id, program_key, account_size, phase_index, issued_at)
select 'phase_pass', t.user_id, coalesce(private.certificate_name(t.user_id), 'Valued Trader'), t.terminal_account_id, t.id, t.program_key, t.starting_balance,
       nullif(t.phase_index, 99), coalesce(t.passed_at, t.updated_at, t.created_at)
  from public.trading_accounts t
 where t.user_id is not null and coalesce(t.phase, '') <> 'funded' and (t.passed_at is not null or t.status = 'passed')
on conflict do nothing;

insert into public.certificates (kind, user_id, trader_name, account_id, trading_account_id, program_key, account_size, issued_at)
select 'funded', t.user_id, coalesce(private.certificate_name(t.user_id), 'Valued Trader'), t.terminal_account_id, t.id, t.program_key, t.starting_balance, t.created_at
  from public.trading_accounts t
 where t.user_id is not null and t.phase = 'funded' and coalesce(t.status, '') not in ('deleted', 'cancelled')
on conflict do nothing;

-- Terminal accounts with no dashboard record that showed a certificate before.
insert into public.certificates (kind, user_id, trader_name, account_id, program_key, account_size, issued_at)
select case when a.status = 'funded' then 'funded' else 'phase_pass' end, a.user_id, coalesce(private.certificate_name(a.user_id), 'Valued Trader'),
       a.id, a.program_key, a.starting_balance, a.updated_at
  from public.accounts a
 where a.user_id is not null
   and a.status in ('passed', 'funded')
   and not exists (select 1 from public.trading_accounts t where t.terminal_account_id = a.id or t.id = a.business_account_id)
on conflict do nothing;
