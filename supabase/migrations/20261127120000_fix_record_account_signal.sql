-- record_account_signal: every call failed with `column reference "net" is ambiguous` (42 errors between 00:01 and
-- 01:44 UTC on 2026-11-27 alone). Its variables net, device and country have the same names as table columns, and
-- in `on conflict (user_id, net)` Postgres cannot tell the variable from the column. So since that version went live
-- no network, device or referral sign-up signal was recorded, and the contest's IP and device checks
-- (private.referral_checks) had nothing new to compare.
--
-- Same function, the variables renamed v_net, v_device, v_country. Nothing else changes: same validation, same
-- upserts, same grants (service_role only).

create or replace function public.record_account_signal(p_user uuid, p_net text, p_ip text default null::text, p_country text default null::text, p_device text default null::text)
 returns void
 language plpgsql
 security definer
 set search_path to ''
as $function$
declare
  joined timestamptz;
  v_net text := case when p_net ~ '^v[46]:[0-9a-f.]{4,40}$' then p_net end;
  v_device text := case when p_device ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then p_device end;
  v_country text := case when p_country ~ '^[A-Za-z]{2}$' then upper(p_country) end;
begin
  if p_user is null then return; end if;

  if v_net is not null then
    insert into public.account_networks as n (user_id, net, ip, country)
    values (p_user, v_net, left(p_ip, 64), v_country)
    on conflict (user_id, net) do update
      set last_seen = now(), hits = n.hits + 1,
          ip = coalesce(excluded.ip, n.ip), country = coalesce(excluded.country, n.country);
  end if;
  if v_device is not null then
    insert into public.account_devices as d (user_id, device_id) values (p_user, v_device)
    on conflict (user_id, device_id) do update set last_seen = now();
  end if;

  -- The first time the server sees a referred account, minutes after it signed up, is where it
  -- signed up from. Later sightings never move it.
  select u.created_at into joined from auth.users u where u.id = p_user;
  if joined is not null and joined > now() - interval '1 day'
     and exists (select 1 from public.affiliate_referrals r where r.referred_user_id = p_user) then
    insert into public.referral_signups as s (referred_user_id, net, ip, country, device_id, source)
    values (p_user, v_net, left(p_ip, 64), v_country, v_device, 'app')
    on conflict (referred_user_id) do update
      set net = coalesce(s.net, excluded.net), ip = coalesce(s.ip, excluded.ip),
          country = coalesce(s.country, excluded.country), device_id = coalesce(s.device_id, excluded.device_id);
  end if;
end $function$;
