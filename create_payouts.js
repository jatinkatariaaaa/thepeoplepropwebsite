require('dotenv').config({path: '.env.local'});
const {createClient} = require('@supabase/supabase-js');
const s = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const query = `
create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  account_id uuid not null references public.accounts (id) on delete cascade,
  amount numeric(18,2) not null,
  crypto_address text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);
alter table public.payouts enable row level security;
create policy "Users can view their own payouts" on public.payouts for select using (auth.uid() = user_id);
create policy "Users can insert their own payouts" on public.payouts for insert with check (auth.uid() = user_id);
`;

// wait, supabase doesn't have a default 'exec_sql' RPC. It might fail.
// So I'll use the psql command or ask the user to run it in SQL editor.
