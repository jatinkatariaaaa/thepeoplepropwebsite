import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

/* ────────────────────────────────────────────────
   Dashboard UI Primitives — Institutional Fintech
   Pure presentational building blocks shared by
   the trader dashboard and admin panel.
   ──────────────────────────────────────────────── */

export function PageHeader({
  title,
  description,
  actions,
  overline,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  overline?: string;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {overline ? <p className="dash-overline mb-1.5">{overline}</p> : null}
        <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl text-balance">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-ink-500 text-pretty">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}

export function Panel({
  title,
  description,
  actions,
  children,
  className = "",
  bodyClassName = "",
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={`dash-card ${className}`}>
      {title || actions ? (
        <header className="flex items-center justify-between gap-3 border-b border-[var(--dash-hairline)] px-4 py-3.5 sm:px-5">
          <div className="min-w-0">
            {title ? (
              <h2 className="text-[15px] font-semibold tracking-tight text-ink">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="mt-0.5 text-[13px] text-ink-500">{description}</p>
            ) : null}
          </div>
          {actions ? (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          ) : null}
        </header>
      ) : null}
      <div className={bodyClassName || "p-4 sm:p-5"}>{children}</div>
    </section>
  );
}

export function StatTile({
  label,
  value,
  delta,
  deltaDirection,
  hint,
  icon,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaDirection?: "up" | "down" | "flat";
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="dash-card dash-card-hover p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="dash-overline">{label}</p>
        {icon ? <span className="text-ink-400">{icon}</span> : null}
      </div>
      <p className="dash-figure mt-2 text-[22px] leading-tight sm:text-2xl">
        {value}
      </p>
      {delta || hint ? (
        <div className="mt-2 flex items-center gap-1.5">
          {delta ? (
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-medium tabular-nums ${
                deltaDirection === "up"
                  ? "text-[var(--dash-positive)]"
                  : deltaDirection === "down"
                    ? "text-[var(--dash-negative)]"
                    : "text-ink-500"
              }`}
            >
              {deltaDirection === "up" ? (
                <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              ) : deltaDirection === "down" ? (
                <ArrowDownRight className="h-3 w-3" aria-hidden="true" />
              ) : (
                <Minus className="h-3 w-3" aria-hidden="true" />
              )}
              {delta}
            </span>
          ) : null}
          {hint ? <span className="text-xs text-ink-400">{hint}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

export type StatusTone = "success" | "pending" | "danger" | "neutral" | "info";

const STATUS_STYLES: Record<StatusTone, { pill: string; dot: string }> = {
  success: {
    pill: "bg-success-50 text-success-700 border-[#A7F3D0]",
    dot: "bg-[#059669]",
  },
  pending: {
    pill: "bg-amber-50 text-amber-700 border-[#FDE68A]",
    dot: "bg-[#D97706]",
  },
  danger: {
    pill: "bg-rose-50 text-rose-700 border-[#FECDD3]",
    dot: "bg-[#E11D48]",
  },
  neutral: {
    pill: "bg-ink-50 text-ink-600 border-ink-200",
    dot: "bg-ink-400",
  },
  info: {
    pill: "bg-ink-50 text-ink-700 border-ink-200",
    dot: "bg-ink-700",
  },
};

export function StatusPill({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: StatusTone;
  children: ReactNode;
  className?: string;
}) {
  const s = STATUS_STYLES[tone];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${s.pill} ${className}`}
    >
      <span className={`status-dot ${s.dot}`} aria-hidden="true" />
      {children}
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      {icon ? (
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-ink-200 bg-ink-50 text-ink-400">
          {icon}
        </div>
      ) : null}
      <p className="text-sm font-semibold text-ink">{title}</p>
      {description ? (
        <p className="mt-1 max-w-sm text-[13px] text-ink-500 text-pretty">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`dash-skeleton ${className}`} aria-hidden="true" />;
}

export function MetricRow({
  label,
  value,
  valueClassName = "",
}: {
  label: string;
  value: ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-[13px] text-ink-500">{label}</span>
      <span className={`dash-num text-[13px] font-medium text-ink ${valueClassName}`}>
        {value}
      </span>
    </div>
  );
}
