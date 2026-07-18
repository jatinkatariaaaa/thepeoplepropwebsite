"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownToLine, BadgeCheck, Star, Wallet } from "lucide-react";
import DottedMap from "dotted-map";
import { testimonialsExtended, type Testimonial } from "@/data/testimonials";

/* ═══════════════════════════════════════════════════════════════
   Testimonials — Advanced Dark Bento Grid (TPP V3 landing style)

   - Full-width rounded dark card (#0c0c0c) on cream, neon lime
     (#cbfb45) accents — matches the landing page language.
   - Dotted world map with pulsing trader pins (142+ countries).
   - Live payout ticker cycling through verified payouts.
   - Testimonials shuffle randomly on every page load.
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

/* ───────────────────────── World map (dotted) ───────────────────────── */

const TRADER_PINS: { lat: number; lng: number }[] = [
  { lat: 6.5, lng: 3.4 }, // Lagos
  { lat: 40.4, lng: -3.7 }, // Madrid
  { lat: 37.5, lng: 127.0 }, // Seoul
  { lat: 19.1, lng: 72.9 }, // Mumbai
  { lat: 25.2, lng: 55.3 }, // Dubai
  { lat: -23.5, lng: -46.6 }, // São Paulo
  { lat: 43.7, lng: -79.4 }, // Toronto
  { lat: 51.5, lng: -0.1 }, // London
  { lat: 35.7, lng: 139.7 }, // Tokyo
  { lat: 1.35, lng: 103.8 }, // Singapore
];

function useWorldMap() {
  return useMemo(() => {
    const map = new DottedMap({ height: 60, grid: "diagonal" });

    const pinPercents = TRADER_PINS.map((p) => {
      const pin = map.addPin({
        lat: p.lat,
        lng: p.lng,
        svgOptions: { color: LIME, radius: 0.55 },
      });
      return pin as { x: number; y: number };
    });

    const svg = map.getSVG({
      radius: 0.32,
      color: "rgba(255,255,255,0.22)",
      shape: "circle",
      backgroundColor: "transparent",
    });

    /* Parse viewBox to convert pin coords → percentages for overlays */
    const vb = svg.match(/viewBox="([\d.\s-]+)"/)?.[1]?.split(" ").map(Number);
    const vw = vb?.[2] ?? 100;
    const vh = vb?.[3] ?? 60;
    const pins = pinPercents.map((p) => ({
      left: (p.x / vw) * 100,
      top: (p.y / vh) * 100,
    }));

    return { svg, pins };
  }, []);
}

function MapCard() {
  const { svg, pins } = useWorldMap();

  return (
    <article className="relative flex flex-col justify-between overflow-hidden rounded-[1.25rem] border border-white/[0.08] bg-white/[0.03] p-6 transition-colors duration-300 hover:border-[#cbfb45]/30 sm:col-span-2 md:col-span-2 md:row-span-2 md:p-7">
      {/* Map */}
      <div className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-[46%] px-2 opacity-90">
        <div
          className="w-full [&>svg]:h-auto [&>svg]:w-full"
          dangerouslySetInnerHTML={{ __html: svg }}
          aria-hidden="true"
        />
        {/* Pulsing pins */}
        {pins.map((p, i) => (
          <span
            key={i}
            className="absolute block h-3 w-3"
            style={{ left: `${p.left}%`, top: `${p.top}%`, transform: "translate(-50%, -50%)" }}
          >
            <span
              className="absolute inset-0 animate-ping rounded-full opacity-60"
              style={{ backgroundColor: LIME, animationDuration: `${2 + (i % 3)}s` }}
            />
          </span>
        ))}
      </div>

      {/* Top copy */}
      <div className="relative">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wide"
          style={{ backgroundColor: LIME, color: INK }}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0c0c0c] opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#0c0c0c]" />
          </span>
          Traders live now
        </span>
      </div>

      {/* Bottom copy */}
      <div className="relative mt-40 sm:mt-48 md:mt-0">
        <p className="text-[36px] font-bold leading-none tracking-[-0.04em] text-white tabular-nums md:text-[44px]">
          142<span style={{ color: LIME }}>+</span>
        </p>
        <p className="mt-2 max-w-[16rem] text-[13px] font-medium leading-relaxed text-white/50">
          countries with funded TPP traders — payouts delivered worldwide.
        </p>
      </div>
    </article>
  );
}

/* ───────────────────────── Live payout ticker ───────────────────────── */

function PayoutTicker({ items }: { items: Testimonial[] }) {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % items.length), 2600);
    return () => clearInterval(id);
  }, [items.length]);

  const t = items[idx];

  return (
    <article className="flex flex-col justify-between gap-6 overflow-hidden rounded-[1.25rem] border border-[#cbfb45]/25 bg-[#cbfb45]/[0.06] p-6 sm:col-span-2">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: LIME }}>
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70" style={{ backgroundColor: LIME }} />
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: LIME }} />
          </span>
          Live payouts
        </span>
        <ArrowDownToLine className="h-4 w-4 text-white/30" strokeWidth={2.25} aria-hidden="true" />
      </div>

      <div className="relative h-14">
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="absolute inset-0 flex items-center gap-4"
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[12px] font-bold"
              style={{ backgroundColor: LIME, color: INK }}
              aria-hidden="true"
            >
              {t.initials}
            </div>
            <div className="min-w-0">
              <p className="flex items-center gap-2 truncate text-[15px] font-bold text-white">
                {t.name}
                <span className="text-[20px] font-bold tracking-[-0.03em] tabular-nums" style={{ color: LIME }}>
                  {t.payout}
                </span>
              </p>
              <p className="truncate text-[12px] font-medium text-white/45">
                Payout confirmed · {t.location}
              </p>
            </div>
            <BadgeCheck className="ml-auto h-5 w-5 shrink-0" style={{ color: LIME }} strokeWidth={2.25} aria-label="Verified payout" />
          </motion.div>
        </AnimatePresence>
      </div>
    </article>
  );
}

