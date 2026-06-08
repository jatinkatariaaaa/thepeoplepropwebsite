import { Wallet, TrendingUp, Calendar, CalendarClock } from "lucide-react";

export function TopMetrics() {
  const metrics = [
    { label: "Account Size", value: "$100,000.00", icon: Wallet },
    { label: "Today's Profit", value: "$0.00", icon: TrendingUp },
    { label: "Start Date", value: "Oct 1, 2025", icon: Calendar },
    { label: "End Date", value: "Oct 31, 2025", icon: CalendarClock },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
      {metrics.map((m, i) => {
        const Icon = m.icon;
        return (
          <div key={i} className="bg-white rounded-2xl border border-[var(--border)] p-6 shadow-sm">
            <div className="flex items-center gap-2 text-[var(--ink-500)] mb-3">
              <Icon className="w-4 h-4" />
              <span className="text-[13px] font-medium">{m.label}</span>
            </div>
            <div className="text-[24px] font-display font-bold text-[var(--ink-950)]">
              {m.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
