import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1312px] px-5 sm:px-8 lg:px-10", className)}>{children}</div>;
}

type Tone = "dark" | "light";

/** Full-bleed section. Dark sections are lit from above; light ones flow pearl → white. */
export function Section({
  id,
  tone = "dark",
  className,
  children,
  shell = true,
}: {
  id?: string;
  tone?: Tone;
  className?: string;
  children: ReactNode;
  shell?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn(
        "relative isolate scroll-mt-24 overflow-clip",
        tone === "dark" ? (shell ? "g-shell" : "g-shell-flat") : "g-light",
        className,
      )}
    >
      {children}
    </section>
  );
}

/** Small glass pill above a title, with an optional icon. */
export function Eyebrow({ children, icon: Icon, tone = "dark", className }: { children: ReactNode; icon?: LucideIcon; tone?: Tone; className?: string }) {
  return (
    <p
      className={cn(
        "g-pill g-hair",
        tone === "dark" ? "bg-white/[0.06] text-white/80" : "g-hair-ink bg-black/[0.035] text-black/70",
        className,
      )}
    >
      {Icon ? (
        <Icon className={cn("h-3.5 w-3.5", tone === "dark" ? "text-[var(--g-lime)]" : "text-[var(--g-emerald)]")} strokeWidth={2} />
      ) : (
        <span className={cn("h-1.5 w-1.5 rounded-full", tone === "dark" ? "bg-[var(--g-lime)]" : "bg-[var(--g-emerald)]")} />
      )}
      {children}
    </p>
  );
}

/** Gradient-shaded title. Pass `fade` for the part that falls into shadow. */
export function Title({
  as: Tag = "h2",
  tone = "dark",
  lead,
  fade,
  className,
}: {
  as?: "h1" | "h2" | "h3";
  tone?: Tone;
  lead: ReactNode;
  fade?: ReactNode;
  className?: string;
}) {
  return (
    <Tag className={cn("g-title", className)}>
      <span className={tone === "dark" ? "g-shade-dark" : "g-shade-light"}>{lead}</span>
      {fade ? (
        <>
          {" "}
          <span className={tone === "dark" ? "text-[#6c7874]" : "text-[#b9c2bf]"}>{fade}</span>
        </>
      ) : null}
    </Tag>
  );
}

export function Lede({ children, tone = "dark", className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <p className={cn("max-w-[34rem] text-[16.5px] leading-[1.6] text-pretty", tone === "dark" ? "text-white/60" : "text-[var(--g-muted-ink)]", className)}>
      {children}
    </p>
  );
}

function Anchor({ href, className, children }: { href: string; className: string; children: ReactNode }) {
  if (href.startsWith("#"))
    return (
      <a href={href} className={className}>
        {children}
      </a>
    );
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}

type BtnKind = "lime" | "glass";

export function Button({ href, kind = "lime", children, className, arrow = true }: { href: string; kind?: BtnKind; children: ReactNode; className?: string; arrow?: boolean }) {
  return (
    <Anchor href={href} className={cn("g-btn group", `g-btn-${kind}`, className)}>
      {children}
      {arrow ? <ArrowRight className="h-4 w-4 transition-transform duration-500 [transition-timing-function:var(--g-out)] group-hover:translate-x-0.5" strokeWidth={2.2} /> : null}
    </Anchor>
  );
}
