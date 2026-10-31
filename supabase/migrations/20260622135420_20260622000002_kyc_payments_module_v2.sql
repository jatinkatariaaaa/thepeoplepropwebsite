/*
# Phase 2B: Payment & KYC Module

Creates the complete database schema for KYC and Payment management.
*/

-- =============================================================================
-- 1. KYC Documents
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.kyc_documents (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type   text NOT NULL CHECK (document_type IN ('passport','national_id','driving_license','address_proof','selfie')),
  document_number text,
  country         text,
  front_image_url text,
  back_image_url  text,
  selfie_image_url text,
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','expired','reupload_requested')),
  rejection_reason text,
  admin_notes     text,
  reviewed_by     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at     timestamptz,
  expires_at      timestamptz,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kyc_docs_user_id     ON public.kyc_documents (user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_docs_status      ON public.kyc_documents (status);
CREATE INDEX IF NOT EXISTS idx_kyc_docs_type_status ON public.kyc_documents (document_type, status);
CREATE INDEX IF NOT EXISTS idx_kyc_docs_created_at  ON public.kyc_documents (created_at DESC);

-- =============================================================================
-- 2. KYC Verification Sessions
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.kyc_verification_sessions (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_status       text NOT NULL DEFAULT 'not_started' CHECK (overall_status IN ('not_started','pending','approved','rejected')),
  required_documents   text[] DEFAULT ARRAY['passport','address_proof','selfie'],
  completed_documents  text[] DEFAULT ARRAY[]::text[],
  last_submitted_at    timestamptz,
  approved_at          timestamptz,
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kyc_sessions_status ON public.kyc_verification_sessions (overall_status);

-- =============================================================================
-- 3. Payment Transactions
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id      uuid REFERENCES public.trading_accounts(id) ON DELETE SET NULL,
  challenge_id    uuid,
  transaction_id  text,
  amount          numeric(18,2) NOT NULL DEFAULT 0,
  currency        text NOT NULL DEFAULT 'USD',
  gateway         text NOT NULL CHECK (gateway IN ('stripe','crypto','manual')),
  payment_method  text,
  status          text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','failed','refunded','cancelled')),
  metadata        jsonb DEFAULT '{}',
  refund_reason   text,
  refunded_at     timestamptz,
  refunded_by     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  invoice_url     text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pay_txn_user_id     ON public.payment_transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_pay_txn_status      ON public.payment_transactions (status);
CREATE INDEX IF NOT EXISTS idx_pay_txn_gateway     ON public.payment_transactions (gateway);
CREATE INDEX IF NOT EXISTS idx_pay_txn_created_at  ON public.payment_transactions (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pay_txn_status_gateway ON public.payment_transactions (status, gateway);

-- =============================================================================
-- 4. Payment Gateway Settings
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.payment_gateway_settings (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway              text NOT NULL UNIQUE CHECK (gateway IN ('stripe','crypto','manual')),
  is_active            boolean NOT NULL DEFAULT false,
  is_sandbox           boolean NOT NULL DEFAULT true,
  api_key              text,
  secret_key           text,
  webhook_secret       text,
  webhook_url          text,
  supported_currencies text[] DEFAULT ARRAY['USD'],
  supported_methods    text[] DEFAULT ARRAY[]::text[],
  fee_percentage       numeric(5,2) DEFAULT 0,
  min_amount           numeric(18,2) DEFAULT 0,
  max_amount           numeric(18,2) DEFAULT 999999,
  config               jsonb DEFAULT '{}',
  created_at           timestamptz DEFAULT now(),
  updated_at           timestamptz DEFAULT now()
);

INSERT INTO public.payment_gateway_settings (gateway, is_active, is_sandbox, supported_currencies, supported_methods)
VALUES
  ('stripe', false, true, ARRAY['USD','EUR','GBP'], ARRAY['card']),
  ('crypto', false, true, ARRAY['USD','BTC','ETH','USDT'], ARRAY['crypto_btc','crypto_eth','crypto_usdt']),
  ('manual', false, true, ARRAY['USD'], ARRAY['bank_transfer','wire'])
ON CONFLICT (gateway) DO NOTHING;

-- =============================================================================
-- 5. Payment Activity Logs
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.payment_activity_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  admin_email text,
  action      text NOT NULL,
  entity_type text,
  entity_id   text,
  old_value   jsonb,
  new_value   jsonb,
  ip_address  text,
  user_agent  text,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pay_logs_entity ON public.payment_activity_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_pay_logs_created ON public.payment_activity_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pay_logs_admin ON public.payment_activity_logs (admin_id);

-- =============================================================================
-- 6. Triggers
-- =============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_kyc_docs_updated ON public.kyc_documents;
CREATE TRIGGER trg_kyc_docs_updated
  BEFORE UPDATE ON public.kyc_documents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_kyc_sessions_updated ON public.kyc_verification_sessions;
CREATE TRIGGER trg_kyc_sessions_updated
  BEFORE UPDATE ON public.kyc_verification_sessions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_pay_txn_updated ON public.payment_transactions;
CREATE TRIGGER trg_pay_txn_updated
  BEFORE UPDATE ON public.payment_transactions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_pay_gateway_updated ON public.payment_gateway_settings;
CREATE TRIGGER trg_pay_gateway_updated
  BEFORE UPDATE ON public.payment_gateway_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- 7. RLS
-- =============================================================================
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_verification_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_gateway_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_activity_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "kyc_docs_select_admin" ON public.kyc_documents;
CREATE POLICY "kyc_docs_select_admin" ON public.kyc_documents FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "kyc_docs_insert_user" ON public.kyc_documents;
CREATE POLICY "kyc_docs_insert_user" ON public.kyc_documents FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "kyc_docs_update_admin" ON public.kyc_documents;
CREATE POLICY "kyc_docs_update_admin" ON public.kyc_documents FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "kyc_docs_delete_admin" ON public.kyc_documents;
CREATE POLICY "kyc_docs_delete_admin" ON public.kyc_documents FOR DELETE
  TO authenticated USING (true);

DROP POLICY IF EXISTS "kyc_sessions_select_admin" ON public.kyc_verification_sessions;
CREATE POLICY "kyc_sessions_select_admin" ON public.kyc_verification_sessions FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "kyc_sessions_insert_user" ON public.kyc_verification_sessions;
CREATE POLICY "kyc_sessions_insert_user" ON public.kyc_verification_sessions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "kyc_sessions_update_admin" ON public.kyc_verification_sessions;
CREATE POLICY "kyc_sessions_update_admin" ON public.kyc_verification_sessions FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "kyc_sessions_delete_admin" ON public.kyc_verification_sessions;
CREATE POLICY "kyc_sessions_delete_admin" ON public.kyc_verification_sessions FOR DELETE
  TO authenticated USING (true);

DROP POLICY IF EXISTS "pay_txn_select_admin" ON public.payment_transactions;
CREATE POLICY "pay_txn_select_admin" ON public.payment_transactions FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "pay_txn_insert_user" ON public.payment_transactions;
CREATE POLICY "pay_txn_insert_user" ON public.payment_transactions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "pay_txn_update_admin" ON public.payment_transactions;
CREATE POLICY "pay_txn_update_admin" ON public.payment_transactions FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "pay_txn_delete_admin" ON public.payment_transactions;
CREATE POLICY "pay_txn_delete_admin" ON public.payment_transactions FOR DELETE
  TO authenticated USING (true);

DROP POLICY IF EXISTS "pay_gateway_select_admin" ON public.payment_gateway_settings;
CREATE POLICY "pay_gateway_select_admin" ON public.payment_gateway_settings FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "pay_gateway_update_admin" ON public.payment_gateway_settings;
CREATE POLICY "pay_gateway_update_admin" ON public.payment_gateway_settings FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "pay_gateway_insert_admin" ON public.payment_gateway_settings;
CREATE POLICY "pay_gateway_insert_admin" ON public.payment_gateway_settings FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "pay_gateway_delete_admin" ON public.payment_gateway_settings;
CREATE POLICY "pay_gateway_delete_admin" ON public.payment_gateway_settings FOR DELETE
  TO authenticated USING (true);

DROP POLICY IF EXISTS "pay_logs_select_admin" ON public.payment_activity_logs;
CREATE POLICY "pay_logs_select_admin" ON public.payment_activity_logs FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "pay_logs_insert_admin" ON public.payment_activity_logs;
CREATE POLICY "pay_logs_insert_admin" ON public.payment_activity_logs FOR INSERT
  TO authenticated WITH CHECK (true);
