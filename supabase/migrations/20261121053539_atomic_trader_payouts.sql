-- All monetary changes happen in the same transaction as the payout transition.
-- Existing rows retain their original amounts and status.
alter table public.payouts
  add column request_key uuid,
  add column review_period_start timestamptz,
  add column news_review_from timestamptz,
  add column eligible_carry numeric,
  add column consistency_limit numeric,
  add column news_minutes integer,
  add column minimum_share numeric,
  add column news_reviewed_at timestamptz,
  add column news_reviewed_by uuid,
  add column news_source text,
  add column news_events timestamptz[],
  add column news_excluded_profit numeric;
create unique index payouts_request_key on public.payouts(user_id, request_key) where request_key is not null;
create index if not exists trades_payout_period on public.trades(account_id, close_time) where is_demo is not true;

create function private.payout_trades(p_account uuid, p_since timestamptz, p_until timestamptz, p_events timestamptz[], p_minutes integer)
returns table(net numeric,best numeric,excluded numeric,first_open timestamptz) language sql stable set search_path = '' as $$
  with marked as (
    select (t.close_time at time zone 'America/New_York' + interval '7 hours')::date as day,
      t.open_time,t.net_pnl, case when t.net_pnl > 0 and exists (
        select 1 from unnest(p_events) as e(ts) where
          t.open_time between e.ts - make_interval(mins => p_minutes) and e.ts + make_interval(mins => p_minutes)
          or t.close_time between e.ts - make_interval(mins => p_minutes) and e.ts + make_interval(mins => p_minutes)
      ) then t.net_pnl else 0 end as excluded
    from public.trades t where t.account_id = p_account and t.is_demo is not true
      and (p_since is null or t.close_time > p_since) and t.close_time <= p_until
  ), days as (
    select day, sum(net_pnl - excluded) as gain, sum(excluded) as removed,min(open_time) as opened from marked group by day
  )
  select coalesce(sum(gain),0), greatest(0,coalesce(max(gain),0)), coalesce(sum(removed),0),min(opened) from days
$$;

