-- ════════════════════════════════════════════════════════════════════
-- Prop-firm features (16 Nov 2026)
--   * 1% monthly stipend on every active account
--   * first 5 payouts on demand, then the regular cycle
--   * free reset for $50K+ accounts that fail within 24 hours
--   * Access: pay $5, pass, then pay the fee to activate the funded account
--   * trading journal, user notifications, assistant log
--   * fix: the terminal → CRM sync trigger no longer overwrites the CRM phase
-- Additive only: no column or table the live apps read is removed or renamed.
-- ════════════════════════════════════════════════════════════════════

-- ── programs ────────────────────────────────────────────────────────
alter table public.tpp_programs
  add column if not exists pay_after_pass boolean not null default false,
  add column if not exists upfront_fee numeric,
  add column if not exists sort_order integer not null default 0;

alter table public.trading_rules
  add column if not exists consistency_pct numeric not null default 0,
  add column if not exists news_window_minutes integer not null default 0;

alter table public.tpp_faqs
  add column if not exists program_key text;

-- ── purchases ───────────────────────────────────────────────────────
alter table public.purchases
  add column if not exists kind text not null default 'challenge',
  add column if not exists addons jsonb not null default '[]'::jsonb,
  add column if not exists platform text,
  add column if not exists base_fee numeric,
  add column if not exists discount_amount numeric not null default 0,
  add column if not exists activation_fee numeric,
  add column if not exists related_account_id uuid,
  add column if not exists payment_id text,
  add column if not exists paid_at timestamptz;

do $$ begin
  alter table public.purchases add constraint purchases_kind_check check (kind in ('challenge', 'activation', 'reset'));
exception when duplicate_object then null; end $$;

-- ── trading accounts ────────────────────────────────────────────────
alter table public.trading_accounts
  add column if not exists breached_at timestamptz,
  add column if not exists breach_reason text,
  add column if not exists profit_split integer,
  add column if not exists reset_of_account_id uuid references public.trading_accounts (id),
  add column if not exists activation_due_at timestamptz,
  add column if not exists activation_fee numeric;

-- ── payouts ─────────────────────────────────────────────────────────
alter table public.payouts
  add column if not exists trading_account_id uuid references public.trading_accounts (id),
  add column if not exists sequence_no integer,
  add column if not exists on_demand boolean not null default false,
  add column if not exists gross_profit numeric,
  add column if not exists trader_share numeric,
  add column if not exists stipend_amount numeric not null default 0,
  add column if not exists fee_refund_amount numeric not null default 0,
  add column if not exists tx_reference text,
  add column if not exists rejected_reason text;

create index if not exists payouts_trading_account_idx on public.payouts (trading_account_id);
create index if not exists payouts_user_idx on public.payouts (user_id, created_at desc);

-- ── stipends ────────────────────────────────────────────────────────
create table if not exists public.stipend_accruals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  trading_account_id uuid not null references public.trading_accounts (id) on delete cascade,
  phase_group_id uuid not null,
  period_no integer not null,
  period_start timestamptz not null,
  period_end timestamptz not null,
  account_size numeric not null,
  rate_pct numeric not null,
  amount numeric not null,
  trading_days integer not null default 0,
  status text not null default 'accrued' check (status in ('accrued', 'released', 'paid', 'void')),
  payout_id uuid references public.payouts (id),
  note text,
  created_at timestamptz not null default now(),
  released_at timestamptz,
  paid_at timestamptz,
  unique (phase_group_id, period_no)
);
create index if not exists stipend_accruals_user_idx on public.stipend_accruals (user_id, status);
alter table public.stipend_accruals enable row level security;
create policy stipend_accruals_select on public.stipend_accruals
  for select to authenticated using (user_id = (select auth.uid()) or private.is_admin());

-- ── account resets ──────────────────────────────────────────────────
create table if not exists public.account_resets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  source_account_id uuid not null unique references public.trading_accounts (id) on delete cascade,
  new_account_id uuid references public.trading_accounts (id),
  phase_group_id uuid,
  kind text not null default 'free_24h' check (kind in ('free_24h', 'admin', 'paid')),
  status text not null default 'eligible' check (status in ('eligible', 'claimed', 'expired', 'void')),
  failed_after_hours numeric,
  eligible_until timestamptz,
  claimed_at timestamptz,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists account_resets_user_idx on public.account_resets (user_id, status);
