"use client";

import { useState } from "react";
import { ArrowUpRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container, Eyebrow, Lede, SectionHeading } from "./primitives";
import { Reveal } from "@/components/v2/motion";

type Plan = {
  size: string;
  fee: string;
  target: string;
  daily: string;
  max: string;
  featured?: boolean;
};

const TABLES: Record<string, { blurb: string; plans: Plan[] }> = {
  Evaluation: {
    blurb:
      "One phase, 8% target, static 10% drawdown. Pass once and the fee comes back at 150%.",
    plans: [
      { size: "$10,000", fee: "$59", target: "$800", daily: "5%", max: "10%" },
      { size: "$50,000", fee: "$249", target: "$4,000", daily: "5%", max: "10%" },
      {
        size: "$200,000",
        fee: "$879",
        target: "$16,000",
        daily: "5%",
        max: "10%",
        featured: true,
      },
      { size: "$500,000", fee: "$1,899", target: "$40,000", daily: "5%", max: "10%" },
    ],
  },
  Instant: {
    blurb:
      "Skip the evaluation entirely. Live capital from day one with a 6% drawdown and payouts every 7 days.",
    plans: [
      { size: "$5,000", fee: "$139", target: "None", daily: "3%", max: "6%" },
      { size: "$25,000", fee: "$549", target: "None", daily: "3%", max: "6%" },
      {
        size: "$100,000",
        fee: "$1,749",
        target: "None",
        daily: "3%",
        max: "6%",
        featured: true,
      },
      { size: "$250,000", fee: "$3,999", target: "None", daily: "3%", max: "6%" },
    ],
  },
};

const INCLUDED = [
  "100% profit split from the first payout",
  "12-hour average payout processing",
  "No consistency or minimum-day rules",
  "News, EAs, hedging and weekend holds",
  "Scaling to $2M in capital",
  "Free retry on a technical breach",
];

export function Pricing() {
  const [tab, setTab] = useState<keyof typeof TABLES>("Evaluation");
  const active = TABLES[tab];

  return (
    <section
      id="pricing"
      className="v2-grain relative isolate overflow-hidden py-28 sm:py-36"
    >
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <div className="v2-fog v2-drift top-[10%] right-[-10%] h-[460px] w-[560px] opacity-[0.16]" />
      </div>

      <Container>
        <Reveal>
          <div className="flex flex-col gap-5">
            <Eyebrow>Challenges</Eyebrow>
            <SectionHeading className="max-w-2xl">
              Pick the capital. The terms never change.
            </SectionHeading>
            <Lede>{active.blurb}</Lede>
          </div>
        </Reveal>

        {/* Tabs */}
        <Reveal delay={0.1}>
          <div
            role="tablist"
            aria-label="Account type"
            className="v2-glass mt-10 inline-flex gap-1 rounded-full p-1"
          >
            {(Object.keys(TABLES) as Array<keyof typeof TABLES>).map((key) => (
              <button
                key={key}
                role="tab"
                type="button"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={cn(
                  "rounded-full px-5 py-2 text-[13px] font-medium transition-colors duration-300",
                  tab === key
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {key}
              </button>
            ))}
          </div>
        </Reveal>

        {/* Plan columns share one panel, divided by hairlines — reads as a table, not cards */}
        <Reveal delay={0.16}>
          <div className="v2-glass v2-litedge relative mt-8 overflow-hidden rounded-[26px]">
            <div
              aria-hidden="true"
              className="v2-fog bottom-[-220px] left-1/2 h-[340px] w-[60%] -translate-x-1/2 opacity-40"
            />
            <div className="relative grid divide-y divide-white/[0.06] md:grid-cols-4 md:divide-x md:divide-y-0">
              {active.plans.map((plan) => (
                <div
                  key={plan.size}
                  className={cn(
                    "relative flex flex-col gap-5 p-7",
                    plan.featured && "bg-white/[0.03]",
                  )}
                >
                  {plan.featured ? (
                    <>
                      <span
                        aria-hidden="true"
                        className="absolute inset-x-6 top-0 h-px bg-[linear-gradient(to_right,transparent,var(--highlight),transparent)]"
                      />
                      <span className="font-mono text-[10px] tracking-[0.18em] text-highlight uppercase">
                        Most funded
                      </span>
                    </>
                  ) : (
                    <span className="font-mono text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                      Account
                    </span>
                  )}

                  <p className="font-heading text-[2rem] leading-none text-foreground">
                    {plan.size}
                  </p>

                  <dl className="flex flex-col gap-2.5 border-t border-border pt-5">
                    <Row label="Profit target" value={plan.target} />
                    <Row label="Daily loss" value={plan.daily} />
                    <Row label="Max loss" value={plan.max} />
                    <Row label="Split" value="100%" highlight />
                  </dl>

                  <div className="mt-auto flex flex-col gap-3 pt-2">
                    <p className="text-[13px] text-muted-foreground">
                      One-time fee{" "}
                      <span className="font-heading text-base text-foreground">
                        {plan.fee}
                      </span>
                    </p>
                    <a
                      href="#pricing"
                      className={cn(
                        "group inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-[13px] font-medium transition-all duration-300",
                        plan.featured
                          ? "bg-foreground text-background shadow-[0_10px_36px_-10px_color-mix(in_oklab,var(--primary)_85%,transparent)] hover:-translate-y-0.5"
                          : "border border-border text-foreground/85 hover:border-white/20 hover:text-foreground",
                      )}
                    >
                      Start
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* What every account includes */}
        <Reveal delay={0.2}>
          <ul className="mt-12 grid gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {INCLUDED.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <Check
                  aria-hidden="true"
                  className="mt-0.5 h-4 w-4 shrink-0 text-highlight"
                />
                <span className="text-[13.5px] leading-relaxed text-muted-foreground">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[12.5px] text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "font-mono text-[12.5px]",
          highlight ? "text-highlight" : "text-foreground/85",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
