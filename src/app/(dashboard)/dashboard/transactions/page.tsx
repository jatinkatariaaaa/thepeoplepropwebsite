"use client";

import { Download, Search, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const transactions = [
  {
    id: "TRX-109283",
    date: "2024-05-12",
    description: "$100,000 Evaluation Challenge",
    amount: "$499.00",
    method: "Crypto",
    status: "Completed",
  },
  {
    id: "TRX-108544",
    date: "2024-04-28",
    description: "$25,000 Evaluation Challenge",
    amount: "$199.00",
    method: "Credit Card",
    status: "Completed",
  },
  {
    id: "TRX-107211",
    date: "2024-03-15",
    description: "Payout Requested",
    amount: "$1,250.00",
    method: "Bank Transfer",
    status: "Processing",
  },
  {
    id: "TRX-106509",
    date: "2024-01-10",
    description: "$50,000 Evaluation Challenge",
    amount: "$299.00",
    method: "Crypto",
    status: "Completed",
  },
];

export default function TransactionsPage() {
  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-[var(--ink-950)] mb-2">Transaction History</h1>
          <p className="text-[var(--ink-500)]">View and download your past purchases and payouts.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-400)]" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-9 pr-4 py-2 bg-white border border-[var(--border)] rounded-xl text-[13px] focus:outline-none focus:border-[var(--ink-400)] transition-colors w-full sm:w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[var(--border)] rounded-xl text-[13px] font-bold text-[var(--ink-700)] hover:text-[var(--ink-950)] hover:bg-[var(--paper-2)] transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--paper-2)] border-b border-[var(--border)]">
                <th className="px-6 py-4 text-[12px] font-bold text-[var(--ink-500)] uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[var(--ink-500)] uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[var(--ink-500)] uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[var(--ink-500)] uppercase tracking-wider">Method</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[var(--ink-500)] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[var(--ink-500)] uppercase tracking-wider text-right">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {transactions.map((trx) => (
                <tr key={trx.id} className="hover:bg-[var(--paper-2)] transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-[13px] font-medium text-[var(--ink-950)]">{trx.date}</div>
                    <div className="text-[11px] text-[var(--ink-400)]">{trx.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[13px] font-medium text-[var(--ink-700)]">{trx.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-[14px] font-bold text-[var(--ink-950)]">{trx.amount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-[13px] text-[var(--ink-600)]">{trx.method}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold",
                      trx.status === "Completed" ? "bg-emerald-100 text-emerald-700" :
                      trx.status === "Processing" ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    )}>
                      {trx.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[var(--ink-400)] hover:text-[var(--ink-950)] hover:bg-white border border-transparent hover:border-[var(--border)] hover:shadow-sm transition-all opacity-0 group-hover:opacity-100 focus:opacity-100">
                      <FileText className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {transactions.length === 0 && (
          <div className="p-12 text-center">
            <FileText className="w-10 h-10 text-[var(--ink-300)] mx-auto mb-3" />
            <p className="text-[14px] font-medium text-[var(--ink-950)]">No transactions found</p>
            <p className="text-[13px] text-[var(--ink-500)] mt-1">Your transaction history will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
