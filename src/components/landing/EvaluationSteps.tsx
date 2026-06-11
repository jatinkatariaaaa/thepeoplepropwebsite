"use client";

import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import {
  ArrowRight,
  Target,
  ShieldCheck,
  Clock,
  KeyRound,
  Banknote,
  CalendarCheck,
  Percent,
  RotateCcw,
  Zap,
  DollarSign,
  CheckCircle2,
  TrendingUp,
  Award,
  Wallet,
} from "lucide-react";

const steps = [
  {
    number: "01",
    label: "Evaluation",
    title: "Pass the Evaluation",
    desc: "Complete one simple phase with transparent objectives. No second phases, no hidden rules.",
    color: "#2563EB",
    colorLight: "#EFF6FF",
    colorBorder: "#BFDBFE",
    Icon: Target,
    bullets: [
      { icon: Target, text: "10% profit target", sub: "Hit and maintain 10% growth" },
      { icon: ShieldCheck, text: "4% daily / 8% max drawdown", sub: "Simple risk rules" },
      { icon: Clock, text: "Min. 3 trading days", sub: "No maximum time limit" },
    ],
    badge: "No Rush",
    badgeDesc: "Trade on your own schedule",
  },
  {
    number: "02",
    label: "Get Funded",
    title: "Unlock Your Funded Account",
    desc: "Pass and receive your funded account credentials in under 24 hours with real capital.",
    color: "#3B82F6",
    colorLight: "#F0F9FF",
    colorBorder: "#BAE6FD",
    Icon: KeyRound,
    bullets: [
      { icon: KeyRound, text: "Account in under 24 hrs", sub: "Instant credentials delivery" },
      { icon: DollarSign, text: "Up to $200,000", sub: "In real trading capital" },
      { icon: ShieldCheck, text: "Same simple rules", sub: "No daily profit target" },
    ],
    badge: "Fast Setup",
    badgeDesc: "Credentials delivered quickly",
  },
  {
    number: "03",
    label: "Get Paid",
    title: "Trade & Collect Payouts",
    desc: "Trade consistently and receive fast, secure bi-weekly payouts with up to 90% profit split.",
    color: "#0369A1",
    colorLight: "#E0F2FE",
    colorBorder: "#BAE6FD",
    Icon: Wallet,
    bullets: [
      { icon: CalendarCheck, text: "First payout in 14 days", sub: "After your first trade" },
      { icon: Percent, text: "Up to 90% profit split", sub: "Paid out bi-weekly" },
      { icon: RotateCcw, text: "100% fee refund", sub: "On your very first payout" },
    ],
    badge: "Keep More",
    badgeDesc: "Industry-leading splits",
  },
];

