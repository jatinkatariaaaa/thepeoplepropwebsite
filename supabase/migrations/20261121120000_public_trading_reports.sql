-- Keep trading data private and expose aggregate reports via server-only calls.
revoke execute on function public.list_public_platforms() from public, anon, authenticated;

create or replace function public.public_payout_summary()
returns table(paid_count bigint, paid_total numeric, highest_paid numeric)
language sql stable security invoker set search_path = ''
as $$
  select count(*), coalesce(sum(p.amount), 0), coalesce(max(p.amount), 0)
  from public.payouts p
  where p.status = 'paid' and p.amount > 0
    and p.processed_at is not null and nullif(btrim(p.tx_reference), '') is not null
    and not exists (
      select from public.certificates c where c.payout_id = p.id and c.is_test is true
    );
$$;
revoke all on function public.public_payout_summary() from public, anon, authenticated;
grant execute on function public.public_payout_summary() to service_role;

create or replace function public.daily_realized_leaderboard()
returns table(rank integer, profit numeric, trade_count bigint, win_rate numeric)
language sql stable security invoker set search_path = ''
as $$
  with daily as (
    select a.user_id, sum(t.net_pnl) as profit, count(*) as trades,
           round(100.0 * count(*) filter (where t.net_pnl > 0) / count(*), 1) as win_rate
    from public.trades t
    join public.accounts a on a.id = t.account_id
    where t.close_time >= date_trunc('day', now(), 'UTC')
      and t.close_time <= now() and t.is_demo is not true and a.phase = 'funded'
      and exists (
        select from public.trading_accounts b
        where b.terminal_account_id = a.id and b.user_id = a.user_id and b.phase = 'funded'
      )
    group by a.user_id
    having sum(t.net_pnl) > 0
    order by sum(t.net_pnl) desc, a.user_id
    limit 20
  )
  select row_number() over (order by profit desc, user_id)::integer, round(profit, 2), trades, win_rate
  from daily
  order by 1;
$$;
revoke all on function public.daily_realized_leaderboard() from public, anon, authenticated;
grant execute on function public.daily_realized_leaderboard() to service_role;

create index if not exists idx_trades_non_demo_close_time
  on public.trades (close_time) where is_demo is not true;
