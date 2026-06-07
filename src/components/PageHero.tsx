import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumb,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  breadcrumb?: { label: string; href: string }[];
  className?: string;
}) {
  return (
    <section
      className={cn(
        "relative pt-14 md:pt-20 pb-12 md:pb-16 border-b border-[var(--border)] overflow-hidden",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[400px] pointer-events-none"
        style={{
          background:
            "radial-gradient(700px 320px at 50% -10%, rgba(14,124,92,0.08), transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-grid bg-grid-fade opacity-50 pointer-events-none"
      />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        {breadcrumb && (
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-[12px] text-[var(--ink-400)] mb-6"
          >
            {breadcrumb.map((b, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <ChevronRight className="w-3 h-3" />}
                {i === breadcrumb.length - 1 ? (
                  <span className="text-[var(--ink-700)]">{b.label}</span>
                ) : (
                  <Link
                    href={b.href}
                    className="hover:text-[var(--ink-950)] transition-colors"
                  >
                    {b.label}
                  </Link>
                )}
              </span>
            ))}
          </nav>
        )}

        {eyebrow && (
          <div className="flex items-center gap-3 text-[11px] tracking-eyebrow text-[var(--accent-700)] mb-5">
            <span className="h-px w-8 bg-[var(--accent)]/40" />
            {eyebrow}
          </div>
        )}
        <h1 className="font-medium text-[clamp(2.4rem,6vw,4.75rem)] leading-[1] tracking-[-0.03em] text-[var(--ink-950)] max-w-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-6 text-base md:text-lg text-[var(--ink-500)] max-w-2xl leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}