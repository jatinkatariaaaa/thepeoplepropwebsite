-- Catalogue v2 (16 Nov 2026): program facts and backend rules match src/data/catalogue.ts.
--   * 3 minimum trading days on every evaluation phase
--   * funded rules carry the payout consistency share and the 2-minute news window
--   * Access is a real two-phase evaluation: $5 to start, the fee is due after passing
--   * FIRSTTPP is a real coupon (it used to be hard-coded in the browser)
--   * the breach trigger also honours the Free Retry add-on
-- FAQs are seeded from the catalogue with Admin → FAQs → "Sync from catalogue".

alter table public.tpp_coupons add column if not exists grants_addons text[] not null default '{}';

update public.trading_rules set profit_target_pct = 10, max_daily_drawdown_pct = 4, max_overall_drawdown_pct = 7,  min_trading_days = 3 where name = '1-Step Phase 1';
update public.trading_rules set profit_target_pct = 8,  max_daily_drawdown_pct = 5, max_overall_drawdown_pct = 10, min_trading_days = 3 where name = '2-Step Phase 1';
update public.trading_rules set profit_target_pct = 5,  max_daily_drawdown_pct = 5, max_overall_drawdown_pct = 10, min_trading_days = 3 where name = '2-Step Phase 2';
update public.trading_rules set profit_target_pct = 6,  max_daily_drawdown_pct = 4, max_overall_drawdown_pct = 8,  min_trading_days = 3 where name in ('3-Step Phase 1', '3-Step Phase 2', '3-Step Phase 3');

update public.trading_rules set profit_target_pct = 0, max_daily_drawdown_pct = 4, max_overall_drawdown_pct = 7,  min_trading_days = 0, consistency_pct = 40, news_window_minutes = 2 where name = '1-Step Funded';
update public.trading_rules set profit_target_pct = 0, max_daily_drawdown_pct = 5, max_overall_drawdown_pct = 10, min_trading_days = 0, consistency_pct = 40, news_window_minutes = 2 where name = '2-Step Funded';
update public.trading_rules set profit_target_pct = 0, max_daily_drawdown_pct = 4, max_overall_drawdown_pct = 8,  min_trading_days = 0, consistency_pct = 40, news_window_minutes = 2 where name = '3-Step Funded';
update public.trading_rules set name = 'Instant Funded', description = 'Instant: funded from day one, no evaluation',
       profit_target_pct = 0, max_daily_drawdown_pct = 3, max_overall_drawdown_pct = 5, min_trading_days = 0, consistency_pct = 25, news_window_minutes = 2
 where name = 'Instant Risk Only';
update public.trading_rules set name = 'Access Funded', description = 'Access: funded account issued after the fee is paid',
       profit_target_pct = 0, max_daily_drawdown_pct = 5, max_overall_drawdown_pct = 10, min_trading_days = 0, consistency_pct = 40, news_window_minutes = 2
 where name = 'Access Risk Only';

insert into public.trading_rules (name, description, profit_target_pct, max_daily_drawdown_pct, max_overall_drawdown_pct, min_trading_days)
select 'Access Phase 1', 'Access: pass first, pay later. Phase 1', 8, 5, 10, 3
where not exists (select 1 from public.trading_rules where name = 'Access Phase 1');
insert into public.trading_rules (name, description, profit_target_pct, max_daily_drawdown_pct, max_overall_drawdown_pct, min_trading_days)
select 'Access Phase 2', 'Access: pass first, pay later. Phase 2', 5, 5, 10, 3
where not exists (select 1 from public.trading_rules where name = 'Access Phase 2');

update public.tpp_programs set sort_order = 1, min_trading_days = 3, consistency_rule = '40% on payouts', payout_cycle = 'First 5 on demand, then bi-weekly',
       highlights = '["One phase, one target", "First 5 payouts on demand", "1% monthly stipend"]'::jsonb
 where key = '1-step';
update public.tpp_programs set sort_order = 2, min_trading_days = 3, consistency_rule = '40% on payouts', payout_cycle = 'First 5 on demand, then bi-weekly',
       highlights = '["Lower fee, more headroom", "5% daily / 10% overall loss limit", "First 5 payouts on demand"]'::jsonb
 where key = '2-step';
update public.tpp_programs set sort_order = 3, min_trading_days = 3, consistency_rule = '40% on payouts', payout_cycle = 'First 5 on demand, then bi-weekly',
       highlights = '["Three 6% phases, easy pacing", "Cheapest entry in our line-up", "1% monthly stipend"]'::jsonb
 where key = '3-step';
