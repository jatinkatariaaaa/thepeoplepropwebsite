-- Trigger functions do not need EXECUTE to fire; helpers are only called from definer functions.
-- private.is_admin() keeps its grant because RLS policies call it as the requesting role.
revoke all on function private.protect_profile_columns() from public, anon, authenticated;
revoke all on function private.trading_account_before_update() from public, anon, authenticated;
revoke all on function private.trading_account_after_breach() from public, anon, authenticated;
revoke all on function private.support_ticket_after_insert() from public, anon, authenticated;
revoke all on function private.ticket_message_after_insert() from public, anon, authenticated;
revoke all on function private.setting_bool(text, boolean) from public, anon, authenticated;
revoke all on function private.setting_num(text, numeric) from public, anon, authenticated;
