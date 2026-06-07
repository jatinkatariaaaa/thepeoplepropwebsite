"use client";

import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { UserProfile } from "@/lib/supabase";

const medal: Record<number, string> = {
  1: "bg-[var(--ink-950)] text-[#D8F26B]",
  2: "bg-[var(--accent-700)] text-white",
  3: "bg-[#B4923C] text-white",
};

export function Leaderboard({ profile }: { profile: UserProfile | null }) {
  const rows = [
    { rank: 1, name: "Aria Volkov", refs: 184, earnings: 4_320, country: "🇨🇿" },
    { rank: 2, name: "Diego Reyes", refs: 162, earnings: 3_810, country: "🇲🇽" },
    { rank: 3, name: "Lina Tsai", refs: 141, earnings: 3_295, country: "🇹🇼" },
    { rank: 4, name: "Omar Idris", refs: 124, earnings: 2_870, country: "🇦🇪" },
    { rank: 5, name: "Theo Bennett", refs: 109, earnings: 2_510, country: "🇬🇧" },
    { rank: 6, name: "Mei Watanabe", refs: 97, earnings: 2_245, country: "🇯🇵" },
    { rank: 7, name: "Sofía Carrasco", refs: 81, earnings: 1_890, country: "🇪🇸" },
    { 
      rank: 8, 
      name: profile?.display_name || "You", 
      refs: profile?.referrals_count ?? 0, 
      earnings: profile?.earnings ?? 0, 
      country: "🇳🇬", 
      you: true 
    },
    { rank: 9, name: "Hana Park", refs: 36, earnings: 820, country: "🇰🇷" },
    { rank: 10, name: "Yusuf Demir", refs: 29, earnings: 660, country: "🇹🇷" },
  ];

  return (
    <div className="surface-card rounded-2xl overflow-hidden">
      <div className="px-6 py-5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--paper)]">
        <div className="flex items-center gap-3">
          <div className="grid place-items-center w-9 h-9 rounded-lg bg-[var(--accent-50)] text-[var(--accent-700)]">
            <Trophy className="w-4 h-4" strokeWidth={2.2} />
          </div>
          <div>
            <h3 className="font-display text-lg text-[var(--ink-950)]">Top 10 referrers</h3>
            <p className="text-xs text-[var(--ink-500)] mt-0.5">
              Top 10 at launch receive a guaranteed funded $25K account
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex text-xs text-[var(--ink-500)] uppercase tracking-wider">
          This cycle
        </span>
      </div>

      <div className="divide-y divide-[var(--border)] bg-white">
        {rows.map((r) => (
          <div
            key={r.rank}
            className={cn(
              "px-6 py-3.5 flex items-center gap-4 transition-colors hover:bg-[var(--paper)]",
              r.you && "bg-[var(--accent-50)]",
            )}
          >
            <div
              className={cn(
                "w-7 h-7 rounded-full grid place-items-center text-xs font-display tabular-nums shrink-0",
                medal[r.rank]
                  ? medal[r.rank]
                  : "bg-[var(--paper-2)] text-[var(--ink-700)]",
              )}
            >
              {r.rank}
            </div>
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <span className="text-base">{r.country}</span>
              <span
                className={cn(
                  "text-sm truncate",
                  r.you ? "text-[var(--ink-950)] font-medium" : "text-[var(--ink-800)]",
                )}
              >
                {r.name}
              </span>
              {r.you && (
                <span className="text-[10px] uppercase tracking-wider text-[var(--accent-700)] border border-[var(--accent-200)] bg-white rounded-full px-2 py-0.5">
                  You
                </span>
              )}
            </div>
            <div className="text-right">
              <div className="text-sm text-[var(--ink-950)] tabular-nums">{r.refs}</div>
              <div className="text-[10px] text-[var(--ink-500)] uppercase tracking-wider">refs</div>
            </div>
            <div className="text-right hidden sm:block min-w-[80px]">
              <div className="text-sm text-[var(--accent-700)] tabular-nums font-medium">
                ${r.earnings.toLocaleString()}
              </div>
              <div className="text-[10px] text-[var(--ink-500)] uppercase tracking-wider">earned</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}