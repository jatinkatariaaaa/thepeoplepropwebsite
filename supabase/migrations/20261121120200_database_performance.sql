-- Cover referencing columns reported by the production performance advisor.
set local lock_timeout = '5s';

create index if not exists accounts_business_account_id_idx on public.accounts (business_account_id);
create index if not exists account_resets_new_account_id_idx on public.account_resets (new_account_id);
create index if not exists admin_notifications_read_by_idx on public.admin_notifications (read_by);
create index if not exists admin_notifications_user_id_idx on public.admin_notifications (user_id);
create index if not exists affiliate_earnings_affiliate_id_idx on public.affiliate_earnings (affiliate_id);
create index if not exists affiliate_earnings_referred_user_id_idx on public.affiliate_earnings (referred_user_id);
create index if not exists affiliate_referrals_affiliate_id_idx on public.affiliate_referrals (affiliate_id);
create index if not exists cms_content_updated_by_idx on public.cms_content (updated_by);
create index if not exists contest_referrals_referred_user_id_idx on public.contest_referrals (referred_user_id);
create index if not exists fraud_alerts_resolved_by_idx on public.fraud_alerts (resolved_by);
create index if not exists fraud_flags_reviewed_by_idx on public.fraud_flags (reviewed_by);
create index if not exists kyc_documents_reviewed_by_idx on public.kyc_documents (reviewed_by);
create index if not exists payment_transactions_account_id_idx on public.payment_transactions (account_id);
create index if not exists payment_transactions_refunded_by_idx on public.payment_transactions (refunded_by);
create index if not exists payouts_account_id_idx on public.payouts (account_id);
create index if not exists purchases_user_id_idx on public.purchases (user_id);
create index if not exists stipend_accruals_payout_id_idx on public.stipend_accruals (payout_id);
create index if not exists stipend_accruals_trading_account_id_idx on public.stipend_accruals (trading_account_id);
create index if not exists support_tickets_assigned_to_idx on public.support_tickets (assigned_to);
create index if not exists ticket_messages_sender_id_idx on public.ticket_messages (sender_id);
create index if not exists tpp_programs_funded_rule_id_idx on public.tpp_programs (funded_rule_id);
create index if not exists tpp_programs_phase_1_rule_id_idx on public.tpp_programs (phase_1_rule_id);
create index if not exists tpp_programs_phase_2_rule_id_idx on public.tpp_programs (phase_2_rule_id);
create index if not exists tpp_programs_phase_3_rule_id_idx on public.tpp_programs (phase_3_rule_id);
create index if not exists trading_accounts_platform_id_idx on public.trading_accounts (platform_id);
create index if not exists trading_accounts_reset_of_account_id_idx on public.trading_accounts (reset_of_account_id);
create index if not exists trading_accounts_rule_id_idx on public.trading_accounts (rule_id);
create index if not exists trading_accounts_terminal_account_id_idx on public.trading_accounts (terminal_account_id);
create index if not exists trading_alerts_account_id_idx on public.trading_alerts (account_id);

-- Remove identical permissive policies, leaving ownership rules unchanged.
drop policy if exists "Allow users to read their own accounts" on public.accounts;
drop policy if exists "Allow users to read their own payouts" on public.payouts;
drop policy if exists "Allow users to read their own purchases" on public.purchases;
drop policy if exists "Users can read own earnings" on public.affiliate_earnings;

-- Cache JWT lookups per statement on frequently accessed relations.
alter policy accounts_select_own on public.accounts using ((select auth.uid()) = user_id);
alter policy "Users can view their linked terminal accounts" on public.accounts using (
  user_id = (select auth.uid()) or business_account_id in (
    select id from public.trading_accounts where user_id = (select auth.uid())
  )
);
alter policy profiles_select_own on public.profiles using ((select auth.uid()) = id);
alter policy profiles_update_own on public.profiles
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
alter policy "Users can view their own payouts" on public.payouts using ((select auth.uid()) = user_id);
alter policy "Users can read own purchases" on public.purchases using ((select auth.uid()) = user_id);
alter policy earnings_select_own on public.affiliate_earnings using ((select auth.uid()) = affiliate_id);
alter policy referrals_select_own on public.affiliate_referrals using ((select auth.uid()) = affiliate_id);
alter policy positions_select_own on public.positions using (
  exists (select from public.accounts a where a.id = positions.account_id and a.user_id = (select auth.uid()))
);
alter policy orders_select_own on public.orders using (
  exists (select from public.accounts a where a.id = orders.account_id and a.user_id = (select auth.uid()))
);
alter policy trades_select_own on public.trades using (
  exists (select from public.accounts a where a.id = trades.account_id and a.user_id = (select auth.uid()))
);
alter policy account_events_select_own on public.account_events using (
  exists (select from public.accounts a where a.id = account_events.account_id and a.user_id = (select auth.uid()))
);
