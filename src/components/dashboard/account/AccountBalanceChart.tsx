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
    <div className="dash-tooltip">
      <p className="mb-1 text-[11px] font-medium text-ink-400">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-[12px]">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-ink-500">{entry.name}</span>
          <span className="dash-tooltip-value">{money.format(Number(entry.value || 0))}</span>
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
        <h3 className="text-[15px] font-semibold tracking-tight text-ink">Account Balance</h3>
        <div className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--dash-hairline)] bg-white px-3 text-xs font-medium text-ink-600">
          <CalendarDays className="w-4 h-4" />
          {rangeLabel}
        </div>
      </div>

      <div className="dash-card min-h-[400px] p-4 sm:p-6">
        {hasCurve ? (
          <ResponsiveContainer width="100%" height={340}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="account-equity-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#059669" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(15, 23, 42, 0.06)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="chartLabel"
                axisLine={false}
                tickLine={false}
                minTickGap={22}
                tick={{ fontSize: 11, fill: "#94A3B8" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                width={72}
                tick={{ fontSize: 11, fill: "#94A3B8" }}
                tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
                domain={["auto", "auto"]}
              />
              <Tooltip content={<CurveTooltip />} />
              <Area
                type="monotone"
                dataKey="equity"
                name="Equity"
                stroke="#0f172a"
                strokeWidth={1.5}
                fill="url(#account-equity-gradient)"
                dot={false}
                activeDot={{ r: 4, fill: "#0f172a", stroke: "#fff", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="balance"
                name="Balance"
                stroke="#94A3B8"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex min-h-[340px] flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-ink-200 bg-ink-50">
              <TrendingUp className="h-5 w-5 text-ink-400" />
            </div>
            <h4 className="mb-1 text-sm font-semibold text-ink">No balance data available</h4>
            <p className="text-[13px] text-ink-500">Closed trades will appear here once the terminal records them.</p>
          </div>
        )}
      </div>
    </div>
  );
}
