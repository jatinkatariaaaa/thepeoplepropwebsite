"use client";

import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Check, X, Zap, Clock, TrendingUp, ShieldCheck, Banknote, Infinity as InfinityIcon } from "lucide-react";

const widgets = [
  {
    id: "split",
    title: "Profit Split",
    icon: Banknote,
    tppValue: "Up to 90%",
    othersValue: "70-80% max",
    highlight: true,
  },
  {
    id: "phases",
    title: "Evaluation",
    icon: ShieldCheck,
    tppValue: "1-Step",
    othersValue: "2-3 Phases",
    highlight: false,
  },
  {
    id: "payouts",
    title: "Payout Speed",
    icon: Zap,
    tppValue: "Sub-24h",
    othersValue: "3-7 Days",
    highlight: true,
  },
  {
    id: "time",
    title: "Time Limit",
    icon: InfinityIcon,
    tppValue: "None",
    othersValue: "30-60 Days",
    highlight: false,
  },
  {
    id: "trading",
    title: "News & Weekend",
    icon: Clock,
    tppValue: "Allowed",
    othersValue: "Restricted",
    highlight: false,
  },
  {
    id: "scaling",
    title: "Scaling Plan",
    icon: TrendingUp,
    tppValue: "Auto (4 months)",
    othersValue: "Manual Review",
    highlight: false,
  },
];

export function WhyChooseUs() {
  return (
    <section className="relative py-16 md:py-32 overflow-hidden bg-gradient-to-b from-[#f8fafc] to-white">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[var(--accent)] opacity-[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="mx-auto max-w-7xl px-5 md:px-8 relative z-10">
        <SectionHeading
          eyebrow="The TPP Advantage"
          title={
            <>
              We did the math.
              <br />
              <span className="word-serif">Other firms</span> didn&apos;t.
            </>
          }
          description="A side-by-side look at why top traders choose our superior infrastructure over industry standards."
          align="center"
          className="mb-14 md:mb-20"
        />

        <AnimatedSection stagger className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {widgets.map((w) => {
            const Icon = w.icon;
            return (
              <AnimatedItem key={w.id} className="h-full">
                <div className="relative h-full flex flex-col p-6 rounded-3xl overflow-hidden group transition-all duration-500 bg-white shadow-[0_4px_24px_rgba(10,37,64,0.06)] hover:shadow-[0_20px_40px_rgba(10,37,64,0.12)] border border-[rgba(10,37,64,0.06)] hover:border-[var(--accent-200)] hover:-translate-y-1">
                  
                  {/* Subtle glare effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  {/* Header */}
                  <div className="flex items-center gap-3 mb-8">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${w.highlight ? 'bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent-200)]' : 'bg-slate-100 text-slate-600'}`}>
                      <Icon className="w-5 h-5" strokeWidth={2.5} />
                    </div>
                    <h3 className="text-[16px] font-semibold tracking-tight text-[var(--ink-950)]">
                      {w.title}
                    </h3>
                  </div>

                  {/* Comparison Data */}
                  <div className="flex-1 flex flex-col justify-end gap-5">
                    
                    {/* TPP Advantage */}
                    <div className="relative">
                      <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-1 h-8 bg-[var(--success)] rounded-r-full" />
                      <div className="pl-3">
                        <p className="text-[11px] font-bold tracking-widest text-[var(--ink-400)] uppercase mb-1">
                          The People Prop
                        </p>
                        <div className="flex items-end gap-2">
                          <span className={`text-[24px] md:text-[28px] font-bold leading-none tracking-tight ${w.highlight ? 'text-[var(--accent)]' : 'text-[var(--ink-950)]'}`}>
                            {w.tppValue}
                          </span>
                          <Check className="w-5 h-5 text-[var(--success)] mb-1" strokeWidth={3} />
                        </div>
                      </div>
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-[rgba(10,37,64,0.1)] to-transparent" />

                    {/* Others Disadvantage */}
                    <div className="pl-3 opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-300">
                      <p className="text-[10px] font-semibold tracking-wider text-[var(--ink-400)] uppercase mb-1">
                        Industry Average
                      </p>
                      <div className="flex items-center gap-1.5">
                        <X className="w-4 h-4 text-slate-400" strokeWidth={2.5} />
                        <span className="text-[15px] font-medium text-slate-500">
                          {w.othersValue}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              </AnimatedItem>
            );
          })}
        </AnimatedSection>

      </div>
    </section>
  );
}