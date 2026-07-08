"use client";

const tiers = [
  { name: "Bronze", target: 5, reward: "5% bonus", dot: "bg-[#B4923C]" },
  { name: "Silver", target: 25, reward: "10% bonus + swag", dot: "bg-[var(--accent-600)]" },
  { name: "Gold", target: 100, reward: "Funded $25K + 15%", dot: "bg-[var(--ink-950)]" },
];

export function TierProgress({ current = 38 }: { current?: number }) {
  const next = tiers.find((t) => t.target > current) ?? tiers[tiers.length - 1];
  const prev =
    [...tiers].reverse().find((t) => t.target <= current) ?? { target: 0 };
  const span = next.target - prev.target || 1;
  const within = current - prev.target;
  const pct = Math.min(100, Math.max(0, (within / span) * 100));
  const remaining = Math.max(0, next.target - current);

  return (
    <div className="surface-card rounded-2xl p-6 md:p-7">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-[var(--ink-500)] mb-1">
            Tier progress
          </div>
          <div className="font-display text-xl text-[var(--ink-950)]">
            {remaining} referrals to <span className="word-serif">{next.name}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-2xl text-[var(--ink-950)] tabular-nums">
            {current}
            <span className="text-[var(--ink-400)]">/{next.target}</span>
          </div>
        </div>
      </div>

      <div className="relative h-2 rounded-full bg-[var(--paper-2)] overflow-hidden border border-[var(--border)]">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-[var(--accent-600)] via-[var(--accent-700)] to-[#0B6149] transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {tiers.map((t) => {
          const reached = current >= t.target;
          return (
            <div
              key={t.name}
              className={`rounded-xl border p-3.5 ${
                reached
                  ? "border-[var(--accent-200)] bg-[var(--accent-50)]"
                  : "border-[var(--border)] bg-[var(--paper)]"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${t.dot}`} />
                <span className="text-xs text-[var(--ink-700)]">{t.name}</span>
              </div>
              <div className="font-display text-sm text-[var(--ink-950)] tabular-nums">
                {t.target} refs
              </div>
              <div className="text-[10px] text-[var(--ink-500)] mt-1 leading-snug">
                {t.reward}
              </div>
              {reached && (
                <div className="mt-2 inline-flex items-center text-[10px] text-[var(--accent-700)] uppercase tracking-wider font-medium">
                  ✓ Reached
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}