-- Contest sign-up checks: one free account per person, not per email address.
--
-- Fake Google accounts are free to make, so a confirmed email proves nothing. Each sign-up
-- through a referral link now carries the internet connection (IP address, compared per /64
-- for IPv6) and the browser (a first-party device cookie) it came from, and only sign-ups
-- that pass these checks count toward the reward:
--
--   referrer_network  same connection the referrer uses        -> doesn't count
--   referrer_device   same browser the referrer uses           -> doesn't count
--   shared_network    an earlier sign-up came from this connection (30 days) -> only the first counts
--   shared_device     an earlier sign-up came from this browser              -> only the first counts
--   no_network        we never saw where it signed up from     -> doesn't count until approved
--   unconfirmed       email not confirmed (as before)
--
-- An admin can approve or reject any single sign-up. A claim with any failed check waits for
-- an admin (or every claim does, with referral_claim_review = 'always'); clean claims are
-- still instant.

-- 1. Where accounts have been seen. Server-only: RLS on, no policies. ---------------------

create table if not exists public.account_networks (
  user_id uuid not null references auth.users(id) on delete cascade,
  net text not null,
  ip text,
  country text,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  hits integer not null default 1,
  primary key (user_id, net)
);
create index if not exists account_networks_net_idx on public.account_networks (net);

create table if not exists public.account_devices (
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id text not null,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now(),
  primary key (user_id, device_id)
);
create index if not exists account_devices_device_idx on public.account_devices (device_id);

-- Where each referred account signed up, and the admin's verdict on it. Kept apart from
-- affiliate_referrals, which referrers can read: they must not see their friends' IPs.
create table if not exists public.referral_signups (
  referred_user_id uuid primary key references auth.users(id) on delete cascade,
  net text,
  ip text,
  country text,
  device_id text,
  source text not null default 'app' check (source in ('app', 'auth_logs', 'admin')),
  recorded_at timestamptz not null default now(),
  review text check (review in ('approved', 'rejected')),
  review_note text,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz
);
create index if not exists referral_signups_net_idx on public.referral_signups (net);
create index if not exists referral_signups_device_idx on public.referral_signups (device_id);
create index if not exists affiliate_referrals_affiliate_idx on public.affiliate_referrals (affiliate_id, created_at);

alter table public.account_networks enable row level security;
alter table public.account_devices enable row level security;
alter table public.referral_signups enable row level security;
revoke all on public.account_networks, public.account_devices, public.referral_signups from anon, authenticated;

-- 2. Claims that wait for an admin ---------------------------------------------------------

alter table public.contest_entries
  add column if not exists claim_status text,
  add column if not exists claim_requested_at timestamptz,
  add column if not exists review_note text,
  add column if not exists reviewed_by uuid references auth.users(id) on delete set null,
  add column if not exists reviewed_at timestamptz;

do $$ begin
  alter table public.contest_entries add constraint contest_entries_claim_status_check
    check (claim_status in ('held', 'approved', 'rejected'));
exception when duplicate_object then null;
end $$;

-- 'auto': clean claims are instant, any failed check waits for an admin. 'always': every claim waits.
insert into public.admin_settings (key, value, category)
values ('referral_claim_review', '"auto"'::jsonb, 'trading')
on conflict (key) do nothing;

-- 3. Recording what the server sees --------------------------------------------------------

create or replace function public.record_account_signal(p_user uuid, p_net text, p_ip text default null,
                                                        p_country text default null, p_device text default null)
returns void language plpgsql security definer set search_path to '' as $$
declare
  joined timestamptz;
  net text := case when p_net ~ '^v[46]:[0-9a-f.]{4,40}$' then p_net end;
  device text := case when p_device ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then p_device end;
  country text := case when p_country ~ '^[A-Za-z]{2}$' then upper(p_country) end;
begin
  if p_user is null then return; end if;

  if net is not null then
    insert into public.account_networks as n (user_id, net, ip, country)
    values (p_user, net, left(p_ip, 64), country)
    on conflict (user_id, net) do update
      set last_seen = now(), hits = n.hits + 1,
          ip = coalesce(excluded.ip, n.ip), country = coalesce(excluded.country, n.country);
  end if;
  if device is not null then
    insert into public.account_devices as d (user_id, device_id) values (p_user, device)
    on conflict (user_id, device_id) do update set last_seen = now();
  end if;

  -- The first time the server sees a referred account, minutes after it signed up, is where it
  -- signed up from. Later sightings never move it.
  select u.created_at into joined from auth.users u where u.id = p_user;
  if joined is not null and joined > now() - interval '1 day'
     and exists (select 1 from public.affiliate_referrals r where r.referred_user_id = p_user) then
    insert into public.referral_signups as s (referred_user_id, net, ip, country, device_id, source)
    values (p_user, net, left(p_ip, 64), country, device, 'app')
    on conflict (referred_user_id) do update
      set net = coalesce(s.net, excluded.net), ip = coalesce(s.ip, excluded.ip),
          country = coalesce(s.country, excluded.country), device_id = coalesce(s.device_id, excluded.device_id);
  end if;
