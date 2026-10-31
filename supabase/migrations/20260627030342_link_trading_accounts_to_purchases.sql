alter table public.trading_accounts
  add column if not exists purchase_id uuid references public.purchases(id);

create unique index if not exists idx_trading_accounts_purchase_id
  on public.trading_accounts(purchase_id)
  where purchase_id is not null;

create index if not exists idx_trading_accounts_user_program_size
  on public.trading_accounts(user_id, program_key, starting_balance, created_at desc);
