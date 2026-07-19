"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

const FEATURES = [
  { lead: "90%", title: "Profit Split", desc: "Keep nearly every dollar you earn." },
  { lead: "100%", title: "Fee Refund", desc: "Full fee back with your first payout." },
  { lead: "24h", title: "Payout Speed", desc: "Among the fastest in the industry." },
  { lead: "1-Step", title: "Evaluation", desc: "One fair phase. No hidden hoops." },
  { lead: "Zero", title: "Time Limits", desc: "Take all the time you need to pass." },
  { lead: "24/7", title: "Human Support", desc: "Real humans, any hour." },
  { lead: "Open", title: "Weekend & News", desc: "No calendar restrictions on trading." },
  { lead: "EAs &", title: "Algos Allowed", desc: "Run your bots. We don't interfere." },
  { lead: "Free", title: "Challenge Reset", desc: "Miss once? We reset you for free." },
  { lead: "4x", title: "Scaling Plan", desc: "Grow up to 4x your starting account." },
  { lead: "∞", title: "Trading Days", desc: "Take all the time you need." },
  { lead: "150+", title: "Countries Served", desc: "Traders funded across the globe." },
];

/* ─────────────────────────────────────────────────────────────
   FeatureGridV2 — numbered feature list with hairline dividers:
   blue lead word + dark title, small description under each.
   ───────────────────────────────────────────────────────────── */
export function FeatureGridV2() {
  return (
    <section className="mx-auto max-w-[1320px] px-4 py-20 lg:py-28">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, ease: EASE }}
        className="mb-14 text-center"
      >
        <h2
          className="text-balance font-bold tracking-[-0.02em] text-[#0e1b33]"
          style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)", lineHeight: 1.05 }}
        >
          Everything a trader <span className="text-[#2e6bff]">actually</span> wants
        </h2>
        <p className="mx-auto mt-4 max-w-[480px] text-pretty text-[15px] leading-relaxed text-[#475467]">
          No fine print traps. No moving goalposts. Just the conditions serious
          traders ask for.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-x-10 md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: (i % 3) * 0.08, ease: EASE }}
            className="flex gap-5 border-t border-[#0e1b33]/[0.08] px-1 py-8"
          >
            <span className="mt-1.5 text-[13px] font-bold tabular-nums text-[#2e6bff]/60">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="text-[21px] font-bold tracking-tight text-[#0e1b33]">
                <span className="text-[#2e6bff]">{f.lead}</span> {f.title}
              </h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-[#475467]">
                {f.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-14 flex justify-center">
        <Link
          href="/dashboard/new-challenge"
          className="group inline-flex h-[52px] items-center gap-2.5 rounded-full bg-[#2e6bff] px-8 text-[15px] font-bold text-white shadow-lg shadow-[#2e6bff]/30 transition-all duration-300 hover:scale-[1.04] hover:bg-[#1f56e0]"
        >
          Start My Challenge Now
          <ArrowRight className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.4} />
        </Link>
      </div>
    </section>
  );
}
