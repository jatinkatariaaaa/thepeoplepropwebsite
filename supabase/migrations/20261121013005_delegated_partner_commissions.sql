-- Delegated staff never acquire an admin_roles row or profiles.is_admin.
create table public.staff_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  rank text not null check (length(trim(rank)) between 1 and 60),
  permissions text[] not null check (
    array_position(permissions, null) is null and
    permissions <@ array['view_total_logins','view_referrals','view_commissions','manage_links']::text[]
  ),
  commission_bps integer not null check (commission_bps between 0 and 10000),
  active boolean not null,
  updated_at timestamptz not null default clock_timestamp()
);

create table public.partner_links (
  id uuid primary key default gen_random_uuid(),
  partner_id uuid not null references public.staff_members(user_id) on delete cascade,
  promoter_id uuid references auth.users(id) on delete cascade,
  code text not null unique default replace(gen_random_uuid()::text, '-', ''),
  promoter_bps integer not null default 0 check (promoter_bps between 0 and 10000),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  check (partner_id is distinct from promoter_id),
  check (promoter_id is not null or promoter_bps = 0),
  unique (partner_id, promoter_id)
);
create unique index partner_direct_link on public.partner_links(partner_id) where promoter_id is null;
create index partner_links_promoter on public.partner_links(promoter_id) where promoter_id is not null;

