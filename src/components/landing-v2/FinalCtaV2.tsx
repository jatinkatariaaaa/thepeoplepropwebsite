"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ─────────────────────────────────────────────────────────────
   FinalCtaV2 — Meridian's "Ready to start trading?" closer,
   with the vertical connector line, adapted to the TPP theme.
   ───────────────────────────────────────────────────────────── */
export function FinalCtaV2() {
  return (
    <section className="relative flex flex-col items-center px-4 pb-28 pt-8 lg:pb-36">
      {/* vertical connector line */}
      <motion.div
        initial={{ opacity: 0, scaleY: 0 }}
        whileInView={{ opacity: 1, scaleY: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.8, ease: EASE }}
        className="mb-10 flex origin-top flex-col items-center"
        aria-hidden
      >
        <span className="h-2 w-2 rounded-full bg-[#9bc927]" />
        <span className="h-16 w-px bg-[#9bc927]/60" />
        <span className="h-2 w-2 rounded-full bg-[#9bc927]" />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
        className="text-balance text-center font-bold tracking-[-0.03em] text-[#0c0c0c]"
        style={{ fontSize: "clamp(2.6rem, 7vw, 5.5rem)", lineHeight: 1 }}
      >
        Ready to get <span className="text-[#9bc927]">funded?</span>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
        className="mt-5 text-center text-[15px] text-[#0c0c0c]/55 lg:text-base"
      >
        Join thousands of traders in 150+ countries.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, delay: 0.3, ease: EASE }}
        className="mt-10"
      >
        <Link
          href="/dashboard/new-challenge"
          className="group inline-flex h-14 items-center gap-3 rounded-full bg-[#0c0c0c] px-9 text-[15px] font-bold text-white transition-all duration-300 hover:scale-[1.04]"
        >
          Start your challenge
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#cbfb45] text-[#0c0c0c] transition-transform duration-300 group-hover:translate-x-1">
            <ArrowRight className="h-4 w-4" strokeWidth={2.4} />
          </span>
        </Link>
      </motion.div>
    </section>
  );
}
