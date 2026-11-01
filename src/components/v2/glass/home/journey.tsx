"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { Check, Route } from "lucide-react";
import { Container, Eyebrow, Lede, Title } from "../ui";
import { Reveal, Stagger, StaggerItem } from "../motion";
import { compactUsd, useCatalogue, usePlatformNames, usePrograms } from "../data";

/** How it works: three stations on one rail; the lime line draws itself as the section scrolls past. */
export function Journey() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const programs = usePrograms();
  const cat = useCatalogue(programs);
  const platforms = usePlatformNames();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.75", "end 0.65"] });
  const line = useSpring(scrollYProgress, { stiffness: 80, damping: 24 });

  const steps = [
    {
      n: "01",
      title: "Unlock your account",
      body: "Take a challenge or get an instant funding account today.",
      facts: [`Accounts up to ${compactUsd(cat.maxSize)}`, "One-time fee", "Unlimited trading period"],
      art: "/art/prop-rules.webp",
    },
    {
      n: "02",
      title: "Trade your way",
      body: "Trade on your favourite platform — news, EAs and weekend holds included.",
      facts: [`${platforms.length} platforms`, "Raw 0.0 pip spreads", "No time limit"],
      art: "/art/prop-bolt.webp",
    },
    {
      n: "03",
      title: "Get paid",
      body: `Request your payout and keep up to ${cat.maxSplit}% of the profit.`,
      facts: ["Processed in under 24 hours", `${cat.baseSplit}% split · ${cat.maxSplit}% add-on`, "Fee refunded on first payout"],
      art: "/art/prop-coins.webp",
    },
  ];

  return (
    <section ref={ref} id="how" className="relative isolate z-10 -mt-12 scroll-mt-24 overflow-clip rounded-t-[44px] bg-white pt-28 pb-40 text-[var(--g-ink)] sm:rounded-t-[56px] sm:pt-36 sm:pb-48">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 h-[480px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(169,220,207,0.45),transparent)]" />
      </div>
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <Reveal className="flex justify-center">
            <Eyebrow tone="light" icon={Route}>
              How it works
            </Eyebrow>
          </Reveal>
          <Reveal delay={0.06}>
            <Title tone="light" className="mt-6 text-[clamp(2.4rem,5vw,4.4rem)]" lead="Three steps." fade="From challenge to payout." />
          </Reveal>
          <Reveal delay={0.12} className="flex justify-center">
            <Lede tone="light" className="mt-6 text-center">
              Pick an account, trade it your way, and request your payout. No hidden rules in between.
            </Lede>
          </Reveal>
        </div>

        <div className="relative mt-20">
          {/* the rail: horizontal on desktop, vertical on phones */}
          <div aria-hidden="true" className="absolute top-[34px] right-[16.66%] left-[16.66%] hidden h-[3px] rounded-full bg-black/[0.07] lg:block">
            <motion.div className="h-full origin-left rounded-full bg-[linear-gradient(90deg,#1d6656,#8fc21d,#cbfb45)]" style={{ scaleX: reduce ? 1 : line }} />
          </div>
          <div aria-hidden="true" className="absolute top-0 bottom-0 left-[27px] w-[3px] rounded-full bg-black/[0.07] lg:hidden">
            <motion.div className="w-full origin-top rounded-full bg-[linear-gradient(180deg,#1d6656,#8fc21d,#cbfb45)]" style={{ scaleY: reduce ? 1 : line, height: "100%" }} />
          </div>

          <Stagger className="relative grid gap-10 lg:grid-cols-3 lg:gap-6" gap={0.12}>
            {steps.map((s) => (
              <StaggerItem key={s.n} className="relative pl-16 lg:pl-0">
                <span className="absolute top-0 left-0 grid h-[56px] w-[56px] place-items-center rounded-full bg-[var(--g-ink)] text-[14px] font-semibold text-[var(--g-lime)] shadow-[0_16px_30px_-14px_rgba(0,0,0,0.55)] ring-[6px] ring-white lg:relative lg:mx-auto lg:h-[72px] lg:w-[72px] lg:text-[16px]">
                  {s.n}
                </span>
                <article className="g-card-paper g-hair g-hair-ink relative mt-0 overflow-visible rounded-[32px] p-7 sm:p-8 lg:mt-8">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.art} alt="" aria-hidden="true" loading="lazy" decoding="async" className="g-float pointer-events-none absolute -top-16 right-3 w-24 drop-shadow-[0_30px_28px_rgba(16,40,34,0.28)] sm:w-28" />
                  <h3 className="max-w-[62%] text-[22px] font-semibold tracking-[-0.03em]">{s.title}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-[var(--g-muted-ink)]">{s.body}</p>
                  <ul className="mt-6 flex flex-col gap-2.5 border-t border-black/[0.06] pt-5">
                    {s.facts.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-[14px] font-medium text-[var(--g-ink)]/80">
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--g-ink)]">
                          <Check className="h-3 w-3 text-[var(--g-lime)]" strokeWidth={3} />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Container>
    </section>
  );
}
