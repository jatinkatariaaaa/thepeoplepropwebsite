-- =============================================================================
-- Phase 2A: Trading Account Management
-- =============================================================================
-- WHERE TO APPLY:
--   Run this in the Supabase Dashboard -> SQL Editor for the project
--   (project ref: xnvtgpoocikieikgiotm), OR via the Supabase CLI:
--     supabase db push
--
-- This migration is idempotent (safe to run multiple times). It only adds
-- columns / constraints that the admin Trading Account Management module
-- relies on. It does NOT drop or rename anything.
-- =============================================================================

-- 1. Ensure the columns used by the admin UI exist on trading_accounts.
--    These are referenced by the existing pages and the new admin actions.
ALTER TABLE public.trading_accounts
  ADD COLUMN IF NOT EXISTS account_number          text,
  ADD COLUMN IF NOT EXISTS login                   text,
  ADD COLUMN IF NOT EXISTS leverage                integer        DEFAULT 100,
  ADD COLUMN IF NOT EXISTS phase                   text           DEFAULT 'phase_1',
  ADD COLUMN IF NOT EXISTS status                  text           DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS balance                 numeric(18,2)  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS equity                  numeric(18,2)  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS starting_balance        numeric(18,2)  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS highest_equity          numeric(18,2)  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_daily_drawdown  numeric(18,2)  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS current_max_drawdown    numeric(18,2)  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS user_id                 uuid,
  ADD COLUMN IF NOT EXISTS platform_id             uuid,
  ADD COLUMN IF NOT EXISTS rule_id                 uuid,
  ADD COLUMN IF NOT EXISTS disabled_at             timestamptz,
  ADD COLUMN IF NOT EXISTS created_at              timestamptz    DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at              timestamptz    DEFAULT now();

-- 2. Make account_number unique (admin create relies on uniqueness).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'trading_accounts_account_number_key'
  ) THEN
    -- Only add if there are no duplicate / null values that would block it.
    IF NOT EXISTS (
      SELECT account_number FROM public.trading_accounts
      WHERE account_number IS NOT NULL
      GROUP BY account_number HAVING count(*) > 1
    ) THEN
      ALTER TABLE public.trading_accounts
        ADD CONSTRAINT trading_accounts_account_number_key UNIQUE (account_number);
    END IF;
  END IF;
END $$;

-- 3. Relax / standardise the status check constraint so every admin status is valid.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'trading_accounts_status_check'
  ) THEN
    ALTER TABLE public.trading_accounts DROP CONSTRAINT trading_accounts_status_check;
  END IF;

  ALTER TABLE public.trading_accounts
    ADD CONSTRAINT trading_accounts_status_check
    CHECK (status IN ('active','suspended','breached','passed','disabled'));
END $$;

-- 4. Helpful indexes for the admin list / filters.
CREATE INDEX IF NOT EXISTS idx_trading_accounts_status     ON public.trading_accounts (status);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_user_id    ON public.trading_accounts (user_id);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_created_at ON public.trading_accounts (created_at DESC);

-- 5. Keep updated_at fresh.
CREATE OR REPLACE FUNCTION public.set_trading_accounts_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_trading_accounts_updated_at ON public.trading_accounts;
CREATE TRIGGER trg_trading_accounts_updated_at
  BEFORE UPDATE ON public.trading_accounts
  FOR EACH ROW EXECUTE FUNCTION public.set_trading_accounts_updated_at();

-- 6. audit_logs is shared with the rest of the admin panel; ensure it exists.
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
