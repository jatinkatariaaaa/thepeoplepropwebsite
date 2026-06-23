-- =============================================================================
-- Phase 2D: Reports, Logs & System Settings
-- =============================================================================

-- =============================================================================
-- 1. API Logs Table
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.api_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint        text NOT NULL,
  method          text NOT NULL CHECK (method IN ('GET','POST','PUT','PATCH','DELETE','OPTIONS')),
  status_code     integer NOT NULL,
  response_time_ms integer NOT NULL DEFAULT 0,
  api_type        text NOT NULL CHECK (api_type IN ('payment','trading','email','webhook','internal')),
  request_body    jsonb DEFAULT NULL,
  response_body   jsonb DEFAULT NULL,
  error_message   text,
  ip_address      text,
  user_agent      text,
  user_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_logs_endpoint ON public.api_logs (endpoint);
CREATE INDEX IF NOT EXISTS idx_api_logs_method ON public.api_logs (method);
CREATE INDEX IF NOT EXISTS idx_api_logs_status ON public.api_logs (status_code);
CREATE INDEX IF NOT EXISTS idx_api_logs_type ON public.api_logs (api_type);
CREATE INDEX IF NOT EXISTS idx_api_logs_created ON public.api_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_logs_user ON public.api_logs (user_id);

-- =============================================================================
-- 2. Extend admin_settings category constraint
-- =============================================================================
ALTER TABLE public.admin_settings DROP CONSTRAINT IF EXISTS admin_settings_category_check;
ALTER TABLE public.admin_settings ADD CONSTRAINT admin_settings_category_check CHECK (category = ANY (ARRAY['general'::text, 'branding'::text, 'seo'::text, 'security'::text, 'trading'::text, 'email'::text]));

-- =============================================================================
-- 3. Seed system settings
-- =============================================================================
INSERT INTO public.admin_settings (category, key, value) VALUES
  ('general', 'company_name', to_jsonb('The People Prop'::text)),
  ('general', 'timezone', to_jsonb('UTC'::text)),
  ('general', 'currency', to_jsonb('USD'::text))
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.admin_settings (category, key, value) VALUES
  ('trading', 'default_leverage', to_jsonb('100'::text)),
  ('trading', 'trading_servers', '[]'::jsonb),
  ('trading', 'rule_templates', '[]'::jsonb)
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.admin_settings (category, key, value) VALUES
  ('email', 'smtp_host', to_jsonb(''::text)),
  ('email', 'smtp_port', to_jsonb('587'::text)),
  ('email', 'smtp_user', to_jsonb(''::text)),
  ('email', 'smtp_pass', to_jsonb(''::text)),
  ('email', 'smtp_secure', to_jsonb('true'::text)),
  ('email', 'sender_name', to_jsonb('The People Prop'::text)),
  ('email', 'sender_email', to_jsonb('noreply@thepeopleprop.com'::text))
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.admin_settings (category, key, value) VALUES
  ('security', 'password_min_length', to_jsonb('8'::text)),
  ('security', 'password_require_uppercase', to_jsonb('true'::text)),
  ('security', 'password_require_number', to_jsonb('true'::text)),
  ('security', 'password_require_special', to_jsonb('true'::text)),
  ('security', 'session_timeout_hours', to_jsonb('24'::text)),
  ('security', 'two_factor_auth', to_jsonb('false'::text)),
  ('security', 'max_login_attempts', to_jsonb('5'::text)),
  ('security', 'lockout_duration_minutes', to_jsonb('30'::text)),
  ('security', 'require_email_verification', to_jsonb('false'::text))
ON CONFLICT (key) DO NOTHING;

-- =============================================================================
-- 4. RLS for api_logs
-- =============================================================================
ALTER TABLE public.api_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "api_logs_select_admin" ON public.api_logs;
CREATE POLICY "api_logs_select_admin" ON public.api_logs FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "api_logs_insert_admin" ON public.api_logs;
CREATE POLICY "api_logs_insert_admin" ON public.api_logs FOR INSERT
  TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "api_logs_update_admin" ON public.api_logs;
CREATE POLICY "api_logs_update_admin" ON public.api_logs FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "api_logs_delete_admin" ON public.api_logs;
CREATE POLICY "api_logs_delete_admin" ON public.api_logs FOR DELETE
  TO authenticated USING (true);
