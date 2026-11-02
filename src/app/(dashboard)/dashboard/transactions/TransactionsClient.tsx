"use client";

import { useEffect, useState } from "react";
import { Download, Search, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Chip, Empty, PageTitle, Panel, Spinner, btn, field, table } from "@/components/dashboard/glass";

type Purchase = {
  id: string;
  created_at: string;
  program_name?: string | null;
  amount?: number | null;
  payment_method?: string | null;
  status?: string | null;
};

export function TransactionsClient() {
  const [transactions, setTransactions] = useState<Purchase[]>([]);
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
    <div className="mx-auto max-w-7xl">
      <PageTitle lead="Transaction" fade="History" lede="View and download your past purchases and payouts.">
        <div className="relative min-w-0 flex-1 sm:flex-none">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-black/40" />
          <input
            type="text"
            placeholder="Search..."
            className={cn(field(), "h-10 rounded-full pl-10 text-[13px] sm:w-64")}
          />
        </div>
        <button className={cn(btn.light, btn.sm)}>
          <Download className="h-4 w-4" />
          Export
        </button>
      </PageTitle>

      <Panel className="overflow-hidden">
        <div className={table.scroll}>
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className={table.headRow}>
                <th className={table.th}>Date</th>
                <th className={table.th}>Description</th>
                <th className={table.th}>Amount</th>
                <th className={table.th}>Method</th>
                <th className={table.th}>Status</th>
                <th className={cn(table.th, "text-right")}>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12">
                    <Spinner className="mx-auto" />
                  </td>
                </tr>
              ) : transactions.length > 0 ? (
                transactions.map((trx) => (
                  <tr key={trx.id} className={cn(table.row, "group")}>
                    <td className={cn(table.td, "whitespace-nowrap")}>
                      <div className="text-[13px] font-medium text-[var(--g-ink)]">
                        {new Date(trx.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-[11px] text-black/40">{trx.id.substring(0, 8)}...</div>
                    </td>
                    <td className={table.td}>
                      <div className="text-[13px] font-medium text-[var(--g-ink)] capitalize">{trx.program_name?.replace(/-/g, ' ')}</div>
                    </td>
                    <td className={cn(table.td, "whitespace-nowrap")}>
                      <div className="g-num text-[14px] font-semibold text-[var(--g-ink)]">${trx.amount?.toFixed(2)}</div>
                    </td>
                    <td className={cn(table.td, "whitespace-nowrap")}>
                      <div className="text-[13px] text-[var(--g-muted-ink)] capitalize">{trx.payment_method || 'Credit Card'}</div>
                    </td>
                    <td className={cn(table.td, "whitespace-nowrap")}>
                      <Chip
                        tone={
                          trx.status === "completed" ? "emerald" :
                          trx.status === "processing" ? "amber" :
                          "emerald" // Default to completed for test purchases
                        }
                        className="capitalize"
                      >
                        {trx.status || "Completed"}
                      </Chip>
                    </td>
                    <td className={cn(table.td, "whitespace-nowrap text-right")}>
                      <button className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-black/40 opacity-0 ring-1 ring-transparent transition-all group-hover:opacity-100 hover:bg-white hover:text-[var(--g-ink)] hover:ring-black/10 focus:opacity-100">
                        <FileText className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <Empty icon={FileText} title="No transactions found">
                      Your transaction history will appear here.
                    </Empty>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
