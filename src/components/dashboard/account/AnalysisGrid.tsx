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
import { Panel } from "../glass";

type TooltipEntry = {
  dataKey?: string | number;
  name?: string;
  value?: number | string;
};

const COLORS = {
  win: "#1d6656",
  loss: "#dc2626",
  flat: "#b9c2bf",
  dark: "#0e1110",
  accent: "#8fc21d",
};

/* Recharts' built-in tooltip, dressed as light glass to match ChartTooltip. */
const glassTooltip = {
  contentStyle: {
    background: "rgba(255,255,255,0.82)",
    border: "none",
    borderRadius: 16,
    boxShadow: "inset 0 0 0 1px rgba(14,17,16,0.08), 0 24px 48px -28px rgba(16,40,34,0.35)",
    backdropFilter: "blur(20px)",
    padding: "10px 14px",
  },
  labelStyle: { color: "#5d6764", fontSize: 12, fontWeight: 600, marginBottom: 4 },
  itemStyle: { color: "#0e1110", fontSize: 13, fontWeight: 600 },
  cursor: { fill: "rgba(14,17,16,0.04)" },
};

const axisTick = { fontSize: 12, fill: "#5d6764" };
const gridStroke = "rgba(14,17,16,0.08)";

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
    <div className="g-glass-light g-hair g-hair-ink rounded-[16px] px-4 py-3">
      <p className="mb-1 text-[12px] font-semibold text-[var(--g-muted-ink)]">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey || entry.name} className="g-num text-[13px] font-semibold text-[var(--g-ink)]">
          {entry.name}: {typeof entry.value === "number" ? formatMoney(entry.value) : entry.value}
        </p>
      ))}
    </div>
  );
}

function DirectionPanel({ title, stats }: { title: string; stats: DirectionStats }) {
  const isPositive = stats.netPnl >= 0;

  return (
    <Panel className="flex flex-col">
      <div className="p-5 border-b border-black/[0.06]">
        <h4 className="font-semibold text-[15px] text-[var(--g-ink)]">{title}</h4>
      </div>
      <div className="p-6 flex-1 flex flex-col items-center justify-center text-center border-b border-black/[0.06] min-h-[190px]">
        <div className={cn("g-num text-[30px] font-semibold mb-1", isPositive ? "text-[var(--g-emerald)]" : "text-red-600")}>
          {formatSignedMoney(stats.netPnl)}
        </div>
        <div className="text-[13px] text-[var(--g-muted-ink)]">
          {stats.trades} trades / {stats.volume.toLocaleString()} lots
        </div>
      </div>
      <div className="grid grid-cols-3 p-4 text-center divide-x divide-black/[0.06]">
        <div className="min-w-0 px-1">
          <div className="text-[11px] font-semibold text-[var(--g-muted-ink)] mb-1">Wins ({stats.wins})</div>
          <div className="g-num text-[14px] font-semibold text-[var(--g-ink)] break-words">{formatMoney(stats.grossProfit)}</div>
        </div>
        <div className="min-w-0 px-1">
          <div className="text-[11px] font-semibold text-[var(--g-muted-ink)] mb-1">Win Rate</div>
          <div className="g-num text-[14px] font-semibold text-[var(--g-ink)] break-words">{formatPct(stats.winRate)}</div>
        </div>
        <div className="min-w-0 px-1">
          <div className="text-[11px] font-semibold text-[var(--g-muted-ink)] mb-1">Losses ({stats.losses})</div>
          <div className="g-num text-[14px] font-semibold text-[var(--g-ink)] break-words">{formatMoney(stats.grossLoss)}</div>
        </div>
      </div>
    </Panel>
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
            <Panel key={stat.label} className="rounded-[22px] p-4 sm:p-5">
              <div className="flex items-center gap-2 text-[13px] font-medium text-[var(--g-muted-ink)] mb-2">
                <Icon className="w-4 h-4 shrink-0 text-[var(--g-emerald)]" /> {stat.label}
              </div>
              <div className="g-num text-[20px] font-semibold text-[var(--g-ink)] break-words">{stat.value}</div>
            </Panel>
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
            <Panel key={stat.label} className="rounded-[22px] p-4 sm:p-5">
              <div className="flex items-center gap-2 text-[12px] font-medium text-[var(--g-muted-ink)] mb-2">
                <Icon className="w-3.5 h-3.5 shrink-0 text-[var(--g-emerald)]" /> {stat.label}
              </div>
              <div className="g-num text-[18px] font-semibold text-[var(--g-ink)] break-words">{stat.value}</div>
            </Panel>
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

        <Panel className="flex flex-col">
          <div className="p-5 border-b border-black/[0.06]">
            <h4 className="font-semibold text-[15px] text-[var(--g-ink)]">Profitability</h4>
          </div>
          <div className="p-6 flex-1 flex flex-col items-center justify-center text-center border-b border-black/[0.06] min-h-[190px]">
            {hasProfitabilityData ? (
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={profitabilityData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={68} stroke="#fff" strokeWidth={2}>
                    {profitabilityData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip {...glassTooltip} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <>
                <PieChartIcon className="w-8 h-8 text-black/30 mb-3" />
                <div className="text-[14px] font-medium text-[var(--g-muted-ink)]">Start trading to see analysis</div>
              </>
            )}
          </div>
          <div className="grid grid-cols-3 p-4 text-center divide-x divide-black/[0.06]">
            <div>
              <div className="text-[11px] font-semibold text-[var(--g-muted-ink)] mb-1">Wins</div>
              <div className="g-num text-[14px] font-semibold text-[var(--g-ink)]">{metrics?.wins || 0}</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-[var(--g-muted-ink)] mb-1">Win Rate</div>
              <div className="g-num text-[14px] font-semibold text-[var(--g-ink)]">{formatPct(metrics?.winRate)}</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-[var(--g-muted-ink)] mb-1">Losses</div>
              <div className="g-num text-[14px] font-semibold text-[var(--g-ink)]">{metrics?.losses || 0}</div>
            </div>
          </div>
        </Panel>

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
        <Panel className="p-5 sm:p-6">
          <h4 className="font-semibold text-[15px] text-[var(--g-ink)] mb-6">PnL Distribution by Duration</h4>
          {hasDurationData ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={durationData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={axisTick} />
                <YAxis axisLine={false} tickLine={false} width={70} tick={axisTick} tickFormatter={(value) => `$${Number(value).toLocaleString()}`} />
                <Tooltip content={<ChartTooltip />} cursor={glassTooltip.cursor} />
                <Bar dataKey="pnl" name="PnL" fill={COLORS.dark} radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
              <BarChart3 className="w-8 h-8 text-black/30 mb-3" />
              <div className="text-[14px] font-semibold text-[var(--g-ink)] mb-1">No trading data available</div>
              <div className="text-[13px] text-[var(--g-muted-ink)]">Closed trades will populate this distribution.</div>
            </div>
          )}
        </Panel>

        <Panel className="p-5 sm:p-6">
          <h4 className="font-semibold text-[15px] text-[var(--g-ink)] mb-6">Trade Count by Duration</h4>
          {hasDurationData ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={durationData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={axisTick} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} width={40} tick={axisTick} />
                <Tooltip {...glassTooltip} />
                <Bar dataKey="trades" name="Trades" fill={COLORS.accent} radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[200px] text-center">
              <Activity className="w-8 h-8 text-black/30 mb-3" />
              <div className="text-[14px] font-semibold text-[var(--g-ink)] mb-1">No duration data available</div>
              <div className="text-[13px] text-[var(--g-muted-ink)]">Open and close trades to build this view.</div>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
