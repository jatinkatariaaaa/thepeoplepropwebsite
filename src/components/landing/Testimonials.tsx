"use client";

import { useEffect, useState } from "react";
import { BadgeCheck, Globe2, Star, Wallet } from "lucide-react";
import { testimonialsExtended, type Testimonial } from "@/data/testimonials";

/* ═══════════════════════════════════════════════════════════════
   Testimonials — Dark Bento Grid (TPP V3 landing style)

   - Matches the landing page language: full-width rounded dark
     card (#0c0c0c) on cream, neon lime (#cbfb45) accents.
   - Testimonials shuffle randomly on every page load, so each
     visitor / refresh sees a different set.
   ═══════════════════════════════════════════════════════════════ */

const INK = "#0c0c0c";
const LIME = "#cbfb45";

/* Fisher–Yates shuffle (non-mutating) */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function Avatar({ t, onLime = false }: { t: Testimonial; onLime?: boolean }) {
  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[12px] font-bold tracking-wide ${
        onLime ? "bg-[#0c0c0c] text-[#cbfb45]" : "bg-[#cbfb45] text-[#0c0c0c]"
      }`}
      aria-hidden="true"
    >
      {t.initials}
    </div>
  );
}

function PersonRow({ t, onLime = false }: { t: Testimonial; onLime?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar t={t} onLime={onLime} />
      <div className="min-w-0">
        <p
          className={`flex items-center gap-1.5 truncate text-[14px] font-bold ${
            onLime ? "text-[#0c0c0c]" : "text-white"
          }`}
        >
          {t.name}
          <BadgeCheck
            className={`h-4 w-4 shrink-0 ${onLime ? "text-[#0c0c0c]" : "text-[#cbfb45]"}`}
            strokeWidth={2.25}
            aria-label="Verified trader"
          />
        </p>
        <p
          className={`truncate text-[12px] font-medium ${
            onLime ? "text-[#0c0c0c]/60" : "text-white/45"
          }`}
        >
          {t.handle} · {t.location}
        </p>
      </div>
    </div>
  );
}

/* ── Large hero card (2×2) ── */
function HeroCard({ t }: { t: Testimonial }) {
  return (
    <article className="flex flex-col justify-between gap-8 rounded-[1.25rem] border border-white/[0.08] bg-white/[0.03] p-7 transition-colors duration-300 hover:border-[#cbfb45]/30 sm:col-span-2 md:col-span-2 md:row-span-2 md:p-9">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-1" aria-label="5 star rating">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className="h-4 w-4 fill-[#cbfb45] text-[#cbfb45]"
              aria-hidden="true"
            />
          ))}
        </div>
        <blockquote className="text-pretty text-[18px] font-medium leading-[1.45] tracking-[-0.01em] text-white/90 md:text-[21px] lg:text-[23px]">
          &ldquo;{t.body}&rdquo;
        </blockquote>
      </div>
      <div className="flex flex-col gap-7">
        <p className="leading-none">
          <span className="text-[40px] font-bold tracking-[-0.04em] text-[#cbfb45] tabular-nums md:text-[52px]">
            {t.payout}
          </span>
          <span className="ml-3 text-[18px] font-semibold text-white/50 md:text-[22px]">
            paid
          </span>
        </p>
        <PersonRow t={t} />
      </div>
    </article>
  );
}

/* ── Charcoal review card ── */
function QuoteCard({ t, className = "" }: { t: Testimonial; className?: string }) {
  return (
    <article
      className={`flex flex-col justify-between gap-5 rounded-[1.25rem] border border-white/[0.08] bg-white/[0.03] p-6 transition-colors duration-300 hover:border-[#cbfb45]/30 ${className}`}
    >
      <blockquote className="text-pretty text-[13.5px] font-medium leading-relaxed text-white/70">
        &ldquo;{t.body}&rdquo;
      </blockquote>
      <PersonRow t={t} />
    </article>
  );
}

