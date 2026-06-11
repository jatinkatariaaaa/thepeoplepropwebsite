"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Trophy, ShieldCheck, Activity } from "lucide-react";
import { toast } from "sonner";

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "breached":
      return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold bg-red-100 text-red-700"><ShieldAlert className="w-3.5 h-3.5" /> Breached</span>;
    case "passed":
      return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold bg-green-100 text-green-700"><Trophy className="w-3.5 h-3.5" /> Passed</span>;
    case "funded":
      return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-700"><ShieldCheck className="w-3.5 h-3.5" /> Funded</span>;
    default:
      return <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-700"><Activity className="w-3.5 h-3.5" /> Active</span>;
  }
}

export function AccountsClient({ initialAccounts }: { initialAccounts: any[] }) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [updating, setUpdating] = useState<string | null>(null);
  const router = useRouter();

  const handleStatusChange = async (accountId: string, newStatus: string, newPhase?: string) => {
    setUpdating(accountId);
    try {
      const res = await fetch("/api/admin/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId, status: newStatus, phase: newPhase }),
      });
      
      if (!res.ok) throw new Error("Failed to update status");
      
      toast.success("Account updated successfully");
      
      // Update local state
      setAccounts(accounts.map(acc => {
        if (acc.id === accountId) {
          return { ...acc, status: newStatus, phase: newPhase || acc.phase };
        }
        return acc;
      }));
      
      router.refresh();
    } catch (error) {
      toast.error("Failed to update account");
      console.error(error);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--paper-2)] border-b border-[var(--border)] text-[13px] uppercase tracking-wider text-[var(--ink-500)]">
              <th className="px-6 py-4 font-medium">Account ID</th>
              <th className="px-6 py-4 font-medium">User</th>
              <th className="px-6 py-4 font-medium">Details</th>
              <th className="px-6 py-4 font-medium">Equity / Bal</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {accounts?.map((acc) => {
              const pnl = acc.equity - acc.starting_balance;
              const isProfit = pnl >= 0;
              
              return (
                <tr key={acc.id} className="hover:bg-[var(--paper-2)] transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-[var(--ink-500)]">{acc.id.substring(0, 8)}...</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[13px] font-medium text-[var(--ink-950)]">{acc.profiles?.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[14px] font-medium text-[var(--ink-950)]">{acc.label}</div>
                    <div className="text-[11px] uppercase tracking-wider text-[var(--ink-500)] mt-0.5">{acc.phase}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[14px] font-mono font-semibold">${Number(acc.equity).toLocaleString()}</div>
                    <div className={`text-[12px] font-mono ${isProfit ? 'text-emerald-600' : 'text-red-600'}`}>
                      {isProfit ? '+' : ''}{pnl.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={acc.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <select 
                        className="text-xs border border-[var(--border)] rounded px-2 py-1.5 bg-white disabled:opacity-50"
                        value=""
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) return;
                          
                          if (val === "funded") {
                            handleStatusChange(acc.id, "funded", "funded");
                          } else {
                            handleStatusChange(acc.id, val);
                          }
                        }}
                        disabled={updating === acc.id}
                      >
                        <option value="">Change Status...</option>
                        <option value="active">Active</option>
                        <option value="passed">Passed</option>
                        <option value="funded">Funded</option>
                        <option value="breached">Breached</option>
                      </select>
                    </div>
                  </td>
                </tr>
              );
            })}
            {(!accounts || accounts.length === 0) && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-[var(--ink-500)]">
                  No accounts found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
