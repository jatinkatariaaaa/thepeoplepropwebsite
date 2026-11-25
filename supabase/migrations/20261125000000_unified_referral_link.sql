-- One referral link for the contest and the affiliate programme.
--
-- Every user already has an affiliate code (affiliates.referral_code). /ref/<code> is
-- now the only link. A sign-up through it is recorded once, in affiliate_referrals,
-- and that single row drives both programmes:
--   * the contest: verified sign-ups toward a free reward account (20 → $10K 3-Step,
--     once per person, claimed instantly), and
--   * the affiliate programme: paid referrals and commissions, which stay with
--     private.settle_purchase_commission → private.credit_standard_referral.
--
-- Nothing is dropped. Old affiliate links (/ref/<8-hex>) and old contest links
-- (/ref/contest/<code>) resolve to the same referrer, and the old contest's
-- referrals are carried over.

-- 1. Campaign terms, editable from admin settings -----------------------------------

insert into public.admin_settings (key, value, category) values
  ('referral_reward_target', '20'::jsonb, 'trading'),
  ('referral_reward_program', '"3-step"'::jsonb, 'trading'),
  ('referral_reward_size', '10000'::jsonb, 'trading')
on conflict (key) do nothing;

create or replace function private.referral_terms(out target integer, out program text, out size numeric)
language sql stable security definer set search_path to '' as $$
  select
    coalesce((select (s.value #>> '{}')::integer from public.admin_settings s
              where s.key = 'referral_reward_target' and (s.value #>> '{}') ~ '^[0-9]{1,6}$'), 20),
    coalesce((select nullif(trim(s.value #>> '{}'), '') from public.admin_settings s
              where s.key = 'referral_reward_program'), '3-step'),
    coalesce((select (s.value #>> '{}')::numeric from public.admin_settings s
              where s.key = 'referral_reward_size' and (s.value #>> '{}') ~ '^[0-9]{1,9}([.][0-9]+)?$'), 10000)
$$;

-- 2. Any code from any of our links → the referrer's user id ------------------------

create or replace function public.resolve_referral_code(p_code text, p_kind text default 'link')
returns uuid language sql stable security definer set search_path to '' as $$
  select case
    when p_code is null or length(trim(p_code)) = 0 or length(trim(p_code)) > 64 then null
    when p_kind = 'contest' then (select e.user_id from public.contest_entries e where e.referral_code = upper(trim(p_code)))
    else public.partner_resolve_legacy_ref(lower(trim(p_code)))
  end
$$;

-- 3. Sign-up: record who referred the new user, and never let that block the sign-up -

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path to 'public' as $$
declare
  ref_raw text := nullif(trim(new.raw_user_meta_data->>'affiliate_id'), '');
  referrer uuid;
begin
  -- 1. Create the user's profile
  insert into public.profiles (id, email) values (new.id, new.email) on conflict (id) do nothing;

  -- 2. Create the user's affiliate account so they have a referral code
  insert into public.affiliates (user_id, referral_code)
  values (new.id, substr(md5(new.id::text), 1, 8)) on conflict (user_id) do nothing;

  -- 3. Record who referred them. New links send the referrer's user id; cookies left by
  --    older links may hold an affiliate or contest code instead. Anything unreadable
  --    is skipped, so a bad value can never stop someone signing up.
  if ref_raw is not null then
    begin
      if ref_raw ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
        select a.user_id into referrer from public.affiliates a where a.user_id = ref_raw::uuid;
      else
        referrer := coalesce(public.resolve_referral_code(ref_raw, 'link'), public.resolve_referral_code(ref_raw, 'contest'));
      end if;

      if referrer is not null and referrer <> new.id then
        insert into public.affiliate_referrals (affiliate_id, referred_user_id)
        values (referrer, new.id) on conflict (referred_user_id) do nothing;
        if found then
          update public.affiliates set total_referrals = coalesce(total_referrals, 0) + 1 where user_id = referrer;
        end if;
      end if;
    exception when others then
      raise warning 'referral not recorded for new user %: %', new.id, sqlerrm;
    end;
  end if;

  return new;
end $$;

-- 4. Sign-ups that can't carry metadata (Google): recorded on the first login --------

create or replace function public.attribute_referral(p_user uuid, p_referrer uuid)
returns boolean language plpgsql security definer set search_path to '' as $$
declare
  joined timestamptz;
begin
  if p_user is null or p_referrer is null or p_user = p_referrer then
    return false;
  end if;

  select u.created_at into joined from auth.users u where u.id = p_user for no key update;
  -- only brand-new accounts: an existing user can't be claimed by opening someone's link
  if not found or joined < now() - interval '1 hour' then
    return false;
  end if;

  if not exists (select 1 from public.affiliates a where a.user_id = p_referrer)
     or exists (select 1 from public.partner_attributions pa where pa.user_id = p_user)
     or exists (select 1 from public.purchases p where p.user_id = p_user and coalesce(p.price_amount, 0) > 0
                and p.payment_status in ('paid', 'completed', 'refunded')) then
    return false;
  end if;

  insert into public.affiliate_referrals (affiliate_id, referred_user_id)
  values (p_referrer, p_user) on conflict (referred_user_id) do nothing;
  if not found then
    return false;
  end if;

  update public.affiliates set total_referrals = coalesce(total_referrals, 0) + 1 where user_id = p_referrer;
  return true;
end $$;

-- 5. Link clicks --------------------------------------------------------------------

create or replace function public.record_referral_click(p_referrer uuid)
returns void language sql security definer set search_path to '' as $$
  update public.affiliates set link_clicks = coalesce(link_clicks, 0) + 1 where user_id = p_referrer
$$;

-- 6. Everything the dashboard and the contest page show, from the one referral row ---

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
    select r.created_at, u.email,
           u.email_confirmed_at is not null as verified,
           exists (select 1 from public.purchases p
                   where p.user_id = r.referred_user_id and coalesce(p.price_amount, 0) > 0
                     and p.payment_status in ('paid', 'completed')) as paid
    from public.affiliate_referrals r
    join auth.users u on u.id = r.referred_user_id
    where r.affiliate_id = p_user and r.referred_user_id <> p_user and u.deleted_at is null
  )
  select jsonb_build_object(
    'code', me.referral_code,
    'clicks', coalesce(me.link_clicks, 0),
    'signups', count(*),
    'verified', count(*) filter (where verified),
    'paid', count(*) filter (where paid),
    'earnings', jsonb_build_object(
      'total', coalesce(me.total_earnings, 0),
      'pending', coalesce(me.pending_payout, 0),
      -- same rate private.credit_standard_referral pays
      'ratePct', least(100, case when me.commission_rate > 0 then me.commission_rate else coalesce(default_pct, 10) end)
    ),
    'reward', jsonb_build_object(
      'target', terms.target,
      'program', terms.program,
      'size', terms.size,
      'claimed', coalesce(entry.claimed, false),
      'claimedAt', entry.claimed_at,
      'purchaseId', reward_purchase,
      'accountId', reward_account
    ),
    'referrals', coalesce((
      select jsonb_agg(jsonb_build_object(
               'email', coalesce(left(split_part(x.email, '@', 1), 2) || '•••@' || split_part(x.email, '@', 2), '—'),
               'joinedAt', x.created_at,
               'verified', x.verified,
               'paid', x.paid) order by x.created_at desc)
      from (select * from refs order by created_at desc limit 200) x
    ), '[]'::jsonb)
  ) into summary
  from refs;

  return summary;
end $$;

-- 7. Claim the reward: instant, once per person -------------------------------------

create or replace function public.claim_referral_reward(p_user uuid)
returns jsonb language plpgsql security definer set search_path to '' as $$
declare
  terms record;
  buyer_email text;
  verified integer;
  entry public.contest_entries%rowtype;
  order_ref text;
  reward_id uuid;
begin
  if p_user is null then
    raise exception 'User required' using errcode = '22023';
  end if;

  -- one claim at a time per user
  select u.email into buyer_email from auth.users u where u.id = p_user and u.deleted_at is null for no key update;
  if not found then
    raise exception 'User does not exist' using errcode = '23503';
  end if;

  select * into terms from private.referral_terms();

  select count(*) into verified
  from public.affiliate_referrals r join auth.users u on u.id = r.referred_user_id
  where r.affiliate_id = p_user and r.referred_user_id <> p_user
    and u.email_confirmed_at is not null and u.deleted_at is null;

  select * into entry from public.contest_entries where user_id = p_user for update;
  if found and entry.claimed then
    return jsonb_build_object('ok', false, 'reason', 'already_claimed', 'verified', verified, 'target', terms.target);
  end if;
  if verified < terms.target then
    return jsonb_build_object('ok', false, 'reason', 'not_enough', 'verified', verified, 'target', terms.target);
  end if;

  order_ref := 'REFERRAL-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10));

  insert into public.purchases (user_id, order_id, full_name, email, program_key, account_size, price_amount,
                                base_fee, payment_status, payment_method, kind, paid_at)
  select p_user, order_ref,
         coalesce(nullif(trim(concat_ws(' ', pr.first_name, pr.last_name)), ''), nullif(trim(pr.display_name), ''),
                  split_part(coalesce(buyer_email, ''), '@', 1)),
         coalesce(buyer_email, ''), terms.program, terms.size, 0, 0, 'paid', 'referral_reward', 'challenge', now()
  from (select 1) one left join public.profiles pr on pr.id = p_user
  returning id into reward_id;

  if entry.id is null then
    insert into public.contest_entries (user_id, referral_code, referral_count, target, claimed, claimed_at)
    select p_user, a.referral_code, verified, terms.target, true, now() from public.affiliates a where a.user_id = p_user;
  else
    update public.contest_entries
    set claimed = true, claimed_at = now(), referral_count = verified, target = terms.target
    where id = entry.id;
  end if;

  return jsonb_build_object('ok', true, 'purchaseId', reward_id, 'orderId', order_ref,
                            'program', terms.program, 'size', terms.size);
end $$;

-- 8. Admin board: everyone with at least one referral or a claimed reward -----------

create or replace function public.referral_board()
returns table (user_id uuid, email text, display_name text, code text, signups bigint, verified bigint,
               paid bigint, claimed boolean, claimed_at timestamptz)
language sql stable security definer set search_path to '' as $$
  select a.user_id, u.email::text, p.display_name, a.referral_code,
         count(ru.id),
         count(ru.id) filter (where ru.email_confirmed_at is not null),
         count(ru.id) filter (where exists (select 1 from public.purchases pu
                                            where pu.user_id = ru.id and coalesce(pu.price_amount, 0) > 0
                                              and pu.payment_status in ('paid', 'completed'))),
         coalesce(e.claimed, false), e.claimed_at
  from public.affiliates a
  join auth.users u on u.id = a.user_id
  left join public.profiles p on p.id = a.user_id
  left join public.contest_entries e on e.user_id = a.user_id
  left join public.affiliate_referrals r on r.affiliate_id = a.user_id and r.referred_user_id <> a.user_id
  left join auth.users ru on ru.id = r.referred_user_id and ru.deleted_at is null
  group by a.user_id, u.email, p.display_name, a.referral_code, e.claimed, e.claimed_at
  having count(ru.id) > 0 or coalesce(e.claimed, false)
  order by 6 desc, 5 desc
$$;

-- 9. Every account gets a referral code (a few older accounts predate the trigger) ---

insert into public.affiliates (user_id, referral_code)
select u.id, substr(md5(u.id::text), 1, 8)
from auth.users u
where not exists (select 1 from public.affiliates a where a.user_id = u.id)
on conflict do nothing;

-- 10. Carry over the old contest's referrals -----------------------------------------

insert into public.affiliate_referrals (affiliate_id, referred_user_id, created_at)
select e.user_id, r.referred_user_id, r.signed_up_at
from public.contest_referrals r
join public.contest_entries e on e.id = r.contest_entry_id
where r.referred_user_id <> e.user_id
  and exists (select 1 from auth.users u where u.id = r.referred_user_id)
  and exists (select 1 from public.affiliates a where a.user_id = e.user_id)
  and not exists (select 1 from public.partner_attributions pa where pa.user_id = r.referred_user_id)
on conflict (referred_user_id) do nothing;

update public.affiliates a
set total_referrals = s.n
from (select a2.user_id, count(r.id)::integer as n
      from public.affiliates a2 left join public.affiliate_referrals r on r.affiliate_id = a2.user_id
      group by a2.user_id) s
where s.user_id = a.user_id and a.total_referrals is distinct from s.n;

-- 11. Who may call what ------------------------------------------------------------
-- Everything except the summary runs only from the server (service role). The summary
-- is also open to signed-in users, for their own row only (checked inside).

revoke all on function private.referral_terms() from public, anon, authenticated;
revoke all on function public.resolve_referral_code(text, text) from public, anon, authenticated;
revoke all on function public.attribute_referral(uuid, uuid) from public, anon, authenticated;
revoke all on function public.record_referral_click(uuid) from public, anon, authenticated;
revoke all on function public.referral_summary(uuid) from public, anon;
revoke all on function public.claim_referral_reward(uuid) from public, anon, authenticated;
revoke all on function public.referral_board() from public, anon, authenticated;

grant execute on function public.resolve_referral_code(text, text) to service_role;
grant execute on function public.attribute_referral(uuid, uuid) to service_role;
grant execute on function public.record_referral_click(uuid) to service_role;
grant execute on function public.referral_summary(uuid) to authenticated, service_role;
grant execute on function public.claim_referral_reward(uuid) to service_role;
grant execute on function public.referral_board() to service_role;
