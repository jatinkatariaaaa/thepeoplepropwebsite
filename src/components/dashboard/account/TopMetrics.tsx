import { Wallet, TrendingUp, Calendar, CalendarClock } from "lucide-react";

export function TopMetrics({ account }: { account: any }) {
  const startDate = account?.created_at 
    ? new Date(account.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Unknown';

  const currentBalance = Number(account?.balance || 0);
  const startingBalance = Number(account?.starting_balance || 0);
  const totalProfit = currentBalance - startingBalance;
  
  const metrics = [
    { label: "Account Size", value: `$${startingBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}`, icon: Wallet },
    { label: "Current Equity", value: `$${Number(account.equity || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}`, icon: TrendingUp },
    { label: "Total Profit", value: `${totalProfit >= 0 ? '+' : ''}$${totalProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}`, icon: TrendingUp },
    { label: "Phase", value: (account.phase || 'Unknown').toUpperCase(), icon: CalendarClock },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
      {metrics.map((m, i) => {
        const Icon = m.icon;
        return (
          <div key={i} className="bg-white rounded-2xl border border-[var(--border)] p-6 shadow-sm">
            <div className="flex items-center gap-2 text-[var(--ink-500)] mb-3">
              <Icon className="w-4 h-4" />
              <span className="text-[13px] font-medium">{m.label}</span>
            </div>
            <div className="text-[24px] font-display font-bold text-[var(--ink-950)]">
              {m.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
