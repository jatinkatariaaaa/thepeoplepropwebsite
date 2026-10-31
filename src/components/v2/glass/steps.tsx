"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Check, Footprints } from "lucide-react";
import { Container, Eyebrow, Lede, Title } from "./ui";
import { EASE, Reveal, Stagger, StaggerItem } from "./motion";
import { compactUsd, sizesOf, useCatalogue, usePlatformNames, usePrograms } from "./data";

/* Each step gets a small, honest product moment instead of a stock image. */

function Stage({ children }: { children: ReactNode }) {
  return (
    <div className="relative grid h-[230px] place-items-center overflow-hidden rounded-[24px] bg-[radial-gradient(ellipse_80%_70%_at_50%_30%,#ffffff,#e4ece9)] shadow-[inset_0_1px_0_#fff,inset_0_-30px_60px_-40px_rgba(16,40,34,0.25)]">
      {children}
    </div>
  );
}

function SizePicker({ sizes }: { sizes: number[] }) {
  const show = sizes.slice(-4);
  const pick = show[Math.min(2, show.length - 1)];
  return (
    <div className="g-glass-light g-hair g-hair-ink w-[82%] rounded-[20px] p-3">
      <p className="px-1 text-[11px] font-medium text-[var(--g-muted-ink)]">Account size</p>
      <div className="mt-2 grid grid-cols-4 gap-1.5">
        {show.map((s) => (
          <span
            key={s}
            className={`g-num rounded-[10px] py-2 text-center text-[12px] font-semibold ${s === pick ? "bg-[var(--g-ink)] text-[var(--g-lime)]" : "bg-black/[0.04] text-[var(--g-ink)]/70"}`}
          >
            {compactUsd(s)}
          </span>
        ))}
      </div>
      <span className="mt-2.5 flex h-9 items-center justify-center rounded-full bg-[var(--g-lime)] text-[12.5px] font-semibold text-[var(--g-ink)]">Get funded</span>
    </div>
  );
}

