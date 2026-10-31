import { supabaseAdmin } from "@/lib/supabase";
import { AffiliatesClient } from "./AffiliatesClient";

export const revalidate = 0;

export default async function AdminAffiliatesPage() {
  const [ { data: affiliates }, { data: profiles }, { data: referrals } ] = await Promise.all([
    supabaseAdmin.from("affiliates").select("*").order("total_earnings", { ascending: false }),
    supabaseAdmin.from("profiles").select("id, email, display_name, affiliate_code"),
    supabaseAdmin.from("affiliate_referrals").select("*").order("created_at", { ascending: false }),
  ]);

  const profilesMap = (profiles || []).reduce((acc: any, p: any) => {
    acc[p.id] = p;
    return acc;
  }, {});

  const referralsMap = (referrals || []).reduce((acc: any, r: any) => {
    if (!acc[r.affiliate_user_id]) acc[r.affiliate_user_id] = [];
    acc[r.affiliate_user_id].push(r);
    return acc;
  }, {});

  const enrichedAffiliates = (affiliates || []).map(aff => ({
    ...aff,
    profiles: profilesMap[aff.user_id] || null,
    referral_list: referralsMap[aff.user_id] || [],
  }));

  const statusCounts = {
    active: enrichedAffiliates.filter((a: any) => a.status === "active").length,
    pending: enrichedAffiliates.filter((a: any) => a.status === "pending").length,
    suspended: enrichedAffiliates.filter((a: any) => a.status === "suspended").length,
  };

  const totalEarnings = enrichedAffiliates.reduce((sum: number, a: any) => sum + Number(a.total_earnings || 0), 0);
  const totalPending = enrichedAffiliates.reduce((sum: number, a: any) => sum + Number(a.pending_payout || 0), 0);

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-[var(--ink-950)] mb-2">Affiliate Management</h1>
        <p className="text-[var(--ink-500)]">Manage affiliates, track referrals, commissions, and process payouts.</p>
      </div>

      <AffiliatesClient
        initialAffiliates={enrichedAffiliates}
        statusCounts={statusCounts}
        totalEarnings={totalEarnings}
        totalPending={totalPending}
      />
    </div>
  );
}
