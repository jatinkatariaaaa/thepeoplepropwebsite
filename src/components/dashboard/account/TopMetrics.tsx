import { Wallet, TrendingUp, CalendarClock } from "lucide-react";
import { Stat } from "../glass";

type AccountSummary = {
  equity?: number | string | null;
  starting_balance?: number | string | null;
  phase?: string | null;
};

export function TopMetrics({ account }: { account: AccountSummary }) {
  const currentEquity = Number(account?.equity || 0);
  const startingBalance = Number(account?.starting_balance || 0);
  const totalProfit = currentEquity - startingBalance;
  
  const metrics = [
    { label: "Account Size", value: `$${startingBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}`, icon: Wallet },
    { label: "Current Equity", value: `$${currentEquity.toLocaleString(undefined, {minimumFractionDigits: 2})}`, icon: TrendingUp },
    { label: "Total Profit", value: `${totalProfit >= 0 ? '+' : ''}$${totalProfit.toLocaleString(undefined, {minimumFractionDigits: 2})}`, icon: TrendingUp },
    { label: "Phase", value: account.phase === 'challenge' ? 'Phase 1' : account.phase === 'verification' ? 'Phase 2' : account.phase === 'phase_3' ? 'Phase 3' : account.phase === 'funded' ? 'Funded' : (account.phase || 'Phase 1').toUpperCase(), icon: CalendarClock },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 lg:gap-4 mb-6">
      {metrics.map((m, i) => (
        <Stat key={i} label={m.label} value={m.value} icon={m.icon} />
      ))}
    </div>
  );
}
