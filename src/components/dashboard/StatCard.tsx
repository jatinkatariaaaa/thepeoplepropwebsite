"use client";

import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";
import { Counter } from "@/components/ui/Counter";
import { cn } from "@/lib/utils";

interface Props {
  icon: LucideIcon;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  delta?: { value: number; positive?: boolean };
  accent?: boolean;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  prefix,
  suffix,
  decimals,
  delta,
  accent,
}: Props) {
  return (
    <div
      className={cn(
        "surface-card rounded-2xl p-5 md:p-6 transition-all",
        accent
          ? "border-[var(--accent-200)] shadow-[0_24px_60px_-30px_rgba(14,124,92,0.45)]"
          : "hover:border-[var(--border-strong)]",
      )}
    >
      <div className="flex items-center justify-between mb-5">
        <div
          className={cn(
            "grid place-items-center w-9 h-9 rounded-lg",
            accent
              ? "bg-[var(--accent-50)] text-[var(--accent-700)]"
              : "bg-[var(--paper-2)] text-[var(--ink-700)]",
          )}
        >
          <Icon className="w-4 h-4" strokeWidth={2.2} />
        </div>
        {delta && (
          <div
            className={cn(
              "inline-flex items-center gap-1 text-xs font-medium",
              delta.positive ? "text-[var(--accent-700)]" : "text-red-600",
            )}
          >
            {delta.positive ? (
              <TrendingUp className="w-3 h-3" strokeWidth={2.2} />
            ) : (
              <TrendingDown className="w-3 h-3" strokeWidth={2.2} />
            )}
            {delta.value}%
          </div>
        )}
      </div>
      <div className="font-display text-3xl md:text-4xl text-[var(--ink-950)] tabular-nums">
        <Counter
          value={value}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals ?? 0}
        />
      </div>
      <div className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--ink-500)]">
        {label}
      </div>
    </div>
  );
}