-- Null preserves the existing global and program-only coupon scopes.
alter table public.tpp_coupons
  add column eligible_accounts jsonb,
  add constraint tpp_coupons_eligible_accounts_nonempty
    check (eligible_accounts is null or (
      jsonb_typeof(eligible_accounts) = 'array' and eligible_accounts <> '[]'::jsonb
    ));

-- Checkout validates a supplied code on the server. Keep giveaway codes out of public listings.
drop policy if exists "Allow public read access on coupons" on public.tpp_coupons;
