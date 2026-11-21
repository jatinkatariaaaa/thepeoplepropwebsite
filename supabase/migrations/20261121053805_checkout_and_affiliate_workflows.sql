-- Count linked CRM and terminal records once. Both resident and CRM-only
-- accounts contribute, including records created before provisioning keys.
alter table public.purchases add column funded_issue_key uuid;
create unique index purchase_funded_issue on public.purchases(funded_issue_key)
  where funded_issue_key is not null and payment_status in ('pending','paid','underpaid','invoice_review');
create index purchase_reserved_funding on public.purchases(user_id) where funded_issue_key is not null;
create function public.funded_allocation(p_user_id uuid) returns numeric
language sql stable security definer set search_path = '' as $$
  select coalesce(sum(amount),0) from (
    select account_key,max(amount) amount from (
      select c.id account_key,c.starting_balance amount from public.trading_accounts c
      where c.user_id=p_user_id and (c.phase='funded' or c.phase_index=99) and c.status in ('active','funded')
      union all
      select coalesce(link.id,a.id), a.starting_balance from public.accounts a
      left join lateral (select c.id from public.trading_accounts c where c.user_id=a.user_id
        and (c.id=a.business_account_id or c.terminal_account_id=a.id) order by (c.id=a.business_account_id) desc nulls last,c.id limit 1) link on true
      where a.user_id=p_user_id and a.phase='funded' and a.status in ('active','funded')
      union all
      select p.funded_issue_key,p.account_size from public.purchases p where p.user_id=p_user_id
        and p.funded_issue_key is not null and p.payment_status in ('pending','paid','underpaid','invoice_review')
        and not exists (select 1 from public.accounts a where a.id=p.funded_issue_key)
        and not exists (select 1 from public.trading_accounts c where c.id=p.funded_issue_key)
    ) candidates group by account_key
  ) grouped
$$;

create function private.enforce_funded_cap() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if new.user_id is null or new.status::text not in ('active','funded') then return new; end if;
  if new.phase::text <> 'funded' and coalesce((to_jsonb(new)->>'phase_index')::integer,0) <> 99 then return new; end if;
  if tg_op='UPDATE' and old.user_id is not distinct from new.user_id and old.status::text in ('active','funded')
    and (old.phase::text='funded' or (to_jsonb(old)->>'phase_index')='99')
    and new.starting_balance<=old.starting_balance then return new; end if;
  perform pg_advisory_xact_lock(hashtextextended('funded-allocation:' || new.user_id::text, 0));
  if public.funded_allocation(new.user_id)>400000 then
    raise exception 'Combined active funded allocation cannot exceed USD 400,000' using errcode='23514';
  end if;
  return new;
end $$;
create function private.reserve_checkout_funding() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  perform pg_advisory_xact_lock(hashtextextended('funded-allocation:' || new.user_id::text,0));
  if public.funded_allocation(new.user_id)>400000 then
    raise exception 'Combined active funded allocation cannot exceed USD 400,000' using errcode='23514';
  end if;
  return new;
end $$;
create trigger reserve_checkout_funding after insert on public.purchases for each row
  when (new.funded_issue_key is not null) execute function private.reserve_checkout_funding();

create function private.connect_terminal_account() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  if new.terminal_account_id is null then return new; end if;
  update public.accounts set business_account_id=new.id where id=new.terminal_account_id and user_id=new.user_id
    and (business_account_id is null or business_account_id=new.id);
  if not found then raise exception 'Terminal account does not match CRM owner or link' using errcode='23514'; end if;
  return new;
end $$;
create trigger connect_terminal_account after insert or update of terminal_account_id on public.trading_accounts
  for each row execute function private.connect_terminal_account();

create function public.settle_free_checkout(p_id uuid) returns void language plpgsql security definer set search_path='' as $$
declare p public.purchases%rowtype;
begin
  select * into strict p from public.purchases where id=p_id for update;
  if p.price_amount<>0 or p.price_amount is null or p.payment_status not in ('paid','pending') then raise exception 'Order cannot be settled' using errcode='23514'; end if;
  if p.payment_status='paid' then return; end if;
  if p.promo_code is not null then
    update public.tpp_coupons set current_uses=coalesce(current_uses,0)+1 where code=p.promo_code and is_active
      and (expires_at is null or expires_at>now()) and (max_uses is null or coalesce(current_uses,0)<max_uses);
    if not found then raise exception 'Coupon is no longer available' using errcode='23514'; end if;
  end if;
  update public.purchases set payment_status='paid', paid_at=now() where id=p_id;
end $$;
revoke all on function private.reserve_checkout_funding(),private.connect_terminal_account(),public.settle_free_checkout(uuid)
  from public,anon,authenticated,service_role;
grant execute on function public.settle_free_checkout(uuid) to service_role;
create trigger terminal_funded_cap after insert or update of phase,status,user_id,starting_balance on public.accounts
  for each row execute function private.enforce_funded_cap();
create trigger crm_funded_cap after insert or update of phase,phase_index,status,user_id,starting_balance on public.trading_accounts
  for each row execute function private.enforce_funded_cap();

