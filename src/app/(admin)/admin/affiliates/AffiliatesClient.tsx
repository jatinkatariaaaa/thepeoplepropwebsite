"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, DollarSign } from "lucide-react";
import { toast } from "sonner";

export function AffiliatesClient({ initialAffiliates }: { initialAffiliates: any[] }) {
  const [affiliates, setAffiliates] = useState(initialAffiliates);
  const [paying, setPaying] = useState<string | null>(null);
  const router = useRouter();

  const handlePayout = async (affiliateId: string, amount: number) => {
    if (amount <= 0) return;
    
    setPaying(affiliateId);
    try {
      const res = await fetch("/api/admin/affiliates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ affiliateId, amount }),
      });
      
      if (!res.ok) throw new Error("Failed to process payout");
      
      const { newPending } = await res.json();
      
      toast.success(`Payout of $${amount} processed successfully`);
      
      // Update local state
      setAffiliates(affiliates.map(aff => {
        if (aff.id === affiliateId) {
          return { ...aff, pending_payout: newPending };
        }
        return aff;
      }));
      
      router.refresh();
    } catch (error) {
      toast.error("Failed to process payout");
      console.error(error);
    } finally {
      setPaying(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--paper-2)] border-b border-[var(--border)] text-[13px] uppercase tracking-wider text-[var(--ink-500)]">
              <th className="px-6 py-4 font-medium">Affiliate User</th>
              <th className="px-6 py-4 font-medium">Referrals</th>
              <th className="px-6 py-4 font-medium">Link Clicks</th>
              <th className="px-6 py-4 font-medium">Total Earnings</th>
              <th className="px-6 py-4 font-medium">Pending Payout</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {affiliates?.map((aff) => {
              const pending = Number(aff.pending_payout);
              return (
                <tr key={aff.id} className="hover:bg-[var(--paper-2)] transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-[13px] font-medium text-[var(--ink-950)]">{aff.profiles?.email}</div>
                    <div className="text-[11px] text-[var(--ink-500)] font-mono">{aff.user_id.substring(0, 8)}</div>
                  </td>
                  <td className="px-6 py-4 text-[var(--ink-600)] font-semibold">{aff.total_referrals}</td>
                  <td className="px-6 py-4 text-[var(--ink-600)] font-semibold">{aff.link_clicks}</td>
                  <td className="px-6 py-4">
                    <div className="text-[14px] font-mono font-semibold text-emerald-600">
                      ${Number(aff.total_earnings).toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`text-[14px] font-mono font-bold ${pending > 0 ? 'text-amber-600' : 'text-[var(--ink-500)]'}`}>
                      ${pending.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handlePayout(aff.id, pending)}
                      disabled={paying === aff.id || pending <= 0}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-all ${
                        pending > 0 
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {paying === aff.id ? (
                        "Processing..."
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Mark Paid
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              );
            })}
            {(!affiliates || affiliates.length === 0) && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-[var(--ink-500)]">
                  No affiliates found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
