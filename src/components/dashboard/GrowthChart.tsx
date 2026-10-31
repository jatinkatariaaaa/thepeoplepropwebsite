"use client";

const data = [
  { m: "Jul", v: 2 },
  { m: "Aug", v: 5 },
  { m: "Sep", v: 4 },
  { m: "Oct", v: 8 },
  { m: "Nov", v: 11 },
  { m: "Dec", v: 9 },
  { m: "Jan", v: 14 },
  { m: "Feb", v: 17 },
  { m: "Mar", v: 21 },
  { m: "Apr", v: 28 },
  { m: "May", v: 34 },
  { m: "Jun", v: 38 },
];

export function GrowthChart() {
  const max = Math.max(...data.map((d) => d.v));

  return (
    <div className="surface-card rounded-2xl p-6 md:p-7">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-[var(--ink-500)] mb-1">
            Referral growth
          </div>
          <div className="font-display text-xl text-[var(--ink-950)]">Last 12 months</div>
        </div>
        <div className="text-right">
          <div className="font-display text-xl text-[var(--ink-950)] tabular-nums">+38</div>
          <div className="text-xs text-[var(--accent-700)] font-medium">+12% MoM</div>
        </div>
      </div>

      <div className="flex items-end gap-1.5 md:gap-2 h-40 md:h-48">
        {data.map((d, i) => {
          const h = (d.v / max) * 100;
          const isLatest = i === data.length - 1;
          return (
            <div key={d.m} className="group relative flex-1 flex flex-col items-center justify-end">
              <div
                className={`w-full rounded-t-md transition-all duration-500 ${
                  isLatest
                    ? "bg-gradient-to-t from-[var(--accent-700)] to-[var(--accent-600)]"
                    : "bg-[var(--paper-2)] border border-[var(--border)] hover:bg-[var(--accent-50)] hover:border-[var(--accent-200)]"
                }`}
                style={{ height: `${h}%` }}
                title={`${d.m}: ${d.v} referrals`}
              />
              {/* Tooltip */}
              <span className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--ink-950)] text-white text-[10px] px-2 py-1 rounded-md tabular-nums pointer-events-none">
                {d.v}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between">
        {data.map((d, i) => (
          <span
            key={d.m}
            className={`text-[10px] ${i % 2 === 0 ? "text-[var(--ink-600)]" : "text-[var(--ink-400)]"}`}
          >
            {d.m}
          </span>
        ))}
      </div>
    </div>
  );
}