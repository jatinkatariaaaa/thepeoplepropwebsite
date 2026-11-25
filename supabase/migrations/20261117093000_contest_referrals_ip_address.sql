-- /api/contest/track writes and checks contest_referrals.ip_address, but the
-- column never existed, so every referral insert failed. One row in the table
-- against 76 contest entries is the result.
alter table public.contest_referrals add column if not exists ip_address text;
create index if not exists contest_referrals_entry_ip_idx on public.contest_referrals (contest_entry_id, ip_address);
