"use client";

import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

const FEATURES = [
  { stat: "90%", title: "Profit Split", desc: "Keep nearly every dollar you earn." },
  { stat: "100%", title: "Fee Refund", desc: "Your full fee back with first payout." },
  { stat: "24h", title: "Payout Speed", desc: "Among the fastest in the industry." },
  { stat: "1-Step", title: "Evaluation", desc: "One fair phase. No hidden hoops." },
  { stat: "Zero", title: "Time Limits", desc: "Take all the time you need to pass." },
  { stat: "Open", title: "Weekend & News", desc: "No calendar restrictions on trading." },
  { stat: "24/7", title: "Human Support", desc: "Real humans, any hour of the day." },
  { stat: "EAs", title: "& Algos Allowed", desc: "Run your bots. We don't interfere." },
  { stat: "4x", title: "Scaling Plan", desc: "Grow up to 4x your starting account." },
];

/* ─────────────────────────────────────────────────────────────
   FeatureGridV2 — Meridian-style numbered feature grid on the
   cream background with hairline dividers.
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
          className="text-balance font-bold tracking-[-0.03em] text-[#0c0c0c]"
          style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.05 }}
        >
          Everything a trader <span className="text-[#9bc927]">actually</span> wants
        </h2>
        <p className="mx-auto mt-4 max-w-[480px] text-pretty text-[15px] leading-relaxed text-[#0c0c0c]/55">
          No fine print traps. No moving goalposts. Just the conditions serious
          traders ask for.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 border-t border-[#0c0c0c]/10 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6, delay: (i % 3) * 0.1, ease: EASE }}
            className="group flex gap-5 border-b border-[#0c0c0c]/10 px-2 py-9 transition-colors duration-300 hover:bg-white/60 lg:px-6"
          >
            <span className="mt-1 text-[13px] font-semibold tabular-nums text-[#0c0c0c]/35">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h3 className="text-xl font-bold tracking-tight text-[#0c0c0c] lg:text-2xl">
                <span className="text-[#9bc927]">{f.stat}</span> {f.title}
              </h3>
              <p className="mt-1.5 text-[14px] leading-relaxed text-[#0c0c0c]/55">{f.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
