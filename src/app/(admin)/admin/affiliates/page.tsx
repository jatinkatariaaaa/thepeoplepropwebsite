import { supabaseAdmin } from "@/lib/supabase";
import { AffiliatesClient } from "./AffiliatesClient";

export const revalidate = 0;

export default async function AdminAffiliatesPage() {
  const { data: affiliates, error } = await supabaseAdmin
    .from("affiliates")
    .select(`
      *,
      profiles (
        email
      )
    `)
    .order("pending_payout", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-[var(--ink-950)] mb-2">Affiliates & Payouts</h1>
        <p className="text-[var(--ink-500)]">Manage affiliates, track their performance, and process payouts.</p>
      </div>

      <AffiliatesClient initialAffiliates={affiliates || []} />
    </div>
  );
}