create function public.trader_payout_quote(p_user uuid, p_account uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  crm public.trading_accounts; acct public.accounts; rules public.trading_rules;
  group_id uuid; counted int; pending boolean; previous public.payouts; stats record;
  demand int := private.setting_num('on_demand_payouts',5);
  cycle int := private.setting_num('payout_cycle_days',14);
  minimum numeric := private.setting_num('payout_min_amount',50);
  next_at timestamptz; cap numeric; news int; profit numeric; share numeric; needed numeric; consistent boolean;
  open_positions int; working_orders boolean; stipend numeric := 0; fee numeric := 0; kyc text; blockers text[] := '{}';
begin
  select * into crm from public.trading_accounts where user_id=p_user and (id=p_account or terminal_account_id=p_account) order by (id=p_account) desc limit 1;
  select * into acct from public.accounts where id=crm.terminal_account_id and user_id=p_user;
  if acct.id is null then raise exception 'Account not found' using errcode='P0002'; end if;
  select * into rules from public.trading_rules where id=crm.rule_id;
  cap := coalesce(nullif(rules.consistency_pct,0),case when crm.program_key like 'instant%' then 25 else 40 end);
  news := coalesce(nullif(rules.news_window_minutes,0),2);
  crm.profit_split := coalesce(crm.profit_split,80);
  if cap <= 0 or cap > 100 or news < 0 or crm.profit_split not between 1 and 100
    or minimum < 0 or demand < 0 or cycle < 0 then
    raise exception 'Payout rules need to be verified for this account' using errcode='23514';
  end if;
  group_id := coalesce(crm.phase_group_id,crm.id);
  with lineage as (select id,terminal_account_id from public.trading_accounts where user_id=p_user and (phase_group_id=group_id or id=group_id or id=crm.id))
    select count(*),coalesce(bool_or(status in ('pending','processing','approved')),false)
      into counted,pending from public.payouts p where p.user_id=p_user and status in ('pending','processing','approved','paid')
      and exists(select 1 from lineage a where a.id=p.trading_account_id or a.terminal_account_id=p.account_id);
  select p.* into previous from public.payouts p where p.user_id=p_user and p.status='paid' and exists(
    select 1 from public.trading_accounts a where a.user_id=p_user and (a.phase_group_id=group_id or a.id=group_id or a.id=crm.id)
      and (a.id=p.trading_account_id or a.terminal_account_id=p.account_id)) order by p.created_at desc, p.id desc limit 1;
  if counted>=demand and previous.created_at+make_interval(days=>cycle)>now() then next_at:=previous.created_at+make_interval(days=>cycle); end if;
  select * into stats from private.payout_trades(acct.id,previous.created_at,now(),'{}',news);
  profit := greatest(0,least(trunc(acct.balance-acct.starting_balance,2),trunc(stats.net+
    case when previous.account_id=acct.id then coalesce(previous.eligible_carry,0) else 0 end,2)));
  share := case when profit>0 then round(stats.best*100/profit,2) else 0 end;
  consistent := stats.best*100 <= profit*cap;
  needed := ceil(stats.best*10000/cap)/100;
  select count(*) into open_positions from public.positions where account_id=acct.id;
  select exists(select 1 from public.orders where account_id=acct.id and status='working') into working_orders;
  if coalesce((select value #>> '{}' from public.admin_settings where key='stipend_release'),'with_payout')='with_payout' then
    select coalesce(sum(amount),0) into stipend from public.stipend_accruals where user_id=p_user and status='accrued';
  end if;
  if counted=0 and crm.program_key in ('1-step','2-step','3-step') then
    select p.price_amount into fee from public.purchases p join public.trading_accounts a on a.purchase_id=p.id
      where a.id=group_id and a.user_id=p_user and p.user_id=p_user and p.payment_status='paid' and coalesce(p.refund_status,'none')='none';
  end if;
  select kyc_status into kyc from public.profiles where id=p_user;
  if acct.phase <> 'funded' or acct.status not in ('active','funded') or crm.status not in ('active','funded') then blockers:=array_append(blockers,'Payouts require an active funded account.'); end if;
  if pending then blockers:=array_append(blockers,'A payout for this account is already under review.'); end if;
  if open_positions>0 or working_orders then blockers:=array_append(blockers,'Close open positions and cancel working orders before requesting a payout.'); end if;
  if profit<=0 then blockers:=array_append(blockers,'There is no eligible realized profit to withdraw.'); end if;
  if next_at is not null then blockers:=array_append(blockers,'The next payout date is '||to_char(next_at at time zone 'UTC','YYYY-MM-DD HH24:MI UTC')||'.'); end if;
  if not consistent then blockers:=array_append(blockers,'Your best trading day exceeds the consistency limit. Eligible gross profit must reach $'||needed||'.'); end if;
  return jsonb_build_object('accountId',crm.id,'terminalAccountId',acct.id,'programKey',crm.program_key,'startingBalance',acct.starting_balance,
    'balance',acct.balance,'profit',profit,'splitPct',crm.profit_split,'sequenceNo',counted+1,'onDemand',counted<demand,'onDemandLeft',greatest(0,demand-counted),
    'nextEligibleAt',next_at,'hasPending',pending,'openPositions',open_positions,'consistency',jsonb_build_object('limitPct',cap,'bestDay',stats.best,
    'periodProfit',stats.net,'sharePct',share,'ok',consistent,'neededProfit',needed),'stipendBalance',stipend,'feeRefund',coalesce(fee,0),
    'minPayout',minimum,'kycStatus',coalesce(kyc,'pending'),'blockers',blockers,'reviewPeriodStart',previous.created_at,
    'newsReviewFrom',coalesce(stats.first_open,previous.created_at,acct.created_at)-make_interval(mins=>news),'newsMinutes',news);
end $$;

create function public.request_trader_payout(p_user uuid,p_account uuid,p_gross numeric,p_method text,p_details text,p_request_key uuid)
returns public.payouts language plpgsql security definer set search_path = '' as $$
declare
  q jsonb; gross numeric; share numeric; stipend numeric:=0; fee numeric; payout public.payouts;
begin
  perform 1 from auth.users where id=p_user for no key update;
  if not found then raise exception 'User not found' using errcode='P0002'; end if;
  select * into payout from public.payouts where user_id=p_user and request_key=p_request_key;
  if found then return payout; end if;
  if p_request_key is null or p_method is null or p_method not in ('usdt_trc20','usdt_erc20','usdt_bep20','bank_transfer')
    or coalesce(length(trim(p_details)),0) not between 1 and 500 then raise exception 'Invalid payment details' using errcode='23514'; end if;
  perform 1 from public.accounts t join public.trading_accounts c on c.terminal_account_id=t.id
    where c.user_id=p_user and t.user_id=p_user and p_account in (c.id,t.id) for update of t;
  q:=public.trader_payout_quote(p_user,p_account);
  if jsonb_array_length(q->'blockers')>0 then raise exception '%',q->'blockers'->>0 using errcode='23514'; end if;
  gross:=coalesce(p_gross,(q->>'profit')::numeric);
  if gross<=0 or gross<>round(gross,2) or gross>(q->>'profit')::numeric then raise exception 'Choose an available profit amount in whole cents' using errcode='23514'; end if;
  if gross<(q->'consistency'->>'neededProfit')::numeric then raise exception 'Requested gross profit does not meet this account’s consistency limit' using errcode='23514'; end if;
  share:=round(gross*(q->>'splitPct')::numeric/100,2);
  if share<(q->>'minPayout')::numeric then raise exception 'The trader share is below the payout minimum' using errcode='23514'; end if;
  fee:=(q->>'feeRefund')::numeric;
  perform public.payout_debit((q->>'terminalAccountId')::uuid,p_user,gross);
  insert into public.payouts(user_id,account_id,trading_account_id,amount,profit,gross_profit,profit_split,trader_share,
    fee_refund_amount,sequence_no,on_demand,crypto_address,payment_details,payment_method,status,request_key,review_period_start,
    eligible_carry,consistency_limit,news_minutes,minimum_share,news_review_from)
    values(p_user,(q->>'terminalAccountId')::uuid,(q->>'accountId')::uuid,share+fee,gross,gross,(q->>'splitPct')::numeric,share,
    fee,(q->>'sequenceNo')::int,(q->>'onDemand')::boolean,trim(p_details),trim(p_details),p_method,'pending',p_request_key,
    (q->>'reviewPeriodStart')::timestamptz,(q->>'profit')::numeric-gross,(q->'consistency'->>'limitPct')::numeric,(q->>'newsMinutes')::int,(q->>'minPayout')::numeric,(q->>'newsReviewFrom')::timestamptz)
    returning * into payout;
  if coalesce((select value #>> '{}' from public.admin_settings where key='stipend_release'),'with_payout')='with_payout' then
    with released as (update public.stipend_accruals set status='released',payout_id=payout.id,released_at=now()
      where user_id=p_user and status='accrued' returning amount) select coalesce(sum(amount),0) into stipend from released;
    update public.payouts set stipend_amount=stipend,amount=share+fee+stipend where id=payout.id returning * into payout;
  end if;
  insert into public.admin_notifications(type,severity,title,message,entity_type,entity_id,user_id)
    values('new_payout','info','New payout request','Payout #'||payout.sequence_no||' requests $'||payout.amount||'.','payout',payout.id::text,p_user);
  return payout;
end $$;

create unique index payouts_reviewed_transfer on public.payouts(payment_method,lower(trim(tx_reference)))
  where status='paid' and news_reviewed_at is not null and tx_reference is not null;

create function public.process_trader_payout(p_id uuid,p_admin uuid,p_action text,p_notes text,p_reference text,
  p_source text,p_events timestamptz[],p_confirmed_amount numeric)
returns public.payouts language plpgsql security definer set search_path = '' as $$
declare
  payout public.payouts; crm public.trading_accounts; rules public.trading_rules; stats record; target_user uuid;
  role_name text; email text; eligible numeric; share numeric; since_at timestamptz; minutes int; cap numeric; minimum numeric;
begin
  select role into role_name from public.admin_roles where user_id=p_admin;
  if coalesce(role_name,'') not in ('super_admin','finance') and not (role_name is null and exists(
    select 1 from public.profiles where id=p_admin and is_admin)) then raise exception 'Forbidden' using errcode='42501'; end if;
  select user_id into target_user from public.payouts where id=p_id;
  perform 1 from auth.users where id=target_user for no key update;
  select * into payout from public.payouts where id=p_id for update;
  if not found then raise exception 'Payout not found' using errcode='P0002'; end if;
  if payout.status=p_action and p_action in ('paid','rejected') then
    if p_action='paid' and (payout.tx_reference is distinct from trim(p_reference) or payout.amount is distinct from p_confirmed_amount) then
      raise exception 'Payout was paid with a different confirmation' using errcode='23514';
    end if;
    return payout;
  end if;
  if payout.status<>'pending' then raise exception 'Payout already processed' using errcode='23514'; end if;
  if payout.gross_profit is null or payout.gross_profit<=0 then
    raise exception 'Legacy payout lacks a recorded debit. Reconcile its account ledger before processing.' using errcode='23514';
  end if;
  select * into crm from public.trading_accounts where terminal_account_id=payout.account_id and user_id=payout.user_id
    and (payout.trading_account_id is null or id=payout.trading_account_id) limit 1;
  if p_action in ('review','paid') and not exists(select 1 from public.profiles where id=payout.user_id and kyc_status='approved') then
    raise exception 'Approve the trader’s KYC before confirming a transfer' using errcode='23514';
  end if;
  if p_action='review' then
    if payout.news_reviewed_at is not null then return payout; end if;
    if crm.id is null or p_events is null or cardinality(p_events)>1000 or array_position(p_events,null) is not null
      or coalesce(length(trim(p_source)),0) not between 4 and 500 then
      raise exception 'Record the verified high-impact calendar source and UTC release times' using errcode='23514';
    end if;
    select * into rules from public.trading_rules where id=crm.rule_id;
    cap:=coalesce(payout.consistency_limit,nullif(rules.consistency_pct,0),case when crm.program_key like 'instant%' then 25 else 40 end);
    minutes:=coalesce(payout.news_minutes,nullif(rules.news_window_minutes,0),2);
    minimum:=coalesce(payout.minimum_share,private.setting_num('payout_min_amount',50));
    since_at:=payout.review_period_start;
    if payout.request_key is null then
      select max(p.created_at) into since_at from public.payouts p where p.user_id=payout.user_id and p.status='paid' and p.created_at<payout.created_at
        and exists(select 1 from public.trading_accounts a where a.user_id=payout.user_id and coalesce(a.phase_group_id,a.id)=coalesce(crm.phase_group_id,crm.id)
          and (p.trading_account_id=a.id or p.account_id=a.terminal_account_id));
    end if;
    select * into stats from private.payout_trades(payout.account_id,since_at,payout.created_at,p_events,minutes);
    eligible:=payout.gross_profit-round(stats.excluded,2);
    if eligible<=0 or stats.best*100>eligible*cap then
      raise exception 'Reviewed profit fails the payout or consistency rule. Decline this request and return its reservation.' using errcode='23514';
    end if;
    if payout.profit_split is null or payout.profit_split not between 1 and 100 then raise exception 'Verify the recorded profit split' using errcode='23514'; end if;
    share:=round(eligible*payout.profit_split/100,2);
    if share<minimum then raise exception 'Reviewed trader share is below the minimum. Decline this request.' using errcode='23514'; end if;
    update public.payouts set news_reviewed_at=now(),news_reviewed_by=p_admin,news_source=trim(p_source),news_events=p_events,
      news_excluded_profit=round(stats.excluded,2),trader_share=share,amount=share+coalesce(stipend_amount,0)+coalesce(fee_refund_amount,0)
      where id=p_id returning * into payout;
  elsif p_action='rejected' then
    if coalesce(length(trim(p_notes)),0)=0 then raise exception 'Enter the reason for declining the payout' using errcode='23514'; end if;
    update public.accounts set balance=balance+payout.gross_profit,equity=equity+payout.gross_profit,
      daily_start_balance=daily_start_balance+payout.gross_profit,highest_equity=highest_equity+payout.gross_profit
      where id=payout.account_id and user_id=payout.user_id;
    if not found then raise exception 'Account debit could not be restored'; end if;
    update public.stipend_accruals set status='accrued',payout_id=null,released_at=null where payout_id=p_id and status='released';
    update public.payouts set status='rejected',rejected_reason=trim(p_notes),notes=trim(p_notes),processed_at=now(),processed_by=p_admin where id=p_id returning * into payout;
    insert into public.user_notifications(user_id,type,title,body,link) values(payout.user_id,'payout_rejected','Payout declined',
      'Your reserved profit and rewards have been returned. '||trim(p_notes),'/dashboard/payouts');
  elsif p_action='paid' then
    if payout.news_reviewed_at is null or coalesce(length(trim(p_reference)),0) not between 1 and 200 or payout.amount is distinct from p_confirmed_amount then
      raise exception 'Complete the news review and confirm the exact transferred amount and reference' using errcode='23514';
    end if;
    if exists(select 1 from public.payouts where id<>p_id and status='paid' and payment_method is not distinct from payout.payment_method
      and lower(trim(tx_reference))=lower(trim(p_reference))) then raise exception 'Transfer reference already recorded' using errcode='23505'; end if;
    if coalesce(payout.fee_refund_amount,0)>0 then
      update public.purchases p set refund_status='refunded',refund_amount=payout.fee_refund_amount,refund_reason='Refunded with first payout'
        from public.trading_accounts a where a.id=coalesce(crm.phase_group_id,crm.id) and a.user_id=payout.user_id
        and a.purchase_id=p.id and p.user_id=payout.user_id and p.payment_status='paid' and coalesce(p.refund_status,'none')='none';
      if not found then raise exception 'Fee refund reservation requires reconciliation' using errcode='23514'; end if;
    end if;
    update public.stipend_accruals set status='paid',paid_at=now() where payout_id=p_id and status='released';
    update public.payouts set status='paid',notes=nullif(trim(p_notes),''),tx_reference=trim(p_reference),processed_at=now(),processed_by=p_admin
      where id=p_id returning * into payout;
    insert into public.user_notifications(user_id,type,title,body,link) values(payout.user_id,'payout_paid','Payout sent',
      'Your payout of $'||payout.amount||' has been sent.','/dashboard/payouts');
  else raise exception 'Invalid payout action' using errcode='23514';
  end if;
  select u.email into email from auth.users u where u.id=p_admin;
  insert into public.audit_logs(admin_id,admin_email,action,entity_type,entity_id,old_value,new_value)
    values(p_admin,email,'payout_'||p_action,'payout',p_id::text,jsonb_build_object('status','pending'),
      jsonb_build_object('status',payout.status,'amount',payout.amount,'news_excluded_profit',payout.news_excluded_profit,'tx_reference',payout.tx_reference));
  return payout;
end $$;

revoke all on function private.payout_trades(uuid,timestamptz,timestamptz,timestamptz[],integer) from public, anon, authenticated, service_role;
revoke all on function public.trader_payout_quote(uuid,uuid),public.request_trader_payout(uuid,uuid,numeric,text,text,uuid),
  public.process_trader_payout(uuid,uuid,text,text,text,text,timestamptz[],numeric) from public, anon, authenticated, service_role;
grant execute on function public.trader_payout_quote(uuid,uuid),public.request_trader_payout(uuid,uuid,numeric,text,text,uuid),
  public.process_trader_payout(uuid,uuid,text,text,text,text,timestamptz[],numeric) to service_role;
