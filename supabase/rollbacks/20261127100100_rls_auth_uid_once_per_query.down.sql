-- Rollback for 20261127100100_rls_auth_uid_once_per_query.sql: the same 37 policies with auth.uid()
-- called per row again, exactly as they were on 2026-11-27.

alter policy account_events_select_own on public.account_events
  using ((EXISTS ( SELECT 1
   FROM accounts a
  WHERE ((a.id = account_events.account_id) AND (a.user_id = auth.uid())))));

alter policy "Allow users to read their own accounts" on public.accounts
  using ((auth.uid() = user_id));

alter policy "Users can view their linked terminal accounts" on public.accounts
  using (((user_id = auth.uid()) OR (business_account_id IN ( SELECT trading_accounts.id
   FROM trading_accounts
  WHERE (trading_accounts.user_id = auth.uid())))));

alter policy accounts_select_own on public.accounts
  using ((auth.uid() = user_id));

alter policy "Users can read own earnings" on public.affiliate_earnings
  using ((auth.uid() = affiliate_id));

alter policy earnings_select_own on public.affiliate_earnings
  using ((auth.uid() = affiliate_id));

alter policy referrals_select_own on public.affiliate_referrals
  using ((auth.uid() = affiliate_id));

alter policy "Allow users to read their own affiliates" on public.affiliates
  using ((auth.uid() = user_id));

alter policy affiliates_select_own on public.affiliates
  using ((auth.uid() = user_id));

alter policy "Users can view own contest entry" on public.contest_entries
  using ((auth.uid() = user_id));

alter policy "Users can view own contest referrals" on public.contest_referrals
  using ((contest_entry_id IN ( SELECT contest_entries.id
   FROM contest_entries
  WHERE (contest_entries.user_id = auth.uid()))));

alter policy kyc_docs_insert_user on public.kyc_documents
  with check ((auth.uid() = user_id));

alter policy kyc_sessions_insert_user on public.kyc_verification_sessions
  with check ((auth.uid() = user_id));

alter policy orders_select_own on public.orders
  using ((EXISTS ( SELECT 1
   FROM accounts a
  WHERE ((a.id = orders.account_id) AND (a.user_id = auth.uid())))));

alter policy pay_txn_insert_user on public.payment_transactions
  with check ((auth.uid() = user_id));

alter policy "Allow users to read their own payouts" on public.payouts
  using ((auth.uid() = user_id));

alter policy "Users can view their own payouts" on public.payouts
  using ((auth.uid() = user_id));

alter policy positions_select_own on public.positions
  using ((EXISTS ( SELECT 1
   FROM accounts a
  WHERE ((a.id = positions.account_id) AND (a.user_id = auth.uid())))));

alter policy profiles_select_own on public.profiles
  using ((auth.uid() = id));

alter policy profiles_update_own on public.profiles
  using ((auth.uid() = id))
  with check ((auth.uid() = id));

alter policy "Allow users to read their own purchases" on public.purchases
  using ((auth.uid() = user_id));

alter policy "Users can read own purchases" on public.purchases
  using ((auth.uid() = user_id));

alter policy "Admin All Access Coupons" on public.tpp_coupons
  using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));

alter policy "Enable full access for admins on tpp_faqs" on public.tpp_faqs
  using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));

alter policy "Allow admins full access on tpp_platforms" on public.tpp_platforms
  using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));

alter policy "Admin All Access Fees" on public.tpp_program_fees
  using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));

alter policy "Admin All Access Programs" on public.tpp_programs
  using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));

alter policy "Enable full access for admins on tpp_stats" on public.tpp_stats
  using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));

alter policy trades_select_own on public.trades
  using ((EXISTS ( SELECT 1
   FROM accounts a
  WHERE ((a.id = trades.account_id) AND (a.user_id = auth.uid())))));

alter policy "Enable full access for admins on trading_accounts" on public.trading_accounts
  using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));

alter policy "Enable read access for users on their own trading_accounts" on public.trading_accounts
  using ((auth.uid() = user_id));

alter policy "Enable full access for admins on trading_alerts" on public.trading_alerts
  using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));

alter policy "Enable read access for users on their own trading_alerts" on public.trading_alerts
  using ((EXISTS ( SELECT 1
   FROM trading_accounts
  WHERE ((trading_accounts.id = trading_alerts.account_id) AND (trading_accounts.user_id = auth.uid())))));

alter policy "Enable full access for admins on trading_rules" on public.trading_rules
  using ((EXISTS ( SELECT 1
   FROM profiles
  WHERE ((profiles.id = auth.uid()) AND (profiles.is_admin = true)))));

alter policy insert_own_user_fraud_metadata on public.user_fraud_metadata
  with check ((auth.uid() = user_id));

alter policy select_own_user_fraud_metadata on public.user_fraud_metadata
  using ((auth.uid() = user_id));

alter policy update_own_user_fraud_metadata on public.user_fraud_metadata
  using ((auth.uid() = user_id))
  with check ((auth.uid() = user_id));
