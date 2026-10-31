"use client";

import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Challenge } from "@/data/challenges";
import { cn } from "@/lib/utils";

export function ChallengeCard({
  c,
  detailed = false,
}: {
  c: Challenge;
  detailed?: boolean;
}) {
  const rows: { label: string; value: string }[] = [
    { label: "Profit Target", value: `${c.profitTargetPct}%` },
    { label: "Daily Drawdown", value: `${c.dailyDrawdown}%` },
    { label: "Max Drawdown", value: `${c.maxDrawdown}%` },
    { label: "Profit Split", value: `${c.profitSplit}%` },
  ];
  if (detailed) {
    rows.push(
      { label: "Min. Trading Days", value: `${c.minTradingDays}` },
      { label: "Consistency Rule", value: c.consistencyRule },
    );
  }

  const featured = c.featured;

  return (
    <div
      className={cn(
        "relative rounded-2xl h-full overflow-hidden transition-all",
        featured
          ? "bg-[var(--ink-950)] text-white border border-[var(--ink-800)] shadow-[0_30px_80px_-30px_rgba(15,23,42,0.45)]"
          : "surface-card hover:border-[var(--border-strong)]",
      )}
    >
      {featured && (
        <div
          aria-hidden
          className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[rgba(37,99,235,0.15)] blur-3xl pointer-events-none"
        />
      )}
      <div className="relative p-7 md:p-8 flex flex-col h-full">
        <div className="flex items-start justify-between mb-6">
          <div>
            <p
              className={cn(
                "text-xs uppercase tracking-[0.2em] mb-3",
                featured ? "text-white/55" : "text-[var(--ink-500)]",
              )}
            >
              {c.tag ?? "Account"}
            </p>
            <div
              className={cn(
                "font-display text-4xl md:text-5xl tabular-nums tracking-tight",
                featured ? "text-white" : "text-[var(--ink-950)]",
              )}
            >
              {c.sizeLabel}
            </div>
          </div>
          {featured && <Badge variant="accent">★ Featured</Badge>}
        </div>

        <div className="flex items-baseline gap-2 mb-6">
          <span
            className={cn(
              "font-display text-2xl",
              featured ? "text-[var(--accent-400)]" : "text-[var(--ink-950)]",
            )}
          >
            {c.priceLabel}
          </span>
          <span
            className={cn(
              "text-xs",
              featured ? "text-white/50" : "text-[var(--ink-500)]",
            )}
          >
            one-time fee
          </span>
        </div>

        <div
          className={cn(
            "h-px mb-5",
            featured ? "bg-white/10" : "bg-[var(--border)]",
          )}
        />

        <ul className="space-y-3 flex-1">
          {rows.map((r) => (
            <li
              key={r.label}
              className="flex items-center justify-between text-sm"
            >
              <span
                className={featured ? "text-white/60" : "text-[var(--ink-600)]"}
              >
                {r.label}
              </span>
              <span
                className={cn(
                  "tabular-nums font-medium",
                  r.label === "Profit Split"
                    ? featured
                      ? "text-[var(--accent-400)]"
                      : "text-[var(--accent-700)]"
                    : featured
                      ? "text-white"
                      : "text-[var(--ink-950)]",
                )}
              >
                {r.value}
              </span>
            </li>
          ))}
        </ul>

        {!detailed && (
          <ul
            className={cn(
              "mt-5 space-y-2 text-xs",
              featured ? "text-white/60" : "text-[var(--ink-600)]",
            )}
          >
            {[
              "No time limit",
              "Bi-weekly payouts",
              "Refund on first payout",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <Check
                  className={cn(
                    "w-3.5 h-3.5",
                    featured ? "text-[var(--accent-400)]" : "text-[var(--accent-700)]",
                  )}
                  strokeWidth={2.5}
                />
                {f}
              </li>
            ))}
          </ul>
        )}

        <Button
          variant={featured ? "primary" : "outline"}
          size="md"
          href={`/challenges#${c.id}`}
          className="mt-7 w-full"
        >
          Select Challenge
          <ArrowRight className="w-4 h-4" strokeWidth={2.2} />
        </Button>
      </div>
    </div>
  );
}