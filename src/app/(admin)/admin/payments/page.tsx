import { supabaseAdmin } from "@/lib/supabase";
import { PaymentsClient } from "./PaymentsClient";

export const revalidate = 0;

export default async function AdminPaymentsPage() {
  const [{ data: transactions }, { data: profiles }] = await Promise.all([
    supabaseAdmin
      .from("payment_transactions")
      .select("*, profiles(id, email, display_name)")
      .order("created_at", { ascending: false })
      .limit(200),
    supabaseAdmin.from("profiles").select("id, email, display_name"),
  ]);

  const profilesMap = (profiles || []).reduce((acc: any, p: any) => {
    acc[p.id] = p;
    return acc;
  }, {});

  const enrichedTxns = (transactions || []).map((t: any) => ({
    ...t,
    profiles: t.profiles || profilesMap[t.user_id] || null,
  }));

  const statusCounts = {
    pending: enrichedTxns.filter((t: any) => t.status === "pending").length,
    completed: enrichedTxns.filter((t: any) => t.status === "completed").length,
    failed: enrichedTxns.filter((t: any) => t.status === "failed").length,
    refunded: enrichedTxns.filter((t: any) => t.status === "refunded").length,
    cancelled: enrichedTxns.filter((t: any) => t.status === "cancelled").length,
  };

  const gatewayTotals = {
    stripe: enrichedTxns.filter((t: any) => t.gateway === "stripe" && t.status === "completed").reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0),
    crypto: enrichedTxns.filter((t: any) => t.gateway === "crypto" && t.status === "completed").reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0),
    manual: enrichedTxns.filter((t: any) => t.gateway === "manual" && t.status === "completed").reduce((sum: number, t: any) => sum + (Number(t.amount) || 0), 0),
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
      <div className="mb-8">
        <h1 className="mb-1 text-xl font-semibold tracking-tight text-ink sm:text-2xl">Payment Management</h1>
        <p className="text-[var(--ink-500)]">Manage transactions, process refunds, and monitor payment activity.</p>
      </div>

      <PaymentsClient
        initialTransactions={enrichedTxns}
        statusCounts={statusCounts}
        gatewayTotals={gatewayTotals}
      />
    </div>
  );
}
