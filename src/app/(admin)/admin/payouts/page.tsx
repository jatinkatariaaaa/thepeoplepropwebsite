import { supabaseAdmin } from "@/lib/supabase";
import { AdminPayoutsClient } from "./AdminPayoutsClient";

export const revalidate = 0;

export default async function AdminPayoutsPage() {
  const [ { data: payouts }, { data: profiles }, { data: accounts } ] = await Promise.all([
    supabaseAdmin.from("payouts").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.from("profiles").select("id, email, display_name"),
    supabaseAdmin.from("accounts").select("id, label, balance, equity, starting_balance")
  ]);

  const profilesMap = (profiles || []).reduce((acc: any, p: any) => {
    acc[p.id] = p;
    return acc;
  }, {});

  const accountsMap = (accounts || []).reduce((acc: any, a: any) => {
    acc[a.id] = a;
    return acc;
  }, {});

  const enrichedPayouts = (payouts || []).map(payout => ({
    ...payout,
    profiles: profilesMap[payout.user_id] || null,
    accounts: accountsMap[payout.account_id] || null,
    profit: payout.profit ?? 0,
    profit_split: payout.profit_split ?? 0,
  }));

  const statusCounts = {
    pending: enrichedPayouts.filter((p: any) => p.status === "pending").length,
    paid: enrichedPayouts.filter((p: any) => p.status === "paid").length,
    rejected: enrichedPayouts.filter((p: any) => p.status === "rejected").length,
  };

  const totalPendingAmount = enrichedPayouts
    .filter((p: any) => p.status === "pending")
    .reduce((sum: number, p: any) => sum + Number(p.amount), 0);

  const totalPaidAmount = enrichedPayouts
    .filter((p: any) => p.status === "paid")
    .reduce((sum: number, p: any) => sum + Number(p.amount), 0);

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-[var(--ink-950)] mb-2">Payout Management</h1>
        <p className="text-[var(--ink-500)]">Review, approve, and process trader withdrawal requests with fraud detection.</p>
      </div>

      <AdminPayoutsClient
        initialPayouts={enrichedPayouts}
        statusCounts={statusCounts}
        totalPendingAmount={totalPendingAmount}
        totalPaidAmount={totalPaidAmount}
      />
    </div>
  );
}