export function EvaluationSteps() {
  return (
    <section id="how" className="relative py-20 md:py-32 overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Header */}
        <div className="flex items-end justify-between gap-8 flex-wrap mb-16 md:mb-20">
          <SectionHeading
            eyebrow="How It Works"
            title={
              <>
                Three steps from
                <br />
                signup to <span className="word-serif">funded</span>.
              </>
            }
            description="No second phases. No 60-day clocks. No hidden gotchas. Just trade — and get paid."
          />
          <Button href="./rules.html" variant="outline" className="hidden md:inline-flex">
            Read the full rules
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Steps — Desktop: horizontal timeline, Mobile: vertical stack */}
        <AnimatedSection stagger>
          {/* Connector track — desktop only */}
          <div className="hidden md:block relative mb-0">
            <div className="relative flex items-start gap-0">
              {steps.map((step, i) => (
                <AnimatedItem key={step.number} className="flex-1 flex flex-col items-center">
                  {/* Step circle + connector */}
                  <div className="relative w-full flex items-center">
                    {/* Left line */}
                    {i > 0 && (
                      <div
                        className="flex-1 h-px"
                        style={{
                          background: `linear-gradient(90deg, ${steps[i - 1].color}55, ${step.color}55)`,
                        }}
                      />
                    )}
                    {i === 0 && <div className="flex-1" />}

                    {/* Circle */}
                    <div
                      className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 border-2"
                      style={{
                        background: step.colorLight,
                        borderColor: step.colorBorder,
                      }}
                    >
                      <span
                        className="text-[13px] font-black tracking-tight"
                        style={{ color: step.color }}
                      >
                        {step.number}
                      </span>
                    </div>

                    {/* Right line */}
                    {i < steps.length - 1 && (
                      <div
                        className="flex-1 h-px"
                        style={{
                          background: `linear-gradient(90deg, ${step.color}55, ${steps[i + 1].color}55)`,
                        }}
                      />
                    )}
                    {i === steps.length - 1 && <div className="flex-1" />}
                  </div>

                  {/* Label below circle */}
                  <span
                    className="mt-3 text-[11px] font-bold tracking-widest uppercase"
                    style={{ color: step.color }}
                  >
                    {step.label}
                  </span>
                </AnimatedItem>
              ))}
            </div>
          </div>

          {/* Cards grid */}
          <div className="mt-8 md:mt-10 grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {steps.map((step, i) => {
              const StepIcon = step.Icon;
              return (
                <AnimatedItem key={step.number}>
                  <div
                    className="relative flex flex-col h-full rounded-2xl border bg-white overflow-hidden transition-all duration-500 hover:-translate-y-1 hover:shadow-xl"
                    style={{
                      borderColor: step.colorBorder,
                      boxShadow: `0 2px 16px ${step.color}10, 0 1px 3px rgba(0,0,0,0.04)`,
                    }}
                  >
                    {/* Top accent bar */}
                    <div
                      className="h-[3px] w-full"
                      style={{
                        background: `linear-gradient(90deg, ${step.color}, ${step.color}55)`,
                      }}
                    />

                    <div className="p-6 md:p-7 flex flex-col flex-1 gap-5">
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          {/* Mobile step indicator */}
                          <div
                            className="md:hidden inline-flex items-center gap-1.5 mb-2 px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border"
                            style={{
                              color: step.color,
                              background: step.colorLight,
                              borderColor: step.colorBorder,
                            }}
                          >
                            Step {step.number}
                          </div>
                          <h3 className="text-[18px] md:text-[20px] font-bold text-[var(--ink-950)] leading-tight">
                            {step.title}
                          </h3>
                        </div>
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: step.colorLight }}
                        >
                          <StepIcon
                            size={18}
                            strokeWidth={2}
                            style={{ color: step.color }}
                          />
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-[14px] text-[var(--ink-500)] leading-relaxed">
                        {step.desc}
                      </p>

                      {/* Divider */}
                      <div className="h-px bg-[var(--border)]" />

                      {/* Bullet list */}
                      <div className="flex flex-col gap-3.5">
                        {step.bullets.map((b, bi) => {
                          const BIcon = b.icon;
                          return (
                            <div key={bi} className="flex items-start gap-3">
                              <div
                                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                                style={{ background: step.colorLight }}
                              >
                                <BIcon size={13} strokeWidth={2.2} style={{ color: step.color }} />
                              </div>
                              <div>
                                <div className="text-[13px] font-semibold text-[var(--ink-900)] leading-snug">
                                  {b.text}
                                </div>
                                <div className="text-[12px] text-[var(--ink-400)] mt-0.5">
                                  {b.sub}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Footer badge */}
                      <div className="mt-auto pt-4">
                        <div
                          className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-[12px] border"
                          style={{
                            background: step.colorLight,
                            borderColor: step.colorBorder,
                          }}
                        >
                          <CheckCircle2 size={13} strokeWidth={2.5} style={{ color: step.color }} />
                          <div>
                            <span
                              className="font-bold"
                              style={{ color: step.color }}
                            >
                              {step.badge} —{" "}
                            </span>
                            <span className="text-[var(--ink-500)]">{step.badgeDesc}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </AnimatedItem>
              );
            })}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}