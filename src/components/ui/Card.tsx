import * as React from "react";
import { cn } from "@/lib/utils";

type Tone = "default" | "quiet" | "ink" | "accent" | "mint";

const tones: Record<Tone, string> = {
  default:
    "bg-white border border-[var(--border)] shadow-[0_1px_2px_rgba(11,15,26,0.04),0_8px_24px_-16px_rgba(11,15,26,0.08)]",
  quiet:
    "bg-[var(--paper-2)] border border-[var(--border)]",
  ink:
    "bg-[var(--ink-950)] border border-[var(--ink-900)] text-white",
  accent:
    "bg-[var(--accent)] border border-[var(--accent-700)] text-white",
  mint:
    "bg-[#E9F5D3] border border-[#CDE39F]",
};

export function Card({
  className,
  children,
  tone = "default",
  as: Component = "div",
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  as?: React.ElementType;
  tone?: Tone;
}) {
  return (
    <Component
      className={cn(
        "relative rounded-2xl transition-all duration-300",
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardHeader({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("p-6 pb-3", className)}>{children}</div>;
}

export function CardBody({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("p-6 pt-3", className)}>{children}</div>;
}