update public.tpp_programs set sort_order = 4, min_trading_days = 0, consistency_rule = '25% on payouts', payout_cycle = 'First 5 on demand, then bi-weekly',
       tagline = 'Skip the evaluation. Trade a funded account today.', max_drawdown = '5%', profit_target = 'None',
       highlights = '["No evaluation, funded from day one", "Static 5% loss limit, no trailing", "First 5 payouts on demand"]'::jsonb
 where key = 'instant';
update public.tpp_programs p set sort_order = 5, phases = 2, min_trading_days = 3, consistency_rule = '40% on payouts', payout_cycle = 'First 5 on demand, then bi-weekly',
       tagline = 'Pass first, pay later. Start for $5.', profit_target = '8% + 5%', pay_after_pass = true, upfront_fee = 5,
       highlights = '["$5 to start the evaluation", "Pay the fee only after you pass", "5% daily / 10% overall loss limit"]'::jsonb,
       phase_1_rule_id = (select id from public.trading_rules where name = 'Access Phase 1' limit 1),
       phase_2_rule_id = (select id from public.trading_rules where name = 'Access Phase 2' limit 1),
       funded_rule_id  = (select id from public.trading_rules where name = 'Access Funded' limit 1)
 where key = 'access';

insert into public.tpp_coupons (code, discount_pct, max_uses, is_active, grants_addons)
select 'FIRSTTPP', 50, null, true, array['free-retry']
where not exists (select 1 from public.tpp_coupons where code = 'FIRSTTPP');

create or replace function private.trading_account_after_breach()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_min_size numeric := private.setting_num('free_reset_min_size', 50000);
  v_window_h numeric := private.setting_num('free_reset_window_hours', 24);
  v_claim_h  numeric := private.setting_num('free_reset_claim_hours', 72);
  v_first_trade timestamptz;
  v_started timestamptz;
  v_hours numeric;
  v_group uuid := coalesce(new.phase_group_id, new.id);
  v_kind text := null;
  v_addons jsonb;
begin
  if new.status <> 'breached' or old.status = 'breached' then return new; end if;
  if new.user_id is null then return new; end if;
  if not exists (select 1 from public.profiles p where p.id = new.user_id) then return new; end if;

  insert into public.user_notifications (user_id, type, title, body, link)
  values (new.user_id, 'account_breached', 'Account breached',
          coalesce(new.breach_reason, 'A loss limit was reached on account ' || new.login || '.'),
          '/dashboard/account/' || new.id);

  if new.terminal_account_id is not null then
    select min(t.open_time) into v_first_trade from public.trades t where t.account_id = new.terminal_account_id;
  end if;
  v_started := coalesce(v_first_trade, new.created_at);
  v_hours := extract(epoch from (now() - v_started)) / 3600.0;

  -- 1. free reset: $50K+ account that failed inside the first 24 hours, once per purchase
  if private.setting_bool('free_reset_enabled', true)
     and coalesce(new.starting_balance, 0) >= v_min_size
     and new.reset_of_account_id is null
     and v_hours <= v_window_h
     and not exists (select 1 from public.account_resets r where r.phase_group_id = v_group and r.kind = 'free_24h') then
    v_kind := 'free_24h';
  end if;

  -- 2. Free Retry add-on: one reset of an evaluation account at any time
  if v_kind is null and new.phase <> 'funded' then
    select p.addons into v_addons
      from public.trading_accounts r join public.purchases p on p.id = r.purchase_id
     where r.id = v_group;
    if v_addons is not null and v_addons ? 'free-retry'
       and not exists (select 1 from public.account_resets r where r.phase_group_id = v_group and r.kind = 'paid') then
      v_kind := 'paid';
    end if;
  end if;

  if v_kind is null then return new; end if;

  insert into public.account_resets (user_id, source_account_id, phase_group_id, kind, status, failed_after_hours, eligible_until)
  values (new.user_id, new.id, v_group, v_kind, 'eligible', round(v_hours, 2), now() + make_interval(hours => v_claim_h::int))
  on conflict (source_account_id) do nothing;

  insert into public.user_notifications (user_id, type, title, body, link)
  values (new.user_id, 'free_reset',
          case when v_kind = 'free_24h' then 'Free reset available' else 'Free Retry available' end,
          'You can restart this account at no cost. Claim it within ' || v_claim_h::int || ' hours.',
          '/dashboard/account/' || new.id);
  return new;
exception when others then
  raise warning 'trading_account_after_breach failed for %: %', new.id, sqlerrm;
  return new;
end;
$$;
