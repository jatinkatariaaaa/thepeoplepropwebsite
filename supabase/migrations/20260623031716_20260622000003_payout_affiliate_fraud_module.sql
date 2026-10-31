/*
# Phase 2C: Payout, Affiliate & Fraud Module

Enhances existing tables and creates new ones for fraud detection and notifications.

## Existing tables enhanced:
- payouts: already has profit, profit_split, notes, processed_at, processed_by
- affiliates: already has status, commission_rate, approved_at, approved_by

## New tables:
- fraud_flags: stores fraud detection alerts and risk scores
- admin_notifications: admin alert system for events
*/

-- =============================================================================
-- 1. Fraud Flags
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.fraud_flags (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  flag_type       text NOT NULL CHECK (flag_type IN ('duplicate_account','same_ip','vpn','device_fingerprint','multiple_accounts','referral_abuse','suspicious_activity','chargeback')),
  severity        text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  status          text NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewing','resolved','dismissed')),
  description     text NOT NULL,
  evidence        jsonb DEFAULT '{}',
  ip_address      text,
  device_fingerprint text,
  related_user_ids uuid[] DEFAULT ARRAY[]::uuid[],
  reviewed_by     uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at     timestamptz,
  resolution      text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fraud_flags_user_id ON public.fraud_flags (user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_flags_status ON public.fraud_flags (status);
CREATE INDEX IF NOT EXISTS idx_fraud_flags_severity ON public.fraud_flags (severity);
CREATE INDEX IF NOT EXISTS idx_fraud_flags_type ON public.fraud_flags (flag_type);
CREATE INDEX IF NOT EXISTS idx_fraud_flags_created ON public.fraud_flags (created_at DESC);

-- =============================================================================
-- 2. Admin Notifications
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type            text NOT NULL CHECK (type IN ('new_payout','fraud_alert','affiliate_registration','payment_failure','kyc_submission','user_suspension','system_alert')),
  severity        text NOT NULL DEFAULT 'info' CHECK (severity IN ('info','warning','critical')),
  title           text NOT NULL,
  message         text NOT NULL,
  entity_type     text,
  entity_id       text,
  user_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_read         boolean NOT NULL DEFAULT false,
  read_by         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  read_at         timestamptz,
  created_at      timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_notif_type ON public.admin_notifications (type);
CREATE INDEX IF NOT EXISTS idx_admin_notif_read ON public.admin_notifications (is_read);
CREATE INDEX IF NOT EXISTS idx_admin_notif_severity ON public.admin_notifications (severity);
CREATE INDEX IF NOT EXISTS idx_admin_notif_created ON public.admin_notifications (created_at DESC);

-- =============================================================================
-- 3. Triggers
-- =============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_fraud_flags_updated ON public.fraud_flags;
CREATE TRIGGER trg_fraud_flags_updated
  BEFORE UPDATE ON public.fraud_flags
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- 4. RLS
-- =============================================================================
ALTER TABLE public.fraud_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Fraud Flags
DROP POLICY IF EXISTS "fraud_flags_select_admin" ON public.fraud_flags;
CREATE POLICY "fraud_flags_select_admin" ON public.fraud_flags FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "fraud_flags_insert_admin" ON public.fraud_flags;
CREATE POLICY "fraud_flags_insert_admin" ON public.fraud_flags FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "fraud_flags_update_admin" ON public.fraud_flags;
CREATE POLICY "fraud_flags_update_admin" ON public.fraud_flags FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "fraud_flags_delete_admin" ON public.fraud_flags;
CREATE POLICY "fraud_flags_delete_admin" ON public.fraud_flags FOR DELETE
  TO authenticated USING (true);

-- Admin Notifications
DROP POLICY IF EXISTS "admin_notif_select_admin" ON public.admin_notifications;
CREATE POLICY "admin_notif_select_admin" ON public.admin_notifications FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "admin_notif_insert_admin" ON public.admin_notifications;
CREATE POLICY "admin_notif_insert_admin" ON public.admin_notifications FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "admin_notif_update_admin" ON public.admin_notifications;
CREATE POLICY "admin_notif_update_admin" ON public.admin_notifications FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "admin_notif_delete_admin" ON public.admin_notifications;
CREATE POLICY "admin_notif_delete_admin" ON public.admin_notifications FOR DELETE
  TO authenticated USING (true);
