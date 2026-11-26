-- Admin board: how many referred friends came back after signing up, and which referrers share a
-- connection with another referrer. Farms that rotate IP addresses still pass the network checks,
-- but their accounts are made once and never used again, and one person running several referrer
-- accounts shows up as referrers on the same connection.

drop function if exists public.referral_board();
create function public.referral_board()
returns table (user_id uuid, email text, display_name text, code text, signups bigint, confirmed bigint, counted bigint,
               flagged bigint, self_flags bigint, networks bigint, returned bigint, linked_referrers bigint,
               first_signup timestamptz, last_signup timestamptz, paid bigint, claimed boolean, claimed_at timestamptz,
               claim_status text, claim_requested_at timestamptz, reward_account uuid, reward_account_status text)
language sql stable security definer set search_path to '' as $$
  with c as (select * from private.referral_checks(null)),
  referrers as (select distinct affiliate_id from public.affiliate_referrals)
  select a.user_id, u.email::text, p.display_name, a.referral_code,
         count(c.referral_id),
         count(c.referral_id) filter (where c.confirmed),
         count(c.referral_id) filter (where c.counted),
         count(c.referral_id) filter (where not c.counted and c.reason <> 'unconfirmed'),
         count(c.referral_id) filter (where c.reason in ('referrer_network', 'referrer_device')),
         count(distinct c.net),
         count(c.referral_id) filter (where exists (select 1 from auth.users ru where ru.id = c.referred_user_id
                                                     and ru.last_sign_in_at > ru.created_at + interval '1 hour')),
         (select count(distinct other.user_id) from public.account_networks mine
            join public.account_networks other on other.net = mine.net and other.user_id <> mine.user_id
            join referrers r on r.affiliate_id = other.user_id
          where mine.user_id = a.user_id),
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

revoke all on function public.referral_board() from public, anon, authenticated;
grant execute on function public.referral_board() to service_role;