alter table public.account_resets enable row level security;
create policy account_resets_select on public.account_resets
  for select to authenticated using (user_id = (select auth.uid()) or private.is_admin());

-- ── trading journal ─────────────────────────────────────────────────
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  account_id uuid,
  trade_id uuid,
  entry_date date not null default current_date,
  symbol text,
  direction text,
  title text,
  notes text,
  setup text,
  tags text[] not null default '{}',
  mistakes text[] not null default '{}',
  emotion text,
  rating smallint check (rating between 1 and 5),
  followed_plan boolean,
  screenshot_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, trade_id)
);
create index if not exists journal_entries_user_date_idx on public.journal_entries (user_id, entry_date desc);
alter table public.journal_entries enable row level security;
create policy journal_entries_own on public.journal_entries
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop trigger if exists trg_journal_entries_updated on public.journal_entries;
create trigger trg_journal_entries_updated
  before update on public.journal_entries
  for each row execute function public.set_updated_at();

-- ── notifications for traders ───────────────────────────────────────
create table if not exists public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists user_notifications_user_idx on public.user_notifications (user_id, created_at desc);
alter table public.user_notifications enable row level security;
create policy user_notifications_select_own on public.user_notifications
  for select to authenticated using (user_id = (select auth.uid()));
create policy user_notifications_update_own on public.user_notifications
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- ── assistant log (what visitors ask, and whether we could answer) ──
create table if not exists public.assistant_logs (
  id uuid primary key default gen_random_uuid(),
  session_id text,
  user_id uuid,
  question text not null,
  answer text,
  source text not null default 'kb' check (source in ('ai', 'kb', 'fallback')),
  program_key text,
  helpful boolean,
  created_at timestamptz not null default now()
);
create index if not exists assistant_logs_created_idx on public.assistant_logs (created_at desc);
alter table public.assistant_logs enable row level security;
create policy assistant_logs_admin on public.assistant_logs
  for select to authenticated using (private.is_admin());

-- ── affiliate commission is paid once per purchase ──────────────────
create unique index if not exists affiliate_earnings_purchase_unique
  on public.affiliate_earnings (purchase_id) where purchase_id is not null;

-- ── terminal → CRM sync: keep the CRM phase, stamp breach details ────
-- The terminal only knows 'challenge' and 'funded'. Copying its phase onto the
-- CRM row turned every Phase 2 / Phase 3 account back into 'challenge', so
-- multi-step programs looped on Phase 2 and never reached Funded.
create or replace function public.sync_account_to_trading_account()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.business_account_id is not null then
    update public.trading_accounts
    set
      balance = new.balance,
      equity = new.equity,
      status = new.status::text,
      highest_equity = new.highest_equity,
      breach_reason = case when new.status::text = 'breached' then coalesce(new.breach_reason, breach_reason) else breach_reason end,
      current_daily_drawdown = case
        when new.daily_start_balance > 0 then greatest(0, ((new.daily_start_balance - new.equity) / new.daily_start_balance) * 100)
        else 0
      end,
      current_max_drawdown = case
        when new.starting_balance > 0 then greatest(0, ((new.starting_balance - new.equity) / new.starting_balance) * 100)
        else 0
      end
    where id = new.business_account_id;
  end if;
  return new;
end;
$$;
revoke execute on function public.sync_account_to_trading_account() from public, anon, authenticated;

-- Repair rows the old trigger flattened.
update public.trading_accounts set phase = 'verification' where phase_index = 2 and phase = 'challenge';
update public.trading_accounts set phase = 'phase_3' where phase_index = 3 and phase = 'challenge';

