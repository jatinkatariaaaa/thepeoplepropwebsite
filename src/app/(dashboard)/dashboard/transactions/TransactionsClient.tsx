"use client";

import { useEffect, useState } from "react";
import { Download, Search, FileText } from "lucide-react";
import { StatusPill } from "@/components/dashboard/ui/primitives";
import { supabase } from "@/lib/supabase";

export function TransactionsClient() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTransactions() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data } = await supabase
          .from("purchases")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });
          
        if (data) {
          setTransactions(data);
        }
      }
      setLoading(false);
    }
    
    fetchTransactions();
  }, []);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">Transactions</h1>
          <p className="mt-1 text-sm text-ink-500">View and download your past purchases and payouts.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-400)]" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="h-9 w-full rounded-none border border-[var(--dash-hairline)] bg-white pl-9 pr-3 text-[13px] outline-none transition-colors focus:border-ink-400 sm:w-64"
            />
          </div>
          <button className="inline-flex h-9 items-center gap-1.5 rounded-none border border-[var(--dash-hairline)] bg-white px-3.5 text-[13px] font-medium text-ink-700 transition-colors hover:border-[var(--dash-hairline-strong)] hover:text-ink">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="dash-card overflow-hidden">
        <div className="dash-scroll-x">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th className="text-right">Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th className="text-right">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-ink border-t-transparent" role="status" aria-label="Loading transactions"></div>
                  </td>
                </tr>
              ) : transactions.length > 0 ? (
                transactions.map((trx) => (
                  <tr key={trx.id} className="group">
                    <td className="whitespace-nowrap">
                      <div className="text-[13px] font-medium text-ink">
                        {new Date(trx.created_at).toLocaleDateString()}
                      </div>
                      <div className="dash-num text-[11px] text-ink-400">{trx.id.substring(0, 8)}...</div>
                    </td>
                    <td>
                      <div className="text-[13px] font-medium capitalize text-ink-700">{trx.program_name?.replace(/-/g, ' ')}</div>
                    </td>
                    <td className="whitespace-nowrap text-right">
                      <div className="dash-num text-[13px] font-semibold text-ink">${trx.amount?.toFixed(2)}</div>
                    </td>
                    <td className="whitespace-nowrap">
                      <div className="text-[13px] capitalize text-ink-600">{trx.payment_method || 'Credit Card'}</div>
                    </td>
                    <td className="whitespace-nowrap">
                      <StatusPill tone={trx.status === "processing" ? "pending" : "success"} className="capitalize">
                        {trx.status || "Completed"}
                      </StatusPill>
                    </td>
                    <td className="whitespace-nowrap text-right">
                      <button className="inline-flex h-8 w-8 items-center justify-center rounded-none border border-transparent text-ink-400 opacity-0 transition-colors hover:border-[var(--dash-hairline)] hover:text-ink focus:opacity-100 group-hover:opacity-100" aria-label="Download invoice">
                        <FileText className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <div className="px-6 py-14 text-center">
                      <FileText className="mx-auto mb-3 h-6 w-6 text-ink-300" />
                      <p className="text-sm font-semibold text-ink">No transactions found</p>
                      <p className="mt-1 text-[13px] text-ink-500">Your transaction history will appear here.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
