"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ─────────────────────────────────────────────────────────────
   PromoBannerV2 — Meridian-style limited-offer strip, on the
   TPP dark card with lime accents.
   ───────────────────────────────────────────────────────────── */
export function PromoBannerV2() {
  return (
    <div className="relative z-20 mx-auto mt-3 max-w-[1320px] px-3">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.7, ease: EASE }}
        className="relative flex flex-col items-center gap-6 overflow-hidden rounded-2xl bg-[#0c0c0c] px-6 py-8 shadow-xl shadow-black/10 md:flex-row md:justify-between md:px-10"
      >
        {/* subtle grid texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-[#cbfb45]/15 blur-[80px]" aria-hidden />

        <div className="relative flex flex-col items-center gap-2 md:items-start">
          <span className="inline-flex items-center rounded-full border border-[#cbfb45]/40 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#cbfb45]">
            Limited Offer
          </span>
          <p className="text-center text-2xl font-bold tracking-tight text-white md:text-left lg:text-3xl">
            30% OFF <span className="text-white/45">on all accounts</span>
            <span className="mx-3 text-[#cbfb45]">+</span>
            100% fee refund
          </p>
        </div>

        <div className="relative flex items-center gap-4">
          <div className="flex flex-col items-center rounded-xl border border-white/15 px-5 py-2.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">
              Promo code
            </span>
            <span className="text-lg font-bold tracking-widest text-[#cbfb45]">TPP30</span>
          </div>
          <Link
            href="/dashboard/new-challenge"
            className="group inline-flex h-12 items-center gap-2 rounded-full bg-[#cbfb45] px-6 text-[14px] font-bold text-[#0c0c0c] transition-transform duration-300 hover:scale-[1.04]"
          >
            Get Started
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.4} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