-- ── stamp pass / breach time; open the free-reset window ────────────
create or replace function private.trading_account_before_update()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.status is distinct from old.status then
    if new.status = 'breached' and new.breached_at is null then
      new.breached_at := now();
    end if;
    if new.status = 'passed' and new.passed_at is null then
      new.passed_at := now();
    end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_trading_account_before_update on public.trading_accounts;
create trigger trg_trading_account_before_update
  before update on public.trading_accounts
  for each row execute function private.trading_account_before_update();

create or replace function private.setting_num(p_key text, p_default numeric)
returns numeric
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v jsonb;
begin
  select value into v from public.admin_settings where key = p_key;
  if v is null then return p_default; end if;
  return coalesce(nullif(trim(both '"' from v::text), '')::numeric, p_default);
exception when others then
  return p_default;
end;
$$;

create or replace function private.setting_bool(p_key text, p_default boolean)
returns boolean
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v jsonb;
begin
  select value into v from public.admin_settings where key = p_key;
  if v is null then return p_default; end if;
  return lower(trim(both '"' from v::text)) in ('true', '1', 'yes', 'on');
exception when others then
  return p_default;
end;
$$;

create or replace function private.trading_account_after_breach()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_min_size numeric := private.setting_num('free_reset_min_size', 50000);
  v_window_h numeric := private.setting_num('free_reset_window_hours', 24);
  v_claim_h  numeric := private.setting_num('free_reset_claim_hours', 72);
  v_first_trade timestamptz;
  v_started timestamptz;
  v_hours numeric;
  v_group uuid := coalesce(new.phase_group_id, new.id);
begin
  if new.status <> 'breached' or old.status = 'breached' then return new; end if;
  if new.user_id is null then return new; end if;
  if not exists (select 1 from public.profiles p where p.id = new.user_id) then return new; end if;

  insert into public.user_notifications (user_id, type, title, body, link)
  values (new.user_id, 'account_breached', 'Account breached',
          coalesce(new.breach_reason, 'A loss limit was reached on account ' || new.login || '.'),
          '/dashboard/account/' || new.id);

  if not private.setting_bool('free_reset_enabled', true) then return new; end if;
  if coalesce(new.starting_balance, 0) < v_min_size then return new; end if;
  -- one free reset per purchase: an account that is itself a reset does not earn another
  if new.reset_of_account_id is not null then return new; end if;
  if exists (select 1 from public.account_resets r where r.phase_group_id = v_group and r.kind = 'free_24h') then return new; end if;

  if new.terminal_account_id is not null then
    select min(t.open_time) into v_first_trade from public.trades t where t.account_id = new.terminal_account_id;
  end if;
  v_started := coalesce(v_first_trade, new.created_at);
  v_hours := extract(epoch from (now() - v_started)) / 3600.0;
  if v_hours > v_window_h then return new; end if;

  insert into public.account_resets (user_id, source_account_id, phase_group_id, kind, status, failed_after_hours, eligible_until)
  values (new.user_id, new.id, v_group, 'free_24h', 'eligible', round(v_hours, 2), now() + make_interval(hours => v_claim_h::int))
  on conflict (source_account_id) do nothing;

  insert into public.user_notifications (user_id, type, title, body, link)
  values (new.user_id, 'free_reset', 'Free reset available',
          'Your account failed inside the first ' || v_window_h::int || ' hours. Claim a free reset within ' || v_claim_h::int || ' hours.',
          '/dashboard/account/' || new.id);
  return new;
exception when others then
  -- perk bookkeeping must never block the risk engine from recording a breach
  raise warning 'trading_account_after_breach failed for %: %', new.id, sqlerrm;
  return new;
end;
$$;

drop trigger if exists trg_trading_account_after_breach on public.trading_accounts;
create trigger trg_trading_account_after_breach
  after update of status on public.trading_accounts
  for each row execute function private.trading_account_after_breach();

-- ── monthly stipend accrual ─────────────────────────────────────────
-- One accrual per purchased account (phase group) for every completed cycle
-- in which the account is still active and was actually traded.
create or replace function public.accrue_stipends()
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_enabled boolean := private.setting_bool('stipend_enabled', true);
  v_rate    numeric := private.setting_num('stipend_rate_pct', 1);
  v_days    integer := private.setting_num('stipend_cycle_days', 30)::int;
  v_min_td  integer := private.setting_num('stipend_min_trading_days', 4)::int;
  v_count   integer := 0;
  g record;
  v_no integer;
  v_start timestamptz;
  v_end timestamptz;
  v_td integer;
  v_amount numeric;