/* ───────────────────────── Shared bits ───────────────────────── */

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
    <article
      className="relative flex flex-col justify-between gap-8 overflow-hidden rounded-[1.25rem] border border-white/[0.08] bg-white/[0.03] p-7 transition-colors duration-300 hover:border-[#cbfb45]/30 sm:col-span-2 md:col-span-2 md:row-span-2 md:p-9"
    >
      {/* Lime glow accent */}
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full opacity-[0.07] blur-3xl"
        style={{ backgroundColor: LIME }}
        aria-hidden="true"
      />
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-1" aria-label="5 star rating">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-4 w-4 fill-[#cbfb45] text-[#cbfb45]" aria-hidden="true" />
          ))}
        </div>
        <blockquote className="text-pretty text-[18px] font-medium leading-[1.45] tracking-[-0.01em] text-white/90 md:text-[21px] lg:text-[23px]">
          &ldquo;{t.body}&rdquo;
        </blockquote>
      </div>
      <div className="flex flex-col gap-7">
        <p className="leading-none">
          <span className="text-[40px] font-bold tracking-[-0.04em] tabular-nums md:text-[52px]" style={{ color: LIME }}>
            {t.payout}
          </span>
          <span className="ml-3 text-[18px] font-semibold text-white/50 md:text-[22px]">paid</span>
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
    <article className={`flex flex-col justify-between gap-5 rounded-[1.25rem] bg-[#cbfb45] p-6 ${className}`}>
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
      <div className={`flex h-9 w-9 items-center justify-center rounded-full ${lime ? "bg-[#0c0c0c]" : "bg-[#cbfb45]"}`}>
        <Icon className={`h-4 w-4 ${lime ? "text-[#cbfb45]" : "text-[#0c0c0c]"}`} strokeWidth={2.25} aria-hidden="true" />
      </div>
      <div>
        <p
          className={`text-[28px] font-bold leading-none tracking-[-0.04em] tabular-nums md:text-[32px] ${
            lime ? "text-[#0c0c0c]" : "text-white"
          }`}
        >
          {value}
        </p>
        <p className={`mt-1.5 text-[12px] font-medium ${lime ? "text-[#0c0c0c]/65" : "text-white/45"}`}>{label}</p>
      </div>
    </div>
  );
}

/* ───────────────────────── Section ───────────────────────── */

export function Testimonials() {
  /* Deterministic order for SSR/first paint, shuffled after mount
     so every page load / visitor sees a different random set. */
  const [picks, setPicks] = useState<Testimonial[]>(() => testimonialsExtended.slice(0, 12));

  useEffect(() => {
    setPicks(shuffle(testimonialsExtended).slice(0, 12));
  }, []);

  const [hero, limeQuote, q1, q2, q3, ...tickerPool] = picks;

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
              <div className="mb-4 text-sm font-medium uppercase tracking-[0.3em]" style={{ color: LIME }}>
                Trader Voices
              </div>
              <h2
                className="text-balance font-bold tracking-[-0.03em] text-white"
                style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)" }}
              >
                Real traders. <span style={{ color: LIME }}>Real payouts.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-md text-[15px] font-medium leading-relaxed text-white/50">
                Every review is from a verified TPP trader — backed by a real payout.
              </p>
            </header>

            {/* Mobile: featured quote + proof metrics + horizontal snap rail */}
            <div className="flex flex-col gap-3 sm:hidden">
              {/* Featured quote */}
              <HeroCard t={hero} />

              {/* Compact proof metrics */}
              <div className="grid grid-cols-2 gap-3">
                <StatTile icon={Star} value="5★" label="TrustPilot rating" />
                <StatTile icon={Wallet} value="250+" label="Successful payouts" lime />
              </div>

              {/* Horizontal snap rail — supporting reviews */}
              <div
                className="-mx-[15px] flex snap-x snap-mandatory gap-3 overflow-x-auto px-[15px] pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                role="group"
                aria-label="More trader reviews"
              >
                <QuoteCard t={q1} className="w-[82vw] max-w-[340px] shrink-0 snap-center" />
                <LimeQuoteCard t={limeQuote} className="w-[82vw] max-w-[340px] shrink-0 snap-center" />
                <QuoteCard t={q2} className="w-[82vw] max-w-[340px] shrink-0 snap-center" />
              </div>

              {/* Live payout proof */}
              <PayoutTicker items={[q3, ...tickerPool]} />

              {/* Global reach */}
              <MapCard />
            </div>

            {/* Bento Grid (tablet / desktop) */}
            <div className="hidden gap-3 sm:grid sm:grid-cols-2 md:grid-cols-4 md:gap-4">
              {/* Rows 1–2: hero (2×2) + world map (2×2) */}
              <HeroCard t={hero} />
              <MapCard />

              {/* Row 3: review + lime quote (2 wide) + review */}
              <QuoteCard t={q1} />
              <LimeQuoteCard t={limeQuote} className="sm:col-span-2" />
              <QuoteCard t={q2} />

              {/* Row 4: stats + live payout ticker (2 wide) */}
              <StatTile icon={Star} value="5★" label="TrustPilot rating" />
              <StatTile icon={Wallet} value="250+" label="Successful payouts" lime />
              <PayoutTicker items={[q3, ...tickerPool]} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
