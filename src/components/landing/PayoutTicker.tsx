"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { BadgeCheck } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   PayoutTicker — Atlas-style live payout proof marquee.
   Cream section: header row with total-paid counter, then a
   CSS/Framer marquee of recent payout cards. Pauses on hover,
   respects prefers-reduced-motion.
   ───────────────────────────────────────────────────────────── */

const EASE = [0.22, 1, 0.36, 1] as const;

type Payout = {
  name: string;
  country: string;
  amount: string;
  ago: string;
};

const PAYOUTS: Payout[] = [
  { name: "Marcus A.", country: "Nigeria", amount: "$4,120", ago: "2h ago" },
  { name: "Sofía C.", country: "Spain", amount: "$2,340", ago: "3h ago" },
  { name: "Daniel P.", country: "South Korea", amount: "$6,750", ago: "5h ago" },
  { name: "Aisha O.", country: "Nigeria", amount: "$3,485", ago: "7h ago" },
  { name: "Chen W.", country: "Singapore", amount: "$8,200", ago: "9h ago" },
  { name: "Grace N.", country: "United Kingdom", amount: "$1,975", ago: "11h ago" },
  { name: "Lucas M.", country: "Brazil", amount: "$5,640", ago: "14h ago" },
  { name: "Emma T.", country: "Australia", amount: "$2,890", ago: "16h ago" },
  { name: "Omar H.", country: "UAE", amount: "$7,310", ago: "19h ago" },
  { name: "Priya S.", country: "India", amount: "$3,150", ago: "21h ago" },
  { name: "Jakub K.", country: "Poland", amount: "$4,560", ago: "23h ago" },
  { name: "Liam D.", country: "Canada", amount: "$9,480", ago: "1d ago" },
];

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

function TotalPaidCounter({ end }: { end: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1800;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end]);

  return <span ref={ref}>${count.toLocaleString("en-US")}</span>;
}

function PayoutCard({ p }: { p: Payout }) {
  const initials = p.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .replace(".", "");
  return (
    <div className="flex w-[290px] shrink-0 items-center gap-4 rounded-2xl border border-[#0c0c0c]/10 bg-white/50 p-4 md:w-[320px]">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0c0c0c] text-[13px] font-bold text-white">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-[14px] font-semibold text-[#0c0c0c]">{p.name}</span>
          <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-[#0c0c0c]/40" strokeWidth={2.2} />
        </div>
        <div className="text-[12px] text-[#6c6a68]">
          {p.country} · just got paid
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="rounded-full bg-[#0c0c0c] px-2.5 py-1 text-[13px] font-bold text-[#cbfb45]">
          {p.amount}
        </span>
        <span className="text-[11px] font-medium text-[#6c6a68]">{p.ago}</span>
      </div>
    </div>
  );
}

export function PayoutTicker() {
  const reduced = useReducedMotion();

  return (
    <section aria-label="Recent trader payouts" className="w-full pb-16 lg:pb-24">
      <div className="w-full px-5 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-8 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end lg:mb-10"
        >
          <div>
            <div className="mb-3 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#6c6a68]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0c0c0c] opacity-40" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#0c0c0c]" />
              </span>
              Live payouts
            </div>
            <h2
              className="font-bold tracking-[-0.03em] text-[#0c0c0c]"
              style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}
            >
              Real traders. Real payouts.
            </h2>
          </div>
          <div className="flex flex-col items-start md:items-end">
            <span className="text-4xl font-bold tracking-tight text-[#0c0c0c] lg:text-5xl">
              <TotalPaidCounter end={1284650} />
            </span>
            <span className="mt-1 text-[13px] font-medium text-[#6c6a68]">
              paid out to traders — and counting
            </span>
          </div>
        </motion.div>
      </div>

      <div
        className="group relative w-full overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        {reduced ? (
          <div className="flex w-full gap-3 overflow-x-auto px-5 pb-2 lg:px-10">
            {PAYOUTS.map((p) => (
              <PayoutCard key={p.name} p={p} />
            ))}
          </div>
        ) : (
          <motion.div
            className="flex w-max items-center gap-3 [animation-play-state:running] group-hover:[animation-play-state:paused]"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 45 }}
          >
            {[...PAYOUTS, ...PAYOUTS].map((p, i) => (
              <PayoutCard key={`${p.name}-${i}`} p={p} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