create table public.affiliate_payout_requests (
  id uuid primary key,
  user_id uuid not null references public.affiliates(user_id),
  amount numeric(18,2) not null check (amount>0),
  method text not null check(method in ('usdt_trc20','usdt_erc20','usdt_bep20')),
  destination text not null,
  status text not null default 'pending' check(status in ('pending','paid','rejected')),
  created_at timestamptz not null default now(),
  decided_at timestamptz, decided_by uuid references auth.users(id),
  payment_reference text, rejection_reason text
);
create unique index affiliate_one_pending_request on public.affiliate_payout_requests(user_id) where status='pending';
create index affiliate_request_history on public.affiliate_payout_requests(user_id,created_at desc);
create index affiliate_request_queue on public.affiliate_payout_requests(status,created_at);
create unique index affiliate_payment_reference on public.affiliate_payout_requests(method,lower(payment_reference)) where status='paid';
alter table public.affiliate_payout_requests enable row level security;
revoke all on public.affiliate_payout_requests from public,anon,authenticated,service_role;
grant select on public.affiliate_payout_requests to service_role;

create function public.affiliate_withdrawal_access(p_user uuid) returns boolean
language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.affiliates where user_id=p_user)
    and not exists(select 1 from public.staff_members where user_id=p_user and (not active or not ('view_commissions'=any(permissions))))
$$;
create function public.request_affiliate_withdrawal(p_id uuid,p_user uuid,p_amount numeric,p_method text,p_destination text)
returns void language plpgsql security definer set search_path='' as $$
declare existing public.affiliate_payout_requests%rowtype; available numeric; affiliate_status text;
begin
  select pending_payout,status into available,affiliate_status from public.affiliates where user_id=p_user for update;
  if not found or not public.affiliate_withdrawal_access(p_user) then raise exception 'Unavailable' using errcode='42501'; end if;
  select * into existing from public.affiliate_payout_requests where id=p_id;
  if found then
    if existing.user_id=p_user and existing.amount=p_amount and existing.method=p_method and existing.destination=p_destination then return; end if;
    raise exception 'Request conflict' using errcode='23505';
  end if;
  if affiliate_status not in ('active','approved') or affiliate_status is null then raise exception 'Affiliate account inactive' using errcode='42501'; end if;
  if p_amount is null or p_amount<=0 or p_amount<>round(p_amount,2) or p_amount>coalesce(available,0) then
    raise exception 'Amount exceeds available commission or is not valid' using errcode='23514';
  end if;
  if p_destination is null or p_method is null or not (case p_method when 'usdt_trc20' then p_destination ~ '^T[1-9A-HJ-NP-Za-km-z]{33}$'
    when 'usdt_erc20' then p_destination ~ '^0x[0-9a-fA-F]{40}$' when 'usdt_bep20' then p_destination ~ '^0x[0-9a-fA-F]{40}$' else false end)
  then raise exception 'Enter a valid address for the selected network' using errcode='23514'; end if;
  insert into public.affiliate_payout_requests(id,user_id,amount,method,destination) values (p_id,p_user,p_amount,p_method,p_destination);
  update public.affiliates set pending_payout=pending_payout-p_amount where user_id=p_user;
end $$;

create function public.review_affiliate_withdrawal(p_id uuid,p_admin uuid,p_status text,p_note text)
returns void language plpgsql security definer set search_path='' as $$
declare req public.affiliate_payout_requests%rowtype; aff public.affiliates%rowtype;
begin
  select * into req from public.affiliate_payout_requests where id=p_id;
  if not found then raise exception 'Request not found' using errcode='P0002'; end if;
  select * into aff from public.affiliates where user_id=req.user_id for update;
  select * into req from public.affiliate_payout_requests where id=p_id for update;
  if req.status=p_status and coalesce(req.payment_reference,req.rejection_reason)=p_note then return; end if;
  if req.status<>'pending' then raise exception 'Request already reviewed' using errcode='40001'; end if;
  if req.user_id=p_admin then raise exception 'Another finance reviewer must review this request' using errcode='42501'; end if;
  if p_note is null or length(trim(p_note)) not between 3 and 250 or p_status is null or p_status not in ('paid','rejected')
  then raise exception 'Enter proof of payment or a rejection reason' using errcode='23514'; end if;
  if p_status='paid' and (aff.pending_payout<0 or coalesce(aff.status,'') not in ('active','approved')) then
    raise exception 'Commission changed or affiliate suspended. Review before paying.' using errcode='23514';
  end if;
  if p_status='rejected' then update public.affiliates set pending_payout=coalesce(pending_payout,0)+req.amount where user_id=req.user_id; end if;
  update public.affiliate_payout_requests set status=p_status,decided_at=now(),decided_by=p_admin,
    payment_reference=case when p_status='paid' then p_note end,rejection_reason=case when p_status='rejected' then p_note end where id=p_id;
end $$;
revoke all on function public.funded_allocation(uuid),private.enforce_funded_cap(),public.affiliate_withdrawal_access(uuid),
  public.request_affiliate_withdrawal(uuid,uuid,numeric,text,text),public.review_affiliate_withdrawal(uuid,uuid,text,text)
  from public,anon,authenticated,service_role;
grant execute on function public.funded_allocation(uuid),public.affiliate_withdrawal_access(uuid),
  public.request_affiliate_withdrawal(uuid,uuid,numeric,text,text),public.review_affiliate_withdrawal(uuid,uuid,text,text) to service_role;
