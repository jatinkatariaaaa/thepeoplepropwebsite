"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star, TrendingUp } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

const STATS = [
  { value: "100%", suffix: "+", label: "Fee Refund" },
  { value: "24/7", suffix: "+", label: "Human Support" },
  { value: "90", suffix: "%", label: "Profit Split" },
  { value: "24h", suffix: "", label: "Average Processing Time" },
];

/* ─────────────────────────────────────────────────────────────
   HeroV2 — full-bleed blue city hero: floating trust pill, giant
   headline on dark navy tiles, blue pill CTA and an overlapping
   row of white stat cards.
   ───────────────────────────────────────────────────────────── */
export function HeroV2() {
  return (
    <section className="relative px-2 pt-2 md:px-3 md:pt-3">
      {/* Image hero card */}
      <div className="relative overflow-hidden rounded-3xl">
        <div
          className="absolute inset-0 bg-[url('/images/v2/hero-city-blue.png')] bg-cover bg-center"
          aria-hidden
        />
        {/* legibility vignette */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#0e1b33]/40 via-transparent to-[#0e1b33]/25"
          aria-hidden
        />

        <div className="relative z-10 flex min-h-[88svh] flex-col items-center justify-start px-4 pb-44 pt-28 md:pt-32">
          {/* Floating trust pill */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="mb-8 inline-flex items-center gap-3 rounded-xl bg-white/95 py-2 pl-2 pr-4 shadow-lg shadow-[#0e1b33]/15 backdrop-blur"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2e6bff]">
              <TrendingUp className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
            </span>
            <span className="text-[13px] font-semibold text-[#0e1b33]">
              Join Active Traders
            </span>
            <span className="h-4 w-px bg-[#0e1b33]/15" aria-hidden />
            <span className="inline-flex items-center gap-1.5 text-[13px] font-bold text-[#0e1b33]">
              4.8<span className="font-normal text-[#0e1b33]/50">/5</span>
              <Star className="h-3.5 w-3.5 fill-[#2e6bff] text-[#2e6bff]" strokeWidth={1.5} />
              Excellent
            </span>
          </motion.div>

          {/* Headline on dark navy tiles */}
          <h1 className="flex flex-wrap items-center justify-center gap-3 text-center md:gap-5">
            <motion.span
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
              className="inline-block rounded-2xl bg-[#101828]/80 px-6 py-2.5 font-bold tracking-[-0.02em] text-white backdrop-blur-sm md:px-9 md:py-4"
              style={{ fontSize: "clamp(2.6rem, 7.5vw, 5.8rem)", lineHeight: 1.05 }}
            >
              The Home
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
              className="inline-block rounded-2xl bg-[#101828]/80 px-6 py-2.5 font-bold tracking-[-0.02em] text-white backdrop-blur-sm md:px-9 md:py-4"
              style={{ fontSize: "clamp(2.6rem, 7.5vw, 5.8rem)", lineHeight: 1.05 }}
            >
              of Traders<span className="text-[#2e6bff]">.</span>
            </motion.span>
          </h1>

          {/* CTA — pinned toward the lower half like the reference */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: EASE }}
            className="mt-auto pt-16"
          >
            <Link
              href="/dashboard/new-challenge"
              className="group inline-flex h-14 items-center gap-3 rounded-full bg-[#2e6bff] px-9 text-[14px] font-bold uppercase tracking-[0.08em] text-white shadow-xl shadow-[#0e1b33]/30 transition-all duration-300 hover:scale-[1.04] hover:bg-[#1f56e0]"
            >
              Start My Challenge
              <ArrowRight className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.4} />
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Overlapping stat cards row */}
      <div className="relative z-20 mx-auto -mt-28 grid max-w-[1320px] grid-cols-2 gap-3 px-3 md:-mt-24 lg:grid-cols-4 lg:gap-5">
        {STATS.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 + i * 0.08, ease: EASE }}
            className="flex flex-col items-center justify-center gap-1.5 rounded-2xl bg-white px-4 py-8 text-center shadow-xl shadow-[#0e1b33]/[0.08] lg:py-10"
          >
            <span
              className="font-bold tracking-tight text-[#0e1b33]"
              style={{ fontSize: "clamp(1.9rem, 3.2vw, 2.7rem)", lineHeight: 1 }}
            >
              {s.value}
              {s.suffix ? (
                <span className="text-[0.6em] font-bold text-[#2e6bff]">{s.suffix}</span>
              ) : null}
            </span>
            <span className="text-[13px] font-medium text-[#475467]">{s.label}</span>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
