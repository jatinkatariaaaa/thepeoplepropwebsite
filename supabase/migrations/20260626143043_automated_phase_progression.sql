alter table public.trading_accounts
  add column if not exists previous_account_id uuid,
  add column if not exists phase_index integer,
  add column if not exists phase_group_id uuid,
  add column if not exists passed_at timestamptz;

alter table public.tpp_programs
  add column if not exists phase_3_rule_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'trading_accounts_previous_account_id_fkey'
      and conrelid = 'public.trading_accounts'::regclass
  ) then
    alter table public.trading_accounts
      add constraint trading_accounts_previous_account_id_fkey
      foreign key (previous_account_id)
      references public.trading_accounts(id)
      on delete set null;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'tpp_programs_phase_3_rule_id_fkey'
      and conrelid = 'public.tpp_programs'::regclass
  ) then
    alter table public.tpp_programs
      add constraint tpp_programs_phase_3_rule_id_fkey
      foreign key (phase_3_rule_id)
      references public.trading_rules(id);
  end if;
end $$;

alter table public.trading_accounts
  drop constraint if exists trading_accounts_phase_check;

alter table public.trading_accounts
  add constraint trading_accounts_phase_check
  check ((phase)::text = any ((array[
    'challenge'::character varying,
    'verification'::character varying,
    'phase_3'::character varying,
    'funded'::character varying
  ])::text[]));

update public.trading_accounts
   set phase_index = case phase
     when 'challenge' then 1
     when 'verification' then 2
     when 'phase_3' then 3
     when 'funded' then 99
     else phase_index
   end
 where phase_index is null;

update public.trading_accounts
   set phase_group_id = id
 where phase_group_id is null;

create unique index if not exists trading_accounts_previous_phase_unique
  on public.trading_accounts(previous_account_id, phase)
  where previous_account_id is not null;

create index if not exists trading_accounts_phase_group_idx
  on public.trading_accounts(phase_group_id, phase_index, created_at);

drop function if exists public.pass_account(uuid, numeric, jsonb);

create function public.pass_account(
  p_account_id uuid,
  p_equity numeric,
  p_marks jsonb default '[]'::jsonb
)
returns public.accounts
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  acct public.accounts;
  pos public.positions;
  mark jsonb;
  exit_fill numeric;
  gross numeric;
  commission numeric;
  net numeric;
begin
  select * into acct
  from public.accounts
  where id = p_account_id
  for update;

  if not found then
    raise exception 'account % not found', p_account_id;
  end if;

  if acct.status not in ('active', 'passed') then
    return acct;
  end if;

  for pos in
    select *
    from public.positions
    where account_id = p_account_id
    for update
  loop
    mark := (
      select m
      from jsonb_array_elements(coalesce(p_marks, '[]'::jsonb)) as m
      where (m->>'position_id')::uuid = pos.id
      limit 1
    );

    if mark is not null then
      exit_fill := (mark->>'exit_fill')::numeric;
      gross := (mark->>'gross_pnl')::numeric;
      commission := coalesce((mark->>'commission')::numeric, 0);
    else
      exit_fill := pos.open_price;
      gross := 0;
      commission := 0;
    end if;

    net := gross - commission;

    insert into public.trades (
      account_id,
      symbol,
      direction,
      volume,
      open_price,
      close_price,
      open_time,
      gross_pnl,
      commission,
      swap,
      net_pnl,
      reason
    ) values (
      pos.account_id,
      pos.symbol,
      pos.direction,
      pos.volume,
      pos.open_price,
      exit_fill,
      pos.open_time,
      gross,
      commission,
      pos.swap,
      net,
      'tp'
    );

    update public.accounts
       set balance = balance + net,
           updated_at = now()
     where id = p_account_id;

    delete from public.positions where id = pos.id;
  end loop;

  update public.orders
     set status = 'cancelled',
         cancelled_at = now()
   where account_id = p_account_id
     and status = 'working';

  update public.accounts
     set status = 'passed',
         equity = balance,
         highest_equity = greatest(highest_equity, balance, p_equity),
         updated_at = now()
   where id = p_account_id
   returning * into acct;

  if not exists (
    select 1
    from public.account_events
    where account_id = p_account_id
      and type = 'target_hit'
  ) then
    insert into public.account_events (account_id, type, equity_at_event, detail)
    values (p_account_id, 'target_hit', p_equity, 'profit target reached');
  end if;

  return acct;
end;
$$;

revoke execute on function public.pass_account(uuid, numeric, jsonb) from public;
revoke execute on function public.pass_account(uuid, numeric, jsonb) from anon;
revoke execute on function public.pass_account(uuid, numeric, jsonb) from authenticated;
grant execute on function public.pass_account(uuid, numeric, jsonb) to service_role;
