-- Payout debit/credit run inside the database so the balance check, the debit
-- and the daily-loss anchor move together. The old API debited the balance but
-- left daily_start_balance alone, so a withdrawal looked like a loss and could
-- breach the daily limit on the next risk tick.

create or replace function public.payout_debit(p_terminal_account_id uuid, p_user_id uuid, p_amount numeric)
returns public.accounts
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  acct public.accounts;
begin
  select * into acct from public.accounts where id = p_terminal_account_id for update;
  if not found then raise exception 'account not found'; end if;
  if acct.user_id is distinct from p_user_id then raise exception 'account does not belong to this user'; end if;
  if acct.phase <> 'funded' or acct.status not in ('active', 'funded') then
    raise exception 'payouts are only available on an active funded account';
  end if;
  if p_amount is null or p_amount <= 0 then raise exception 'amount must be positive'; end if;
  if exists (select 1 from public.positions where account_id = acct.id) then
    raise exception 'close all open positions before requesting a payout';
  end if;
  if exists (select 1 from public.orders where account_id = acct.id and status = 'working') then
    raise exception 'cancel your pending orders before requesting a payout';
  end if;
  if acct.balance - acct.starting_balance < p_amount then
    raise exception 'amount exceeds the withdrawable profit of %', round(acct.balance - acct.starting_balance, 2);
  end if;

  update public.accounts
     set balance = balance - p_amount,
         equity = balance - p_amount,
         daily_start_balance = daily_start_balance - p_amount,
         highest_equity = greatest(balance - p_amount, highest_equity - p_amount)
   where id = acct.id
   returning * into acct;
  return acct;
end;
$$;
revoke all on function public.payout_debit(uuid, uuid, numeric) from public, anon, authenticated;
grant execute on function public.payout_debit(uuid, uuid, numeric) to service_role;

-- Returns a declined payout to the account. No-op if the account is no longer tradable.
create or replace function public.payout_credit(p_terminal_account_id uuid, p_amount numeric)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  acct public.accounts;
begin
  select * into acct from public.accounts where id = p_terminal_account_id for update;
  if not found then return false; end if;
  if acct.status not in ('active', 'funded') then return false; end if;
  if p_amount is null or p_amount <= 0 then return false; end if;
  update public.accounts
     set balance = balance + p_amount,
         equity = equity + p_amount,
         daily_start_balance = daily_start_balance + p_amount,
         highest_equity = highest_equity + p_amount
   where id = acct.id;
  return true;
end;
$$;
revoke all on function public.payout_credit(uuid, numeric) from public, anon, authenticated;
grant execute on function public.payout_credit(uuid, numeric) to service_role;

-- Daily housekeeping: stipend accrual, lapsed reset offers, lapsed Access activations.
create or replace function public.run_daily_maintenance()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_stipends integer := 0;
  v_resets integer := 0;
  v_activations integer := 0;
begin
  v_stipends := public.accrue_stipends();

  update public.account_resets set status = 'expired'
   where status = 'eligible' and eligible_until is not null and eligible_until < now();
  get diagnostics v_resets = row_count;

  with lapsed as (
    select a.id, a.user_id from public.trading_accounts a
     where a.status = 'passed' and a.activation_due_at is not null and a.activation_due_at < now()
       and not exists (select 1 from public.trading_accounts n where n.previous_account_id = a.id)
       and not exists (select 1 from public.user_notifications u where u.type = 'activation_lapsed' and u.link = '/dashboard/account/' || a.id)
  )
  insert into public.user_notifications (user_id, type, title, body, link)
  select l.user_id, 'activation_lapsed', 'Activation window closed',
         'The 48-hour window to pay the fee for your passed Access account has ended. Contact support if you need it reopened.',
         '/dashboard/account/' || l.id
    from lapsed l where l.user_id is not null and exists (select 1 from public.profiles p where p.id = l.user_id);
  get diagnostics v_activations = row_count;

  return jsonb_build_object('stipends', v_stipends, 'resets_expired', v_resets, 'activations_lapsed', v_activations, 'ran_at', now());
end;
$$;
revoke all on function public.run_daily_maintenance() from public, anon, authenticated;
grant execute on function public.run_daily_maintenance() to service_role;

-- Runs every day at 00:10 UTC inside the database (no external cron needed).
create extension if not exists pg_cron;
do $$
begin
  if exists (select 1 from cron.job where jobname = 'tpp-daily-maintenance') then
    perform cron.unschedule('tpp-daily-maintenance');
  end if;
  perform cron.schedule('tpp-daily-maintenance', '10 0 * * *', 'select public.run_daily_maintenance()');
end $$;
