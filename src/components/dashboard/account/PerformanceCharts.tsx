import Link from "next/link";
import type { AccountMetrics } from "@/lib/account-metrics";
import { TppMark } from "@/components/v2/glass/logo";
import { Panel } from "../glass";

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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      {/* Score Box */}
      <div className="g-card-dark g-hair lg:col-span-1 rounded-[28px] p-6 text-white overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
        <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-20 h-64 w-64 rounded-full bg-[radial-gradient(closest-side,rgba(203,251,69,0.18),transparent)]" />
        <div className="absolute top-6 left-6 flex items-center gap-2.5 text-white/80 font-semibold text-sm">
          <Link href="/" aria-label="The People Prop home" className="text-white">
            <TppMark className="h-[17px]" />
          </Link>
          Score
        </div>

        {/* Placeholder Radar Chart Graphic */}
        <div className="relative w-48 h-48 mt-4 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-full h-full opacity-80">
            {/* Radar Web */}
            <polygon points="50,10 90,50 50,90 10,50" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-white/20" />
            <polygon points="50,25 75,50 50,75 25,50" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-white/20" />
            <polygon points="50,40 60,50 50,60 40,50" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-white/20" />

            {/* Crosshairs */}
            <line x1="50" y1="10" x2="50" y2="90" stroke="currentColor" strokeWidth="0.5" className="text-white/20" />
            <line x1="10" y1="50" x2="90" y2="50" stroke="currentColor" strokeWidth="0.5" className="text-white/20" />

            <polygon points={polygonPoints} fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" className="text-[var(--g-lime)]" />

            {/* Center dot */}
            <circle cx="50" cy="50" r="2" fill="currentColor" className="text-white" />
          </svg>

          {/* Labels */}
          <span className="absolute -top-1 text-[10px] text-white/60">Consistency</span>
          <span className="absolute -right-4 text-[10px] text-white/60">SL usage</span>
          <span className="absolute -bottom-1 text-[10px] text-white/60">WR</span>
          <span className="absolute -left-2 text-[10px] text-white/60">RR</span>
        </div>

        <div className="absolute bottom-6 left-6">
          <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/55 mb-1">Profit factor</div>
          <div className="g-num text-[40px] font-semibold leading-none">{profitFactorLabel}</div>
        </div>
      </div>

      {/* Balance & Equity Box */}
      <Panel className="lg:col-span-2 p-6 flex flex-col justify-center gap-8 min-h-[300px]">
        {/* Balance Row */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="text-[14px] font-medium text-[var(--g-muted-ink)] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--g-ink)]" />
              Balance
            </div>
            <div className="g-num text-[18px] font-semibold text-[var(--g-ink)]">${currentBalance.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 border-t border-dashed border-black/20" />
            <div className="g-num shrink-0 text-[11px] font-semibold text-[var(--g-emerald)]">
              ${startingBalance.toLocaleString(undefined, {minimumFractionDigits: 2})} Max
            </div>
          </div>
        </div>

        {/* Equity Row */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <div className="text-[14px] font-medium text-[var(--g-muted-ink)] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--g-ink)]" />
              Equity
            </div>
            <div className="g-num text-[18px] font-semibold text-[var(--g-ink)]">${currentEquity.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 border-t border-dashed border-black/20" />
            <div className="g-num shrink-0 text-[11px] font-semibold text-[var(--g-emerald)]">
              ${startingBalance.toLocaleString(undefined, {minimumFractionDigits: 2})} Max
            </div>
          </div>
        </div>
      </Panel>
    </div>
  );
}
