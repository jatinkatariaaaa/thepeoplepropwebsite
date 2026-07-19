"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Headset, MessagesSquare } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ─────────────────────────────────────────────────────────────
   SupportV2 — split band: white 24/7 support card on the left
   with FAQ / Live Chat buttons, blue community card on the
   right with a "Never trade alone." headline.
   ───────────────────────────────────────────────────────────── */
export function SupportV2() {
  return (
    <section className="mx-auto grid max-w-[1320px] gap-5 px-4 py-20 lg:grid-cols-[1fr_1.1fr] lg:py-28">
      {/* Support card */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, ease: EASE }}
        className="flex flex-col items-center justify-center rounded-3xl border border-[#0e1b33]/[0.07] bg-white px-8 py-14 text-center shadow-xl shadow-[#0e1b33]/[0.05]"
      >
        {/* orbit avatar */}
        <div className="relative mb-8 flex h-40 w-40 items-center justify-center">
          <span className="absolute inset-0 rounded-full border border-[#2e6bff]/15" aria-hidden />
          <span className="absolute inset-4 rounded-full border border-[#2e6bff]/20" aria-hidden />
          <span className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-[#2e6bff] to-[#1a49d8] shadow-lg shadow-[#2e6bff]/30">
            <Headset className="h-11 w-11 text-white" strokeWidth={1.6} aria-hidden />
          </span>
        </div>

        <h2 className="text-3xl font-bold tracking-tight text-[#0e1b33] lg:text-4xl">
          24/7 Human Support
        </h2>
        <p className="mt-4 max-w-[400px] text-pretty text-[14.5px] leading-relaxed text-[#475467]">
          We&apos;re always here to help.{" "}
          <strong className="font-semibold text-[#0e1b33]">
            Check our FAQ for quick answers
          </strong>{" "}
          or reach out to our dedicated support team via live chat, Discord,
          email, or social media.
        </p>

        <div className="mt-8 flex items-center gap-3">
          <Link
            href="/faqs"
            className="inline-flex h-11 items-center rounded-full bg-[#2e6bff] px-7 text-[14px] font-bold text-white transition-colors hover:bg-[#1f56e0]"
          >
            FAQ
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-11 items-center rounded-full border border-[#0e1b33]/12 px-7 text-[14px] font-bold text-[#0e1b33] transition-colors hover:border-[#2e6bff]/40 hover:text-[#2e6bff]"
          >
            Live Chat
          </Link>
        </div>
      </motion.div>

      {/* Community card */}
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, delay: 0.12, ease: EASE }}
        className="relative flex flex-col justify-end overflow-hidden rounded-3xl bg-gradient-to-br from-[#4d84ff] via-[#2e6bff] to-[#1a49d8] px-8 py-14 shadow-xl shadow-[#2e6bff]/25 lg:px-12"
      >
        {/* radar rings + watermark icon */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <span className="absolute -right-16 -top-20 h-[420px] w-[420px] rounded-full border border-white/15" />
          <span className="absolute -right-4 -top-8 h-[320px] w-[320px] rounded-full border border-white/15" />
          <MessagesSquare className="absolute right-10 top-10 h-44 w-44 text-white/15" strokeWidth={1} />
        </div>

        <div className="relative">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-white/80">
            <span className="h-2 w-2 rounded-full bg-white/80" aria-hidden />
            Join the community
          </span>
          <h2
            className="mt-5 text-balance font-bold tracking-[-0.02em] text-white"
            style={{ fontSize: "clamp(2.4rem, 4.5vw, 3.6rem)", lineHeight: 1.05 }}
          >
            Never trade alone.
          </h2>
          <Link
            href="/contact"
            className="group mt-9 inline-flex h-12 items-center gap-2.5 rounded-full border border-white/35 bg-white/10 px-7 text-[14px] font-bold text-white backdrop-blur transition-colors hover:bg-white/20"
          >
            <MessagesSquare className="h-4.5 w-4.5" strokeWidth={2} aria-hidden />
            Join our Discord
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.4} />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
