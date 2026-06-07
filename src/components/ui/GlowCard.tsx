"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * GlowCard — premium light-theme card.
 * Default is white with hairline border + soft shadow that lifts on hover.
 * `featured` adds a subtle accent border and slightly stronger shadow.
 */
export function GlowCard({
  children,
  className,
  featured,
}: {
  children: React.ReactNode;
  className?: string;
  featured?: boolean;
}) {
  return (
    <div
      className={cn(
        "group relative rounded-2xl bg-white overflow-hidden transition-all duration-300",
        featured
          ? "border-2 border-[var(--ink-950)] shadow-[0_24px_60px_-20px_rgba(11,15,26,0.20)]"
          : "border border-[var(--border)] shadow-[0_1px_2px_rgba(11,15,26,0.04),0_8px_24px_-16px_rgba(11,15,26,0.08)] hover:border-[var(--border-strong)] hover:shadow-[0_18px_36px_-18px_rgba(11,15,26,0.15)]",
        className,
      )}
    >
      {featured && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 inset-x-0 h-1 bg-[var(--accent)]"
        />
      )}
      <div className="relative">{children}</div>
    </div>
  );
}