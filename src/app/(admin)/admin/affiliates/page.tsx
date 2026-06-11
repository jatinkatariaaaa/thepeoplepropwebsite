import { supabaseAdmin } from "@/lib/supabase";
import { AffiliatesClient } from "./AffiliatesClient";

export const revalidate = 0;

export default async function AdminAffiliatesPage() {
  const [ { data: affiliates }, { data: profiles } ] = await Promise.all([
    supabaseAdmin.from("affiliates").select("*").order("pending_payout", { ascending: false }),
    supabaseAdmin.from("profiles").select("id, email, display_name")
  ]);

  const profilesMap = (profiles || []).reduce((acc: any, p: any) => {
    acc[p.id] = p;
    return acc;
  }, {});

  const enrichedAffiliates = (affiliates || []).map(aff => ({
    ...aff,
    profiles: profilesMap[aff.user_id] || null
  }));

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-[var(--ink-950)] mb-2">Affiliates & Payouts</h1>
        <p className="text-[var(--ink-500)]">Manage affiliates, track their performance, and process payouts.</p>
      </div>

      <AffiliatesClient initialAffiliates={enrichedAffiliates} />
    </div>
  );
}
