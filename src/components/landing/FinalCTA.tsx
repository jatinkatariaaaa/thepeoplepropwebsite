"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { ArrowUpRight, Shield, Zap } from "lucide-react";

export function FinalCTA() {
  const sectionRef = useRef<HTMLElement>(null);
  const skip = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const gridY = useTransform(scrollYProgress, [0, 1], [60, -60]);
  const smoothGridY = useSpring(gridY, { stiffness: 80, damping: 30 });
  const glowScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1.2, 0.9]);

  return (
    <section ref={sectionRef} className="relative py-12 md:py-32 overflow-hidden">
      {/* Parallax grid */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-grid opacity-50 pointer-events-none"
        style={{ y: skip ? 0 : smoothGridY }}
      />
      <div className="absolute inset-0 bg-grid-fade pointer-events-none" />

      <div className="relative mx-auto max-w-5xl px-5 md:px-8 text-center">
        <motion.p
          className="text-[11px] tracking-eyebrow text-[var(--accent-700)] mb-5"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Founders&apos; Cohort
        </motion.p>

        <motion.h2
          className="font-medium text-[clamp(2.4rem,7vw,5.25rem)] leading-[0.98] tracking-[-0.035em] text-[var(--ink-950)]"
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          Your capital is waiting.
          <br />
          Come take <span className="word-serif">it</span>.
        </motion.h2>

        <motion.p
          className="mt-7 max-w-xl mx-auto text-[16px] text-[var(--ink-500)] leading-relaxed"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          One fair evaluation. Up to $200,000 funded. 90% profit split. Paid
          bi-weekly. No second phases. No hidden tricks.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <Button href="/challenges" variant="primary" size="lg">
            Start My Challenge
            <ArrowUpRight className="w-4 h-4" />
          </Button>
          <Button href="/rules" variant="outline" size="lg">
            Read the full rulebook
          </Button>
        </motion.div>

        <motion.ul
          className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-[13px] text-[var(--ink-500)]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <li className="flex items-center gap-2">
            <Shield
              className="w-4 h-4 text-[var(--accent)]"
              strokeWidth={2.2}
            />
            Regulated execution
          </li>
          <li className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[var(--accent)]" strokeWidth={2.2} />
            Sub-24h payouts
          </li>
          <li>14-day refund guarantee</li>
        </motion.ul>
      </div>
    </section>
  );
}