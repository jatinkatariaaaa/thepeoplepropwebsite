import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-6xl px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

/** Small mono label used above section headings. */
export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-2.5 font-mono text-[11px] tracking-[0.22em] text-muted-foreground uppercase",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="h-1 w-1 rounded-full bg-primary shadow-[0_0_10px_2px_var(--primary)]"
      />
      {children}
    </p>
  );
}

export function SectionHeading({
  children,
  className,
  as: Tag = "h2",
}: {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <Tag
      className={cn(
        "v2-fadetext font-heading text-4xl leading-[1.05] text-balance sm:text-5xl",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function Lede({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "max-w-xl text-[15px] leading-relaxed text-muted-foreground text-pretty",
        className,
      )}
    >
      {children}
    </p>
  );
}

/** Primary CTA — solid light pill with a cool glow, like the reference. */
export function GlowButton({
  children,
  href,
  className,
}: {
  children: ReactNode;
  href: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-transform duration-300 hover:-translate-y-0.5",
        "shadow-[0_0_0_1px_rgba(255,255,255,0.14),0_10px_40px_-8px_color-mix(in_oklab,var(--primary)_75%,transparent)]",
        className,
      )}
    >
      {children}
    </a>
  );
}

/** Secondary CTA — hairline glass pill. */
export function GhostButton({
  children,
  href,
  className,
}: {
  children: ReactNode;
  href: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        "v2-glass inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-foreground/85 transition-colors duration-300 hover:text-foreground hover:[background:rgba(255,255,255,0.07)]",
        className,
      )}
    >
      {children}
    </a>
  );
}

/** Thin luminous divider that fades at both ends. */
export function HairRule({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "h-px w-full bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.12),transparent)]",
        className,
      )}
    />
  );
}
