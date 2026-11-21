-- The service account cannot read auth.users directly. These service-only
-- functions return the aggregates/recipient information needed by the desk.
create function public.partner_desk_eligible(p_user_id uuid) returns boolean
language sql stable security invoker set search_path = '' as $$
  select exists (select 1 from public.staff_members where user_id = p_user_id and active)
      or exists (select 1 from public.partner_links l join public.staff_members m on m.user_id = l.partner_id
                 where l.promoter_id = p_user_id and m.active)
      or exists (select 1 from public.partner_sales where promoter_id = p_user_id)
$$;

create function public.partner_desk_snapshot(p_user_id uuid) returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  staff public.staff_members%rowtype;
  desk jsonb := jsonb_build_object('member', null, 'promotions', '[]'::jsonb);
begin
  if not public.partner_desk_eligible(p_user_id) then return null; end if;

  select * into staff from public.staff_members where user_id = p_user_id and active;
  if found then
    desk := desk || jsonb_build_object('member', jsonb_build_object(
      'rank', staff.rank, 'permissions', staff.permissions,
      'directCode', (select code from public.partner_links where partner_id = p_user_id and promoter_id is null),
      'poolBps', case when staff.permissions && array['manage_links', 'view_commissions'] then staff.commission_bps end
    ));
    if 'view_total_logins' = any(staff.permissions) then
      desk := desk || jsonb_build_object('totalLogins', (
        select count(*) from auth.users where last_sign_in_at is not null and deleted_at is null and not is_anonymous
      ));
    end if;
    if 'view_referrals' = any(staff.permissions) then
      desk := desk || (
        select jsonb_build_object('referredLogins', count(*), 'directLogins', count(*) filter (where l.promoter_id is null))
        from public.partner_attributions a join public.partner_links l on l.id = a.link_id
        join auth.users u on u.id = a.user_id where l.partner_id = p_user_id and u.last_sign_in_at is not null
        and u.deleted_at is null and not u.is_anonymous
      );
    end if;
    if 'view_commissions' = any(staff.permissions) then
      desk := desk || jsonb_build_object('commissions', (
        select jsonb_build_object('sales', count(*), 'earnedCents', coalesce(sum(partner_cents), 0))
        from public.partner_sales where partner_id = p_user_id and reversed_at is null
      ));
    end if;
    if 'manage_links' = any(staff.permissions) then
      desk := desk || jsonb_build_object('links', (
        select coalesce(jsonb_agg(jsonb_build_object('id', l.id, 'code', l.code, 'recipient', coalesce(u.email, 'Closed account'),
          'shareBps', l.promoter_bps, 'active', l.active) ||
          case when 'view_referrals' = any(staff.permissions) then jsonb_build_object('referredLogins', (
            select count(*) from public.partner_attributions a join auth.users r on r.id = a.user_id
            where a.link_id = l.id and r.last_sign_in_at is not null and r.deleted_at is null and not r.is_anonymous
          )) else '{}'::jsonb end order by l.created_at, l.id), '[]'::jsonb)
        from public.partner_links l join auth.users u on u.id = l.promoter_id where l.partner_id = p_user_id
      ));
    end if;
  end if;

  return desk || jsonb_build_object('promotions', (
    select coalesce(jsonb_agg(jsonb_build_object('code', l.code, 'active', l.active and m.active,
      'shareBps', l.promoter_bps, 'sales', totals.sales, 'earnedCents', totals.earned)
      order by l.created_at, l.id), '[]'::jsonb)
    from public.partner_links l join public.staff_members m on m.user_id = l.partner_id
    cross join lateral (
      select count(*) as sales, coalesce(sum(s.promoter_cents), 0) as earned
      from public.partner_sales s where s.link_id = l.id and s.promoter_id = p_user_id and s.reversed_at is null
    ) totals
    where l.promoter_id = p_user_id and (m.active or exists (
      select 1 from public.partner_sales s where s.link_id = l.id and s.promoter_id = p_user_id
    ))
  ));
end $$;

-- Older shared URLs used the first eight user-ID digits. Other clients used
-- affiliates.referral_code or the full UUID. Do not guess on ambiguous matches.
create function public.partner_resolve_legacy_ref(p_code text) returns uuid
language sql stable security invoker set search_path = '' as $$
  select case when count(*) = 1 then (array_agg(a.user_id))[1] end from public.affiliates a
  where a.referral_code = p_code or a.user_id::text = lower(p_code)
     or (p_code ~* '^[0-9a-f]{8}$' and left(a.user_id::text, 8) = lower(p_code))
$$;

-- Email verification may happen on a different device. Capture only the
-- public referral code supplied at account creation, never later metadata edits.
create function public.record_partner_signup() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform public.attribute_partner_link(new.id, new.raw_user_meta_data->>'partner_code');
  return new;
end $$;
-- AFTER INSERT triggers with the same event run in alphabetical order. The
-- existing on_auth_user_created trigger creates profiles and legacy referrals first.
create trigger partner_signup_attribution after insert on auth.users
  for each row when ((new.raw_user_meta_data->>'partner_code') ~ '^[0-9a-f]{32}$')
  execute function public.record_partner_signup();

revoke all on function public.partner_desk_snapshot(uuid), public.partner_desk_eligible(uuid),
  public.partner_resolve_legacy_ref(text), public.record_partner_signup() from public, anon, authenticated, service_role;
grant execute on function public.partner_desk_snapshot(uuid), public.partner_desk_eligible(uuid),
  public.partner_resolve_legacy_ref(text) to service_role;