/* ── Lime inverted quote card ── */
function LimeQuoteCard({ t, className = "" }: { t: Testimonial; className?: string }) {
  return (
    <article
      className={`flex flex-col justify-between gap-5 rounded-[1.25rem] bg-[#cbfb45] p-6 ${className}`}
    >
      <blockquote className="text-pretty text-[14px] font-semibold leading-relaxed text-[#0c0c0c] md:text-[15px]">
        &ldquo;{t.body}&rdquo;
      </blockquote>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PersonRow t={t} onLime />
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0c0c0c] px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-[#cbfb45]">
          <BadgeCheck className="h-3.5 w-3.5" strokeWidth={2.5} />
          {t.payout} paid
        </span>
      </div>
    </article>
  );
}

/* ── Stat tile ── */
function StatTile({
  icon: Icon,
  value,
  label,
  lime = false,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
  lime?: boolean;
}) {
  return (
    <div
      className={`flex flex-col justify-between gap-6 rounded-[1.25rem] p-6 ${
        lime ? "bg-[#cbfb45]" : "border border-white/[0.08] bg-white/[0.03]"
      }`}
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-full ${
          lime ? "bg-[#0c0c0c]" : "bg-[#cbfb45]"
        }`}
      >
        <Icon
          className={`h-4 w-4 ${lime ? "text-[#cbfb45]" : "text-[#0c0c0c]"}`}
          strokeWidth={2.25}
          aria-hidden="true"
        />
      </div>
      <div>
        <p
          className={`text-[28px] font-bold leading-none tracking-[-0.04em] tabular-nums md:text-[32px] ${
            lime ? "text-[#0c0c0c]" : "text-white"
          }`}
        >
          {value}
        </p>
        <p
          className={`mt-1.5 text-[12px] font-medium ${
            lime ? "text-[#0c0c0c]/65" : "text-white/45"
          }`}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

export function Testimonials() {
  /* Deterministic order for SSR/first paint, shuffled after mount
     so every page load / visitor sees a different random set. */
  const [picks, setPicks] = useState<Testimonial[]>(() =>
    testimonialsExtended.slice(0, 5),
  );

  useEffect(() => {
    setPicks(shuffle(testimonialsExtended).slice(0, 5));
  }, []);

  const [hero, limeQuote, ...quotes] = picks;

  return (
    <section className="w-full pb-16 pt-8 lg:pb-24" aria-label="Trader Testimonials">
      <div className="px-[5px] py-[5px]">
        <div
          className="rounded-[2rem] px-[15px] py-20 lg:rounded-[3.5rem] lg:px-[35px] xl:py-28"
          style={{ backgroundColor: INK }}
        >
          <div className="mx-auto max-w-6xl">
            {/* Section Header */}
            <header className="mb-12 text-center md:mb-16">
              <div
                className="mb-4 text-sm font-medium uppercase tracking-[0.3em]"
                style={{ color: LIME }}
              >
                Trader Voices
              </div>
              <h2
                className="text-balance font-bold tracking-[-0.03em] text-white"
                style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)" }}
              >
                Real traders. <span style={{ color: LIME }}>Real payouts.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-md text-[15px] font-medium leading-relaxed text-white/50">
                Every review is from a verified TPP trader — backed by a real
                payout.
              </p>
            </header>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 md:gap-4">
              {/* Rows 1–2 left: hero (2×2) */}
              <HeroCard t={hero} />

              {/* Row 1 right: review + stat */}
              <QuoteCard t={quotes[0]} />
              <StatTile icon={Star} value="5★" label="TrustPilot rating" />

              {/* Row 2 right: lime stat + stat */}
              <StatTile icon={Globe2} value="142+" label="Countries served" lime />
              <StatTile icon={Wallet} value="250+" label="Successful payouts" />

              {/* Row 3: lime quote (2 wide) + two reviews */}
              <LimeQuoteCard t={limeQuote} className="sm:col-span-2" />
              <QuoteCard t={quotes[1]} />
              <QuoteCard t={quotes[2]} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