end $$;

-- 4. Which sign-ups count ------------------------------------------------------------------

create or replace function private.referral_checks(p_affiliate uuid default null)
returns table (referral_id uuid, affiliate_id uuid, referred_user_id uuid, created_at timestamptz,
               confirmed boolean, net text, country text, device_id text, review text, reason text, counted boolean)
language sql stable security definer set search_path to '' as $$
  with r as (
    select r.id, r.affiliate_id, r.referred_user_id, r.created_at,
           u.email_confirmed_at is not null as confirmed,
           s.net, s.country, s.device_id, s.review
    from public.affiliate_referrals r
    join auth.users u on u.id = r.referred_user_id and u.deleted_at is null
    left join public.referral_signups s on s.referred_user_id = r.referred_user_id
    where r.referred_user_id <> r.affiliate_id
      and (p_affiliate is null or r.affiliate_id = p_affiliate)
  )
  select r.id, r.affiliate_id, r.referred_user_id, r.created_at, r.confirmed, r.net, r.country, r.device_id, r.review,
         x.reason, (x.reason is null or x.reason = 'approved')
  from r
  cross join lateral (
    select case
      when r.review = 'rejected' then 'rejected'
      when r.review = 'approved' then 'approved'
      when not r.confirmed then 'unconfirmed'
      when r.net is null then 'no_network'
      when exists (select 1 from public.account_networks n where n.user_id = r.affiliate_id and n.net = r.net) then 'referrer_network'
      when r.device_id is not null
           and exists (select 1 from public.account_devices d where d.user_id = r.affiliate_id and d.device_id = r.device_id) then 'referrer_device'
      when exists (select 1 from public.referral_signups o
                   join public.affiliate_referrals oref on oref.referred_user_id = o.referred_user_id
                   where o.net = r.net and o.referred_user_id <> r.referred_user_id
                     and (oref.created_at, oref.id) < (r.created_at, r.id)
                     and oref.created_at > r.created_at - interval '30 days') then 'shared_network'
      when r.device_id is not null
           and exists (select 1 from public.referral_signups o
                       join public.affiliate_referrals oref on oref.referred_user_id = o.referred_user_id
                       where o.device_id = r.device_id and o.referred_user_id <> r.referred_user_id
                         and (oref.created_at, oref.id) < (r.created_at, r.id)) then 'shared_device'
    end as reason
  ) x
$$;

-- 5. The referrer's summary: "verified" is now what counts ----------------------------------

create or replace function public.referral_summary(p_user uuid)
returns jsonb language plpgsql stable security definer set search_path to '' as $$
declare
  me public.affiliates%rowtype;
  terms record;
  entry public.contest_entries%rowtype;
  default_pct numeric;
  reward_purchase uuid;
  reward_account uuid;
  summary jsonb;
