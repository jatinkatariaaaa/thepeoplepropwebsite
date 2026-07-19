"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ─────────────────────────────────────────────────────────────
   PromoBannerV2 — bright royal-blue limited-offer strip with a
   giant discount lockup and a promo-code card on the right.
   ───────────────────────────────────────────────────────────── */
export function PromoBannerV2() {
  return (
    <div className="relative z-20 mx-auto mt-4 max-w-[1320px] px-3 lg:mt-5">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.7, ease: EASE }}
        className="relative flex flex-col items-center gap-8 overflow-hidden rounded-2xl bg-gradient-to-r from-[#1a49d8] via-[#2e6bff] to-[#1a49d8] px-6 py-9 shadow-2xl shadow-[#2e6bff]/30 lg:flex-row lg:justify-between lg:px-10"
      >
        {/* stadium-light texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 0%, rgba(255,255,255,0.5) 0%, transparent 30%), radial-gradient(circle at 80% 100%, rgba(255,255,255,0.35) 0%, transparent 35%), linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.18) 50%, transparent 60%)",
          }}
        />

        {/* Limited offer chip */}
        <span className="absolute left-6 top-5 inline-flex items-center rounded-full border border-white/40 bg-white/10 px-3.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.2em] text-white backdrop-blur lg:left-10">
          Limited Offer
        </span>

        {/* Big discount lockup */}
        <div className="relative mt-6 flex flex-col items-center gap-2 md:flex-row md:gap-8 lg:mt-0 lg:pl-2">
          <div className="text-center">
            <p
              className="font-extrabold uppercase tracking-tight text-white"
              style={{ fontSize: "clamp(2.6rem, 5vw, 4rem)", lineHeight: 0.95 }}
            >
              30% OFF
            </p>
            <p className="mt-1 text-[12px] font-bold uppercase tracking-[0.18em] text-white/85">
              On all accounts
            </p>
          </div>
          <span
            className="hidden font-extrabold text-white/80 md:block"
            style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)" }}
            aria-hidden
          >
            +
          </span>
          <div className="text-center">
            <p
              className="font-extrabold uppercase tracking-tight text-white"
              style={{ fontSize: "clamp(2.6rem, 5vw, 4rem)", lineHeight: 0.95 }}
            >
              Keep 90%
            </p>
            <p className="mt-1 text-[12px] font-bold uppercase tracking-[0.18em] text-white/85">
              Of your challenge profit
            </p>
          </div>
        </div>

        {/* Promo code card */}
        <div className="relative flex flex-col items-center gap-2.5">
          <div className="flex flex-col items-center rounded-xl bg-white/12 px-7 py-3 backdrop-blur">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">
              Promo code
            </span>
            <span className="text-xl font-extrabold tracking-[0.14em] text-white">
              TPP30
            </span>
          </div>
          <Link
            href="/dashboard/new-challenge"
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-white px-7 text-[14px] font-bold text-[#2e6bff] shadow-lg transition-transform duration-300 hover:scale-[1.04]"
          >
            Get Started
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
