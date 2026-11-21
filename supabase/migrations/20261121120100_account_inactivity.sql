-- Give existing accounts a one-week rollout notice before the first suspension.
-- Price execution acquires a lock on the same terminal account row.
alter table public.accounts add column if not exists inactivity_resumed_at timestamptz;

create or replace function private.resume_from_inactivity()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if old.status = 'suspended' and old.breach_reason = 'inactivity' and new.status in ('active', 'funded') then
    new.inactivity_resumed_at := now();
  end if;
  return new;
end;
$$;
revoke all on function private.resume_from_inactivity() from public, anon, authenticated;
create trigger resume_from_inactivity before update of status on public.accounts
  for each row execute function private.resume_from_inactivity();

create or replace function public.suspend_inactive_linked_accounts(p_rollout_at timestamptz)
returns integer
language plpgsql
security invoker
set search_path = ''
as $$
declare
  account record;
  last_activity timestamptz;
  suspend_after timestamptz;
  account_link text;
  suspended_count integer := 0;
begin
  for account in
    select a.id, a.user_id, a.created_at, a.reset_at, a.inactivity_resumed_at, b.id as crm_id
    from public.accounts a
    join public.trading_accounts b on b.id = a.business_account_id
      and b.terminal_account_id = a.id and b.user_id = a.user_id
    where a.status in ('active', 'funded') and b.status in ('active', 'funded')
      and greatest(a.created_at, a.reset_at, a.inactivity_resumed_at) < now() - interval '27 days'
    order by a.id
    for update of a, b skip locked
  loop
    -- Check activity and payment state again after obtaining the account locks.
    select greatest(account.created_at, account.reset_at, account.inactivity_resumed_at, max(t.open_time))
      into last_activity
      from public.trades t
      where t.account_id = account.id and t.is_demo is not true;

    if exists (select from public.positions p where p.account_id = account.id)
      or exists (select from public.orders o where o.account_id = account.id and o.status = 'working')
      or exists (
        select from public.payouts p
        where (p.account_id = account.id or p.trading_account_id = account.crm_id)
          and p.status in ('pending', 'processing', 'approved')
      ) then
      continue;
    end if;

    suspend_after := last_activity + interval '30 days';
    if account.created_at <= p_rollout_at then
      suspend_after := greatest(suspend_after, p_rollout_at + interval '7 days');
    end if;
    account_link := '/dashboard/account/' || account.crm_id;

    if now() >= suspend_after then
      update public.accounts set status = 'suspended', breach_reason = 'inactivity', updated_at = now()
        where id = account.id;
      update public.trading_accounts set status = 'suspended', breach_reason = 'inactivity', updated_at = now()
        where id = account.crm_id;
      insert into public.user_notifications (user_id, type, title, body, link)
      values (account.user_id, 'account_inactive', 'Trading account paused',
              'This account was paused due to inactivity. Contact support if you would like to resume trading.', account_link);
      suspended_count := suspended_count + 1;
    elsif now() >= suspend_after - interval '3 days'
      or (last_activity <= p_rollout_at - interval '30 days' and account.created_at <= p_rollout_at) then
      insert into public.user_notifications (user_id, type, title, body, link)
      select account.user_id, 'account_inactivity_warning', 'Trading account inactivity reminder',
             'Open a trade before ' || to_char(suspend_after at time zone 'UTC', 'YYYY-MM-DD HH24:MI') || ' UTC to keep this account active.',
             account_link
      where not exists (
        select from public.user_notifications n
        where n.user_id = account.user_id and n.type = 'account_inactivity_warning'
          and n.link = account_link and n.created_at >= last_activity
      );
    end if;
  end loop;
  return suspended_count;
end;
$$;

revoke all on function public.suspend_inactive_linked_accounts(timestamptz) from public, anon, authenticated;
grant execute on function public.suspend_inactive_linked_accounts(timestamptz) to service_role;

select cron.schedule(
  'tpp-account-inactivity',
  '20 0 * * *',
  format('select public.suspend_inactive_linked_accounts(%L::timestamptz);', statement_timestamp())
);
