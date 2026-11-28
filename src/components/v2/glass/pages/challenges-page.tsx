"use client";

import { useState } from "react";
import Link from "@/components/IntentLink";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CalendarRange, Check, Coins, Gift, Layers, MessagesSquare, RotateCcw, Trophy, Zap } from "lucide-react";
import { ALL_SIZES, formatSize, type ProgramKey } from "@/data/programs";
import { PERKS, generalFaqs, perks, programDetails } from "@/data/catalogue";
import { cn } from "@/lib/utils";
import { Button, Container, Eyebrow, Lede, Section, Title } from "../ui";
import { EASE, Reveal, Stagger, StaggerItem } from "../motion";
import { FaqItem } from "../faq";
import { ACCESS_UPFRONT, compactUsd, entryPrice, usd, useCatalogue, usePrograms, useSelectedProgram } from "../data";
import { PageHero } from "../page-hero";
import { Challenges } from "../challenges";
import { Cta } from "../cta";
import { APP, href, programHref } from "../routes";

const PERK_ICON = { stipend: Coins, "on-demand": Zap, "free-reset": RotateCcw } as const;

/** One program at a time: a rail of five routes, and the route drawn out beside it. */
function ProgramExplorer() {
  const programs = usePrograms();
  const [selected, setSelected] = useSelectedProgram();
  const program = programs.find((p) => p.key === selected) ?? programs[0];
  const d = programDetails[program.key];
  const price = entryPrice(program);
  const nodes = [...d.phases.map((p) => ({ label: p.label, value: `${p.targetPct}%`, note: "target" })), { label: "Funded", value: `${program.profitSplit}%`, note: "split" }];

  const configure = (k: ProgramKey) => {
    setSelected(k);
    document.getElementById("challenges")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Section shell={false} className="pt-10 pb-24 sm:pb-32">
      <Container>
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <Reveal>
              <Eyebrow icon={Layers}>Account types</Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <Title className="mt-6 text-[clamp(2.2rem,4.4vw,3.8rem)]" lead="Five routes." fade="Pick the one you would actually pass." />
            </Reveal>
          </div>
          <Reveal delay={0.12}>
            <Lede className="lg:mb-2">Each account type has its own page with the objectives, payout rules, program terms and questions. Start here to see how they differ.</Lede>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="mt-12">
          <div className="grid gap-3 lg:grid-cols-[320px_minmax(0,1fr)]">
            {/* rail */}
            <div role="tablist" aria-label="Account types" className="g-noscroll -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
              {programs.map((p) => {
                const on = p.key === program.key;
                const e = entryPrice(p);
                return (
                  <button
                    key={p.key}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => setSelected(p.key)}
                    className={cn(
                      "group relative flex w-[230px] shrink-0 items-center justify-between gap-3 rounded-[22px] p-4 text-left transition-colors duration-500 lg:w-auto",
                      on ? "g-glass g-hair" : "bg-white/[0.03] hover:bg-white/[0.06]",
                    )}
                  >
                    <span className="min-w-0">
                      <span className={cn("block text-[17px] font-semibold tracking-[-0.02em]", on ? "text-white" : "text-white/75")}>{programDetails[p.key].name}</span>
                      <span className="mt-0.5 block truncate text-[12.5px] text-white/45">{programDetails[p.key].motto}</span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="block text-[10.5px] text-white/40">{e.label}</span>
                      <span className={cn("g-num block text-[17px] font-semibold", on ? "text-[var(--g-lime)]" : "text-white/70")}>{e.value}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            {/* stage */}
            <div className={cn("g-hair relative overflow-hidden rounded-[32px] p-6 sm:p-9", program.key === "access" ? "g-card-emerald" : "g-card-dark")}>
              <span aria-hidden="true" className="pointer-events-none absolute -top-32 -right-24 h-80 w-80 rounded-full bg-[radial-gradient(closest-side,rgba(169,220,207,0.2),transparent)]" />
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={program.key} role="tabpanel" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.4, ease: EASE }} className="relative">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      {program.badge ? <span className="rounded-full bg-white/10 px-2.5 py-1 text-[10.5px] font-semibold tracking-wide text-[var(--g-lime-soft)] uppercase">{program.badge}</span> : null}
                      <h3 className="mt-3 text-[30px] font-semibold tracking-[-0.035em] text-white sm:text-[36px]">{d.name}</h3>
                      <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-white/60">{d.summary}</p>
                    </div>
                    <p className="text-right">
                      <span className="block text-[12px] text-white/45">{price.label}</span>
                      <span className="g-num g-shade-lime block text-[44px] leading-none font-semibold tracking-[-0.04em]">{price.value}</span>
                    </p>
                  </div>

                  {/* the route */}
                  <ol className="mt-8 flex items-stretch gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                    {nodes.map((n, i) => {
                      const last = i === nodes.length - 1;
                      return (
                        <li key={n.label} className="flex min-w-[124px] flex-1 items-center gap-2">
                          <div className={cn("flex-1 rounded-[18px] px-4 py-3.5 ring-1", last ? "bg-[var(--g-lime)] text-[var(--g-ink)] ring-transparent" : "bg-black/25 text-white ring-white/[0.08]")}>
                            <p className={cn("flex items-center gap-1.5 text-[11.5px] font-semibold", last ? "text-[var(--g-ink)]/70" : "text-white/50")}>
                              {last ? <Trophy className="h-3.5 w-3.5" /> : null}
                              {n.label}
                            </p>
                            <p className="g-num mt-1 text-[22px] leading-none font-semibold tracking-[-0.03em]">
                              {n.value} <span className={cn("text-[11.5px] font-medium", last ? "text-[var(--g-ink)]/65" : "text-white/45")}>{n.note}</span>
                            </p>
                          </div>
                          {!last ? <ArrowRight className="h-4 w-4 shrink-0 text-white/30" /> : null}
                        </li>
                      );
                    })}
                  </ol>

                  <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      ["Max daily loss", `${d.funded.dailyLossPct}%`],
                      ["Max overall loss", `${d.funded.maxLossPct}%`],
                      ["Min trading days", d.phases.length ? String(d.phases[0].minTradingDays) : "None"],
                      ["Time limit", "None"],
                    ].map(([k, v]) => (
                      <div key={k} className="rounded-[16px] bg-black/20 px-4 py-3 ring-1 ring-white/[0.06]">
                        <dt className="text-[11.5px] text-white/45">{k}</dt>
                        <dd className="g-num mt-0.5 text-[17px] font-semibold text-white">{v}</dd>
                      </div>
                    ))}
                  </dl>

                  <ul className="mt-5 grid gap-1.5 sm:grid-cols-3">
                    {d.bestFor.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-[13px] leading-snug text-white/60">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--g-lime)]" strokeWidth={3} />
                        {b}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-7 flex flex-wrap gap-2.5">
                    <Link href={programHref(program.key)} className="g-btn g-btn-lime group">
                      Full {d.name} details
                      <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5" />
                    </Link>
                    <button type="button" onClick={() => configure(program.key)} className="g-btn g-btn-glass">
                      Configure and price
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

/** The three things every account comes with, as figures. */
function PerksBand() {
  return (
    <section id="perks" className="g-light relative isolate z-10 -mt-12 scroll-mt-24 overflow-clip rounded-t-[44px] pt-24 pb-24 sm:rounded-t-[56px] sm:pt-32 sm:pb-28">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <Reveal className="flex justify-center">
            <Eyebrow tone="light" icon={Gift}>
              On every account
            </Eyebrow>
          </Reveal>
          <Reveal delay={0.06}>
            <Title tone="light" className="mt-6 text-[clamp(2.2rem,4.4vw,3.8rem)]" lead="Three things" fade="no other account gives you." />
          </Reveal>
          <Reveal delay={0.12} className="flex justify-center">
            <Lede tone="light" className="mt-6 text-center">
              They are part of the account, not add-ons. Whichever route and size you choose, these come with it.
            </Lede>
          </Reveal>
        </div>

        <Stagger className="mt-12 grid gap-3 lg:grid-cols-3" gap={0.08}>
          {perks.map((p) => {
            const Icon = PERK_ICON[p.key];
            return (
              <StaggerItem key={p.key}>
                <article className="g-card-paper g-hair g-hair-ink flex h-full flex-col rounded-[30px] p-7 sm:p-8">
                  <span className="grid h-12 w-12 place-items-center rounded-[16px] bg-[var(--g-ink)] text-[var(--g-lime)]">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <p className="mt-7 flex items-baseline gap-3">
                    <span className="g-num g-shade-light text-[72px] leading-none font-semibold tracking-[-0.05em]">{p.figure}</span>
                  </p>
                  <p className="mt-1 text-[14px] text-[var(--g-muted-ink)]">{p.figureNote}</p>
                  <h3 className="mt-6 text-[21px] font-semibold tracking-[-0.025em]">{p.title}</h3>
                  <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--g-muted-ink)]">{p.summary}</p>
                  <ul className="mt-5 grid gap-2.5 border-t border-black/[0.07] pt-5">
                    {p.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-[var(--g-muted-ink)]">
                        <span className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-[var(--g-emerald)]/10">
                          <Check className="h-3 w-3 text-[var(--g-emerald)]" strokeWidth={3} />
                        </span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>
      </Container>
    </section>
  );
}

/** Every program × every size. */
function FeeMatrix() {
  const programs = usePrograms();
  return (
    <section id="compare" className="g-light relative isolate z-10 -mt-12 scroll-mt-24 overflow-clip rounded-t-[44px] pt-24 pb-20 sm:rounded-t-[56px] sm:pt-32 sm:pb-24">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <Reveal className="flex justify-center">
            <Eyebrow tone="light" icon={CalendarRange}>
              Price list
            </Eyebrow>
          </Reveal>
          <Reveal delay={0.06}>
            <Title tone="light" className="mt-6 text-[clamp(2.2rem,4.4vw,3.8rem)]" lead="Every size." fade="Every price." />
          </Reveal>
        </div>

        <Reveal delay={0.1} className="mt-12">
          <div className="g-card-paper g-hair g-hair-ink overflow-hidden rounded-[28px]">
            <div className="g-noscroll overflow-x-auto">
              <table className="w-full min-w-[860px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-black/[0.07]">
                    <th scope="col" className="sticky left-0 z-10 bg-[#fcfdfc] px-6 py-5 text-[12.5px] font-semibold text-[var(--g-muted-ink)]">
                      Account type
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
                        <Link href={programHref(p.key)} className="group flex items-center gap-2">
                          <span className="text-[15px] font-semibold text-[var(--g-ink)] underline-offset-4 group-hover:underline">{p.shortLabel}</span>
                          {p.badge ? <span className="rounded-full bg-[var(--g-ink)] px-2 py-0.5 text-[9.5px] font-semibold tracking-wide text-[var(--g-lime)] uppercase">{p.badge}</span> : null}
                        </Link>
                        <span className="mt-0.5 block text-[12px] text-[var(--g-muted-ink)]">
                          {p.key === "access" ? `$${ACCESS_UPFRONT} to start · fee after passing` : p.key === "instant" ? "No evaluation" : `${p.profitTarget} target`} · {p.maxDrawdown} max loss
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
          <p className="mx-auto mt-4 max-w-3xl text-center text-[12.5px] leading-relaxed text-[var(--g-muted-ink)]">
            Prices in USD, charged once. 1-Step, 2-Step and 3-Step fees are refunded with your first payout. Access shows the fee due after you pass; ${ACCESS_UPFRONT} of it is paid at the start. Add-ons are priced at checkout.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}

function StartFaq() {
  const items = generalFaqs.filter((f) => f.category === "Getting started" || f.category === "Perks").slice(0, 7);
  const [open, setOpen] = useState<string | null>(items[0]?.q ?? null);
  return (
    <section className="relative isolate bg-white pt-8 pb-40 text-[var(--g-ink)] sm:pb-48">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <Eyebrow tone="light" icon={MessagesSquare}>
                Before you buy
              </Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <Title tone="light" className="mt-6 text-[clamp(2rem,3.6vw,3.2rem)]" lead="What traders ask" fade="first." />
            </Reveal>
            <Reveal delay={0.1}>
              <Lede tone="light" className="mt-5">
                Each account type also has its own questions on its page. For everything else, the help centre has the full list.
              </Lede>
              <Link href={href("faqs")} className="group mt-7 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--g-emerald)]">
                Open the help centre <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
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

/** The whole /challenges page body. */
export function ChallengesPage() {
  const programs = usePrograms();
  const cat = useCatalogue(programs);
  return (
    <>
      <PageHero
        art="/art/page-challenges.webp"
        crumb="Challenges"
        eyebrow="Funded accounts"
        icon={Layers}
        lead="Five paths"
        fade="to a funded account."
        lede={`From a single 10% target to a $${ACCESS_UPFRONT} start you only pay for once you pass. Accounts up to ${compactUsd(cat.maxSize)}, a ${PERKS.stipend.ratePct}% stipend every month and your first ${PERKS.onDemandPayouts} payouts on demand.`}
      >
        <div className="flex flex-wrap gap-3">
          <Button href={APP.newChallenge}>Start an account</Button>
          <Button href="#compare" kind="glass" arrow={false}>
            See every price
          </Button>
        </div>
        <ul className="mt-8 flex flex-wrap gap-2">
          {[`Fees from ${usd(cat.minFee)}`, `Up to ${cat.maxSplit}% split`, "No time limit", `Free reset on ${compactUsd(PERKS.freeReset.minSize)}+`].map((t) => (
            <li key={t} className="g-hair rounded-full bg-white/[0.06] px-3.5 py-1.5 text-[13px] text-white/75 backdrop-blur-md">
              {t}
            </li>
          ))}
        </ul>
      </PageHero>
      <ProgramExplorer />
      <PerksBand />
      <Challenges className="z-10 -mt-12 rounded-t-[44px] pt-28 sm:rounded-t-[56px] sm:pt-36" />
      <FeeMatrix />
      <StartFaq />
      <Cta />
    </>
  );
}
