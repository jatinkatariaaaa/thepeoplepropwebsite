/*
# Phase 2B: Payment & KYC Module

## Overview
This migration creates the complete database schema for the Payment and KYC management system in the TPP admin CRM. It also creates prerequisite tables (profiles, trading_accounts) if they don't exist.

## New Tables

### 1. profiles
User profiles table (prerequisite).
- `id` (uuid, PK, FK → auth.users)
- `email`, `display_name`, `is_admin`, `status`, `created_at`

### 2. trading_accounts
Trading accounts table (prerequisite, minimal version).
- `id` (uuid, PK)
- `user_id` (uuid)
- `account_number`, `login`, `status`, `balance`, `equity`
- `created_at`, `updated_at`

### 3. kyc_documents
Stores user-submitted KYC verification documents with review workflow.
- `id` (uuid, PK) — document record ID
- `user_id` (uuid, FK → auth.users) — submitting user
- `document_type` (text) — passport, national_id, driving_license, address_proof, selfie
- `document_number` (text) — optional extracted document number
- `country` (text) — issuing country
- `front_image_url` (text) — front side image URL
- `back_image_url` (text) — back side image URL (optional)
- `selfie_image_url` (text) — selfie image URL
- `status` (text) — pending, approved, rejected, expired, reupload_requested
- `rejection_reason` (text) — admin-provided reason
- `admin_notes` (text) — internal admin notes
- `reviewed_by` (uuid) — admin user ID who reviewed
- `reviewed_at` (timestamptz) — review timestamp
- `expires_at` (timestamptz) — document expiry date
- `created_at` (timestamptz) — submission timestamp
- `updated_at` (timestamptz) — last update

### 4. kyc_verification_sessions
Tracks KYC verification sessions/status per user.
- `id` (uuid, PK)
- `user_id` (uuid, FK → auth.users) — unique per user
- `overall_status` (text) — not_started, pending, approved, rejected
- `required_documents` (text[]) — which docs are required
- `completed_documents` (text[]) — which docs are submitted
- `last_submitted_at` (timestamptz)
- `approved_at` (timestamptz)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### 5. payment_transactions
Stores all payment transactions across all gateways.
- `id` (uuid, PK)
- `user_id` (uuid, FK → auth.users)
- `account_id` (uuid, FK → trading_accounts) — optional
- `challenge_id` (uuid) — optional, linked challenge purchase
- `transaction_id` (text) — external gateway transaction ID
- `amount` (numeric) — transaction amount
- `currency` (text) — payment currency
- `gateway` (text) — stripe, crypto, manual
- `payment_method` (text) — card, crypto_btc, crypto_eth, bank_transfer, etc.
- `status` (text) — pending, completed, failed, refunded, cancelled
- `metadata` (jsonb) — gateway-specific response data
- `refund_reason` (text) — reason if refunded
- `refunded_at` (timestamptz)
- `refunded_by` (uuid) — admin who processed refund
- `invoice_url` (text) — generated invoice URL
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### 6. payment_gateway_settings
Stores configuration for each payment gateway.
- `id` (uuid, PK)
- `gateway` (text) — stripe, crypto, manual
- `is_active` (boolean) — enabled/disabled
- `is_sandbox` (boolean) — sandbox vs live mode
- `api_key` (text) — public API key
- `secret_key` (text) — encrypted/secret key
- `webhook_secret` (text) — webhook verification secret
- `webhook_url` (text) — configured webhook endpoint
- `supported_currencies` (text[]) — e.g. ["USD","EUR","BTC"]
- `supported_methods` (text[]) — e.g. ["card","crypto"]
- `fee_percentage` (numeric) — platform fee %
- `min_amount` (numeric) — minimum transaction
- `max_amount` (numeric) — maximum transaction
- `config` (jsonb) — gateway-specific config
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### 7. payment_activity_logs
Audit trail for payment-related admin actions.
- `id` (uuid, PK)
- `admin_id` (uuid)
- `admin_email` (text)
- `action` (text) — verify, refund, cancel, update_settings, etc.
- `entity_type` (text) — transaction, gateway_setting, kyc_document
- `entity_id` (text)
- `old_value` (jsonb)
- `new_value` (jsonb)
- `ip_address` (text)
- `user_agent` (text)
- `created_at` (timestamptz)

## Security
- RLS enabled on all new tables
- Policies for authenticated admin access
*/

-- =============================================================================
-- 0. Prerequisite tables
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         text,
  display_name  text,
  is_admin      boolean DEFAULT false,
  status        text DEFAULT 'active' CHECK (status IN ('active','suspended','banned')),
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.trading_accounts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  account_number  text,
  login           text,
  leverage        integer DEFAULT 100,
  phase           text DEFAULT 'phase_1',
  status          text DEFAULT 'active' CHECK (status IN ('active','suspended','breached','passed','disabled')),
  balance         numeric(18,2) DEFAULT 0,
  equity          numeric(18,2) DEFAULT 0,
  starting_balance numeric(18,2) DEFAULT 0,
  highest_equity  numeric(18,2) DEFAULT 0,
  current_daily_drawdown numeric(18,2) DEFAULT 0,
  current_max_drawdown numeric(18,2) DEFAULT 0,
  platform_id     uuid,
  rule_id         uuid,
  disabled_at     timestamptz,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    uuid,
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

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs (entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON public.audit_logs (created_at DESC);

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
-- 6. Triggers for updated_at
-- =============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated ON public.profiles;
CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_trading_accounts_updated ON public.trading_accounts;
CREATE TRIGGER trg_trading_accounts_updated
  BEFORE UPDATE ON public.trading_accounts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

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
-- 7. Row Level Security
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trading_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_verification_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_gateway_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

-- Trading Accounts
DROP POLICY IF EXISTS "trading_accounts_select_own" ON public.trading_accounts;
CREATE POLICY "trading_accounts_select_own" ON public.trading_accounts FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "trading_accounts_insert_own" ON public.trading_accounts;
CREATE POLICY "trading_accounts_insert_own" ON public.trading_accounts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "trading_accounts_update_own" ON public.trading_accounts;
CREATE POLICY "trading_accounts_update_own" ON public.trading_accounts FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "trading_accounts_delete_own" ON public.trading_accounts;
CREATE POLICY "trading_accounts_delete_own" ON public.trading_accounts FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- KYC Documents
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

-- KYC Sessions
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

-- Payment Transactions
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

-- Payment Gateway Settings
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

-- Payment Activity Logs
DROP POLICY IF EXISTS "pay_logs_select_admin" ON public.payment_activity_logs;
CREATE POLICY "pay_logs_select_admin" ON public.payment_activity_logs FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "pay_logs_insert_admin" ON public.payment_activity_logs;
CREATE POLICY "pay_logs_insert_admin" ON public.payment_activity_logs FOR INSERT
  TO authenticated WITH CHECK (true);

-- Audit Logs
DROP POLICY IF EXISTS "audit_logs_select_admin" ON public.audit_logs;
CREATE POLICY "audit_logs_select_admin" ON public.audit_logs FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "audit_logs_insert_admin" ON public.audit_logs;
CREATE POLICY "audit_logs_insert_admin" ON public.audit_logs FOR INSERT
  TO authenticated WITH CHECK (true);
