"use client";

import { motion } from "framer-motion";
import { Star, Landmark, Bitcoin, Zap } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   PayoutMethodsStrip — dark card combining Trustpilot social
   proof with payout method badges. Sits right before the
   final CTA, FundingPips / Atlas style.
   ───────────────────────────────────────────────────────────── */

const EASE = [0.22, 1, 0.36, 1] as const;

const METHODS = [
  { icon: Landmark, label: "Bank Transfer" },
  { icon: Bitcoin, label: "Crypto · USDT / USDC" },
  { icon: Zap, label: "Rise" },
];

export function PayoutMethodsStrip() {
  return (
    <section aria-label="Payout methods and reviews" className="w-full pb-16 lg:pb-24">
      <div className="px-[5px]">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mx-auto overflow-hidden rounded-2xl bg-[#0c0c0c] px-6 py-10 lg:rounded-[2rem] lg:px-12 lg:py-12"
        >
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            {/* Trustpilot block */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 fill-[#00b67a] text-[#00b67a]" />
                <span className="text-[15px] font-bold tracking-tight text-white">Trustpilot</span>
              </div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className="flex h-7 w-7 items-center justify-center bg-[#00b67a]"
                  >
                    <Star className="h-4 w-4 fill-white text-white" />
                  </span>
                ))}
              </div>
              <span className="text-[13px] font-medium text-white/50">
                Rated 5.0 — Excellent by our traders
              </span>
            </div>

            {/* Copy + methods */}
            <div className="flex max-w-lg flex-col gap-5">
              <p
                className="font-bold leading-snug tracking-[-0.02em] text-white text-balance"
                style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)" }}
              >
                Withdraw your profits in under{" "}
                <span className="text-[#cbfb45]">24 hours</span>, your way.
              </p>
              <div className="flex flex-wrap gap-2">
                {METHODS.map((m) => (
                  <span
                    key={m.label}
                    className="inline-flex items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.04] px-4 py-2 text-[13px] font-medium text-white/80"
                  >
                    <m.icon className="h-4 w-4 text-[#cbfb45]" strokeWidth={2} />
                    {m.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
