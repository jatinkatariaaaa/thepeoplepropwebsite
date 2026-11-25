-- Run with psql -v ON_ERROR_STOP=1 against a migrated test database.
begin;
do $test$
declare
  order_code text := 'qa-' || gen_random_uuid()::text;
  paid_id text;
  order_status text;
begin
  insert into public.purchases(order_id, full_name, email, program_key, account_size, price_amount, payment_status)
    values (order_code, 'QA buyer', 'qa@example.test', '2-step', 10000, 100, 'pending');

  perform public.record_gateway_payment(order_code, 'attempt-a', 'refunded', null, null);
  perform public.record_gateway_payment(order_code, 'attempt-a', 'finished', 100, 'usd');
  select payment_status into order_status from public.purchases where order_id = order_code;
  if order_status is distinct from 'pending' then raise exception 'An early refund settled the order'; end if;

  if public.record_gateway_payment(order_code, 'attempt-b', 'finished', 100, 'eur') <> 'amount_mismatch'
    or public.record_gateway_payment(order_code, 'attempt-b', 'finished', 99.99, 'usd') <> 'amount_mismatch' then
    raise exception 'Invoice currency or amount was not checked';
  end if;
  perform public.record_gateway_payment(order_code, 'attempt-b', 'finished', 100, 'usd');
  perform public.record_gateway_payment(order_code, 'attempt-b', 'finished', 100, 'usd');
  perform public.record_gateway_payment(order_code, 'attempt-a', 'refunded', null, null);
  select payment_status, payment_id into order_status, paid_id from public.purchases where order_id = order_code;
  if order_status is distinct from 'paid' or paid_id is distinct from 'attempt-b' then
    raise exception 'A refund for another attempt affected the successful payment';
  end if;

  perform public.record_gateway_payment(order_code, 'attempt-b', 'refunded', null, null);
  perform public.record_gateway_payment(order_code, 'attempt-b', 'finished', 100, 'usd');
  select payment_status into order_status from public.purchases where order_id = order_code;
  if order_status is distinct from 'refunded' then raise exception 'A late callback reopened the refunded order'; end if;
end $test$;
rollback;
