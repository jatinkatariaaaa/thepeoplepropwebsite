"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star, TrendingUp } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

const STATS = [
  { value: "90%", suffix: "", label: "Profit split" },
  { value: "24", suffix: "h", label: "Payout processing" },
  { value: "$200", suffix: "K", label: "Max funded capital" },
  { value: "150", suffix: "+", label: "Countries served" },
];

/* ─────────────────────────────────────────────────────────────
   HeroV2 — Meridian-style hero adapted to the TPP theme.
   Full-bleed image card, floating trust pill, giant headline on
   dark tiles, pill CTA, overlapping stat cards row.
   ───────────────────────────────────────────────────────────── */
export function HeroV2() {
  return (
    <section className="relative px-[5px] pt-[5px]">
      {/* Image hero card */}
      <div className="relative overflow-hidden rounded-2xl">
        {/* Background image */}
        <div
          className="absolute inset-0 bg-[url('/images/v2/hero-city.png')] bg-cover bg-center"
          aria-hidden
        />
        {/* Soft vignette for legibility */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#0c0c0c]/55 via-transparent to-[#0c0c0c]/35"
          aria-hidden
        />

        <div className="relative z-10 flex min-h-[86svh] flex-col items-center justify-start px-4 pb-40 pt-24 md:pt-28 lg:min-h-[92svh]">
          {/* Floating trust pill */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="mb-8 inline-flex items-center gap-3 rounded-full bg-white/95 py-2 pl-2 pr-4 shadow-lg shadow-black/10 backdrop-blur"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0c0c0c]">
              <TrendingUp className="h-3.5 w-3.5 text-[#cbfb45]" strokeWidth={2.5} />
            </span>
            <span className="text-[13px] font-semibold text-[#0c0c0c]">
              Join Active Traders
            </span>
            <span className="h-4 w-px bg-[#0c0c0c]/15" aria-hidden />
            <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#0c0c0c]">
              4.8<span className="font-normal text-[#0c0c0c]/50">/5</span>
              <Star className="h-3.5 w-3.5 fill-[#cbfb45] text-[#0c0c0c]" strokeWidth={1.5} />
              Excellent
            </span>
          </motion.div>

          {/* Headline on dark tiles — Meridian style */}
          <h1 className="flex flex-wrap items-center justify-center gap-3 text-center">
            <motion.span
              initial={{ opacity: 0, y: 28, rotate: -1.5 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
              className="inline-block rounded-2xl bg-[#0c0c0c]/85 px-6 py-3 font-bold tracking-[-0.03em] text-white backdrop-blur-sm md:px-8 md:py-4"
              style={{ fontSize: "clamp(2.4rem, 7vw, 5.5rem)", lineHeight: 1 }}
            >
              The Home
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 28, rotate: 1.5 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
              className="inline-block rounded-2xl bg-[#0c0c0c]/85 px-6 py-3 font-bold tracking-[-0.03em] text-white backdrop-blur-sm md:px-8 md:py-4"
              style={{ fontSize: "clamp(2.4rem, 7vw, 5.5rem)", lineHeight: 1 }}
            >
              of Traders<span className="text-[#cbfb45]">.</span>
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.45, ease: EASE }}
            className="mt-8 max-w-[520px] text-balance text-center text-[15px] font-medium leading-relaxed text-white drop-shadow-md md:text-base"
          >
            Trade our capital up to $200,000. Transparent rules, up to 90%
            profit split, and payouts in under 24 hours.
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
            className="mt-10"
          >
            <Link
              href="/dashboard/new-challenge"
              className="group inline-flex h-14 items-center gap-3 rounded-full bg-[#cbfb45] px-8 text-[15px] font-bold uppercase tracking-wide text-[#0c0c0c] shadow-xl shadow-black/20 transition-transform duration-300 hover:scale-[1.04]"
            >
              Start My Challenge
              <ArrowRight className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.4} />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Overlapping stat cards row */}
      <div className="relative z-20 mx-auto -mt-28 grid max-w-[1320px] grid-cols-2 gap-3 px-3 md:-mt-24 lg:grid-cols-4">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 + i * 0.08, ease: EASE }}
            className="flex flex-col items-center justify-center gap-1 rounded-2xl bg-white px-4 py-7 text-center shadow-xl shadow-black/[0.06] lg:py-9"
          >
            <span className="font-bold tracking-tight text-[#0c0c0c]" style={{ fontSize: "clamp(1.9rem, 3.2vw, 2.6rem)", lineHeight: 1 }}>
              {s.value}
              <span className="text-[0.65em] font-bold text-[#9bc927]">{s.suffix}</span>
            </span>
            <span className="text-[13px] font-medium text-[#0c0c0c]/55">{s.label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
