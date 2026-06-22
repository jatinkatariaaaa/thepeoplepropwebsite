"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const BRAND_COLORS = {
  lime: "#cbfb45",
  dark: "#0c0c0c",
  muted: "#6c6a68",
  border: "#E2E8F0",
  success: "#059669",
  danger: "#DC2626",
  warning: "#D97706",
  violet: "#7C3AED",
  sky: "#0284C7",
};

const PIE_COLORS = [
  BRAND_COLORS.dark,
  BRAND_COLORS.lime,
  BRAND_COLORS.success,
  BRAND_COLORS.violet,
  BRAND_COLORS.sky,
  BRAND_COLORS.warning,
];

interface ChartProps {
  data: any[];
  height?: number;
}

interface AreaChartProps extends ChartProps {
  dataKey: string;
  xKey?: string;
  color?: string;
  gradient?: boolean;
}

interface BarChartProps extends ChartProps {
  dataKey: string;
  xKey?: string;
  color?: string;
}

interface PieChartProps extends ChartProps {
  dataKey: string;
  nameKey: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[var(--border)] bg-white px-4 py-3 shadow-lg">
      <p className="mb-1 text-[12px] font-medium text-[var(--ink-400)]">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-[14px] font-bold text-[var(--ink-950)]">
          {typeof entry.value === "number" && entry.name?.toLowerCase().includes("revenue")
            ? `$${entry.value.toLocaleString()}`
            : entry.value?.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

export function AdminAreaChart({
  data,
  dataKey,
  xKey = "date",
  color = BRAND_COLORS.dark,
  gradient = true,
  height = 300,
}: AreaChartProps) {
  const gradientId = `gradient-${dataKey}`;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <defs>
          {gradient && (
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.2} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          )}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 12, fill: BRAND_COLORS.muted }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: BRAND_COLORS.muted }}
          axisLine={false}
          tickLine={false}
          width={50}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2.5}
          fill={gradient ? `url(#${gradientId})` : "transparent"}
          dot={false}
          activeDot={{ r: 5, fill: color, stroke: "#fff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function AdminBarChart({
  data,
  dataKey,
  xKey = "date",
  color = BRAND_COLORS.dark,
  height = 300,
}: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 12, fill: BRAND_COLORS.muted }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: BRAND_COLORS.muted }}
          axisLine={false}
          tickLine={false}
          width={50}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function AdminPieChart({
  data,
  dataKey,
  nameKey,
  height = 300,
}: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          outerRadius={100}
          innerRadius={60}
          strokeWidth={2}
          stroke="#fff"
        >
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
