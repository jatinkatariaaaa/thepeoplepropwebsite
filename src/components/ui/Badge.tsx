import * as React from "react";
import { cn } from "@/lib/utils";

type Variant =
  | "default"
  | "accent"
  | "success"
  | "outline"
  | "ink"
  | "blue"
  | "warn"
  | "violet";

const variants: Record<Variant, string> = {
  default:
    "bg-[var(--ink-50)] text-[var(--ink-700)] border border-[var(--border)]",
  accent:
    "bg-[var(--accent-50)] text-[var(--accent-700)] border border-[rgba(37,99,235,0.18)]",
  success:
    "bg-[var(--success-50)] text-[var(--success-700)] border border-[rgba(5,150,105,0.22)]",
  outline:
    "bg-white text-[var(--ink-700)] border border-[var(--border-strong)]",
  ink:
    "bg-[var(--ink-950)] text-white border border-[var(--ink-900)]",
  blue:
    "bg-[var(--accent-100)] text-[var(--accent-700)] border border-[var(--accent-200)]",
  warn:
    "bg-[#FFFBEB] text-[var(--amber-700)] border border-[rgba(217,119,6,0.25)]",
  violet:
    "bg-[var(--violet-50)] text-[var(--violet-700)] border border-[rgba(124,58,237,0.20)]",
};

export function Badge({
  variant = "default",
  className,
  children,
}: {
  variant?: Variant;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium tracking-[0.04em]",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}