"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { preload } from "react-dom";
import { cn } from "@/lib/utils";
import { Eyebrow } from "./ui";
import { TppMark } from "./logo";
import { findStat, prettyValue, useCatalogue, usePrograms, useStats } from "./data";
import { href } from "./routes";

/**
 * Split screen for the sign-in pages: the glass TPP wordmark plate on the left
 * (a banner on phones), the form on the right. The figures are the same live
 * stats the rest of the site shows.
 */
export function AuthShell({ eyebrow, lead, fade, lede, children }: { eyebrow: string; lead: string; fade?: string; lede: string; children: ReactNode }) {
  preload("/art/hero-mobile.webp", { as: "image", fetchPriority: "high" });
  const stats = useStats();
  const { maxSplit } = useCatalogue(usePrograms());
  const facts = [findStat(stats, "payouts"), findStat(stats, "countries"), maxSplit ? { value: `${maxSplit}%`, label: "Max. profit split" } : undefined].filter(
    (f): f is { value: string; label: string } => Boolean(f),
  );

  return (
    <div className="v2-scope min-h-screen bg-[#0e1110] text-white antialiased lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
      <aside className="relative isolate flex h-[300px] flex-col overflow-hidden p-6 sm:h-[360px] sm:p-8 lg:sticky lg:top-0 lg:h-screen lg:p-12">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/art/hero-mobile.webp" width={1080} height={1920} alt="" fetchPriority="high" decoding="async" className="absolute inset-0 -z-20 h-full w-full object-cover object-top" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(6,16,13,0.1)_0%,rgba(6,16,13,0)_30%,rgba(9,13,12,0.82)_70%,#0e1110_100%)]" />
        <div aria-hidden="true" className="g-grain" />

        <Link href={href("home")} aria-label="The People Prop — home" className="relative inline-flex w-fit text-white">
          <TppMark className="h-6" />
        </Link>

        <div className="relative mt-auto hidden max-w-md lg:block">
          <Eyebrow>{eyebrow}</Eyebrow>
          <p className="g-display mt-6 text-[clamp(2.4rem,3.4vw,3.5rem)]">
            <span className="g-shade-dark">{lead}</span>
            {fade ? <span className="text-[#6c7874]"> {fade}</span> : null}
          </p>
          <p className="mt-5 text-[16px] leading-relaxed text-white/65">{lede}</p>
          {facts.length ? (
            <div className={cn("mt-10 grid gap-2", facts.length === 3 ? "grid-cols-3" : "grid-cols-2")}>
              {facts.map((f) => (
                <div key={f.label} className="g-glass g-hair rounded-[20px] p-4">
                  <p className="g-num text-[22px] font-semibold tracking-[-0.03em] text-white">{prettyValue(f.value)}</p>
                  <p className="mt-1 text-[12px] leading-snug text-white/50">{f.label}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <p className="relative mt-10 hidden text-[12px] text-white/40 lg:block">© {new Date().getFullYear()} The People Prop</p>
      </aside>

      <main className="relative flex flex-col justify-center px-5 pt-10 pb-16 sm:px-10 lg:px-16 lg:py-16">
        <div className="mx-auto w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}

/* ───────────── form pieces shared by the sign-in pages ───────────── */

export const authLabel = "mb-2 block text-[13px] font-medium text-white/70";

export function authField(invalid: boolean) {
  return cn(
    "h-12 w-full rounded-[16px] bg-white/[0.05] text-[15px] text-white ring-1 outline-none transition-shadow placeholder:text-white/30 disabled:opacity-60",
    invalid ? "ring-red-400/60 focus:ring-2 focus:ring-red-400" : "ring-white/10 focus:ring-2 focus:ring-[var(--g-lime)]/70",
  );
}

export function AuthHeading({ lead, fade, lede }: { lead: string; fade: string; lede: string }) {
  return (
    <>
      <h1 className="g-display text-[clamp(2rem,4vw,2.6rem)]">
        <span className="g-shade-dark">{lead}</span> <span className="text-[#6c7874]">{fade}</span>
      </h1>
      <p className="mt-3 mb-6 text-[15px] text-white/55">{lede}</p>
    </>
  );
}

export function AuthNotices({ error, success }: { error: string | null; success: string | null }) {
  if (!error && !success) return null;
  return (
    <div className="mb-6 space-y-3">
      {error ? (
        <div role="alert" className="rounded-[14px] bg-red-500/10 px-4 py-3 text-[13.5px] text-red-200 ring-1 ring-red-400/25">
          {error}
        </div>
      ) : null}
      {success ? (
        <div role="status" className="rounded-[14px] bg-[var(--g-lime)]/10 px-4 py-3 text-[13.5px] text-[var(--g-lime-soft)] ring-1 ring-[var(--g-lime)]/25">
          {success}
        </div>
      ) : null}
    </div>
  );
}
