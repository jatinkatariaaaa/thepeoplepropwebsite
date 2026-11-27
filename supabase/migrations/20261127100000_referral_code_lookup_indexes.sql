-- Indexes for partner_resolve_legacy_ref, which every /ref and /r referral link goes through
-- (resolve_referral_code, 4,233 calls on 2026-11-26; partner_resolve_legacy_ref, 1,452).
--
-- Its lookup is `referral_code = code OR user_id::text = code OR left(user_id::text, 8) = code`.
-- Only referral_code had an index, so every click read all of affiliates and cast each user_id to text
-- (measured: a sequential scan of 1,875 rows, 4.4 ms execution plus 10 ms planning). With an index on each
-- expression the planner answers all three with one bitmap OR of index lookups. Nothing about which
-- referrer a code resolves to changes.

create index if not exists affiliates_user_id_text_idx on public.affiliates ((user_id::text));
create index if not exists affiliates_user_id_prefix_idx on public.affiliates ((left(user_id::text, 8)));
