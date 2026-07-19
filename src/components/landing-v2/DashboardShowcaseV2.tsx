"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ─────────────────────────────────────────────────────────────
   DashboardShowcaseV2 — full-bleed royal-blue band with a giant
   white headline on the left and tilted dashboard screens on
   the right.
   ───────────────────────────────────────────────────────────── */
export function DashboardShowcaseV2() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#2e6bff] via-[#2a63f2] to-[#1a49d8] py-20 lg:py-28">
      {/* faint contour lines */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.4) 0%, transparent 40%), linear-gradient(rgba(255,255,255,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.25) 1px, transparent 1px)",
          backgroundSize: "auto, 96px 96px, 96px 96px",
        }}
      />

      <div className="relative mx-auto grid max-w-[1320px] items-center gap-14 px-4 lg:grid-cols-[1fr_1.15fr]">
        <motion.div
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: EASE }}
        >
          <h2
            className="text-balance font-bold tracking-[-0.02em] text-white"
            style={{ fontSize: "clamp(2.6rem, 5.5vw, 4.4rem)", lineHeight: 1.05 }}
          >
            The Most Advanced Dashboard{" "}
            <span className="text-white/60">in Prop Trading.</span>
          </h2>
          <p className="mt-6 max-w-[480px] text-pretty text-[15.5px] leading-relaxed text-white/85">
            Built entirely in-house, our platform gives traders a faster,
            clearer, and more powerful way to manage accounts, track
            performance, and stay in control from one seamless interface.
          </p>

          <Link
            href="/dashboard/new-challenge"
            className="group mt-10 inline-flex h-[52px] items-center gap-2.5 rounded-full bg-white px-8 text-[15px] font-bold text-[#0e1b33] shadow-xl shadow-[#0e1b33]/20 transition-transform duration-300 hover:scale-[1.04]"
          >
            Start your challenge
            <ArrowRight className="h-4.5 w-4.5 text-[#2e6bff] transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.4} />
          </Link>
        </motion.div>

        {/* Tilted dashboard screens */}
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
          className="relative"
        >
          <div className="rotate-2 overflow-hidden rounded-2xl border border-white/25 shadow-2xl shadow-[#0e1b33]/40">
            <Image
              src="/images/dashboard-v2.webp"
              alt="The People Prop trader dashboard showing account balance, payouts and performance analytics"
              width={1200}
              height={760}
              className="h-auto w-full"
            />
          </div>

          {/* floating payout chip */}
          <motion.div
            animate={{ y: [-8, 8, -8] }}
            transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
            className="absolute -bottom-6 -left-3 rounded-2xl bg-white px-5 py-3.5 shadow-xl shadow-[#0e1b33]/30 lg:-left-8"
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#475467]">
              Payout approved
            </p>
            <p className="text-xl font-bold tracking-tight text-[#0e1b33]">
              +$4,820{" "}
              <span className="text-[13px] font-semibold text-[#2e6bff]">in 9h 14m</span>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
