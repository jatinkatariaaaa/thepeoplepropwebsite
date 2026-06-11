"use client";

import { useState } from "react";
import { Clock, CheckCircle, XCircle, DollarSign, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function AdminPayoutsClient({ initialPayouts }: { initialPayouts: any[] }) {
  const router = useRouter();
  const [payouts, setPayouts] = useState(initialPayouts);
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpdateStatus = async (payoutId: string, status: "paid" | "rejected") => {
    if (!confirm(`Are you sure you want to mark this payout as ${status.toUpperCase()}?`)) return;

    setLoading(payoutId);
    try {
      const res = await fetch("/api/admin/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payoutId, status }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update payout");
      }

      toast.success(`Payout marked as ${status}`);
      setPayouts(payouts.map(p => p.id === payoutId ? { ...p, status } : p));
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-[var(--ink-500)] uppercase bg-[var(--paper-2)] border-b border-[var(--border)]">
            <tr>
              <th className="px-6 py-4 font-medium">Trader</th>
              <th className="px-6 py-4 font-medium">Account ID</th>
              <th className="px-6 py-4 font-medium">Amount</th>
              <th className="px-6 py-4 font-medium">Wallet Address</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {payouts?.map((payout) => (
              <tr key={payout.id} className="hover:bg-[var(--paper-2)] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-[var(--ink-950)]">{payout.profiles?.display_name || "Unknown"}</span>
                    <span className="text-xs text-[var(--ink-500)]">{payout.profiles?.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-mono text-xs">{payout.account_id.substring(0, 8)}</div>
                  {payout.accounts && (
                    <div className="text-xs text-[var(--ink-500)] mt-1">
                      ${payout.accounts.size.toLocaleString()}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="font-medium text-[var(--ink-950)] flex items-center">
                    <DollarSign className="w-3.5 h-3.5 text-[var(--ink-400)] mr-0.5" />
                    {Number(payout.amount).toLocaleString()}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-[var(--ink-400)]" />
                    <span className="font-mono text-xs truncate max-w-[150px]" title={payout.crypto_address}>
                      {payout.crypto_address}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {payout.status === "pending" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200"><Clock className="w-3.5 h-3.5" /> Pending</span>}
                  {payout.status === "paid" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200"><CheckCircle className="w-3.5 h-3.5" /> Paid</span>}
                  {payout.status === "rejected" && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200"><XCircle className="w-3.5 h-3.5" /> Rejected</span>}
                </td>
                <td className="px-6 py-4 text-[var(--ink-500)] whitespace-nowrap text-xs">
                  {new Date(payout.created_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right">
                  {payout.status === "pending" && (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleUpdateStatus(payout.id, "paid")}
                        disabled={loading === payout.id}
                        className="p-1.5 bg-green-50 text-green-600 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50"
                        title="Mark as Paid"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(payout.id, "rejected")}
                        disabled={loading === payout.id}
                        className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                        title="Reject & Refund"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {(!payouts || payouts.length === 0) && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-[var(--ink-500)]">
                  <div className="flex flex-col items-center gap-2">
                    <DollarSign className="w-8 h-8 text-[var(--ink-300)]" />
                    <p>No payout requests found.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
