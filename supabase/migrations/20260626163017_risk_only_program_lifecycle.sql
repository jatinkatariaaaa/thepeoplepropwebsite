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
  'Instant Risk Only',
  'Instant funded risk-only account. No profit target; loss limits only.',
  0,
  3,
  5,
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
  select 1 from public.trading_rules where name = 'Instant Risk Only'
);

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
  'Access Risk Only',
  'Access account risk-only template. No profit target; loss limits only.',
  0,
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
  select 1 from public.trading_rules where name = 'Access Risk Only'
);

update public.trading_rules
set
  profit_target_pct = 0,
  max_daily_drawdown_pct = 3,
  max_overall_drawdown_pct = 5
where name = 'Instant Risk Only';

update public.trading_rules
set
  profit_target_pct = 0,
  max_daily_drawdown_pct = 5,
  max_overall_drawdown_pct = 10
where name = 'Access Risk Only';

with rule_ids as (
  select
    (array_agg(id) filter (where name = 'Instant Risk Only'))[1] as instant_rule_id,
    (array_agg(id) filter (where name = 'Access Risk Only'))[1] as access_rule_id
  from public.trading_rules
)
update public.tpp_programs p
set
  phases = 0,
  profit_target = 'None',
  phase_1_rule_id = case
    when p.key = 'instant' then r.instant_rule_id
    when p.key = 'access' then r.access_rule_id
    else p.phase_1_rule_id
  end,
  phase_2_rule_id = null,
  phase_3_rule_id = null,
  funded_rule_id = case
    when p.key = 'instant' then r.instant_rule_id
    when p.key = 'access' then r.access_rule_id
    else p.funded_rule_id
  end
from rule_ids r
where p.key in ('instant', 'access');

with specs(name, description, profit_target_pct, daily_drawdown_pct, overall_drawdown_pct) as (
  values
    ('1-Step Phase 1', 'Auto-synced from 1-Step Evaluation challenge settings.', 10::numeric, 4::numeric, 7::numeric),
    ('1-Step Funded', 'Auto-synced from 1-Step Evaluation challenge settings.', 0::numeric, 4::numeric, 7::numeric),
    ('2-Step Phase 1', 'Auto-synced from 2-Step Evaluation challenge settings.', 8::numeric, 5::numeric, 10::numeric),
    ('2-Step Phase 2', 'Auto-synced from 2-Step Evaluation challenge settings.', 5::numeric, 5::numeric, 10::numeric),
    ('2-Step Funded', 'Auto-synced from 2-Step Evaluation challenge settings.', 0::numeric, 5::numeric, 10::numeric),
    ('3-Step Phase 1', 'Auto-synced from 3-Step Evaluation challenge settings.', 6::numeric, 4::numeric, 8::numeric),
    ('3-Step Phase 2', 'Auto-synced from 3-Step Evaluation challenge settings.', 6::numeric, 4::numeric, 8::numeric),
    ('3-Step Phase 3', 'Auto-synced from 3-Step Evaluation challenge settings.', 6::numeric, 4::numeric, 8::numeric),
    ('3-Step Funded', 'Auto-synced from 3-Step Evaluation challenge settings.', 0::numeric, 4::numeric, 8::numeric)
)
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
  s.name,
  s.description,
  s.profit_target_pct,
  s.daily_drawdown_pct,
  s.overall_drawdown_pct,
  0,
  0,
  true,
  true,
  true,
  true,
  true,
  false,
  false
from specs s
where not exists (
  select 1 from public.trading_rules r where r.name = s.name
);

with specs(name, description, profit_target_pct, daily_drawdown_pct, overall_drawdown_pct) as (
  values
    ('1-Step Phase 1', 'Auto-synced from 1-Step Evaluation challenge settings.', 10::numeric, 4::numeric, 7::numeric),
    ('1-Step Funded', 'Auto-synced from 1-Step Evaluation challenge settings.', 0::numeric, 4::numeric, 7::numeric),
    ('2-Step Phase 1', 'Auto-synced from 2-Step Evaluation challenge settings.', 8::numeric, 5::numeric, 10::numeric),
    ('2-Step Phase 2', 'Auto-synced from 2-Step Evaluation challenge settings.', 5::numeric, 5::numeric, 10::numeric),
    ('2-Step Funded', 'Auto-synced from 2-Step Evaluation challenge settings.', 0::numeric, 5::numeric, 10::numeric),
    ('3-Step Phase 1', 'Auto-synced from 3-Step Evaluation challenge settings.', 6::numeric, 4::numeric, 8::numeric),
    ('3-Step Phase 2', 'Auto-synced from 3-Step Evaluation challenge settings.', 6::numeric, 4::numeric, 8::numeric),
    ('3-Step Phase 3', 'Auto-synced from 3-Step Evaluation challenge settings.', 6::numeric, 4::numeric, 8::numeric),
    ('3-Step Funded', 'Auto-synced from 3-Step Evaluation challenge settings.', 0::numeric, 4::numeric, 8::numeric)
)
update public.trading_rules r
set
  description = s.description,
  profit_target_pct = s.profit_target_pct,
  max_daily_drawdown_pct = s.daily_drawdown_pct,
  max_overall_drawdown_pct = s.overall_drawdown_pct
from specs s
where r.name = s.name;

with rule_ids as (
  select
    (array_agg(id) filter (where name = '1-Step Phase 1'))[1] as one_phase_1_rule_id,
    (array_agg(id) filter (where name = '1-Step Funded'))[1] as one_funded_rule_id,
    (array_agg(id) filter (where name = '2-Step Phase 1'))[1] as two_phase_1_rule_id,
    (array_agg(id) filter (where name = '2-Step Phase 2'))[1] as two_phase_2_rule_id,
    (array_agg(id) filter (where name = '2-Step Funded'))[1] as two_funded_rule_id,
    (array_agg(id) filter (where name = '3-Step Phase 1'))[1] as three_phase_1_rule_id,
    (array_agg(id) filter (where name = '3-Step Phase 2'))[1] as three_phase_2_rule_id,
    (array_agg(id) filter (where name = '3-Step Phase 3'))[1] as three_phase_3_rule_id,
    (array_agg(id) filter (where name = '3-Step Funded'))[1] as three_funded_rule_id
  from public.trading_rules
)
update public.tpp_programs p
set
  phase_1_rule_id = case
    when p.key = '1-step' then r.one_phase_1_rule_id
    when p.key = '2-step' then r.two_phase_1_rule_id
    when p.key = '3-step' then r.three_phase_1_rule_id
    else p.phase_1_rule_id
  end,
  phase_2_rule_id = case
    when p.key = '1-step' then null
    when p.key = '2-step' then r.two_phase_2_rule_id
    when p.key = '3-step' then r.three_phase_2_rule_id
    else p.phase_2_rule_id
  end,
  phase_3_rule_id = case
    when p.key in ('1-step', '2-step') then null
    when p.key = '3-step' then r.three_phase_3_rule_id
    else p.phase_3_rule_id
  end,
  funded_rule_id = case
    when p.key = '1-step' then r.one_funded_rule_id
    when p.key = '2-step' then r.two_funded_rule_id
    when p.key = '3-step' then r.three_funded_rule_id
    else p.funded_rule_id
  end
from rule_ids r
where p.key in ('1-step', '2-step', '3-step');