begin
  if not v_enabled or v_rate <= 0 or v_days <= 0 then return 0; end if;

  for g in
    select distinct on (coalesce(a.phase_group_id, a.id))
           coalesce(a.phase_group_id, a.id) as group_id,
           a.id as account_id, a.user_id, a.starting_balance,
           (select min(r.created_at) from public.trading_accounts r
             where coalesce(r.phase_group_id, r.id) = coalesce(a.phase_group_id, a.id)) as started_at
    from public.trading_accounts a
    where a.status in ('active', 'funded') and a.user_id is not null
      and exists (select 1 from public.profiles p where p.id = a.user_id)
    order by coalesce(a.phase_group_id, a.id), a.created_at desc
  loop
    v_no := floor(extract(epoch from (now() - g.started_at)) / (v_days * 86400.0))::int;
    if v_no < 1 then continue; end if;
    -- only the cycle that just completed: a missed run never back-pays old cycles
    v_start := g.started_at + make_interval(days => (v_no - 1) * v_days);
    v_end   := g.started_at + make_interval(days => v_no * v_days);

    if exists (select 1 from public.stipend_accruals s where s.phase_group_id = g.group_id and s.period_no = v_no) then
      continue;
    end if;

    select count(distinct (t.close_time at time zone 'America/New_York')::date) into v_td
    from public.trades t
    join public.trading_accounts ta on ta.terminal_account_id = t.account_id
    where coalesce(ta.phase_group_id, ta.id) = g.group_id
      and t.close_time >= v_start and t.close_time < v_end;

    if v_td < v_min_td then continue; end if;

    v_amount := round(g.starting_balance * v_rate / 100.0, 2);
    insert into public.stipend_accruals
      (user_id, trading_account_id, phase_group_id, period_no, period_start, period_end, account_size, rate_pct, amount, trading_days)
    values
      (g.user_id, g.account_id, g.group_id, v_no, v_start, v_end, g.starting_balance, v_rate, v_amount, v_td)
    on conflict (phase_group_id, period_no) do nothing;

    if found then
      v_count := v_count + 1;
      insert into public.user_notifications (user_id, type, title, body, link)
      values (g.user_id, 'stipend', 'Monthly stipend credited',
              '$' || to_char(v_amount, 'FM999,999,990.00') || ' was added to your rewards balance.',
              '/dashboard/payouts');
    end if;
  end loop;

  return v_count;
end;
$$;
revoke all on function public.accrue_stipends() from public, anon, authenticated;
grant execute on function public.accrue_stipends() to service_role;

-- ── settings that drive the perks (edit them in Admin → Settings) ───
insert into public.admin_settings (key, value, category) values
  ('stipend_enabled',            'true'::jsonb,           'trading'),
  ('stipend_rate_pct',           '1'::jsonb,              'trading'),
  ('stipend_cycle_days',         '30'::jsonb,             'trading'),
  ('stipend_min_trading_days',   '4'::jsonb,              'trading'),
  ('stipend_release',            '"with_payout"'::jsonb,  'trading'),
  ('on_demand_payouts',          '5'::jsonb,              'trading'),
  ('payout_cycle_days',          '14'::jsonb,             'trading'),
  ('payout_min_amount',          '50'::jsonb,             'trading'),
  ('free_reset_enabled',         'true'::jsonb,           'trading'),
  ('free_reset_min_size',        '50000'::jsonb,          'trading'),
  ('free_reset_window_hours',    '24'::jsonb,             'trading'),
  ('free_reset_claim_hours',     '72'::jsonb,             'trading'),
  ('access_activation_hours',    '48'::jsonb,             'trading'),
  ('affiliate_commission_pct',   '10'::jsonb,             'trading')
on conflict (key) do nothing;
