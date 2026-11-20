create table public.trade_replays (
  id uuid primary key,
  account_id uuid not null references public.accounts(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  symbol text not null check (char_length(symbol) between 1 and 16),
  timeframe integer not null check (timeframe in (60, 300, 900, 3600, 14400, 86400)),
  entry_time bigint not null check (entry_time > 0),
  direction text not null check (direction in ('buy', 'sell')),
  entry numeric not null check (entry > 0 and entry <= 100000000),
  stop_loss numeric not null check (stop_loss > 0 and stop_loss <= 100000000),
  target numeric not null check (target > 0 and target <= 100000000),
  lots numeric not null check (lots between 0.01 and 100),
  notes text not null default '' check (char_length(notes) <= 500),
  outcome text not null check (outcome in ('target', 'stop', 'ambiguous', 'unresolved')),
  outcome_time bigint check (outcome_time > entry_time),
  example_pnl numeric,
  currency text not null check (currency ~ '^[A-Z]{3}$'),
  candles jsonb not null check (jsonb_typeof(candles) = 'array' and jsonb_array_length(candles) between 1 and 1000),
  check (
    (direction = 'buy' and stop_loss < entry and entry < target)
    or (direction = 'sell' and target < entry and entry < stop_loss)
  ),
  check (
    (outcome = 'target' and outcome_time is not null and example_pnl is not null and example_pnl >= 0)
    or (outcome = 'stop' and outcome_time is not null and example_pnl is not null and example_pnl <= 0)
    or (outcome = 'ambiguous' and outcome_time is not null and example_pnl is null)
    or (outcome = 'unresolved' and outcome_time is null and example_pnl is null)
  )
);

comment on table public.trade_replays is 'Historical teaching setups and hypothetical P&L. Accessed only through the terminal server.';
create index trade_replays_account_author_date_idx on public.trade_replays (account_id, created_by, created_at desc);
create index trade_replays_author_idx on public.trade_replays (created_by);
alter table public.trade_replays enable row level security;
revoke all on public.trade_replays from public, anon, authenticated, service_role;
grant select, insert on public.trade_replays to service_role;

create table public.partner_collaborators (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (char_length(btrim(display_name)) between 2 and 80),
  affiliate_user_id uuid unique references public.profiles(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz not null default now()
);

create table public.partner_certificates (
  id uuid primary key default gen_random_uuid(),
  collaborator_id uuid not null references public.partner_collaborators(id),
  issued_by uuid references auth.users(id) on delete set null,
  issued_at timestamptz not null default now(),
  revoked_at timestamptz,
  revoked_by uuid references auth.users(id) on delete set null
);

comment on table public.partner_certificates is 'Verifiable partnership credentials for approved collaborators.';
create index partner_collaborators_approved_by_idx on public.partner_collaborators (approved_by);
create index partner_certificates_collaborator_idx on public.partner_certificates (collaborator_id);
create index partner_certificates_issued_by_idx on public.partner_certificates (issued_by);
create index partner_certificates_revoked_by_idx on public.partner_certificates (revoked_by);
create unique index partner_certificates_one_active_idx on public.partner_certificates (collaborator_id) where revoked_at is null;
alter table public.partner_collaborators enable row level security;
alter table public.partner_certificates enable row level security;
revoke all on public.partner_collaborators, public.partner_certificates from public, anon, authenticated, service_role;
grant select, insert, update on public.partner_collaborators, public.partner_certificates to service_role;
