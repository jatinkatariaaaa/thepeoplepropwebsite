ALTER TABLE public.payouts
  ADD COLUMN IF NOT EXISTS payment_method TEXT NOT NULL DEFAULT 'crypto',
  ADD COLUMN IF NOT EXISTS payment_details TEXT;
