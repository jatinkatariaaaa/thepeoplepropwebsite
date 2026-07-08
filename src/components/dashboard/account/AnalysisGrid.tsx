"use client";

import {
  Activity,
  BarChart3,
  CalendarDays,
  Hash,
  PieChart as PieChartIcon,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AccountMetrics, DirectionStats } from "@/lib/account-metrics";
import { cn } from "@/lib/utils";

type TooltipEntry = {
  dataKey?: string | number;
  name?: string;
  value?: number | string;
};

const COLORS = {
  win: "#059669",
  loss: "#E11D48",
  flat: "#94a3b8",
  dark: "#0f172a",
  accent: "#059669",
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

function formatMoney(value?: number) {
  return money.format(value || 0);
}

function formatSignedMoney(value?: number) {
  const amount = value || 0;
  return `${amount >= 0 ? "+" : ""}${money.format(amount)}`;
}

function formatPct(value?: number) {
  return `${(value || 0).toFixed(2)}%`;
}

function formatNum(value?: number | null) {
  if (value === null) return "No loss";
  return (value || 0).toFixed(2);
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;

  return (
    <div className="dash-tooltip">
      <p className="mb-1 text-[11px] font-medium text-ink-400">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey || entry.name} className="dash-tooltip-value text-[12px]">
          {entry.name}: {typeof entry.value === "number" ? formatMoney(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
}

function DirectionPanel({ title, stats }: { title: string; stats: DirectionStats }) {
  const isPositive = stats.netPnl >= 0;

  return (
    <div className="dash-card flex flex-col">
      <div className="border-b border-[var(--dash-hairline)] px-4 py-3.5 sm:px-5">
        <h4 className="text-[15px] font-semibold tracking-tight text-ink">{title}</h4>
      </div>
      <div className="flex min-h-[180px] flex-1 flex-col items-center justify-center border-b border-[var(--dash-hairline)] p-6 text-center">
        <div className={cn("dash-figure mb-1 text-[26px]", isPositive ? "text-[var(--dash-positive)]" : "text-[var(--dash-negative)]")}>
          {formatSignedMoney(stats.netPnl)}
        </div>
        <div className="text-[13px] text-ink-500">
          {stats.trades} trades / {stats.volume.toLocaleString()} lots
        </div>
      </div>
      <div className="grid grid-cols-3 divide-x divide-[var(--dash-hairline)] p-4 text-center">
        <div>
          <div className="dash-overline mb-1">Wins ({stats.wins})</div>
          <div className="dash-num text-[14px] font-semibold text-ink">{formatMoney(stats.grossProfit)}</div>
        </div>
        <div>
          <div className="dash-overline mb-1">Win Rate</div>
          <div className="dash-num text-[14px] font-semibold text-ink">{formatPct(stats.winRate)}</div>
        </div>
        <div>
          <div className="dash-overline mb-1">Losses ({stats.losses})</div>
          <div className="dash-num text-[14px] font-semibold text-ink">{formatMoney(stats.grossLoss)}</div>
        </div>
      </div>
    </div>
  );
}

export function AnalysisGrid({ metrics }: { metrics?: AccountMetrics | null }) {
  const profitabilityData = [
    { name: "Wins", value: metrics?.wins || 0, fill: COLORS.win },
    { name: "Losses", value: metrics?.losses || 0, fill: COLORS.loss },
    { name: "Breakeven", value: metrics?.breakevenTrades || 0, fill: COLORS.flat },
  ].filter((item) => item.value > 0);

  const durationData = (metrics?.durationBuckets ?? []).filter((bucket) => bucket.trades > 0 || bucket.pnl !== 0);
  const hasProfitabilityData = profitabilityData.length > 0;
  const hasDurationData = durationData.length > 0;

  return (
    <div className="space-y-6 mb-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Average Win", value: formatMoney(metrics?.averageWin), icon: TrendingUp },
          { label: "Win Ratio", value: formatPct(metrics?.winRate), icon: Target },
          { label: "Average Loss", value: formatMoney(-(metrics?.averageLoss || 0)), icon: TrendingDown },
          { label: "Profit Factor", value: formatNum(metrics?.profitFactor), icon: BarChart3 },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="dash-card dash-card-hover p-4 sm:p-5">
              <div className="dash-overline mb-2 flex items-center gap-1.5">
                <Icon className="w-4 h-4" /> {stat.label}
              </div>
              <div className="dash-figure text-xl">{stat.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: "Number of days", value: String(metrics?.dailyPnL?.length || 0), icon: CalendarDays },
          { label: "Total Trades Taken", value: String(metrics?.totalTrades || 0), icon: Hash },
          { label: "Total Lots Used", value: (metrics?.totalVolume || 0).toLocaleString(undefined, { maximumFractionDigits: 2 }), icon: BarChart3 },
          { label: "Biggest Win", value: formatMoney(metrics?.biggestWin), icon: TrendingUp },
          { label: "Biggest Loss", value: formatMoney(metrics?.biggestLoss), icon: TrendingDown },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="dash-card dash-card-hover p-4 sm:p-5">
              <div className="dash-overline mb-2 flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5" /> {stat.label}
              </div>
              <div className="dash-figure text-lg">{stat.value}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DirectionPanel title="Short Analysis" stats={metrics?.shortStats ?? {
          direction: "sell",
          trades: 0,
          wins: 0,
          losses: 0,
          winRate: 0,
          grossProfit: 0,
          grossLoss: 0,
          netPnl: 0,
          averageWin: 0,
          averageLoss: 0,
          volume: 0,
        }} />

        <div className="dash-card flex flex-col">
          <div className="border-b border-[var(--dash-hairline)] px-4 py-3.5 sm:px-5">
            <h4 className="text-[15px] font-semibold tracking-tight text-ink">Profitability</h4>
          </div>
          <div className="flex min-h-[180px] flex-1 flex-col items-center justify-center border-b border-[var(--dash-hairline)] p-6 text-center">
            {hasProfitabilityData ? (
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={profitabilityData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={68} stroke="#fff" strokeWidth={2}>
                    {profitabilityData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <>
                <PieChartIcon className="mb-3 h-6 w-6 text-ink-300" />
                <div className="text-sm text-ink-500">Start trading to see analysis</div>
              </>
            )}
          </div>
          <div className="grid grid-cols-3 divide-x divide-[var(--dash-hairline)] p-4 text-center">
            <div>
              <div className="dash-overline mb-1">Wins</div>
              <div className="dash-num text-[14px] font-semibold text-ink">{metrics?.wins || 0}</div>
            </div>
            <div>
              <div className="dash-overline mb-1">Win Rate</div>
              <div className="dash-num text-[14px] font-semibold text-ink">{formatPct(metrics?.winRate)}</div>
            </div>
            <div>
              <div className="dash-overline mb-1">Losses</div>
              <div className="dash-num text-[14px] font-semibold text-ink">{metrics?.losses || 0}</div>
            </div>
          </div>
        </div>

        <DirectionPanel title="Long Analysis" stats={metrics?.longStats ?? {
          direction: "buy",
          trades: 0,
          wins: 0,
          losses: 0,
          winRate: 0,
          grossProfit: 0,
          grossLoss: 0,
          netPnl: 0,
          averageWin: 0,
          averageLoss: 0,
          volume: 0,
        }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="dash-card p-4 sm:p-5">
          <h4 className="mb-5 text-[15px] font-semibold tracking-tight text-ink">PnL Distribution by Duration</h4>
          {hasDurationData ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={durationData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid stroke="rgba(15, 23, 42, 0.06)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
                <YAxis axisLine={false} tickLine={false} width={70} tick={{ fontSize: 11, fill: "#94A3B8" }} tickFormatter={(value) => `$${Number(value).toLocaleString()}`} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="pnl" name="PnL" fill={COLORS.dark} radius={[3, 3, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
              <BarChart3 className="mb-3 h-6 w-6 text-ink-300" />
              <div className="mb-1 text-sm font-semibold text-ink">No trading data available</div>
              <div className="text-[13px] text-ink-500">Closed trades will populate this distribution.</div>
            </div>
          )}
        </div>

        <div className="dash-card p-4 sm:p-5">
          <h4 className="mb-5 text-[15px] font-semibold tracking-tight text-ink">Trade Count by Duration</h4>
          {hasDurationData ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={durationData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid stroke="rgba(15, 23, 42, 0.06)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#94A3B8" }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} width={40} tick={{ fontSize: 11, fill: "#94A3B8" }} />
                <Tooltip />
                <Bar dataKey="trades" name="Trades" fill={COLORS.accent} radius={[3, 3, 0, 0]} maxBarSize={32} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
              <Activity className="mb-3 h-6 w-6 text-ink-300" />
              <div className="mb-1 text-sm font-semibold text-ink">No duration data available</div>
              <div className="text-[13px] text-ink-500">Open and close trades to build this view.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
