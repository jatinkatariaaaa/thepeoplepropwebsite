"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ─────────────────────────────────────────────────────────────
   FinalCtaV2 — vertical connector line, giant "Ready to start
   trading?" headline with blue accent, blue pill CTA and a
   full-width city skyline band below.
   ───────────────────────────────────────────────────────────── */
export function FinalCtaV2() {
  return (
    <section className="relative pt-8">
      <div className="flex flex-col items-center px-4 pb-24 lg:pb-32">
        {/* vertical connector line */}
        <motion.div
          initial={{ opacity: 0, scaleY: 0 }}
          whileInView={{ opacity: 1, scaleY: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-12 flex origin-top flex-col items-center"
          aria-hidden
        >
          <span className="h-2 w-2 rounded-full bg-[#2e6bff]" />
          <span className="h-16 w-px bg-[#2e6bff]/50" />
          <span className="h-2 w-2 rounded-full bg-[#2e6bff]" />
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, delay: 0.1, ease: EASE }}
          className="text-balance text-center font-bold tracking-[-0.02em] text-[#0e1b33]"
          style={{ fontSize: "clamp(2.8rem, 7vw, 5.6rem)", lineHeight: 1 }}
        >
          Ready to start <span className="text-[#2e6bff]">trading?</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
          className="mt-5 text-center text-[15px] text-[#475467] lg:text-base"
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
            className="group inline-flex h-14 items-center gap-3 rounded-full bg-[#2e6bff] px-9 text-[15px] font-bold text-white shadow-xl shadow-[#2e6bff]/30 transition-all duration-300 hover:scale-[1.04] hover:bg-[#1f56e0]"
          >
            Start My Challenge
            <ArrowRight className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.4} />
          </Link>
        </motion.div>
      </div>

      {/* City skyline band */}
      <div className="relative h-[280px] w-full overflow-hidden md:h-[360px]">
        <Image
          src="/images/v2/skyline-band.png"
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
          aria-hidden
        />
      </div>
    </section>
  );
}
