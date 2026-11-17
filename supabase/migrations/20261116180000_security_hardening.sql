-- ════════════════════════════════════════════════════════════════════
-- Security hardening (16 Nov 2026)
--
-- What was wrong before this migration:
--   * Nine tables carried a policy named "Service role full access" that was
--     granted to the `public` role with USING (true). The service role
--     bypasses RLS anyway, so the only thing those policies did was let
--     anyone holding the public anon key read and write admin_roles,
--     admin_settings, audit_logs, cms_content, email_settings,
--     email_templates, support_tickets, ticket_messages and the contest tables.
--     A visitor could insert themselves into admin_roles as super_admin.
--   * profiles_update_own let a signed-in user update every column of their
--     own profile, including is_admin, kyc_status and status.
--   * tpp_platforms (which stores the terminal API key) was world-readable.
--   * Any signed-in user could read every KYC document, payment-gateway
--     secret, fraud flag, notification and API log, and edit most of them.
--   * Users could insert rows straight into payouts, skipping the API checks.
--
-- Everything the apps do through the service role keeps working unchanged.
-- ════════════════════════════════════════════════════════════════════

create schema if not exists private;
grant usage on schema private to anon, authenticated, service_role;

-- Admin check used by policies. Lives outside the exposed API schema.
create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (select 1 from public.admin_roles r where r.user_id = (select auth.uid()))
      or exists (select 1 from public.profiles p where p.id = (select auth.uid()) and p.is_admin is true);
$$;
revoke all on function private.is_admin() from public;
grant execute on function private.is_admin() to anon, authenticated, service_role;

-- ── profiles: users may edit their own row, but never the privileged columns ──
create or replace function private.protect_profile_columns()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  -- API requests run as anon/authenticated; the service role and SQL editor do not.
  if current_user in ('anon', 'authenticated') then
    new.is_admin         := old.is_admin;
    new.kyc_status       := old.kyc_status;
    new.status           := old.status;
    new.suspended_reason := old.suspended_reason;
    new.global_rank      := old.global_rank;
    new.email            := old.email;
    new.affiliate_code   := old.affiliate_code;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_profile_columns on public.profiles;
create trigger trg_protect_profile_columns
  before update on public.profiles
  for each row execute function private.protect_profile_columns();

-- ── tables that were open to the world ──
drop policy if exists "Service role full access on admin_roles" on public.admin_roles;
create policy admin_roles_select on public.admin_roles
  for select to authenticated
  using (user_id = (select auth.uid()) or private.is_admin());

drop policy if exists "Service role full access on admin_settings" on public.admin_settings;
create policy admin_settings_select_admin on public.admin_settings
  for select to authenticated using (private.is_admin());

drop policy if exists "Service role full access on audit_logs" on public.audit_logs;
create policy audit_logs_select_admin on public.audit_logs
  for select to authenticated using (private.is_admin());

drop policy if exists "Service role full access on cms_content" on public.cms_content;
create policy cms_content_select_published on public.cms_content
  for select to anon, authenticated using (is_published is true or private.is_admin());

drop policy if exists "Service role full access on email_settings" on public.email_settings;
create policy email_settings_select_admin on public.email_settings
  for select to authenticated using (private.is_admin());

drop policy if exists "Service role full access on email_templates" on public.email_templates;
create policy email_templates_select_admin on public.email_templates
  for select to authenticated using (private.is_admin());

drop policy if exists "Service role full access on contest_entries" on public.contest_entries;
drop policy if exists "Service role full access on contest_referrals" on public.contest_referrals;

drop policy if exists "Service role full access on support_tickets" on public.support_tickets;
create policy support_tickets_select on public.support_tickets
  for select to authenticated using (user_id = (select auth.uid()) or private.is_admin());
create policy support_tickets_insert_own on public.support_tickets
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy support_tickets_update_admin on public.support_tickets
  for update to authenticated using (private.is_admin()) with check (private.is_admin());

drop policy if exists "Service role full access on ticket_messages" on public.ticket_messages;
create policy ticket_messages_select on public.ticket_messages
  for select to authenticated
  using (
    private.is_admin()
    or exists (select 1 from public.support_tickets t where t.id = ticket_id and t.user_id = (select auth.uid()))
  );
create policy ticket_messages_insert on public.ticket_messages
  for insert to authenticated
  with check (
    (private.is_admin() and sender_role = 'admin')
    or (
      sender_role = 'user'
      and sender_id = (select auth.uid())
      and exists (select 1 from public.support_tickets t where t.id = ticket_id and t.user_id = (select auth.uid()))
    )
  );

-- ── tables every signed-in user could read and edit ──
drop policy if exists admin_notif_select_admin on public.admin_notifications;
drop policy if exists admin_notif_insert_admin on public.admin_notifications;
drop policy if exists admin_notif_update_admin on public.admin_notifications;
drop policy if exists admin_notif_delete_admin on public.admin_notifications;
create policy admin_notifications_admin on public.admin_notifications
  for all to authenticated using (private.is_admin()) with check (private.is_admin());

drop policy if exists api_logs_select_admin on public.api_logs;
drop policy if exists api_logs_insert_admin on public.api_logs;
drop policy if exists api_logs_update_admin on public.api_logs;
drop policy if exists api_logs_delete_admin on public.api_logs;
create policy api_logs_admin on public.api_logs
  for all to authenticated using (private.is_admin()) with check (private.is_admin());

