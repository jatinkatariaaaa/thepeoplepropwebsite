"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";
import { faq } from "@/data/faq";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ─────────────────────────────────────────────────────────────
   FaqV2 — light Meridian-style FAQ: heading + CTA on the left,
   white accordion cards on the right.
   ───────────────────────────────────────────────────────────── */
export function FaqV2() {
  const [open, setOpen] = useState<number | null>(0);
  const items = faq.slice(0, 6);

  return (
    <section className="mx-auto grid max-w-[1320px] gap-12 px-4 py-20 lg:grid-cols-[1fr_1.4fr] lg:py-28">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, ease: EASE }}
        className="lg:sticky lg:top-28 lg:self-start"
      >
        <span className="inline-flex items-center rounded-full border border-[#0c0c0c]/15 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0c0c0c]/60">
          FAQ
        </span>
        <h2
          className="mt-6 text-balance font-bold tracking-[-0.03em] text-[#0c0c0c]"
          style={{ fontSize: "clamp(2rem, 4.5vw, 3.4rem)", lineHeight: 1.05 }}
        >
          Questions? <span className="text-[#9bc927]">Answered.</span>
        </h2>
        <p className="mt-4 max-w-[380px] text-pretty text-[15px] leading-relaxed text-[#0c0c0c]/55">
          The rules, the payouts, the platforms — everything you need to know
          before you start.
        </p>
        <Link
          href="/faqs"
          className="group mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-[#0c0c0c] px-6 text-[14px] font-bold text-white transition-transform duration-300 hover:scale-[1.04]"
        >
          View all FAQs
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.4} />
        </Link>
      </motion.div>

      <div className="flex flex-col gap-3">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <motion.div
              key={item.q}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.06, ease: EASE }}
              className={cn(
                "rounded-2xl border bg-white shadow-sm transition-colors duration-300",
                isOpen ? "border-[#9bc927]/50" : "border-[#0c0c0c]/[0.07]"
              )}
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="text-[15px] font-semibold text-[#0c0c0c] lg:text-base">
                  {item.q}
                </span>
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
                    isOpen
                      ? "rotate-180 border-[#cbfb45] bg-[#cbfb45] text-[#0c0c0c]"
                      : "border-[#0c0c0c]/15 text-[#0c0c0c]/50"
                  )}
                >
                  <ChevronDown className="h-4 w-4" strokeWidth={2.2} />
                </span>
              </button>
              <motion.div
                initial={false}
                animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="overflow-hidden"
              >
                <p className="px-6 pb-6 text-[14px] leading-relaxed text-[#0c0c0c]/60">
                  {item.a}
                </p>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
