"use client";

import { BadgeDollarSign, CalendarOff, Check, Scale, Target, TrendingUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, Container, Eyebrow, Lede, Section, Title } from "./ui";
import { Reveal, Stagger, StaggerItem } from "./motion";
import { TppMark } from "./logo";

/* The matrix from the main landing page, row for row. */
const ROWS = [
  { icon: Target, cat: "Execution", them: "Marked-up spreads", us: "Raw 0.0 pip spreads" },
  { icon: CalendarOff, cat: "Freedom", them: "30-day deadline", us: "No time limit" },
  { icon: BadgeDollarSign, cat: "Payouts", them: "Fixed payout windows", us: "Payout on demand" },
  { icon: TrendingUp, cat: "Growth", them: "Paid resets", us: "Free retry + auto scaling" },
];

export function Compare() {
  const last = ROWS.length - 1;
  return (
    <Section id="compare" className="pt-56 pb-28 sm:pt-64 sm:pb-36">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-40 left-1/2 h-[560px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(29,102,86,0.32),transparent)]" />
        <div className="g-grain" />
      </div>
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <Reveal className="flex justify-center">
            <Eyebrow icon={Scale}>The TPP difference</Eyebrow>
          </Reveal>
          <Reveal delay={0.06}>
            <Title className="mt-6 text-[clamp(2.3rem,4.8vw,4.2rem)]" lead="The difference is in" fade="the details." />
          </Reveal>
          <Reveal delay={0.12} className="flex justify-center">
            <Lede className="mt-6 text-center">Four places where TPP sets a different standard from a typical prop firm.</Lede>
          </Reveal>
        </div>

        {/* desktop: a lit column for TPP, like a product comparison sheet */}
        <Reveal delay={0.1} className="mx-auto mt-16 hidden max-w-[1060px] md:block">
          <div role="table" aria-label="TPP compared with a typical prop firm" className="grid grid-cols-[0.8fr_1fr_1.1fr]">
            <div role="row" className="contents">
              <div role="columnheader">
                <span className="sr-only">Category</span>
              </div>
              <div role="columnheader" className="flex items-end px-6 pb-5">
                <div>
                  <p className="text-[15px] font-semibold text-white/55">Industry standard</p>
                  <p className="text-[12.5px] text-white/35">Typical prop firm</p>
                </div>
              </div>
              <div role="columnheader" className="g-hair relative rounded-t-[28px] bg-[linear-gradient(180deg,#145244,#0e3d33)] px-7 pt-7 pb-5">
                <TppMark className="h-[22px] text-white" />
                <p className="mt-2 text-[12.5px] text-[var(--g-mint)]">The People Prop</p>
              </div>
            </div>
            {ROWS.map(({ icon: Icon, cat, them, us }, i) => (
              <div role="row" key={cat} className="contents">
                <div role="rowheader" className="flex items-center gap-3 border-t border-white/[0.07] px-2 py-6 text-[15px] font-semibold text-white/85">
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.05] ring-1 ring-white/10">
                    <Icon className="h-[18px] w-[18px] text-[var(--g-sage)]" strokeWidth={1.8} />
                  </span>
                  {cat}
                </div>
                <div role="cell" className="flex items-center gap-3 border-t border-white/[0.07] px-6 py-6 text-[15.5px] text-white/45">
                  <X className="h-4 w-4 shrink-0 text-white/30" strokeWidth={2.4} />
                  {them}
                </div>
                <div
                  role="cell"
                  className={cn(
                    "flex items-center gap-3 border-t border-white/[0.08] bg-[linear-gradient(180deg,#0e3d33,#0d3a31)] px-7 py-6 text-[16px] font-semibold text-white",
                    i === last && "rounded-b-[28px] shadow-[0_50px_80px_-40px_rgba(3,40,32,0.9)]",
                  )}
                >
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[var(--g-lime)] text-[var(--g-ink)]">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  {us}
                </div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* mobile: one card per row */}
        <Stagger className="mt-12 grid gap-3 md:hidden" gap={0.08}>
          {ROWS.map(({ icon: Icon, cat, them, us }) => (
            <StaggerItem key={cat}>
              <div className="g-glass g-hair rounded-[24px] p-5">
                <p className="flex items-center gap-2.5 text-[14px] font-semibold text-white/80">
                  <Icon className="h-4 w-4 text-[var(--g-sage)]" strokeWidth={1.8} />
                  {cat}
                </p>
                <p className="mt-4 flex items-center gap-2.5 text-[14px] text-white/40">
                  <X className="h-4 w-4 text-white/30" strokeWidth={2.4} />
                  {them}
                </p>
                <p className="mt-2.5 flex items-center gap-2.5 text-[15.5px] font-semibold text-white">
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--g-lime)] text-[var(--g-ink)]">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  {us}
                </p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.1} className="mt-12 flex justify-center">
          <Button href="#challenges">See the challenges</Button>
        </Reveal>
      </Container>
    </Section>
  );
}