begin
  if p_user is null or (auth.uid() is not null and auth.uid() <> p_user) then
    raise exception 'Not allowed' using errcode = '42501';
  end if;

  select * into me from public.affiliates where user_id = p_user;
  if not found then
    return null;
  end if;

  select * into terms from private.referral_terms();
  select * into entry from public.contest_entries where user_id = p_user;

  select case when trim(s.value #>> '{}') ~ '^[+-]?([0-9]+([.][0-9]*)?|[.][0-9]+)$' then (s.value #>> '{}')::numeric end
  into default_pct from public.admin_settings s where s.key = 'affiliate_commission_pct';

  select p.id, t.id into reward_purchase, reward_account
  from public.purchases p left join public.trading_accounts t on t.purchase_id = p.id
  where p.user_id = p_user and p.payment_method = 'referral_reward'
  order by p.created_at desc limit 1;

  with refs as (
    select c.created_at, c.confirmed, c.counted, c.reason, u.email,
           exists (select 1 from public.purchases p
                   where p.user_id = c.referred_user_id and coalesce(p.price_amount, 0) > 0
                     and p.payment_status in ('paid', 'completed')) as paid
    from private.referral_checks(p_user) c
    join auth.users u on u.id = c.referred_user_id
  )
  select jsonb_build_object(
    'code', me.referral_code,
    'clicks', coalesce(me.link_clicks, 0),
    'signups', count(*),
    'confirmed', count(*) filter (where confirmed),
    -- what the contest counts: confirmed sign-ups that passed the checks
    'verified', count(*) filter (where counted),
    'flagged', count(*) filter (where not counted and reason <> 'unconfirmed'),
    'paid', count(*) filter (where paid),
    'earnings', jsonb_build_object(
      'total', coalesce(me.total_earnings, 0),
      'pending', coalesce(me.pending_payout, 0),
      'ratePct', least(100, case when me.commission_rate > 0 then me.commission_rate else coalesce(default_pct, 10) end)
    ),
    'reward', jsonb_build_object(
      'target', terms.target,
      'program', terms.program,
      'size', terms.size,
      'claimed', coalesce(entry.claimed, false),
      'claimedAt', entry.claimed_at,
      'status', entry.claim_status,
      'requestedAt', entry.claim_requested_at,
      'note', entry.review_note,
      'purchaseId', reward_purchase,
      'accountId', reward_account
    ),
    'referrals', coalesce((
      select jsonb_agg(jsonb_build_object(
               'email', coalesce(left(split_part(x.email, '@', 1), 2) || '•••@' || split_part(x.email, '@', 2), '—'),
               'joinedAt', x.created_at,
               'verified', x.confirmed,
               'counted', x.counted,
               'reason', case when x.counted then null else x.reason end,
               'paid', x.paid) order by x.created_at desc)
      from (select * from refs order by created_at desc limit 200) x
    ), '[]'::jsonb)
  ) into summary
  from refs;

  return summary;
end $$;

-- 6. Giving the reward (instant claim, or an admin's approval) ------------------------------

create or replace function private.grant_referral_reward(p_user uuid, p_counted integer, p_admin uuid default null)
returns jsonb language plpgsql security definer set search_path to '' as $$
declare
  terms record;
  buyer_email text;
  order_ref text;
  reward_id uuid;
begin
  select * into terms from private.referral_terms();
  select u.email into buyer_email from auth.users u where u.id = p_user;
  order_ref := 'REFERRAL-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));

  insert into public.purchases (user_id, order_id, full_name, email, program_key, account_size, price_amount,
                                base_fee, payment_status, payment_method, kind, paid_at)
  select p_user, order_ref,
         coalesce(nullif(trim(concat_ws(' ', pr.first_name, pr.last_name)), ''), nullif(trim(pr.display_name), ''),
                  split_part(coalesce(buyer_email, ''), '@', 1)),
         coalesce(buyer_email, ''), terms.program, terms.size, 0, 0, 'paid', 'referral_reward', 'challenge', now()
  from (select 1) one left join public.profiles pr on pr.id = p_user
  returning id into reward_id;

  insert into public.contest_entries as e (user_id, referral_code, referral_count, target, claimed, claimed_at,
                                           claim_status, claim_requested_at, reviewed_by, reviewed_at)
  select p_user, a.referral_code, p_counted, terms.target, true, now(), 'approved', now(), p_admin,
         case when p_admin is not null then now() end
  from public.affiliates a where a.user_id = p_user
  on conflict (user_id) do update
    set claimed = true, claimed_at = now(), referral_count = excluded.referral_count, target = excluded.target,
        claim_status = 'approved', claim_requested_at = coalesce(e.claim_requested_at, now()),
        reviewed_by = excluded.reviewed_by, reviewed_at = excluded.reviewed_at;

  return jsonb_build_object('ok', true, 'purchaseId', reward_id, 'orderId', order_ref,
                            'program', terms.program, 'size', terms.size);
end $$;

-- 7. The trader's claim ----------------------------------------------------------------------

create or replace function public.claim_referral_reward(p_user uuid)
returns jsonb language plpgsql security definer set search_path to '' as $$
declare
  terms record;
  counted integer;
  flagged integer;
  mode text;
  entry public.contest_entries%rowtype;
  code text;
begin
  if p_user is null then
    raise exception 'User required' using errcode = '22023';
  end if;

  -- one claim at a time per user
  perform 1 from auth.users u where u.id = p_user and u.deleted_at is null for no key update;
  if not found then
    raise exception 'User does not exist' using errcode = '23503';
  end if;

  select * into terms from private.referral_terms();
  select count(*) filter (where c.counted), count(*) filter (where not c.counted and c.reason <> 'unconfirmed')
  into counted, flagged
  from private.referral_checks(p_user) c;

  select * into entry from public.contest_entries where user_id = p_user for update;
  if found and entry.claimed then
    return jsonb_build_object('ok', false, 'reason', 'already_claimed', 'verified', counted, 'target', terms.target);
  end if;
  if found and entry.claim_status = 'held' then
    return jsonb_build_object('ok', false, 'reason', 'held', 'verified', counted, 'target', terms.target);
  end if;
  if found and entry.claim_status = 'rejected' then
    return jsonb_build_object('ok', false, 'reason', 'rejected', 'note', entry.review_note, 'verified', counted, 'target', terms.target);
  end if;
  if counted < terms.target then
    return jsonb_build_object('ok', false, 'reason', 'not_enough', 'verified', counted, 'target', terms.target);
  end if;

  select coalesce(nullif(trim(s.value #>> '{}'), ''), 'auto') into mode
  from public.admin_settings s where s.key = 'referral_claim_review';

  if coalesce(mode, 'auto') = 'always' or flagged > 0 then
    select a.referral_code into code from public.affiliates a where a.user_id = p_user;
    insert into public.contest_entries as e (user_id, referral_code, referral_count, target, claimed, claim_status, claim_requested_at)
    values (p_user, code, counted, terms.target, false, 'held', now())
    on conflict (user_id) do update
      set claim_status = 'held', claim_requested_at = now(), referral_count = excluded.referral_count, target = excluded.target;

    insert into public.admin_notifications (type, severity, title, message, entity_type, entity_id, user_id)
    values ('fraud_alert', 'warning', 'Contest claim waiting for review',
            counted || ' sign-ups count, ' || flagged || ' failed the checks', 'contest_claim', p_user::text, p_user);

    return jsonb_build_object('ok', false, 'reason', 'held', 'verified', counted, 'target', terms.target);
  end if;

  return private.grant_referral_reward(p_user, counted, null);
end $$;

-- 8. Admin decisions ---------------------------------------------------------------------------

-- One sign-up: 'approve' counts it whatever the checks say, 'reject' never counts it, 'clear' goes back to the checks.
create or replace function public.review_referral_signup(p_referred uuid, p_admin uuid, p_decision text, p_note text default null)
returns void language plpgsql security definer set search_path to '' as $$
begin
  if p_decision not in ('approve', 'reject', 'clear') then
    raise exception 'Decision must be approve, reject or clear' using errcode = '22023';
  end if;
  if not exists (select 1 from public.affiliate_referrals where referred_user_id = p_referred) then
    raise exception 'Not a referred account' using errcode = 'P0002';
  end if;
  insert into public.referral_signups as s (referred_user_id, source, review, review_note, reviewed_by, reviewed_at)
  values (p_referred, 'admin',
          case p_decision when 'approve' then 'approved' when 'reject' then 'rejected' end,
          nullif(trim(p_note), ''), p_admin, now())
  on conflict (referred_user_id) do update
    set review = excluded.review, review_note = excluded.review_note, reviewed_by = excluded.reviewed_by, reviewed_at = now();
end $$;

-- A held (or rejected) claim: 'approve' gives the account, 'reject' declines it, 'reset' lets the trader claim again.
create or replace function public.review_referral_claim(p_user uuid, p_admin uuid, p_decision text, p_note text default null)
returns jsonb language plpgsql security definer set search_path to '' as $$
declare
  entry public.contest_entries%rowtype;
  counted integer;
begin
  if p_decision not in ('approve', 'reject', 'reset') then
    raise exception 'Decision must be approve, reject or reset' using errcode = '22023';
  end if;
  perform 1 from auth.users u where u.id = p_user for no key update;
  select * into entry from public.contest_entries where user_id = p_user for update;
  if found and entry.claimed then
    return jsonb_build_object('ok', false, 'reason', 'already_claimed');
  end if;

  if p_decision = 'approve' then
    select count(*) filter (where c.counted) into counted from private.referral_checks(p_user) c;
    return private.grant_referral_reward(p_user, counted, p_admin);
  end if;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'no_claim');
  end if;
  update public.contest_entries
     set claim_status = case when p_decision = 'reject' then 'rejected' end,
         review_note = case when p_decision = 'reject' then nullif(trim(p_note), '') end,
         reviewed_by = p_admin, reviewed_at = now()
   where id = entry.id;
  return jsonb_build_object('ok', true);
end $$;

-- 9. Admin board and the per-referrer list ----------------------------------------------------

drop function if exists public.referral_board();
create function public.referral_board()
returns table (user_id uuid, email text, display_name text, code text, signups bigint, confirmed bigint, counted bigint,
               flagged bigint, self_flags bigint, networks bigint, first_signup timestamptz, last_signup timestamptz,
               paid bigint, claimed boolean, claimed_at timestamptz, claim_status text, claim_requested_at timestamptz,
               reward_account uuid, reward_account_status text)
language sql stable security definer set search_path to '' as $$
  with c as (select * from private.referral_checks(null))
  select a.user_id, u.email::text, p.display_name, a.referral_code,
         count(c.referral_id),
         count(c.referral_id) filter (where c.confirmed),
         count(c.referral_id) filter (where c.counted),
         count(c.referral_id) filter (where not c.counted and c.reason <> 'unconfirmed'),
         count(c.referral_id) filter (where c.reason in ('referrer_network', 'referrer_device')),
         count(distinct c.net),
         min(c.created_at), max(c.created_at),
         count(c.referral_id) filter (where exists (select 1 from public.purchases pu
                                                    where pu.user_id = c.referred_user_id and coalesce(pu.price_amount, 0) > 0
                                                      and pu.payment_status in ('paid', 'completed'))),
         coalesce(e.claimed, false), e.claimed_at, e.claim_status, e.claim_requested_at,
         (select t.id from public.purchases rp join public.trading_accounts t on t.purchase_id = rp.id
          where rp.user_id = a.user_id and rp.payment_method = 'referral_reward' order by rp.created_at desc limit 1),
         (select t.status from public.purchases rp join public.trading_accounts t on t.purchase_id = rp.id
          where rp.user_id = a.user_id and rp.payment_method = 'referral_reward' order by rp.created_at desc limit 1)
  from public.affiliates a
  join auth.users u on u.id = a.user_id
  left join public.profiles p on p.id = a.user_id
  left join public.contest_entries e on e.user_id = a.user_id
  left join c on c.affiliate_id = a.user_id
  group by a.user_id, u.email, p.display_name, a.referral_code, e.claimed, e.claimed_at, e.claim_status, e.claim_requested_at
  having count(c.referral_id) > 0 or coalesce(e.claimed, false) or e.claim_status is not null
  order by (e.claim_status = 'held') desc nulls last, 7 desc, 5 desc
$$;

create or replace function public.referral_signup_list(p_affiliate uuid)
returns table (referred_user_id uuid, email text, created_at timestamptz, last_sign_in_at timestamptz, confirmed boolean,
               net text, ip text, country text, device_id text, source text, net_signups bigint, device_signups bigint,
               reason text, counted boolean, review text, review_note text)
language sql stable security definer set search_path to '' as $$
  select c.referred_user_id, u.email::text, c.created_at, u.last_sign_in_at, c.confirmed,
         c.net, s.ip, c.country, c.device_id, s.source,
         (select count(*) from public.referral_signups o where o.net = c.net),
         (select count(*) from public.referral_signups o where o.device_id = c.device_id),
         c.reason, c.counted, c.review, s.review_note
  from private.referral_checks(p_affiliate) c
  join auth.users u on u.id = c.referred_user_id
  left join public.referral_signups s on s.referred_user_id = c.referred_user_id
  order by c.created_at
$$;

-- 10. Who may call what -------------------------------------------------------------------------

revoke all on function public.record_account_signal(uuid, text, text, text, text) from public, anon, authenticated;
revoke all on function private.referral_checks(uuid) from public, anon, authenticated;
revoke all on function private.grant_referral_reward(uuid, integer, uuid) from public, anon, authenticated;
revoke all on function public.claim_referral_reward(uuid) from public, anon, authenticated;
revoke all on function public.review_referral_signup(uuid, uuid, text, text) from public, anon, authenticated;
revoke all on function public.review_referral_claim(uuid, uuid, text, text) from public, anon, authenticated;
revoke all on function public.referral_board() from public, anon, authenticated;
revoke all on function public.referral_signup_list(uuid) from public, anon, authenticated;
revoke all on function public.referral_summary(uuid) from public, anon;

grant execute on function public.record_account_signal(uuid, text, text, text, text) to service_role;
grant execute on function public.claim_referral_reward(uuid) to service_role;
grant execute on function public.review_referral_signup(uuid, uuid, text, text) to service_role;
grant execute on function public.review_referral_claim(uuid, uuid, text, text) to service_role;
grant execute on function public.referral_board() to service_role;
grant execute on function public.referral_signup_list(uuid) to service_role;
grant execute on function public.referral_summary(uuid) to authenticated, service_role;
