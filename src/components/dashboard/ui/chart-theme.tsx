"use client";

/* ────────────────────────────────────────────────
   Unified Recharts theme — institutional minimal.
   Ink gridlines, no axis lines, 11px tick labels,
   mono-figure tooltips.
   ──────────────────────────────────────────────── */

export const CHART = {
  ink: "#0F172A",
  positive: "#059669",
  negative: "#E11D48",
  lime: "#CBFB45",
  grid: "rgba(15, 23, 42, 0.06)",
  tick: "#94A3B8",
  areaFrom: "rgba(5, 150, 105, 0.14)",
  areaTo: "rgba(5, 150, 105, 0)",
  inkAreaFrom: "rgba(15, 23, 42, 0.08)",
  inkAreaTo: "rgba(15, 23, 42, 0)",
} as const;

export const gridProps = {
  strokeDasharray: "3 3",
  stroke: CHART.grid,
  vertical: false,
} as const;

export const axisProps = {
  axisLine: false,
  tickLine: false,
  tick: { fontSize: 11, fill: CHART.tick },
  tickMargin: 8,
} as const;

export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number | string; color?: string }>;
  label?: string | number;
  formatter?: (value: number | string) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="dash-tooltip">
      {label !== undefined && label !== "" ? (
        <p className="mb-1 text-[11px] font-medium text-ink-400">{label}</p>
      ) : null}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          {entry.name ? (
            <span className="text-[12px] text-ink-500">{entry.name}</span>
          ) : null}
          <span className="dash-tooltip-value">
            {formatter && entry.value !== undefined
              ? formatter(entry.value)
              : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}