create table public.partner_attributions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  link_id uuid not null references public.partner_links(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index partner_attributions_link on public.partner_attributions(link_id);

-- One frozen allocation per purchase, including the firm's retained amount.
create table public.partner_sales (
  purchase_id uuid primary key references public.purchases(id),
  buyer_id uuid not null references auth.users(id),
  link_id uuid not null references public.partner_links(id),
  partner_id uuid not null references public.staff_members(user_id),
  promoter_id uuid references auth.users(id),
  gross_cents bigint not null check (gross_cents > 0),
  owner_cents bigint not null check (owner_cents >= 0),
  partner_cents bigint not null check (partner_cents >= 0),
  promoter_cents bigint not null check (promoter_cents >= 0),
  partner_bps integer not null check (partner_bps between 0 and 10000),
  promoter_bps integer not null check (promoter_bps between 0 and partner_bps),
  created_at timestamptz not null default now(),
  reversed_at timestamptz,
  check (owner_cents + partner_cents + promoter_cents = gross_cents),
  check (promoter_id is not null or (promoter_bps = 0 and promoter_cents = 0))
);
create index partner_sales_partner on public.partner_sales(partner_id, created_at desc);
create index partner_sales_promoter on public.partner_sales(promoter_id, created_at desc) where promoter_id is not null;
create index partner_sales_link on public.partner_sales(link_id);
create index partner_sales_buyer on public.partner_sales(buyer_id);

-- A split has two payees. Keep the existing one-legacy-earning-per-purchase
-- index intact and reference the purchase through its partner allocation.
alter table public.affiliate_earnings add column partner_sale_id uuid references public.partner_sales(purchase_id),
  add constraint affiliate_earnings_one_source check (partner_sale_id is null or purchase_id is null);
create unique index affiliate_earnings_partner_payee on public.affiliate_earnings(partner_sale_id, affiliate_id)
  where partner_sale_id is not null;

alter table public.staff_members enable row level security;
alter table public.partner_links enable row level security;
alter table public.partner_attributions enable row level security;
alter table public.partner_sales enable row level security;
revoke all on public.staff_members, public.partner_links, public.partner_attributions, public.partner_sales from public, anon, authenticated;
grant select on public.staff_members, public.partner_links, public.partner_attributions, public.partner_sales to service_role;
revoke insert, update, delete, truncate on public.staff_members, public.partner_links, public.partner_attributions, public.partner_sales from service_role;

create function public.partner_account_id(p_email text) returns uuid
language sql stable security definer set search_path = '' as $$
  select case when count(*) = 1 then (array_agg(u.id))[1] end
    from auth.users u where lower(u.email) = lower(trim(p_email)) and u.deleted_at is null
    and not coalesce(u.is_anonymous, false)
$$;

create function public.set_staff_member(p_user_id uuid, p_rank text, p_permissions text[], p_commission_bps integer,
  p_active boolean, p_expected_updated_at timestamptz default null) returns void
language plpgsql security definer set search_path = '' as $$
declare
  previous_version timestamptz;
begin
  perform 1 from auth.users where id = p_user_id for no key update;
  if not found then raise exception 'User does not exist' using errcode = '23503'; end if;
  select updated_at into previous_version from public.staff_members where user_id = p_user_id for update;
  if previous_version is distinct from p_expected_updated_at then
    raise exception 'Staff access changed. Reload before saving.' using errcode = '40001';
  end if;
  if p_active and (exists (select 1 from public.admin_roles where user_id = p_user_id)
    or exists (select 1 from public.profiles where id = p_user_id and is_admin)) then
    raise exception 'This account already has administrative access' using errcode = '42501';
  end if;
  if p_active and exists (select 1 from public.partner_links where partner_id = p_user_id and active and promoter_bps > p_commission_bps) then
    raise exception 'Reduce or disable higher promoter allocations first' using errcode = '23514';
  end if;
  insert into public.staff_members (user_id, rank, permissions, commission_bps, active)
  values (p_user_id, trim(p_rank), p_permissions, p_commission_bps, p_active)
  on conflict (user_id) do update set rank = excluded.rank, permissions = excluded.permissions,
    commission_bps = excluded.commission_bps, active = excluded.active, updated_at = clock_timestamp();
  insert into public.partner_links(partner_id) values (p_user_id) on conflict (partner_id) where promoter_id is null do nothing;
  insert into public.affiliates(user_id, referral_code) values (p_user_id, replace(gen_random_uuid()::text, '-', '')) on conflict (user_id) do nothing;
end $$;

create function public.set_partner_link(p_partner_id uuid, p_promoter_id uuid, p_promoter_bps integer, p_active boolean,
  p_create_only boolean default false)
returns text language plpgsql security definer set search_path = '' as $$
declare
  member public.staff_members%rowtype;
  link_code text;
begin
  select * into member from public.staff_members where user_id = p_partner_id for update;
  if not found or not member.active or not ('manage_links' = any(member.permissions)) then
    raise exception 'Link management permission required' using errcode = '42501';
  end if;
  if p_promoter_id is null or p_promoter_id = p_partner_id or (p_active and p_promoter_bps > member.commission_bps) then
    raise exception 'Invalid promoter or allocation exceeds partner share' using errcode = '23514';
  end if;
  if p_create_only and exists (select 1 from public.partner_links where partner_id = p_partner_id and promoter_id = p_promoter_id) then
    raise exception 'A link already exists for this promoter' using errcode = '23505';
  end if;
  insert into public.partner_links(partner_id, promoter_id, promoter_bps, active)
    values (p_partner_id, p_promoter_id, p_promoter_bps, p_active)
    on conflict (partner_id, promoter_id) do update set promoter_bps = excluded.promoter_bps, active = excluded.active
    returning code into link_code;
  insert into public.affiliates(user_id, referral_code) values (p_promoter_id, replace(gen_random_uuid()::text, '-', '')) on conflict (user_id) do nothing;
  return link_code;
end $$;

create function public.attribute_partner_link(p_user_id uuid, p_code text) returns boolean
language plpgsql security definer set search_path = '' as $$
begin
  perform 1 from auth.users where id = p_user_id for no key update;
  if not found then return false; end if;
  insert into public.partner_attributions(user_id, link_id)
    select p_user_id, l.id from public.partner_links l join public.staff_members m on m.user_id = l.partner_id
      where l.code = p_code and l.active and m.active and p_user_id <> l.partner_id and p_user_id is distinct from l.promoter_id
      and not exists (select 1 from public.affiliate_referrals r where r.referred_user_id = p_user_id)
      and not exists (select 1 from public.purchases p where p.user_id = p_user_id and p.price_amount > 0 and p.payment_status in ('paid', 'completed', 'refunded'))
    on conflict (user_id) do nothing;
  return found;
end $$;

-- Existing affiliate balances are also read directly by the trader dashboard.
-- Keep those reads subject to the owner's grant, even with a direct REST query.
create function private.can_read_affiliate_commissions() returns boolean
language sql stable security definer set search_path = '' as $$
  select not exists (select 1 from public.staff_members where user_id = (select auth.uid())
    and (not active or not ('view_commissions' = any(permissions))))
$$;
revoke all on function private.can_read_affiliate_commissions() from public, anon, authenticated, service_role;
grant execute on function private.can_read_affiliate_commissions() to authenticated;
create policy delegated_affiliate_balances on public.affiliates as restrictive
  for select to authenticated using ((select private.can_read_affiliate_commissions()));
create policy delegated_affiliate_earnings on public.affiliate_earnings as restrictive
  for select to authenticated using ((select private.can_read_affiliate_commissions()));

create function private.post_partner_balances(sale public.partner_sales, reversing boolean) returns void
language plpgsql security definer set search_path = '' as $$
declare
  payee record;
begin
  -- Stable row lock order covers two partners promoting for one another.
  for payee in select * from (values (sale.partner_id, sale.partner_cents), (sale.promoter_id, sale.promoter_cents))
    as shares(user_id, cents) where cents > 0 order by user_id
  loop
    if reversing then
      update public.affiliate_earnings set status = 'reversed'
        where partner_sale_id = sale.purchase_id and affiliate_id = payee.user_id;
    else
      insert into public.affiliate_earnings(affiliate_id, partner_sale_id, amount, status)
        values (payee.user_id, sale.purchase_id, payee.cents / 100.0, 'pending');
    end if;
    update public.affiliates set
      total_earnings = coalesce(total_earnings, 0) + (case when reversing then -payee.cents else payee.cents end) / 100.0,
      pending_payout = coalesce(pending_payout, 0) + (case when reversing then -payee.cents else payee.cents end) / 100.0
      where user_id = payee.user_id;
    if not found then raise exception 'Affiliate balance missing'; end if;
  end loop;
end $$;

-- Retain the ordinary one-tier referral program when no partner claimed the buyer.
create function private.credit_standard_referral(p_purchase uuid, p_buyer uuid, p_amount numeric) returns void
language plpgsql security definer set search_path = '' as $$
declare
  referrer uuid;
  custom_pct numeric;
  default_pct numeric;
  earned numeric;
begin
  select a.user_id, a.commission_rate into referrer, custom_pct
    from public.affiliate_referrals r join public.affiliates a on a.user_id = r.affiliate_id
    where r.referred_user_id = p_buyer and r.affiliate_id <> p_buyer and coalesce(a.status, 'approved') in ('approved', 'active');
  if not found then return; end if;
  select case when trim(value #>> '{}') ~ '^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)([eE][+-]?[0-9]+)?$'
    then (value #>> '{}')::numeric end
    into default_pct from public.admin_settings where key = 'affiliate_commission_pct';
  if coalesce(default_pct, 10) <= 0 then return; end if;
  earned := round(p_amount * least(100, case when custom_pct > 0 then custom_pct else coalesce(default_pct, 10) end) / 100, 2);
  if earned <= 0 then return; end if;
  insert into public.affiliate_earnings(affiliate_id, referred_user_id, purchase_id, amount, status)
    values (referrer, p_buyer, p_purchase, earned, 'pending') on conflict (purchase_id) where purchase_id is not null do nothing;
  if found then
    update public.affiliates set total_earnings = coalesce(total_earnings, 0) + earned,
      pending_payout = coalesce(pending_payout, 0) + earned where user_id = referrer;
  end if;
end $$;

create function private.settle_purchase_commission() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  terms record;
  sale public.partner_sales%rowtype;
  gross bigint;
  allocated bigint;
  promoted bigint;
begin
  if tg_op = 'UPDATE' and old.payment_status is not distinct from new.payment_status then return new; end if;
  if new.payment_status = 'refunded' then
    update public.partner_sales set reversed_at = clock_timestamp()
      where purchase_id = new.id and reversed_at is null returning * into sale;
    if found then perform private.post_partner_balances(sale, true); end if;
    return new;
  end if;
  if new.payment_status is distinct from 'paid' or new.user_id is null or not (coalesce(new.price_amount, 0) > 0) then return new; end if;
  if tg_op = 'UPDATE' and old.payment_status = 'refunded' then return new; end if;
  perform 1 from auth.users where id = new.user_id for no key update;
  if exists (select 1 from public.affiliate_earnings where purchase_id = new.id) then return new; end if;
  select l.id, l.partner_id, l.promoter_id, l.promoter_bps, m.commission_bps,
    (m.active and l.active) as eligible into terms from public.partner_attributions a
    join public.partner_links l on l.id = a.link_id join public.staff_members m on m.user_id = l.partner_id
    where a.user_id = new.user_id;
  if not found then
    perform private.credit_standard_referral(new.id, new.user_id, new.price_amount);
    return new;
  end if;
  if not terms.eligible then return new; end if;
  gross := round(new.price_amount * 100);
  if gross <= 0 then return new; end if;
  allocated := round(gross::numeric * terms.commission_bps / 10000);
  promoted := round(gross::numeric * terms.promoter_bps / 10000);
  insert into public.partner_sales(purchase_id, buyer_id, link_id, partner_id, promoter_id, gross_cents,
    owner_cents, partner_cents, promoter_cents, partner_bps, promoter_bps)
    values (new.id, new.user_id, terms.id, terms.partner_id, terms.promoter_id, gross,
      gross - allocated, allocated - promoted, promoted, terms.commission_bps, terms.promoter_bps)
    on conflict (purchase_id) do nothing returning * into sale;
  if found then perform private.post_partner_balances(sale, false); end if;
  return new;
end $$;
create trigger settle_purchase_commission after insert or update of payment_status on public.purchases
  for each row when (new.payment_status in ('paid', 'refunded')) execute function private.settle_purchase_commission();

create function public.debit_affiliate_payout(p_user_id uuid, p_amount numeric) returns numeric
language plpgsql security definer set search_path = '' as $$
declare
  remaining numeric;
begin
  if p_amount is null or p_amount <= 0 or p_amount <> round(p_amount, 2) then
    raise exception 'Enter a positive amount in whole cents' using errcode = '23514';
  end if;
  update public.affiliates set pending_payout = pending_payout - p_amount
    where user_id = p_user_id and pending_payout >= p_amount returning pending_payout into remaining;
  if not found then raise exception 'Insufficient available balance' using errcode = '23514'; end if;
  return remaining;
end $$;

revoke all on function private.post_partner_balances(public.partner_sales,boolean),
  private.credit_standard_referral(uuid,uuid,numeric), private.settle_purchase_commission()
  from public, anon, authenticated, service_role;
revoke all on function public.partner_account_id(text), public.set_staff_member(uuid,text,text[],integer,boolean,timestamptz),
  public.set_partner_link(uuid,uuid,integer,boolean,boolean), public.attribute_partner_link(uuid,text), public.debit_affiliate_payout(uuid,numeric)
  from public, anon, authenticated, service_role;
grant execute on function public.partner_account_id(text), public.set_staff_member(uuid,text,text[],integer,boolean,timestamptz),
  public.set_partner_link(uuid,uuid,integer,boolean,boolean), public.attribute_partner_link(uuid,text), public.debit_affiliate_payout(uuid,numeric)
  to service_role;

-- One order may have several gateway payment attempts. Remember an early
-- refund so a delayed "finished" event for that attempt cannot settle it.
create table private.gateway_payment_refunds (
  purchase_id uuid not null references public.purchases(id) on delete cascade,
  payment_id text not null,
  primary key (purchase_id, payment_id)
);
revoke all on private.gateway_payment_refunds from public, anon, authenticated, service_role;

create function public.record_gateway_payment(p_order_id text, p_payment_id text, p_status text,
  p_invoice_amount numeric, p_currency text) returns text
language plpgsql security definer set search_path = '' as $$
declare
  purchase public.purchases%rowtype;
begin
  if nullif(p_payment_id, '') is null or p_status is null or p_status not in ('finished', 'refunded') then
    raise exception 'Invalid payment event' using errcode = '22023';
  end if;
  select * into purchase from public.purchases where order_id = p_order_id for update;
  if not found then return 'missing'; end if;
  if purchase.payment_status = 'refunded' then return 'ignored'; end if;
  if p_status = 'refunded' then
    insert into private.gateway_payment_refunds values (purchase.id, p_payment_id) on conflict do nothing;
    if purchase.payment_status = 'paid' and purchase.payment_id = p_payment_id then
      update public.purchases set payment_status = 'refunded' where id = purchase.id;
    end if;
    return 'ignored';
  end if;
  if exists (select 1 from private.gateway_payment_refunds where purchase_id = purchase.id and payment_id = p_payment_id) then
    return 'ignored';
  end if;
  if purchase.payment_status = 'paid' then
    return case when purchase.payment_id = p_payment_id then 'paid' else 'ignored' end;
  end if;
  if lower(p_currency) is distinct from 'usd' or p_invoice_amount is null or round(p_invoice_amount, 2) < round(purchase.price_amount, 2) then
    update public.purchases set payment_status = 'underpaid' where id = purchase.id;
    return 'amount_mismatch';
  end if;
  update public.purchases set payment_status = 'paid', paid_at = clock_timestamp(), payment_id = p_payment_id where id = purchase.id;
  if purchase.promo_code is not null then
    update public.tpp_coupons set current_uses = coalesce(current_uses, 0) + 1 where code = purchase.promo_code;
  end if;
  return 'paid';
end $$;
revoke all on function public.record_gateway_payment(text,text,text,numeric,text) from public, anon, authenticated, service_role;
grant execute on function public.record_gateway_payment(text,text,text,numeric,text) to service_role;
