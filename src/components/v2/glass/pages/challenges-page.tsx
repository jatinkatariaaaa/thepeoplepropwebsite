"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Bot, CalendarClock, CalendarRange, HandCoins, Layers } from "lucide-react";
import { ALL_SIZES, formatSize, type ProgramKey } from "@/data/programs";
import { faq } from "@/data/faq";
import { cn } from "@/lib/utils";
import { Button, Container, Eyebrow, Lede, Section, Title } from "../ui";
import { Reveal, Stagger, StaggerItem } from "../motion";
import { FaqItem } from "../faq";
import { ACCESS_UPFRONT, compactUsd, entryPrice, usd, useCatalogue, usePrograms, useSelectedProgram } from "../data";
import { PageHero } from "../page-hero";
import { Challenges } from "../challenges";
import { Cta } from "../cta";
import { href } from "../routes";

const MARK: Record<ProgramKey, string> = { "1-step": "1", "2-step": "2", "3-step": "3", instant: "∞", access: "$5" };

/** Apple-style "compare models": one tall column per program, specs aligned row by row. */
export function ProgramColumns() {
  const programs = usePrograms();
  const [, setProgram] = useSelectedProgram();
  const configure = (k: ProgramKey) => {
    setProgram(k);
    document.getElementById("challenges")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const rows = (p: (typeof programs)[number]) => [
    { label: "Profit target", value: p.profitTarget === "—" ? "None" : p.profitTarget },
    { label: "Max. daily loss", value: p.dailyDrawdown },
    { label: "Max. overall loss", value: p.maxDrawdown },
    { label: "Min. trading days", value: String(p.minTradingDays) },
    { label: "Profit split", value: `${p.profitSplit}% → ${p.profitSplitMax}%` },
    { label: "Payout cycle", value: p.payoutCycle },
    { label: "Consistency rule", value: p.consistencyRule },
  ];

  return (
    <Section shell={false} className="pt-10 pb-24 sm:pb-32">
      <Container>
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <Reveal>
              <Eyebrow icon={Layers}>Compare programs</Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <Title className="mt-6 text-[clamp(2.2rem,4.4vw,3.8rem)]" lead="Five programs." fade="One honest spec sheet." />
            </Reveal>
          </div>
          <Reveal delay={0.12}>
            <Lede className="lg:mb-2">Targets, loss limits and payout rhythm side by side, so you can pick on facts. Fees vary by account size — see the full table below.</Lede>
          </Reveal>
        </div>

        <Stagger className="g-noscroll -mx-5 mt-14 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0" gap={0.07}>
          {programs.map((p) => {
            const price = entryPrice(p);
            const hero = p.key === "access";
            return (
              <StaggerItem key={p.key} className="w-[78%] shrink-0 snap-start sm:w-[44%] lg:w-auto">
                <article className={cn("g-hair flex h-full flex-col rounded-[28px] p-5", hero ? "g-card-emerald" : "g-card-dark")}>
                  <div className="flex items-center justify-between">
                    <span className={cn("g-num grid h-11 min-w-11 place-items-center rounded-[14px] px-2 text-[16px] font-semibold", hero ? "bg-[var(--g-lime)] text-[var(--g-ink)]" : "bg-white/[0.07] text-white")}>
                      {MARK[p.key]}
                    </span>
                    {p.badge ? <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10.5px] font-semibold tracking-wide text-[var(--g-lime-soft)] uppercase">{p.badge}</span> : null}
                  </div>
                  <h3 className="mt-5 text-[19px] font-semibold tracking-[-0.03em] text-white">{p.label}</h3>
                  <p className="mt-1.5 min-h-[40px] text-[13px] leading-snug text-white/55">{p.tagline}</p>
                  <p className="mt-5 flex items-baseline gap-1.5">
                    <span className="text-[12px] text-white/45">{price.label}</span>
                    <span className="g-num g-shade-dark text-[34px] leading-none font-semibold">{price.value}</span>
                  </p>
                  <dl className="mt-5 flex flex-1 flex-col border-t border-white/[0.08]">
                    {rows(p).map((r) => (
                      <div key={r.label} className="border-b border-white/[0.06] py-2.5 last:border-b-0">
                        <dt className="text-[11.5px] text-white/40">{r.label}</dt>
                        <dd className="g-num mt-0.5 text-[14px] font-semibold text-white">{r.value}</dd>
                      </div>
                    ))}
                  </dl>
                  <button type="button" onClick={() => configure(p.key)} className={cn("g-btn group mt-5 h-11 w-full text-[14px]", hero ? "g-btn-lime" : "g-btn-glass")}>
                    Configure
                    <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5" />
                  </button>
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>
        <p className="mt-4 text-[12px] text-white/35">Split shows the standard split → the maximum with the split add-on.</p>
      </Container>
    </Section>
  );
}

/** Every program × every size, on a light sheet. */
export function FeeMatrix() {
  const programs = usePrograms();
  return (
    <section id="compare" className="g-light relative isolate z-10 -mt-12 scroll-mt-24 overflow-clip rounded-t-[44px] pt-24 pb-20 sm:rounded-t-[56px] sm:pt-32 sm:pb-24">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <Reveal className="flex justify-center">
            <Eyebrow tone="light" icon={CalendarRange}>
              Side by side
            </Eyebrow>
          </Reveal>
          <Reveal delay={0.06}>
            <Title tone="light" className="mt-6 text-[clamp(2.2rem,4.4vw,3.8rem)]" lead="Every size." fade="Every price." />
          </Reveal>
          <Reveal delay={0.12} className="flex justify-center">
            <Lede tone="light" className="mt-6 text-center">
              Every program, every account size — one transparent table. All fees one-time, refunded on your first qualifying payout.
            </Lede>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="mt-14">
          <div className="g-card-paper g-hair g-hair-ink overflow-hidden rounded-[28px]">
            <div className="g-noscroll overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-black/[0.07]">
                    <th scope="col" className="sticky left-0 z-10 bg-[#fcfdfc] px-6 py-5 text-[12.5px] font-semibold text-[var(--g-muted-ink)]">
                      Program
                    </th>
                    {ALL_SIZES.map((s) => (
                      <th key={s} scope="col" className="g-num px-3 py-5 text-center text-[13px] font-semibold text-[var(--g-ink)]">
                        {formatSize(s)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {programs.map((p) => (
                    <tr key={p.key} className="border-b border-black/[0.05] last:border-b-0">
                      <th scope="row" className="sticky left-0 z-10 bg-[#fcfdfc] px-6 py-4 font-normal">
                        <span className="flex items-center gap-2">
                          <span className="text-[15px] font-semibold text-[var(--g-ink)]">{p.shortLabel}</span>
                          {p.badge ? <span className="rounded-full bg-[var(--g-ink)] px-2 py-0.5 text-[9.5px] font-semibold tracking-wide text-[var(--g-lime)] uppercase">{p.badge}</span> : null}
                        </span>
                        <span className="mt-0.5 block text-[12px] text-[var(--g-muted-ink)]">
                          {p.profitTarget} · {p.maxDrawdown} max loss
                        </span>
                      </th>
                      {ALL_SIZES.map((s) => {
                        const fee = p.fees[s];
                        return (
                          <td key={s} className="g-num px-3 py-4 text-center text-[15px] font-semibold text-[var(--g-ink)]">
                            {fee != null ? `$${fee.toLocaleString("en-US")}` : <span className="text-black/20">—</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="mt-4 text-center text-[12.5px] text-[var(--g-muted-ink)]">
            All prices in USD. One-time fee. Refunded with your first qualifying payout. Add-ons (100% split, on-demand payouts) sold separately at checkout. Access shows the fee due after you pass.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}

const INCLUDED = [
  { icon: CalendarClock, title: "Unlimited trading period", body: "No deadline on any phase. Trade when your setup is there." },
  { icon: Bot, title: "EAs, bots & news trading", body: "Automate your strategy and trade high-impact releases." },
  { icon: CalendarRange, title: "Weekend holds", body: "Hold positions over the weekend — no opening trades on Saturday or Sunday." },
  { icon: HandCoins, title: "Fee refunded", body: "Your fee comes back with your first qualifying payout." },
];

export function Included() {
  return (
    <section className="relative isolate bg-white pt-4 pb-20 text-[var(--g-ink)] sm:pb-24">
      <Container>
        <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" gap={0.07}>
          {INCLUDED.map(({ icon: Icon, title, body }) => (
            <StaggerItem key={title}>
              <div className="g-card-paper g-hair g-hair-ink h-full rounded-[24px] p-6">
                <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-[var(--g-ink)] text-[var(--g-lime)]">
                  <Icon className="h-5 w-5" strokeWidth={1.9} />
                </span>
                <h3 className="mt-5 text-[17px] font-semibold tracking-[-0.02em]">{title}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-[var(--g-muted-ink)]">{body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}

export function ChallengeFaq() {
  const items = faq.filter((f) => ["rules", "payouts", "general"].includes(f.category ?? "")).slice(0, 6);
  const [open, setOpen] = useState<string | null>(items[0]?.q ?? null);
  return (
    <section className="relative isolate bg-white pt-8 pb-40 text-[var(--g-ink)] sm:pb-48">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <Reveal>
              <Eyebrow tone="light">Challenge questions</Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <Title tone="light" className="mt-6 text-[clamp(2rem,3.6vw,3.2rem)]" lead="What traders ask" fade="before buying." />
            </Reveal>
            <Reveal delay={0.1}>
              <Lede tone="light" className="mt-5">
                Everything you need to know before purchasing a challenge.
              </Lede>
              <Link href={href("rules")} className="group mt-7 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--g-emerald)]">
                See all rules <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Reveal>
          </div>
          <ul className="flex flex-col gap-2.5">
            {items.map((item) => (
              <FaqItem key={item.q} item={item} open={open === item.q} onToggle={() => setOpen(open === item.q ? null : item.q)} />
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

/** The whole /v2/challenges page body. */
export function ChallengesPage() {
  const programs = usePrograms();
  const cat = useCatalogue(programs);
  return (
    <>
      <PageHero
        art="/v2/pt/page-challenges.webp"
        crumb="Challenges"
        eyebrow="Funded accounts"
        icon={Layers}
        lead="Five paths"
        fade="to a funded account."
        lede={`Pick the evaluation that fits how you trade — from the fastest 1-Step to the $${ACCESS_UPFRONT} pay-after-you-pass route. Up to ${compactUsd(cat.maxSize)} in allocation, up to ${cat.maxSplit}% split.`}
      >
        <div className="flex flex-wrap gap-3">
          <Button href="#challenges">Build your challenge</Button>
          <Button href="#compare" kind="glass" arrow={false}>
            Compare every plan
          </Button>
        </div>
        <ul className="mt-8 flex flex-wrap gap-2">
          {[`Fees from ${usd(cat.minFee)}`, `Accounts up to ${compactUsd(cat.maxSize)}`, `Up to ${cat.maxSplit}% split`].map((t) => (
            <li key={t} className="g-hair rounded-full bg-white/[0.06] px-3.5 py-1.5 text-[13px] text-white/75 backdrop-blur-md">
              {t}
            </li>
          ))}
        </ul>
      </PageHero>
      <ProgramColumns />
      <Challenges className="pt-24 sm:pt-28" />
      <FeeMatrix />
      <Included />
      <ChallengeFaq />
      <Cta />
    </>
  );
}
