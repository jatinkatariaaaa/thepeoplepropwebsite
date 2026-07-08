"use client";

import { ArrowDownRight, UserPlus, Wallet, Trophy } from "lucide-react";

const events = [
  {
    icon: Wallet,
    title: "Payout cleared",
    detail: "$420.00 USDT — March cycle commission",
    when: "2 hrs ago",
    accent: true,
  },
  {
    icon: UserPlus,
    title: "New referral activated",
    detail: "@alex.fx purchased $25K Pro challenge",
    when: "11 hrs ago",
  },
  {
    icon: Trophy,
    title: "Tier promotion",
    detail: "Reached Silver — +10% commission unlocked",
    when: "Yesterday",
    accent: true,
  },
  {
    icon: UserPlus,
    title: "New referral activated",
    detail: "@kira.trades purchased $10K Core challenge",
    when: "2 days ago",
  },
  {
    icon: ArrowDownRight,
    title: "Refund processed",
    detail: "@harvey.k canceled within 24h window",
    when: "3 days ago",
  },
  {
    icon: UserPlus,
    title: "New referral activated",
    detail: "@nadia.live purchased $5K Starter challenge",
    when: "4 days ago",
  },
];

export function ActivityTimeline() {
  return (
    <div className="surface-card rounded-none p-6 md:p-7">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-lg text-[var(--ink-950)]">Recent activity</h3>
        <button className="text-xs text-[var(--ink-500)] hover:text-[var(--ink-950)] transition-colors">
          View all →
        </button>
      </div>

      <ul className="relative space-y-1">
        <span
          aria-hidden="true"
          className="absolute left-[15px] top-2 bottom-2 w-px bg-[var(--border)]"
        />
        {events.map((e, i) => (
          <li key={i} className="relative flex gap-4 py-3">
            <div
              className={`relative z-10 grid place-items-center w-8 h-8 rounded-full border shrink-0 ${
                e.accent
                  ? "bg-[var(--accent-50)] border-[var(--accent-200)] text-[var(--carbon-blue)]"
                  : "bg-white border-[var(--border)] text-[var(--ink-700)]"
              }`}
            >
              <e.icon className="w-3.5 h-3.5" strokeWidth={2.2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm text-[var(--ink-950)] font-medium">{e.title}</span>
                <span className="text-xs text-[var(--ink-500)] shrink-0">{e.when}</span>
              </div>
              <p className="text-xs text-[var(--ink-600)] mt-0.5">{e.detail}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}