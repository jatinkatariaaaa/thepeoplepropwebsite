import { supabaseAdmin } from "@/lib/supabase";
import { ContestReferralsClient } from "./ContestReferralsClient";

export const revalidate = 0;

type BoardRow = {
  user_id: string;
  email: string | null;
  display_name: string | null;
  code: string;
  signups: number;
  verified: number;
  paid: number;
  claimed: boolean;
  claimed_at: string | null;
};

/**
 * Everyone who has referred at least one person through their link, ranked by verified
 * sign-ups (what the contest counts). Traders claim the reward themselves on reaching the target.
 */
export default async function AdminContestPage() {
  const [{ data: board }, { data: setting }, { data: referrals }] = await Promise.all([
    supabaseAdmin.rpc("referral_board"),
    supabaseAdmin.from("admin_settings").select("value").eq("key", "referral_reward_target").maybeSingle(),
    supabaseAdmin.from("affiliate_referrals").select("id, affiliate_id, referred_user_id, created_at").order("created_at", { ascending: false }),
  ]);

  const target = Number(setting?.value) > 0 ? Number(setting?.value) : 20;
  const rows = (board ?? []) as BoardRow[];

  // referred users' emails, for the expandable list under each referrer
  const referredIds = (referrals ?? []).map((r) => r.referred_user_id);
  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id, email")
    .in("id", referredIds.length > 0 ? referredIds : ["00000000-0000-0000-0000-000000000000"]);
  const emailOf = new Map((profiles ?? []).map((p) => [p.id, p.email ?? "—"]));

  const listOf = new Map<string, { id: string; referred_email: string; signed_up_at: string }[]>();
  for (const r of referrals ?? []) {
    const list = listOf.get(r.affiliate_id) ?? [];
    list.push({ id: r.id, referred_email: emailOf.get(r.referred_user_id) ?? "—", signed_up_at: r.created_at });
    listOf.set(r.affiliate_id, list);
  }

  const entries = rows.map((row) => {
    const referralsList = listOf.get(row.user_id) ?? [];
    return {
      id: row.user_id,
      user_id: row.user_id,
      referral_code: row.code,
      referral_count: Number(row.verified),
      target,
      claimed: row.claimed,
      claimed_at: row.claimed_at,
      created_at: referralsList[referralsList.length - 1]?.signed_up_at ?? row.claimed_at ?? new Date().toISOString(),
      profile: { id: row.user_id, email: row.email ?? "—", display_name: row.display_name },
      referralsList,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-[var(--ink-950)]">Contest Referrals</h1>
        <p className="text-sm text-[var(--ink-500)] mt-1">
          Verified sign-ups through each trader&apos;s referral link. At {target} they can claim the free account themselves from their dashboard.
        </p>
      </div>

      <ContestReferralsClient entries={entries} />
    </div>
  );
}
