import { supabaseAdmin } from "@/lib/supabase";
import { ContestReferralsClient } from "./ContestReferralsClient";

export const revalidate = 0;

export default async function AdminContestPage() {
  // Fetch all contest entries with their referral details
  const [{ data: entries }, { data: referrals }] = await Promise.all([
    supabaseAdmin
      .from("contest_entries")
      .select("*")
      .order("referral_count", { ascending: false }),
    supabaseAdmin
      .from("contest_referrals")
      .select("*")
      .order("signed_up_at", { ascending: false }),
  ]);

  // Get user emails from profiles
  const userIds = (entries || []).map((e: any) => e.user_id);
  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id, email, display_name")
    .in("id", userIds.length > 0 ? userIds : ["__none__"]);

  const profilesMap = (profiles || []).reduce((acc: any, p: any) => {
    acc[p.id] = p;
    return acc;
  }, {});

  // Build referrals map: contest_entry_id -> referral[]
  const referralsMap = (referrals || []).reduce((acc: any, r: any) => {
    if (!acc[r.contest_entry_id]) acc[r.contest_entry_id] = [];
    acc[r.contest_entry_id].push(r);
    return acc;
  }, {});

  const enrichedEntries = (entries || []).map((entry: any) => ({
    ...entry,
    profile: profilesMap[entry.user_id] || null,
    referralsList: referralsMap[entry.id] || [],
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-[var(--ink-950)]">Contest Referrals</h1>
        <p className="text-sm text-[var(--ink-500)] mt-1">
          Track referral progress for the free account contest. Allocate accounts when users reach their target.
        </p>
      </div>

      <ContestReferralsClient entries={enrichedEntries} />
    </div>
  );
}
