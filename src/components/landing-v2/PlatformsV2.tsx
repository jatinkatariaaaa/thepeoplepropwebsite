"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CandlestickChart } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ─────────────────────────────────────────────────────────────
   PlatformsV2 — "Available Trading Platforms" section: centered
   heading with a blue accent word and a wide platform card with
   a blue icon block on the left.
   ───────────────────────────────────────────────────────────── */
export function PlatformsV2() {
  return (
    <section className="relative overflow-hidden bg-[#f4f8ff] py-20 lg:py-28">
      {/* faint dotted contour texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(rgba(46,107,255,0.18) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative mx-auto max-w-[1320px] px-4">
        <motion.h2
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="text-balance text-center font-bold tracking-[-0.02em] text-[#0e1b33]"
          style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)", lineHeight: 1.05 }}
        >
          Available <span className="text-[#2e6bff]">Trading</span> Platforms
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, delay: 0.15, ease: EASE }}
          className="mx-auto mt-14 flex max-w-[720px] flex-col overflow-hidden rounded-2xl bg-white shadow-xl shadow-[#0e1b33]/[0.07] sm:flex-row"
        >
          {/* Blue icon block */}
          <div className="flex items-center justify-center bg-[#2e6bff] p-10 sm:w-[170px] sm:shrink-0">
            <CandlestickChart className="h-16 w-16 text-white" strokeWidth={1.4} aria-hidden />
          </div>
          <div className="flex flex-col justify-center gap-1.5 p-8">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#2e6bff]">
              Platform
            </span>
            <h3 className="text-2xl font-bold tracking-tight text-[#0e1b33]">
              MetaTrader 5
            </h3>
            <p className="text-[14.5px] leading-relaxed text-[#475467]">
              A trusted industry-standard platform with advanced charting,
              technical analysis tools, and support for automated trading.
            </p>
          </div>
        </motion.div>

        <div className="mt-14 flex justify-center">
          <Link
            href="/dashboard/new-challenge"
            className="group inline-flex h-[52px] items-center gap-2.5 rounded-full bg-[#2e6bff] px-8 text-[15px] font-bold text-white shadow-lg shadow-[#2e6bff]/30 transition-all duration-300 hover:scale-[1.04] hover:bg-[#1f56e0]"
          >
            Buy Challenge
            <ArrowRight className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.4} />
          </Link>
        </div>
      </div>
    </section>
  );
}
