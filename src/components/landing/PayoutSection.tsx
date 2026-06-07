"use client";

import { motion } from "framer-motion";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Check, MapPin } from "lucide-react";

/* Payout proof — SVG dotted globe + floating payout chips + offices row */

const payouts: { name: string; city: string; amount: string; side: "tl" | "tr" | "bl" | "br" }[] = [];

const offices = [
  { city: "London", region: "EU HQ" },
  { city: "Dubai", region: "MENA" },
  { city: "Singapore", region: "APAC" },
  { city: "Mumbai", region: "India" },
];

export function PayoutSection() {
  return (
    <section className="relative py-12 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Proof Of Payouts"
          title={
            <>
              Real traders. Real{" "}
              <span className="word-serif">payouts</span>.
              <br />
              Across 142 countries.
            </>
          }
          description="$24.6M paid out and counting. Every payout verified on-chain or via bank confirmation."
          align="center"
          className="mb-16"
        />

        <AnimatedSection className="relative">
          <div className="relative mx-auto max-w-6xl flex items-center justify-center rounded-2xl overflow-hidden">
            {/* Border gradient fades behind the image */}
            <div className="absolute top-0 left-0 right-0 h-24 md:h-32 bg-gradient-to-b from-[#eef2f7] to-transparent pointer-events-none z-0" />
            <div className="absolute bottom-0 left-0 right-0 h-24 md:h-32 bg-gradient-to-t from-[#e9f0fa] to-transparent pointer-events-none z-0" />
            <div className="absolute top-0 bottom-0 left-0 w-24 md:w-32 bg-gradient-to-r from-[#eef2f7] to-transparent pointer-events-none z-0" />
            <div className="absolute top-0 bottom-0 right-0 w-24 md:w-32 bg-gradient-to-l from-[#e9f0fa] to-transparent pointer-events-none z-0" />
            
            <img
              src="/globe-replacement.webp"
              alt="Global Trader Network Map"
              className="relative z-10 w-full h-auto object-contain pointer-events-none select-none opacity-90"
            />
          </div>

          {/* Offices row */}
          <div className="mt-12 md:mt-16 max-w-6xl mx-auto w-full">
            <p className="text-center text-[11px] tracking-eyebrow text-[var(--ink-400)] mb-5">
              Regional Trader Hubs
            </p>
            <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
              {offices.map((o) => (
                <li
                  key={o.city}
                  className="relative overflow-hidden group flex items-center justify-center md:justify-start gap-3 md:gap-4 px-5 md:px-8 py-4 md:py-5 rounded-2xl bg-white border border-[rgba(10,37,64,0.08)] shadow-[0_8px_20px_rgba(10,37,64,0.04)] cursor-pointer transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_rgba(10,37,64,0.08)]"
                >
                  {/* Left-to-right glass hover fill */}
                  <div className="absolute inset-0 bg-[rgba(37,99,235,0.04)] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out z-0" />
                  
                  <span className="relative z-10 grid place-items-center w-8 h-8 rounded-full bg-[var(--paper-2)] text-[var(--ink-600)] group-hover:bg-white group-hover:shadow-sm group-hover:text-[var(--accent)] transition-all duration-300">
                    <MapPin className="w-3.5 h-3.5" strokeWidth={2.2} />
                  </span>
                  <div className="relative z-10 leading-tight">
                    <p className="text-[14px] font-medium text-[var(--ink-950)]">
                      {o.city}
                    </p>
                    <p className="text-[11px] text-[var(--ink-500)] tracking-eyebrow group-hover:text-[var(--ink-600)] transition-colors duration-300">
                      {o.region}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}


function PayoutChip({
  name,
  city,
  amount,
  side,
  delay = 0,
}: {
  name: string;
  city: string;
  amount: string;
  side: "tl" | "tr" | "bl" | "br";
  delay?: number;
}) {
  const pos =
    side === "tl"
      ? "top-[10%] left-[2%]"
      : side === "tr"
        ? "top-[14%] right-[2%]"
        : side === "bl"
          ? "bottom-[12%] left-[6%]"
          : "bottom-[8%] right-[4%]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.55, delay }}
      className={`absolute ${pos} surface-card flex items-center gap-3 pl-2.5 pr-4 py-2`}
      style={{ boxShadow: "0 16px 30px -14px rgba(15,23,42,0.18)" }}
    >
      <span className="grid place-items-center w-8 h-8 rounded-full bg-[var(--success)] text-white">
        <Check className="w-3.5 h-3.5" strokeWidth={3} />
      </span>
      <div className="leading-tight">
        <p className="text-[10.5px] tracking-eyebrow text-[var(--ink-400)]">
          {name} · {city}
        </p>
        <p className="text-[13.5px] font-medium tabular-nums text-[var(--ink-950)]">
          {amount}
        </p>
      </div>
    </motion.div>
  );
}