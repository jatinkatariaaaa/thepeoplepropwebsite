import type { HTMLAttributes, ReactNode } from "react";
import Image from "next/image";
import { ChevronDown, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TppMark } from "@/components/v2/glass/logo";

/*
 * Building blocks for the trader dashboard: the light side of the glass system
 * in src/app/glass.css (frosted white glass, ink hairlines, a pearl canvas).
 * The dashboard layout wraps every page in .v2-scope plus the light overrides
 * in src/app/(dashboard)/dashboard.module.css. Nothing here uses hooks, so
 * server and client components can share these.
 *
 * glass.css sits outside Tailwind's cascade layers, so its rules beat utility
 * classes: resize a .g-btn with `!` utilities (see `btn.sm`), and keep .g-hair
 * (it sets position: relative) off fixed or absolute elements.
 */

/** The TPP wordmark on an ink tile, so its volt "P" keeps its contrast on light glass. */
export function LogoTile({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-[var(--g-ink)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_8px_18px_-10px_rgba(14,17,16,0.6)]",
        className,
      )}
    >
      <TppMark className="h-[15px]" />
    </span>
  );
}

/** Title block at the top of a dashboard page: shaded lead, muted fade, optional lede and actions. */
export function PageTitle({
  lead,
  fade,
  lede,
  children,
  className,
}: {
  lead: ReactNode;
  fade?: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-7 flex flex-col gap-5 sm:mb-8 md:flex-row md:items-end md:justify-between", className)}>
      <div className="min-w-0">
        <h1 className="g-title text-[clamp(1.9rem,3vw,2.5rem)]">
          <span className="g-shade-light">{lead}</span>
          {fade ? <span className="text-[#a3ada9]"> {fade}</span> : null}
        </h1>
        {lede ? <p className="mt-3 max-w-xl text-[14.5px] leading-relaxed text-pretty text-[var(--g-muted-ink)]">{lede}</p> : null}
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2.5">{children}</div> : null}
    </div>
  );
}

/** The dashboard's card surface: frosted white glass with an ink hairline. */
export function Panel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("g-glass-light g-hair g-hair-ink rounded-[28px]", className)} {...props} />;
}

/** Header row of a Panel, divided from its body by a hairline. */
export function PanelHead({
  title,
  sub,
  icon: Icon,
  as: Tag = "h2",
  children,
  className,
}: {
  title: ReactNode;
  sub?: ReactNode;
  icon?: LucideIcon;
  as?: "h2" | "h3" | "h4";
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-3 border-b border-black/[0.06] px-5 py-4 sm:px-6 sm:py-5", className)}>
      <div className="min-w-0">
        <Tag className="flex items-center gap-2 text-[16px] font-semibold tracking-[-0.02em] text-[var(--g-ink)]">
          {Icon ? <Icon className="h-4 w-4 shrink-0 text-[var(--g-emerald)]" strokeWidth={2} /> : null}
          {title}
        </Tag>
        {sub ? <p className="mt-1 text-[13px] leading-relaxed text-[var(--g-muted-ink)]">{sub}</p> : null}
      </div>
      {children}
    </div>
  );
}

/** Heading for a group of panels or form fields. */
export function SectionTitle({
  title,
  sub,
  as: Tag = "h2",
  children,
  className,
}: {
  title: ReactNode;
  sub?: ReactNode;
  as?: "h2" | "h3" | "h4";
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex flex-wrap items-end justify-between gap-3", className)}>
      <div className="min-w-0">
        <Tag className="text-[17px] font-semibold tracking-[-0.02em] text-[var(--g-ink)]">{title}</Tag>
        {sub ? <p className="mt-1 text-[13px] leading-relaxed text-[var(--g-muted-ink)]">{sub}</p> : null}
      </div>
      {children}
    </div>
  );
}

