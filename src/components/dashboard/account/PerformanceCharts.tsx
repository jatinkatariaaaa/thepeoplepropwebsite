import type { AccountMetrics } from "@/lib/account-metrics";

type AccountSummary = {
  balance?: number | string | null;
  equity?: number | string | null;
  starting_balance?: number | string | null;
};

export function PerformanceCharts({ account, metrics }: { account?: AccountSummary | null, metrics?: AccountMetrics | null }) {
  const currentBalance = Number(account?.balance || 0);
  const currentEquity = Number(account?.equity || 0);
  const startingBalance = Number(account?.starting_balance || 0);
  const profitFactorLabel = metrics?.profitFactor == null
    ? metrics?.grossProfit ? "No loss" : "0.00"
    : metrics.profitFactor.toFixed(2);
  const winRate = metrics?.winRate ?? 0;
  const rrScore = metrics?.averageLoss ? Math.min(90, (metrics.averageWin / metrics.averageLoss) * 30) : 35;
  const consistencyScore = metrics?.dailyPnL?.length
    ? Math.min(85, 35 + metrics.dailyPnL.filter((day) => day.pnl >= 0).length * 8)
    : 25;
  const polygonPoints = `50,${Math.max(18, 80 - consistencyScore * 0.7)} ${Math.min(85, 35 + winRate * 0.5)},50 50,${Math.min(82, 35 + rrScore * 0.45)} ${Math.max(15, 65 - (metrics?.profitFactor ?? 0) * 10)},50`;

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
      {/* Score Box */}
      <div className="relative flex min-h-[300px] flex-col items-center justify-center overflow-hidden rounded-none bg-ink p-6 text-white lg:col-span-1">
        <p className="dash-overline absolute left-6 top-6 text-white/50">
          Performance Score
        </p>

        {/* Radar Chart Graphic */}
        <div className="relative mt-4 flex h-48 w-48 items-center justify-center">
          <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
            {/* Radar Web */}
            <polygon points="50,10 90,50 50,90 10,50" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-white/15" />
            <polygon points="50,25 75,50 50,75 25,50" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-white/15" />
            <polygon points="50,40 60,50 50,60 40,50" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-white/15" />

            {/* Crosshairs */}
            <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="0.5" className="text-white/15" />
            <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="0.5" className="text-white/15" />

            <polygon points={polygonPoints} fill="#CBFB45" fillOpacity="0.16" stroke="#CBFB45" strokeWidth="1.25" />

            {/* Center dot */}
            <circle cx="50" cy="50" r="1.5" fill="currentColor" className="text-white/80" />
          </svg>

          {/* Labels */}
          <span className="absolute -top-1 text-[10px] text-white/50">Consistency</span>
          <span className="absolute -right-4 text-[10px] text-white/50">SL usage</span>
          <span className="absolute -bottom-1 text-[10px] text-white/50">WR</span>
          <span className="absolute -left-2 text-[10px] text-white/50">RR</span>
        </div>

        <div className="absolute bottom-6 left-6">
          <p className="dash-overline mb-1 text-white/50">Profit factor</p>
          <p className="dash-figure text-[32px] leading-none text-white">{profitFactorLabel}</p>
        </div>
      </div>

      {/* Balance & Equity Box */}
      <div className="dash-card flex min-h-[300px] flex-col justify-center gap-8 p-5 sm:p-6 lg:col-span-2">
        {/* Balance Row */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[13px] text-ink-500">
              <span className="status-dot bg-ink" aria-hidden="true" />
              Balance
            </div>
            <div className="dash-figure text-lg">${currentBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
          </div>
          <div className="relative h-px w-full bg-[var(--dash-hairline)]">
            <div className="dash-num absolute right-0 top-1/2 -translate-y-1/2 bg-white pl-2 text-[11px] font-medium text-[var(--dash-positive)]">
              ${startingBalance.toLocaleString(undefined, {minimumFractionDigits: 2})} Max
            </div>
            <div className="absolute left-0 top-1/2 w-full -translate-y-1/2 border-t border-dashed border-ink-200" />
          </div>
        </div>

        {/* Equity Row */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[13px] text-ink-500">
              <span className="status-dot bg-ink-400" aria-hidden="true" />
              Equity
            </div>
            <div className="dash-figure text-lg">${currentEquity.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
          </div>
          <div className="relative h-px w-full bg-[var(--dash-hairline)]">
            <div className="dash-num absolute right-0 top-1/2 -translate-y-1/2 bg-white pl-2 text-[11px] font-medium text-[var(--dash-positive)]">
              ${startingBalance.toLocaleString(undefined, {minimumFractionDigits: 2})} Max
            </div>
            <div className="absolute left-0 top-1/2 w-full -translate-y-1/2 border-t border-dashed border-ink-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
