"use client";

import { CalendarDays, TrendingUp } from "lucide-react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { AccountMetrics } from "@/lib/account-metrics";

type TooltipEntry = {
  dataKey?: string | number;
  name?: string;
  value?: number | string;
  color?: string;
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

function formatDateLabel(value?: string) {
  if (!value) return "No activity";
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

function CurveTooltip({
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
      <p className="mb-2 text-[12px] font-bold text-[var(--ink-500)]">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-[13px]">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-[var(--ink-500)]">{entry.name}</span>
          <span className="font-bold text-[var(--ink-950)]">{money.format(Number(entry.value || 0))}</span>
        </div>
      ))}
    </div>
  );
}

export function AccountBalanceChart({ metrics }: { metrics?: AccountMetrics | null }) {
  const chartData = (metrics?.equityCurve ?? []).map((point, index) => ({
    ...point,
    chartLabel: point.label || (point.date ? formatDateLabel(point.date) : `Point ${index + 1}`),
  }));
  const hasCurve = chartData.length > 1;
  const firstDate = metrics?.dailyPnL?.[0]?.date;
  const lastDate = metrics?.dailyPnL?.[metrics.dailyPnL.length - 1]?.date;
  const rangeLabel = firstDate && lastDate
    ? `${formatDateLabel(firstDate)} - ${formatDateLabel(lastDate)}`
    : "Live account";

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-[16px] text-[var(--ink-950)]">Account Balance</h3>
        <div className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] bg-white rounded-xl text-[13px] font-medium text-[var(--ink-600)] shadow-sm">
          <CalendarDays className="w-4 h-4" />
          {rangeLabel}
        </div>
      </div>

      <div className="bg-white border border-[var(--border)] rounded-[24px] shadow-sm p-6 min-h-[400px]">
        {hasCurve ? (
          <ResponsiveContainer width="100%" height={340}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="account-equity-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0f172a" stopOpacity={0.14} />
                  <stop offset="100%" stopColor="#0f172a" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#eef2f7" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="chartLabel"
                axisLine={false}
                tickLine={false}
                minTickGap={22}
                tick={{ fontSize: 12, fill: "#6c6a68" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                width={72}
                tick={{ fontSize: 12, fill: "#6c6a68" }}
                tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
                domain={["auto", "auto"]}
              />
              <Tooltip content={<CurveTooltip />} />
              <Area
                type="monotone"
                dataKey="equity"
                name="Equity"
                stroke="#0f172a"
                strokeWidth={2.5}
                fill="url(#account-equity-gradient)"
                dot={false}
                activeDot={{ r: 5, fill: "#0f172a", stroke: "#fff", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="balance"
                name="Balance"
                stroke="#65a30d"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex min-h-[340px] flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--paper-2)] flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-[var(--ink-400)]" />
            </div>
            <h4 className="font-bold text-[16px] text-[var(--ink-950)] mb-1">No balance data available</h4>
            <p className="text-[14px] text-[var(--ink-500)]">Closed trades will appear here once the terminal records them.</p>
          </div>
        )}
      </div>
    </div>
  );
}
