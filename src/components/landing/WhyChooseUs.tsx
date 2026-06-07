"use client";

import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Check, X } from "lucide-react";

const rows: { feature: string; tpp: string; others: string }[] = [
  {
    feature: "Profit split",
    tpp: "Up to 90%",
    others: "70 – 80% typical",
  },
  {
    feature: "Evaluation phases",
    tpp: "1 step — pass once",
    others: "2 to 3 phases",
  },
  {
    feature: "Payout cycle",
    tpp: "Bi-weekly, sub-24h",
    others: "Monthly, 3 – 7 days",
  },
  {
    feature: "Refund on first payout",
    tpp: "100%",
    others: "0 – 30%",
  },
  {
    feature: "News & weekend trading",
    tpp: "Allowed, no penalty",
    others: "Restricted or banned",
  },
  {
    feature: "Time limit",
    tpp: "None",
    others: "30 – 60 days",
  },
  {
    feature: "Scaling plan",
    tpp: "Auto every 4 months",
    others: "Manual review",
  },
];

export function WhyChooseUs() {
  return (
    <section className="relative py-12 md:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <SectionHeading
          eyebrow="Side By Side"
          title={
            <>
              We did the math.
              <br />
              <span className="word-serif">Other firms</span> didn&apos;t.
            </>
          }
          description="Compare what TPP offers against industry-standard prop firms."
          align="center"
          className="mb-12 md:mb-16"
        />

        <AnimatedSection>
          <div className="evalsteps-panel overflow-hidden max-w-4xl mx-auto flex flex-col gap-2" style={{ padding: '12px' }}>
            {/* Header */}
            <div className="grid grid-cols-[1.2fr_1fr_1fr] px-2 mb-2">
              <div className="px-5 md:px-7 py-3 text-[11px] tracking-eyebrow text-[var(--ink-500)] border-b border-[var(--border)]">
                Feature
              </div>
              <div className="px-5 md:px-7 py-3 text-[12px] font-medium text-[var(--ink-950)] flex items-center gap-2 border-b border-[var(--border)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
                The People Prop
              </div>
              <div className="px-5 md:px-7 py-3 text-[12px] text-[var(--ink-500)] border-b border-[var(--border)]">
                Industry average
              </div>
            </div>

            {/* Rows */}
            <AnimatedSection stagger className="flex flex-col gap-1 px-2 pb-2">
              {rows.map((r) => (
                <AnimatedItem key={r.feature}>
                  <div className="grid grid-cols-[1.2fr_1fr_1fr] rounded-xl relative overflow-hidden group transition-all duration-500 hover:bg-[rgba(255,255,255,0.6)] hover:backdrop-blur-xl hover:shadow-[0_20px_40px_rgba(10,37,64,0.12),inset_0_1px_1px_rgba(255,255,255,1)] hover:-translate-y-1 hover:z-10 cursor-default border border-transparent hover:border-white/60">
                    
                    {/* Liquid glare effect */}
                    <div className="absolute inset-0 -translate-x-[150%] group-hover:translate-x-[150%] bg-gradient-to-r from-transparent via-white/80 to-transparent transition-transform duration-[1.2s] ease-in-out pointer-events-none -skew-x-12 z-0" />

                    <div className="relative z-10 px-5 md:px-7 py-4 text-[14px] text-[var(--ink-700)] border-b border-[rgba(10,37,64,0.04)] group-hover:border-transparent transition-colors duration-300">
                      {r.feature}
                    </div>
                    <div className="relative z-10 px-5 md:px-7 py-4 text-[14px] font-medium text-[var(--ink-950)] flex items-center gap-2 border-b border-[rgba(10,37,64,0.04)] group-hover:border-transparent transition-colors duration-300">
                      <Check
                        className="w-4 h-4 text-[var(--success)] shrink-0"
                        strokeWidth={2.5}
                      />
                      {r.tpp}
                    </div>
                    <div className="relative z-10 px-5 md:px-7 py-4 text-[14px] text-[var(--ink-500)] flex items-center gap-2 border-b border-[rgba(10,37,64,0.04)] group-hover:border-transparent transition-colors duration-300">
                      <X className="w-4 h-4 text-[var(--ink-300)] shrink-0" />
                      {r.others}
                    </div>
                  </div>
                </AnimatedItem>
              ))}
            </AnimatedSection>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}