function Terminal({ platforms }: { platforms: string[] }) {
  const bars = [38, 52, 44, 66, 58, 74, 63, 88];
  return (
    <div className="g-hair w-[84%] overflow-hidden rounded-[18px] bg-[linear-gradient(180deg,#1b201f,#101413)] shadow-[0_30px_50px_-30px_rgba(0,0,0,0.6)]">
      <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="ml-2 truncate text-[10.5px] text-white/45">{platforms[0]}</span>
      </div>
      <div className="flex h-[92px] items-end gap-[6px] px-4 pb-3">
        {bars.map((h, i) => (
          <motion.span
            key={i}
            initial={{ scaleY: 0.2 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.2 + i * 0.06, ease: EASE }}
            style={{ height: `${h}%` }}
            className={`w-full origin-bottom rounded-[4px] ${i % 3 === 1 ? "bg-[var(--g-sage)]/70" : "bg-[var(--g-lime)]"}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-1 border-t border-white/[0.06] px-3 py-2">
        {platforms.slice(1, 4).map((p) => (
          <span key={p} className="rounded-full bg-white/[0.07] px-2 py-0.5 text-[10px] text-white/60">
            {p}
          </span>
        ))}
      </div>
    </div>
  );
}

function Payout() {
  const rows = ["Payout requested", "Processing", "Paid"];
  return (
    <div className="g-glass-light g-hair g-hair-ink w-[80%] rounded-[20px] p-3.5">
      <ol className="flex flex-col gap-2.5">
        {rows.map((r, i) => (
          <motion.li
            key={r}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.25 + i * 0.25, ease: EASE }}
            className="flex items-center gap-3"
          >
            <span className={`grid h-7 w-7 place-items-center rounded-full ${i === rows.length - 1 ? "bg-[var(--g-lime)] text-[var(--g-ink)]" : "bg-[var(--g-ink)] text-white"}`}>
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
            <span className="text-[13px] font-semibold text-[var(--g-ink)]">{r}</span>
          </motion.li>
        ))}
      </ol>
      <p className="mt-3 rounded-[12px] bg-black/[0.04] px-3 py-2 text-[11.5px] font-medium text-[var(--g-muted-ink)]">Processed in under 24 hours</p>
    </div>
  );
}

export function Steps() {
  const programs = usePrograms();
  const cat = useCatalogue(programs);
  const platforms = usePlatformNames();
  const sizes = Array.from(new Set(programs.flatMap(sizesOf))).sort((a, b) => a - b);

  const steps = [
    {
      n: "1",
      title: "Unlock your account",
      body: "Take a challenge or get an instant funding account today.",
      facts: [`Accounts up to ${compactUsd(cat.maxSize)}`, "One-time fee", "Unlimited trading period"],
      stage: <SizePicker sizes={sizes} />,
    },
    {
      n: "2",
      title: "Trade your way",
      body: "Trade on your favourite platform — news, EAs and weekend holds included.",
      facts: [`${platforms.length} platforms`, "Raw 0.0 pip spreads", "No time limit"],
      stage: <Terminal platforms={platforms} />,
    },
    {
      n: "3",
      title: "Get paid",
      body: `Request your payout and keep up to ${cat.maxSplit}% of the profit.`,
      facts: ["Processed in under 24 hours", `${cat.baseSplit}% split · ${cat.maxSplit}% add-on`, "Fee refunded on first payout"],
      stage: <Payout />,
    },
  ];

  return (
    <section id="how" className="relative isolate scroll-mt-24 bg-white pt-10 pb-40 text-[var(--g-ink)] sm:pb-48">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <Reveal className="flex justify-center">
            <Eyebrow tone="light" icon={Footprints}>
              How it works
            </Eyebrow>
          </Reveal>
          <Reveal delay={0.06}>
            <Title tone="light" className="mt-6 text-[clamp(2.3rem,4.8vw,4.2rem)]" lead="Three steps." fade="From challenge to payout." />
          </Reveal>
          <Reveal delay={0.12} className="flex justify-center">
            <Lede tone="light" className="mt-6 text-center">
              Pick an account, trade the way you already do, and request your payout.
            </Lede>
          </Reveal>
        </div>

        <div className="relative mt-16">
          {/* the thread that ties the three steps together */}
          <div aria-hidden="true" className="absolute top-[132px] right-[16%] left-[16%] hidden h-px bg-[linear-gradient(90deg,transparent,rgba(14,17,16,0.14)_12%,rgba(14,17,16,0.14)_88%,transparent)] lg:block">
            <span className="g-step-pulse absolute -top-[3px] h-[7px] w-24 rounded-full bg-[linear-gradient(90deg,transparent,var(--g-emerald),transparent)]" />
          </div>
          <Stagger className="relative grid gap-5 lg:grid-cols-3" gap={0.12}>
            {steps.map((s) => (
              <StaggerItem key={s.n}>
                <article className="g-card-paper g-hair g-hair-ink flex h-full flex-col rounded-[32px] p-3">
                  <Stage>{s.stage}</Stage>
                  <div className="flex flex-1 flex-col px-4 pt-6 pb-5">
                    <div className="flex items-center gap-3">
                      <span className="g-num grid h-9 w-9 place-items-center rounded-full bg-[var(--g-ink)] text-[14px] font-semibold text-[var(--g-lime)]">{s.n}</span>
                      <h3 className="text-[21px] font-semibold tracking-[-0.03em]">{s.title}</h3>
                    </div>
                    <p className="mt-3 text-[15px] leading-relaxed text-[var(--g-muted-ink)]">{s.body}</p>
                    <ul className="mt-5 flex flex-col gap-2 border-t border-black/[0.06] pt-5">
                      {s.facts.map((f) => (
                        <li key={f} className="flex items-center gap-2.5 text-[13.5px] font-medium text-[var(--g-ink)]/80">
                          <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--g-emerald)]/10 text-[var(--g-emerald)]">
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Container>
    </section>
  );
}