drop policy if exists select_fraud_alerts on public.fraud_alerts;
drop policy if exists insert_fraud_alerts on public.fraud_alerts;
drop policy if exists update_fraud_alerts on public.fraud_alerts;
create policy fraud_alerts_admin on public.fraud_alerts
  for all to authenticated using (private.is_admin()) with check (private.is_admin());

drop policy if exists fraud_flags_select_admin on public.fraud_flags;
drop policy if exists fraud_flags_insert_admin on public.fraud_flags;
drop policy if exists fraud_flags_update_admin on public.fraud_flags;
drop policy if exists fraud_flags_delete_admin on public.fraud_flags;
create policy fraud_flags_admin on public.fraud_flags
  for all to authenticated using (private.is_admin()) with check (private.is_admin());

drop policy if exists select_notifications on public.notifications;
drop policy if exists insert_notifications on public.notifications;
create policy notifications_admin on public.notifications
  for all to authenticated using (private.is_admin()) with check (private.is_admin());

drop policy if exists pay_logs_select_admin on public.payment_activity_logs;
drop policy if exists pay_logs_insert_admin on public.payment_activity_logs;
create policy payment_activity_logs_admin on public.payment_activity_logs
  for all to authenticated using (private.is_admin()) with check (private.is_admin());

drop policy if exists pay_gateway_select_admin on public.payment_gateway_settings;
drop policy if exists pay_gateway_insert_admin on public.payment_gateway_settings;
drop policy if exists pay_gateway_update_admin on public.payment_gateway_settings;
drop policy if exists pay_gateway_delete_admin on public.payment_gateway_settings;
create policy payment_gateway_settings_admin on public.payment_gateway_settings
  for all to authenticated using (private.is_admin()) with check (private.is_admin());

drop policy if exists pay_txn_select_admin on public.payment_transactions;
drop policy if exists pay_txn_update_admin on public.payment_transactions;
drop policy if exists pay_txn_delete_admin on public.payment_transactions;
create policy payment_transactions_select on public.payment_transactions
  for select to authenticated using (user_id = (select auth.uid()) or private.is_admin());
create policy payment_transactions_update_admin on public.payment_transactions
  for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy payment_transactions_delete_admin on public.payment_transactions
  for delete to authenticated using (private.is_admin());

drop policy if exists kyc_docs_select_admin on public.kyc_documents;
drop policy if exists kyc_docs_update_admin on public.kyc_documents;
drop policy if exists kyc_docs_delete_admin on public.kyc_documents;
create policy kyc_documents_select on public.kyc_documents
  for select to authenticated using (user_id = (select auth.uid()) or private.is_admin());
create policy kyc_documents_update_admin on public.kyc_documents
  for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy kyc_documents_delete_admin on public.kyc_documents
  for delete to authenticated using (private.is_admin());

drop policy if exists kyc_sessions_select_admin on public.kyc_verification_sessions;
drop policy if exists kyc_sessions_update_admin on public.kyc_verification_sessions;
drop policy if exists kyc_sessions_delete_admin on public.kyc_verification_sessions;
create policy kyc_sessions_select on public.kyc_verification_sessions
  for select to authenticated using (user_id = (select auth.uid()) or private.is_admin());
create policy kyc_sessions_update_admin on public.kyc_verification_sessions
  for update to authenticated using (private.is_admin()) with check (private.is_admin());
create policy kyc_sessions_delete_admin on public.kyc_verification_sessions
  for delete to authenticated using (private.is_admin());

-- ── payouts: requests go through /api/payouts, which checks balance, cycle and split ──
drop policy if exists "Users can insert their own payouts" on public.payouts;
drop policy if exists "Allow users to insert their own payouts" on public.payouts;

-- ── tpp_platforms holds the terminal API key: admins only ──
drop policy if exists "Allow public read access on tpp_platforms" on public.tpp_platforms;

-- The public site and the checkout only need the name and surcharge of each platform.
create or replace function public.list_public_platforms()
returns table (id uuid, name text, extra_fee_pct numeric, server_name text)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select p.id, p.name::text, coalesce(p.extra_fee_pct, 0), p.server_name::text
  from public.tpp_platforms p
  where p.is_active is true
  order by p.created_at;
$$;
revoke all on function public.list_public_platforms() from public;
grant execute on function public.list_public_platforms() to anon, authenticated, service_role;

-- ── trigger functions are not an API ──
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.sync_account_to_trading_account() from public, anon, authenticated;
revoke execute on function public.block_trade_mutation() from public, anon, authenticated;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;
revoke execute on function public.set_updated_at() from public, anon, authenticated;

alter function public.touch_updated_at() set search_path = public, pg_temp;
alter function public.set_updated_at() set search_path = public, pg_temp;
alter function public.block_trade_mutation() set search_path = public, pg_temp;
alter function public.forex_session_anchor(timestamptz) set search_path = public, pg_temp;
alter function public.needs_daily_reset(timestamptz, timestamptz) set search_path = public, pg_temp;
alter function public.sync_account_to_trading_account() set search_path = public, pg_temp;
