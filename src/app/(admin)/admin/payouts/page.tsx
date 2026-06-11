import { supabaseAdmin } from "@/lib/supabase";
import { AdminPayoutsClient } from "./AdminPayoutsClient";

export const revalidate = 0;

export default async function AdminPayoutsPage() {
  const [ { data: payouts }, { data: profiles } ] = await Promise.all([
    supabaseAdmin.from("payouts").select("*, accounts(id, size, balance)").order("created_at", { ascending: false }),
    supabaseAdmin.from("profiles").select("id, email, display_name")
  ]);

  const profilesMap = (profiles || []).reduce((acc: any, p: any) => {
    acc[p.id] = p;
    return acc;
  }, {});

  const enrichedPayouts = (payouts || []).map(payout => ({
    ...payout,
    profiles: profilesMap[payout.user_id] || null
  }));

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-[var(--ink-950)] mb-2">Trader Payouts</h1>
        <p className="text-[var(--ink-500)]">Review and process withdrawal requests from funded traders.</p>
      </div>

      <AdminPayoutsClient initialPayouts={enrichedPayouts} />
    </div>
  );
}
