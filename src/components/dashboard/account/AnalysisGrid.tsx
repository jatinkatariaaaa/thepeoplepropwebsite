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
  loss: "#dc2626",
  flat: "#94a3b8",
  dark: "#0f172a",
  accent: "#65a30d",
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
    <div className="rounded-xl border border-[var(--border)] bg-white px-4 py-3 shadow-lg">
      <p className="mb-1 text-[12px] font-bold text-[var(--ink-500)]">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey || entry.name} className="text-[13px] font-bold text-[var(--ink-950)]">
          {entry.name}: {typeof entry.value === "number" ? formatMoney(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
}

function DirectionPanel({ title, stats }: { title: string; stats: DirectionStats }) {
  const isPositive = stats.netPnl >= 0;

  return (
    <div className="bg-white border border-[var(--border)] rounded-2xl shadow-sm flex flex-col">
      <div className="p-5 border-b border-[var(--border)]">
        <h4 className="font-bold text-[15px] text-[var(--ink-950)]">{title}</h4>
      </div>
      <div className="p-6 flex-1 flex flex-col items-center justify-center text-center border-b border-[var(--border)] min-h-[190px]">
        <div className={cn("text-[30px] font-display font-bold mb-1", isPositive ? "text-emerald-600" : "text-red-600")}>
          {formatSignedMoney(stats.netPnl)}
        </div>
        <div className="text-[13px] text-[var(--ink-500)]">
          {stats.trades} trades / {stats.volume.toLocaleString()} lots
        </div>
      </div>
      <div className="grid grid-cols-3 p-4 text-center divide-x divide-[var(--border)]">
        <div>
          <div className="text-[11px] font-bold text-[var(--ink-500)] mb-1">Wins ({stats.wins})</div>
          <div className="text-[14px] font-bold text-[var(--ink-950)]">{formatMoney(stats.grossProfit)}</div>
        </div>
        <div>
          <div className="text-[11px] font-bold text-[var(--ink-500)] mb-1">Win Rate</div>
          <div className="text-[14px] font-bold text-[var(--ink-950)]">{formatPct(stats.winRate)}</div>
        </div>
        <div>
          <div className="text-[11px] font-bold text-[var(--ink-500)] mb-1">Losses ({stats.losses})</div>
          <div className="text-[14px] font-bold text-[var(--ink-950)]">{formatMoney(stats.grossLoss)}</div>
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
            <div key={stat.label} className="bg-white border border-[var(--border)] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-[13px] font-medium text-[var(--ink-500)] mb-2">
                <Icon className="w-4 h-4" /> {stat.label}
              </div>
              <div className="text-[20px] font-display font-bold text-[var(--ink-950)]">{stat.value}</div>
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
            <div key={stat.label} className="bg-white border border-[var(--border)] rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-2 text-[12px] font-medium text-[var(--ink-500)] mb-2">
                <Icon className="w-3.5 h-3.5" /> {stat.label}
              </div>
              <div className="text-[18px] font-display font-bold text-[var(--ink-950)]">{stat.value}</div>
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

        <div className="bg-white border border-[var(--border)] rounded-2xl shadow-sm flex flex-col">
          <div className="p-5 border-b border-[var(--border)]">
            <h4 className="font-bold text-[15px] text-[var(--ink-950)]">Profitability</h4>
          </div>
          <div className="p-6 flex-1 flex flex-col items-center justify-center text-center border-b border-[var(--border)] min-h-[190px]">
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
                <PieChartIcon className="w-8 h-8 text-[var(--ink-400)] mb-3" />
                <div className="text-[14px] font-medium text-[var(--ink-600)]">Start trading to see analysis</div>
              </>
            )}
          </div>
          <div className="grid grid-cols-3 p-4 text-center divide-x divide-[var(--border)]">
            <div>
              <div className="text-[11px] font-bold text-[var(--ink-500)] mb-1">Wins</div>
              <div className="text-[14px] font-bold text-[var(--ink-950)]">{metrics?.wins || 0}</div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-[var(--ink-500)] mb-1">Win Rate</div>
              <div className="text-[14px] font-bold text-[var(--ink-950)]">{formatPct(metrics?.winRate)}</div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-[var(--ink-500)] mb-1">Losses</div>
              <div className="text-[14px] font-bold text-[var(--ink-950)]">{metrics?.losses || 0}</div>
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
        <div className="bg-white border border-[var(--border)] rounded-2xl shadow-sm p-6">
          <h4 className="font-bold text-[15px] text-[var(--ink-950)] mb-6">PnL Distribution by Duration</h4>
          {hasDurationData ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={durationData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid stroke="#eef2f7" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6c6a68" }} />
                <YAxis axisLine={false} tickLine={false} width={70} tick={{ fontSize: 12, fill: "#6c6a68" }} tickFormatter={(value) => `$${Number(value).toLocaleString()}`} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="pnl" name="PnL" fill={COLORS.dark} radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
              <BarChart3 className="w-8 h-8 text-[var(--ink-400)] mb-3" />
              <div className="text-[14px] font-bold text-[var(--ink-950)] mb-1">No trading data available</div>
              <div className="text-[13px] text-[var(--ink-500)]">Closed trades will populate this distribution.</div>
            </div>
          )}
        </div>

        <div className="bg-white border border-[var(--border)] rounded-2xl shadow-sm p-6">
          <h4 className="font-bold text-[15px] text-[var(--ink-950)] mb-6">Trade Count by Duration</h4>
          {hasDurationData ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={durationData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid stroke="#eef2f7" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#6c6a68" }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} width={40} tick={{ fontSize: 12, fill: "#6c6a68" }} />
                <Tooltip />
                <Bar dataKey="trades" name="Trades" fill={COLORS.accent} radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
              <Activity className="w-8 h-8 text-[var(--ink-400)] mb-3" />
              <div className="text-[14px] font-bold text-[var(--ink-950)] mb-1">No duration data available</div>
              <div className="text-[13px] text-[var(--ink-500)]">Open and close trades to build this view.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
