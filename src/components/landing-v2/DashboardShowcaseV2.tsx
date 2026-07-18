"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

const POINTS = [
  "Live equity, drawdown & target tracking",
  "One-click payout requests",
  "Trade analytics & session breakdowns",
  "Leaderboards, rewards & referrals",
];

/* ─────────────────────────────────────────────────────────────
   DashboardShowcaseV2 — Meridian's "The Most Trader-First
   Dashboard" band, on the TPP dark card with lime accents.
   ───────────────────────────────────────────────────────────── */
export function DashboardShowcaseV2() {
  return (
    <section className="px-[5px] py-2">
      <div className="relative overflow-hidden rounded-2xl bg-[#0c0c0c] px-6 py-20 lg:px-14 lg:py-28">
        {/* ambient lime glow */}
        <div className="pointer-events-none absolute -left-24 top-1/3 h-[420px] w-[420px] rounded-full bg-[#cbfb45]/10 blur-[120px]" aria-hidden />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        <div className="relative mx-auto grid max-w-[1320px] items-center gap-14 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 36 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <span className="inline-flex items-center rounded-full border border-[#cbfb45]/40 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#cbfb45]">
              The Dashboard
            </span>
            <h2
              className="mt-6 text-balance font-bold tracking-[-0.03em] text-white"
              style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)", lineHeight: 1.02 }}
            >
              The most <span className="text-[#cbfb45]">trader-first</span> dashboard
            </h2>
            <p className="mt-5 max-w-[460px] text-pretty text-[15px] leading-relaxed text-white/55">
              Everything about your evaluation and funded account in one place —
              built to feel like a trading terminal, not an admin panel.
            </p>

            <ul className="mt-8 flex flex-col gap-3.5">
              {POINTS.map((p) => (
                <li key={p} className="flex items-center gap-3 text-[15px] font-medium text-white/85">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-[#cbfb45]" strokeWidth={2} />
                  {p}
                </li>
              ))}
            </ul>

            <Link
              href="/dashboard"
              className="group mt-10 inline-flex h-12 items-center gap-2 rounded-full bg-[#cbfb45] px-6 text-[14px] font-bold text-[#0c0c0c] transition-transform duration-300 hover:scale-[1.04]"
            >
              Explore the Dashboard
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.4} />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 48, rotate: 2 }}
            whileInView={{ opacity: 1, y: 0, rotate: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
            className="relative"
          >
            <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/50">
              <Image
                src="/images/dashboard-v2.webp"
                alt="TPP trader dashboard showing live equity, targets and payout tracking"
                width={1200}
                height={760}
                className="h-auto w-full"
              />
            </div>
            {/* floating payout chip */}
            <motion.div
              animate={{ y: [-8, 8, -8] }}
              transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
              className="absolute -bottom-5 -left-3 rounded-2xl bg-white px-5 py-3.5 shadow-xl shadow-black/30 lg:-left-8"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#0c0c0c]/45">
                Payout approved
              </p>
              <p className="text-xl font-bold tracking-tight text-[#0c0c0c]">
                +$4,820 <span className="text-[13px] font-semibold text-[#9bc927]">in 9h 14m</span>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
