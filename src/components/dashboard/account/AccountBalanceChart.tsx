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
import { Panel, SectionTitle } from "../glass";

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
    <div className="g-glass-light g-hair g-hair-ink rounded-[16px] px-4 py-3">
      <p className="mb-2 text-[12px] font-semibold text-[var(--g-muted-ink)]">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 text-[13px]">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-[var(--g-muted-ink)]">{entry.name}</span>
          <span className="g-num font-semibold text-[var(--g-ink)]">{money.format(Number(entry.value || 0))}</span>
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
      <SectionTitle as="h3" title="Account Balance" className="items-center">
        <div className="flex items-center gap-2 rounded-full bg-white/65 px-4 py-2 text-[13px] font-medium text-[var(--g-muted-ink)] ring-1 ring-black/[0.08]">
          <CalendarDays className="w-4 h-4" />
          {rangeLabel}
        </div>
      </SectionTitle>

      <Panel className="p-4 sm:p-6 min-h-[400px]">
        {hasCurve ? (
          <ResponsiveContainer width="100%" height={340}>
            <ComposedChart data={chartData} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="account-equity-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1d6656" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="#1d6656" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(14,17,16,0.08)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="chartLabel"
                axisLine={false}
                tickLine={false}
                minTickGap={22}
                tick={{ fontSize: 12, fill: "#5d6764" }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                width={72}
                tick={{ fontSize: 12, fill: "#5d6764" }}
                tickFormatter={(value) => `$${Number(value).toLocaleString()}`}
                domain={["auto", "auto"]}
              />
              <Tooltip content={<CurveTooltip />} cursor={{ stroke: "rgba(14,17,16,0.15)" }} />
              <Area
                type="monotone"
                dataKey="equity"
                name="Equity"
                stroke="#0e1110"
                strokeWidth={2.5}
                fill="url(#account-equity-gradient)"
                dot={false}
                activeDot={{ r: 5, fill: "#0e1110", stroke: "#cbfb45", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="balance"
                name="Balance"
                stroke="#8fc21d"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex min-h-[340px] flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-black/[0.04] ring-1 ring-black/[0.06] flex items-center justify-center mb-4">
              <TrendingUp className="w-7 h-7 text-[var(--g-muted-ink)]" />
            </div>
            <h4 className="font-semibold text-[16px] text-[var(--g-ink)] mb-1">No balance data available</h4>
            <p className="text-[14px] text-[var(--g-muted-ink)]">Closed trades will appear here once the terminal records them.</p>
          </div>
        )}
      </Panel>
    </div>
  );
}