/** A single figure with its label. `highlight` puts it on the ink card with a volt figure. */
export function Stat({
  label,
  value,
  icon: Icon,
  highlight = false,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  icon?: LucideIcon;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("g-hair overflow-hidden rounded-[24px] p-5", highlight ? "g-card-dark" : "g-glass-light g-hair-ink", className)}>
      {highlight ? (
        <span aria-hidden="true" className="pointer-events-none absolute -top-20 -right-16 h-48 w-48 rounded-full bg-[radial-gradient(closest-side,rgba(203,251,69,0.2),transparent)]" />
      ) : null}
      <div className="relative flex items-start justify-between gap-3">
        <p className={cn("pt-1.5 text-[12.5px] font-medium", highlight ? "text-white/60" : "text-[var(--g-muted-ink)]")}>{label}</p>
        {Icon ? (
          <span
            className={cn(
              "grid h-8 w-8 shrink-0 place-items-center rounded-full",
              highlight ? "bg-[var(--g-lime)] text-[var(--g-ink)]" : "bg-[var(--g-emerald)]/10 text-[var(--g-emerald)] ring-1 ring-[var(--g-emerald)]/15",
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={2} />
          </span>
        ) : null}
      </div>
      <p className={cn("g-num relative mt-2 text-[26px] leading-tight font-semibold break-words", highlight ? "g-shade-lime" : "text-[var(--g-ink)]")}>{value}</p>
    </div>
  );
}

export type Tone = "lime" | "emerald" | "amber" | "red" | "neutral";

const TONE: Record<Tone, string> = {
  lime: "bg-[var(--g-lime)]/45 text-[#3b5410] ring-[#8fc21d]/40",
  emerald: "bg-[var(--g-emerald)]/10 text-[var(--g-emerald)] ring-[var(--g-emerald)]/20",
  amber: "bg-amber-400/15 text-amber-800 ring-amber-500/25",
  red: "bg-red-500/10 text-red-700 ring-red-500/20",
  neutral: "bg-black/[0.04] text-[var(--g-muted-ink)] ring-black/[0.07]",
};

/** Small status pill. */
export function Chip({ tone = "neutral", className, children }: { tone?: Tone; className?: string; children: ReactNode }) {
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold whitespace-nowrap ring-1", TONE[tone], className)}>{children}</span>;
}

/** Notice banner in the same tones as the chips. */
export function Notice({ tone = "neutral", icon: Icon, className, children }: { tone?: Tone; icon?: LucideIcon; className?: string; children: ReactNode }) {
  return (
    <div className={cn("flex gap-3 rounded-[18px] px-4 py-3.5 text-[13.5px] leading-relaxed ring-1", TONE[tone], className)}>
      {Icon ? <Icon className="mt-0.5 h-[18px] w-[18px] shrink-0" strokeWidth={2} /> : null}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

const METER = {
  lime: "bg-[linear-gradient(90deg,#cbfb45,#8fc21d)]",
  emerald: "bg-[var(--g-emerald)]",
  ink: "bg-[var(--g-ink)]/75",
  red: "bg-red-500",
};

/** Progress track. `value` is a percentage. */
export function Meter({ value, tone = "lime", className }: { value: number; tone?: keyof typeof METER; className?: string }) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-black/[0.06]", className)}>
      <div className={cn("h-full rounded-full transition-[width] duration-700 ease-out", METER[tone])} style={{ width: `${value}%` }} />
    </div>
  );
}

/** Path-traced prop from public/art, used as quiet decoration. */
export function Prop({ src, width, height, className }: { src: string; width: number; height: number; className?: string }) {
  return <Image src={src} width={width} height={height} alt="" aria-hidden="true" className={cn("pointer-events-none select-none", className)} />;
}

/** Centered message for empty lists and missing data. */
export function Empty({
  icon: Icon,
  visual,
  title,
  children,
  action,
  className,
}: {
  icon?: LucideIcon;
  visual?: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-12 text-center sm:py-14", className)}>
      {visual ??
        (Icon ? (
          <span className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-black/[0.04] text-[var(--g-muted-ink)] ring-1 ring-black/[0.06]">
            <Icon className="h-5 w-5" strokeWidth={1.8} />
          </span>
        ) : null)}
      <p className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--g-ink)]">{title}</p>
      {children ? <p className="mt-1.5 max-w-sm text-[13.5px] leading-relaxed text-[var(--g-muted-ink)]">{children}</p> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <span role="status" aria-label="Loading" className={cn("block h-8 w-8 animate-spin rounded-full border-2 border-black/10 border-t-[var(--g-emerald)]", className)} />;
}

/** Buttons on .g-btn (48px tall); `sm` resizes any of them for toolbars, cards and table rows. */
export const btn = {
  lime: "g-btn g-btn-lime cursor-pointer disabled:pointer-events-none disabled:opacity-40",
  ink: "g-btn cursor-pointer bg-[var(--g-ink)] text-white shadow-[0_14px_28px_-16px_rgba(14,17,16,0.7)] hover:bg-[#232927] disabled:pointer-events-none disabled:opacity-40",
  light: "g-btn cursor-pointer bg-white/70 text-[var(--g-ink)] ring-1 ring-black/10 backdrop-blur-md hover:bg-white disabled:pointer-events-none disabled:opacity-40",
  sm: "h-10! px-4! text-[13.5px]!",
};

/** Two-to-four way switch: a white pill on a frosted track. */
export const segment = {
  wrap: "inline-flex items-center gap-1 rounded-full bg-black/[0.045] p-1 ring-1 ring-black/[0.05]",
  item: (on: boolean) =>
    cn(
      "inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-1.5 text-[13px] font-semibold transition-all",
      on
        ? "bg-white text-[var(--g-ink)] shadow-[0_1px_2px_rgba(14,17,16,0.08),0_6px_16px_-8px_rgba(14,17,16,0.25)]"
        : "text-[var(--g-muted-ink)] hover:text-[var(--g-ink)]",
    ),
};

/** Table pieces: hairline rows that lift on hover. */
export const table = {
  scroll: "overflow-x-auto [scrollbar-width:thin]",
  headRow: "border-b border-black/[0.07]",
  th: "px-5 py-3.5 text-left text-[12px] font-medium whitespace-nowrap text-[var(--g-muted-ink)]",
  row: "border-b border-black/[0.05] transition-colors last:border-b-0 hover:bg-black/[0.02]",
  td: "px-5 py-4",
};

/** Form fields: the sign-in pages' field (12px tall rhythm, 16px radius, ring focus) on light glass. */
export const fieldLabel = "mb-2 block text-[13px] font-medium text-[var(--g-muted-ink)]";

export function field(invalid = false) {
  return cn(
    "h-12 w-full rounded-[16px] bg-white/70 px-4 text-[15px] text-[var(--g-ink)] ring-1 outline-none! transition-shadow placeholder:text-black/35 disabled:cursor-not-allowed disabled:opacity-60",
    invalid ? "ring-red-500/50 focus:ring-2 focus:ring-red-500/70" : "ring-black/10 focus:ring-2 focus:ring-[var(--g-emerald)]/70",
  );
}

/** Add to `field()` on a native <select>, next to a <SelectChevron />. */
export const selectField = "cursor-pointer appearance-none pr-11";

export function SelectChevron() {
  return <ChevronDown aria-hidden="true" className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-black/40" strokeWidth={2.2} />;
}
