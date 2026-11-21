-- Legacy reconciliation only links a verifiable same-owner Terminal record.
create or replace function public.repair_verified_terminal_links()
returns integer language plpgsql security invoker set search_path = '' as $$
declare linked_count integer;
begin
  with matched as (
    select t.id, (array_agg(a.id order by a.id))[1] as terminal_id
    from public.trading_accounts t
    join public.accounts a on a.user_id = t.user_id and
      (a.business_account_id = t.id or (a.id = t.id and a.business_account_id is null))
    where t.terminal_account_id is null and t.status in ('active', 'funded')
      and a.status in ('active', 'funded') and a.phase::text = t.phase::text
      and a.starting_balance = t.starting_balance
      and not exists (select from public.trading_accounts x where x.terminal_account_id = a.id)
    group by t.id
    having count(*) = 1
  )
  update public.trading_accounts t set terminal_account_id = m.terminal_id, updated_at = now()
  from matched m where t.id = m.id and t.terminal_account_id is null;
  get diagnostics linked_count = row_count;
  return linked_count;
end;
$$;

create or replace function public.terminal_passes_to_reconcile()
returns setof public.trading_accounts language sql stable security invoker set search_path = '' as $$
  select t.*
    from public.trading_accounts t
    join public.accounts a on a.id = t.terminal_account_id and a.user_id = t.user_id
    where a.status = 'passed' and t.status = 'passed'
      and t.program_key is not null and t.activation_due_at is null
      and not exists (select from public.trading_accounts n where n.previous_account_id = t.id)
    order by t.updated_at desc
    limit 8;
$$;

revoke all on function public.repair_verified_terminal_links(), public.terminal_passes_to_reconcile() from public, anon, authenticated;
grant execute on function public.repair_verified_terminal_links(), public.terminal_passes_to_reconcile() to service_role;
