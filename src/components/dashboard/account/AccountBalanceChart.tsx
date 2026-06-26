import { TrendingUp, CalendarDays } from "lucide-react";

export function AccountBalanceChart({ metrics }: { metrics?: any }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[16px] text-[var(--ink-950)]">Account Balance</h3>
        <button className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] bg-white rounded-xl text-[13px] font-medium text-[var(--ink-600)] hover:bg-[var(--paper-2)] transition-colors">
          <CalendarDays className="w-4 h-4" />
          Pick date range
        </button>
      </div>

      <div className="bg-white border border-[var(--border)] rounded-[24px] shadow-sm flex flex-col items-center justify-center p-12 min-h-[400px]">
        <div className="w-16 h-16 rounded-full bg-[var(--paper-2)] flex items-center justify-center mb-4">
          <TrendingUp className="w-8 h-8 text-[var(--ink-400)]" />
        </div>
        <h4 className="font-bold text-[16px] text-[var(--ink-950)] mb-1">No balance data available</h4>
        <p className="text-[14px] text-[var(--ink-500)]">Start trading to see equity and balance history</p>
      </div>
    </div>
  );
}
