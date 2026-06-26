insert into public.trading_rules (
  name,
  description,
  profit_target_pct,
  max_daily_drawdown_pct,
  max_overall_drawdown_pct,
  min_trading_days,
  max_trading_days,
  is_news_trading_allowed,
  is_weekend_holding_allowed,
  is_ea_allowed,
  is_hedging_allowed,
  is_copy_trading_allowed,
  is_martingale_allowed,
  is_grid_trading_allowed
)
select
  'Phase 3 Verification',
  'Third evaluation phase before funded status.',
  5,
  5,
  10,
  0,
  0,
  true,
  true,
  true,
  true,
  true,
  false,
  false
where not exists (
  select 1 from public.trading_rules where name = 'Phase 3 Verification'
);

with rule_ids as (
  select
    max(id) filter (where name = 'Phase 1 Evaluation') as phase_1_rule_id,
    max(id) filter (where name = 'Phase 2 Verification') as phase_2_rule_id,
    max(id) filter (where name = 'Phase 3 Verification') as phase_3_rule_id,
    max(id) filter (where name = 'Funded Standard') as funded_rule_id
  from public.trading_rules
)
update public.tpp_programs p
set
  phase_1_rule_id = coalesce(p.phase_1_rule_id, r.phase_1_rule_id),
  phase_2_rule_id = case
    when p.phases >= 2 then coalesce(p.phase_2_rule_id, r.phase_2_rule_id)
    else p.phase_2_rule_id
  end,
  phase_3_rule_id = case
    when p.phases >= 3 then coalesce(p.phase_3_rule_id, r.phase_3_rule_id)
    else p.phase_3_rule_id
  end,
  funded_rule_id = coalesce(p.funded_rule_id, r.funded_rule_id)
from rule_ids r
where p.key in ('1-step', '2-step', '3-step', 'access', 'instant');
