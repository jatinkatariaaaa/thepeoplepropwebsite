"use client";

import { useMemo, useState } from "react";
import Link from "@/components/IntentLink";
import {
  ArrowRight,
  Ban,
  CalendarClock,
  Check,
  ChevronRight,
  CircleDollarSign,
  Coins,
  FileText,
  Flag,
  Gauge,
  Info,
  Layers,
  MessagesSquare,
  RotateCcw,
  ShieldAlert,
  Target,
  Trophy,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AccountSize, ProgramKey } from "@/data/programs";
import { CONDITIONS, PERKS, PROGRAM_ORDER, pctOf, perks, programDetails, type Guideline, type PhaseSpec } from "@/data/catalogue";
import { Button, Container, Eyebrow, Lede, Section, Title } from "../ui";
import { Reveal, Stagger, StaggerItem } from "../motion";
import { FaqItem } from "../faq";
import { Cta } from "../cta";
import { APP, href } from "../routes";
import { compactUsd, sizesOf, usd, usePrograms } from "../data";

const ART: Record<ProgramKey, { src: string; w: number; h: number; className: string }> = {
  "1-step": { src: "/art/prop-bolt.webp", w: 513, h: 565, className: "w-[300px] lg:w-[380px]" },
  "2-step": { src: "/art/prop-candles.webp", w: 669, h: 815, className: "w-[300px] lg:w-[390px]" },
  "3-step": { src: "/art/prop-tiles.webp", w: 788, h: 768, className: "w-[330px] lg:w-[440px]" },
  instant: { src: "/art/prop-stopwatch.webp", w: 364, h: 504, className: "w-[240px] lg:w-[300px]" },
  access: { src: "/art/prop-card5.webp", w: 812, h: 476, className: "w-[360px] lg:w-[480px]" },
};

const PERK_ICON = { stipend: Coins, "on-demand": Zap, "free-reset": RotateCcw } as const;

const GUIDE: Record<Guideline["status"], { icon: LucideIcon; chip: string; dot: string }> = {
  allowed: { icon: Check, chip: "bg-[var(--g-lime)]/15 text-[var(--g-lime-soft)] ring-[var(--g-lime)]/25", dot: "bg-[var(--g-lime)] text-[var(--g-ink)]" },
  restricted: { icon: ShieldAlert, chip: "bg-amber-400/12 text-amber-200 ring-amber-300/25", dot: "bg-amber-300 text-[var(--g-ink)]" },
  limit: { icon: Gauge, chip: "bg-white/[0.07] text-white/75 ring-white/12", dot: "bg-white/15 text-white" },
  "not-allowed": { icon: Ban, chip: "bg-red-400/12 text-red-200 ring-red-300/25", dot: "bg-red-400 text-[var(--g-ink)]" },
};

const startHref = (key: ProgramKey, size: number) => `${APP.newChallenge}?program=${key}&size=${size}`;

/* ───────────────────────── hero ───────────────────────── */

function Hero({ programKey, size, fee }: { programKey: ProgramKey; size: number; fee: number | null }) {
  const d = programDetails[programKey];
  const art = ART[programKey];
  const isAccess = programKey === "access";
  const chips = [
    d.phases.length ? `${d.phases.length} ${d.phases.length === 1 ? "phase" : "phases"}: ${d.phases.map((p) => `${p.targetPct}%`).join(" + ")}` : "No evaluation",
    `${d.funded.dailyLossPct}% daily · ${d.funded.maxLossPct}% max loss`,
    `First ${PERKS.onDemandPayouts} payouts on demand`,
    `${PERKS.stipend.ratePct}% monthly stipend`,
  ];

  return (
    <section className="relative isolate z-10 overflow-x-clip bg-[#06100d]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-[30%] right-[-10%] h-[90%] w-[70%] rounded-full bg-[radial-gradient(closest-side,rgba(29,102,86,0.55),transparent)]" />
        <div className="absolute bottom-[-40%] left-[-10%] h-[80%] w-[60%] rounded-full bg-[radial-gradient(closest-side,rgba(203,251,69,0.08),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(0deg,#0e1110_6%,rgba(14,17,16,0)_100%)]" />
        <div className="g-grain" />
      </div>

      <Container className="grid items-center gap-10 pt-36 pb-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:pt-44 lg:pb-24">
        <div>
          <Reveal>
            <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-[12.5px] text-white/45">
              <Link href={href("home")} className="transition-colors hover:text-white">
                Home
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link href={href("challenges")} className="transition-colors hover:text-white">
                Challenges
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="text-white/75" aria-current="page">
                {d.name}
              </span>
            </nav>
          </Reveal>
          <Reveal delay={0.04}>
            <Eyebrow icon={Layers}>{d.motto}</Eyebrow>
          </Reveal>
          <Reveal delay={0.1}>
            <h1 className="g-display mt-6 text-[clamp(3rem,6.4vw,5.6rem)]">
              <span className="g-shade-dark">{d.name}</span> <span className="text-[#6c7874]">account.</span>
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-6 max-w-[36rem] text-[17px] leading-[1.6] text-white/65">{d.summary}</p>
          </Reveal>
          <Reveal delay={0.22}>
            <ul className="mt-7 flex flex-wrap gap-2">
              {chips.map((c) => (
                <li key={c} className="g-hair rounded-full bg-white/[0.06] px-3.5 py-1.5 text-[13px] text-white/80 backdrop-blur-md">
                  {c}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.28}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Button href={startHref(programKey, size)}>{isAccess ? `Start for $${PERKS.accessUpfront}` : `Start ${d.name}${fee != null ? ` · ${usd(fee)}` : ""}`}</Button>
              <Button href="#objectives" kind="glass" arrow={false}>
                See the objectives
              </Button>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.2} className="relative hidden justify-center lg:flex">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={art.src} width={art.w} height={art.h} alt="" className={cn("g-float h-auto drop-shadow-[0_60px_80px_rgba(0,0,0,0.55)]", art.className)} />
        </Reveal>
      </Container>

      <Container className="pb-10">
        <nav aria-label="Account types" className="g-noscroll -mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:px-0">
          {PROGRAM_ORDER.map((k) => {
            const on = k === programKey;
            return (
              <Link
                key={k}
                href={`${href("challenges")}/${k}`}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "shrink-0 rounded-full px-5 py-2.5 text-[14px] font-semibold transition-colors duration-300",
                  on ? "bg-white text-[var(--g-ink)]" : "g-hair bg-white/[0.05] text-white/65 hover:bg-white/[0.1] hover:text-white",
                )}
              >
                {programDetails[k].name}
              </Link>
            );
          })}
        </nav>
      </Container>
    </section>
  );
}

/* ───────────────────────── size + fee ───────────────────────── */

function SizePicker({ sizes, size, onPick }: { sizes: number[]; size: number; onPick: (s: number) => void }) {
  return (
    <div role="radiogroup" aria-label="Account size" className="g-noscroll -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      {sizes.map((s) => {
        const on = s === size;
        return (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onPick(s)}
            className={cn(
              "g-num shrink-0 rounded-[16px] px-5 py-3 text-[15px] font-semibold transition-all duration-300",
              on ? "bg-[var(--g-lime)] text-[var(--g-ink)] shadow-[0_14px_30px_-14px_rgba(203,251,69,0.7)]" : "g-hair bg-white/[0.05] text-white/70 hover:bg-white/[0.1] hover:text-white",
            )}
          >
            {compactUsd(s)}
          </button>
        );
      })}
    </div>
  );
}

/* ───────────────────────── phase track ───────────────────────── */

function PhaseCard({ phase, size, index, total }: { phase: PhaseSpec; size: number; index: number; total: number }) {
  const funded = phase.key === "funded";
  const rows = [
    ...(phase.targetPct != null ? [{ icon: Target, label: "Profit target", pct: phase.targetPct, tone: "lime" as const }] : []),
    { icon: Gauge, label: "Max daily loss", pct: phase.dailyLossPct, tone: "red" as const },
    { icon: ShieldAlert, label: "Max overall loss", pct: phase.maxLossPct, tone: "red" as const },
  ];
  return (
    <article className={cn("g-hair relative flex h-full flex-col rounded-[30px] p-6 sm:p-7", funded ? "g-card-emerald" : "g-card-dark")}>
      <div className="flex items-center justify-between gap-3">
        <span className={cn("g-num grid h-10 min-w-10 place-items-center rounded-[13px] px-2 text-[14px] font-semibold", funded ? "bg-[var(--g-lime)] text-[var(--g-ink)]" : "bg-white/[0.08] text-white")}>
          {funded ? <Trophy className="h-[18px] w-[18px]" strokeWidth={2} /> : `0${index + 1}`}
        </span>
        <span className="text-[12px] font-medium text-white/45">{funded ? "After you pass" : `Step ${index + 1} of ${total}`}</span>
      </div>
      <h3 className="mt-5 text-[22px] font-semibold tracking-[-0.03em] text-white">{phase.label}</h3>
      <p className="mt-2 min-h-[44px] text-[14px] leading-relaxed text-white/60">{phase.summary}</p>

      <dl className="mt-5 flex flex-1 flex-col gap-2">
        {rows.map(({ icon: Icon, label, pct, tone }) => (
          <div key={label} className="flex items-center justify-between gap-3 rounded-[16px] bg-black/20 px-4 py-3 ring-1 ring-white/[0.06]">
            <dt className="flex items-center gap-2.5 text-[13.5px] text-white/65">
              <Icon className={cn("h-4 w-4", tone === "lime" ? "text-[var(--g-lime)]" : "text-red-300")} strokeWidth={2} />
              {label}
            </dt>
            <dd className="text-right">
              <span className={cn("g-num text-[17px] font-semibold", tone === "lime" ? "text-[var(--g-lime-soft)]" : "text-white")}>{pct}%</span>
              <span className="g-num ml-2 text-[12.5px] text-white/45">{usd(pctOf(size, pct))}</span>
            </dd>
          </div>
        ))}
        <div className="flex items-center justify-between gap-3 px-4 pt-2 text-[13px] text-white/55">
          <dt className="flex items-center gap-2.5">
            <CalendarClock className="h-4 w-4" strokeWidth={2} />
            {funded ? "Payouts" : "Minimum trading days"}
          </dt>
          <dd className="g-num font-semibold text-white/85">{funded ? `First ${PERKS.onDemandPayouts} on demand` : phase.minTradingDays}</dd>
        </div>
        <div className="flex items-center justify-between gap-3 px-4 text-[13px] text-white/55">
          <dt className="flex items-center gap-2.5">
            <Flag className="h-4 w-4" strokeWidth={2} />
            Time limit
          </dt>
          <dd className="font-semibold text-white/85">None</dd>
        </div>
      </dl>
    </article>
  );
}

/* ───────────────────────── page ───────────────────────── */

export function ProgramPage({ programKey }: { programKey: ProgramKey }) {
  const d = programDetails[programKey];
  const live = usePrograms().find((p) => p.key === programKey);
  const sizes = useMemo(() => (live ? (sizesOf(live) as number[]) : []), [live]);
  const [picked, setPicked] = useState<number>(100_000);
  const size = sizes.includes(picked) ? picked : (sizes[Math.min(2, sizes.length - 1)] ?? 25_000);
  const fee = live?.fees[size as AccountSize] ?? null;
  const isAccess = programKey === "access";
  const stages = [...d.phases, d.funded];
  const split = live?.profitSplit ?? 80;

  const [openTerm, setOpenTerm] = useState<string | null>(d.terms[0]?.title ?? null);
  const [openFaq, setOpenFaq] = useState<string | null>(d.faqs[0]?.q ?? null);

  const payoutFacts = [
    { icon: Zap, label: "Payouts 1 to 5", value: "On demand", note: "Request whenever you have profit" },
    { icon: CalendarClock, label: "Payout 6 onward", value: `Every ${PERKS.payoutCycleDays} days`, note: "One request per cycle" },
    { icon: CircleDollarSign, label: "Your share", value: `${split}%`, note: `${live?.profitSplitMax ?? 100}% with the split add-on` },
    { icon: Gauge, label: "Consistency", value: `${d.funded.consistencyPct}%`, note: "Best day's share of a payout" },
    { icon: Wallet, label: "Minimum payout", value: `$${PERKS.minPayout}`, note: "USDT or bank transfer" },
    { icon: Coins, label: "Monthly stipend", value: usd(pctOf(size, PERKS.stipend.ratePct)), note: `${PERKS.stipend.ratePct}% of a ${compactUsd(size)} account` },
  ];

  return (
    <>
      <Hero programKey={programKey} size={size} fee={fee} />

      {/* sizes and fee */}
      <Section shell={false} className="pt-6 pb-20 sm:pb-24">
        <Container>
          <div className="g-glass g-hair grid gap-8 rounded-[36px] p-6 sm:p-9 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-center lg:p-11">
            <div className="min-w-0">
              <Reveal>
                <Eyebrow icon={Wallet}>Account size</Eyebrow>
              </Reveal>
              <Reveal delay={0.06}>
                <Title as="h2" className="mt-5 text-[clamp(1.9rem,3.4vw,2.8rem)]" lead="Pick a size." fade="Every number on this page follows it." />
              </Reveal>
              <Reveal delay={0.12} className="mt-7">
                <SizePicker sizes={sizes} size={size} onPick={setPicked} />
              </Reveal>
              <Reveal delay={0.16}>
                <p className="mt-5 text-[13.5px] leading-relaxed text-white/50">{d.feeNote}</p>
              </Reveal>
            </div>
            <Reveal delay={0.14}>
              <div className="g-card-dark g-hair relative overflow-hidden rounded-[28px] p-6 sm:p-7">
                <span aria-hidden="true" className="pointer-events-none absolute -top-24 -right-16 h-60 w-60 rounded-full bg-[radial-gradient(closest-side,rgba(203,251,69,0.16),transparent)]" />
                <p className="relative text-[12px] font-medium tracking-wide text-white/50 uppercase">{isAccess ? "Due today" : "One-time fee"}</p>
                <p className="relative mt-2 flex items-baseline gap-3">
                  <span className="g-num g-shade-lime text-[54px] leading-none font-semibold tracking-[-0.04em]">{isAccess ? `$${PERKS.accessUpfront}` : fee != null ? usd(fee) : "—"}</span>
                  <span className="g-num text-[15px] text-white/55">{compactUsd(size)} account</span>
                </p>
                {isAccess && fee != null ? (
                  <p className="relative mt-3 text-[13.5px] leading-relaxed text-white/60">
                    Then <b className="g-num font-semibold text-white">{usd(fee - PERKS.accessUpfront)}</b>, due within {PERKS.accessActivationHours} hours of passing Phase 2. Nothing more if you do not pass.
                  </p>
                ) : null}
                <Link href={startHref(programKey, size)} className="g-btn g-btn-lime group relative mt-6 w-full">
                  {isAccess ? "Start the evaluation" : `Start ${d.name}`}
                  <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      {/* objectives */}
      <Section id="objectives" shell={false} className="pb-28 sm:pb-36">
        <Container>
          <div className="grid items-end gap-6 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <Reveal>
                <Eyebrow icon={Target}>Trading objectives</Eyebrow>
              </Reveal>
              <Reveal delay={0.06}>
                <Title className="mt-6 text-[clamp(2.2rem,4.4vw,3.8rem)]" lead={d.phases.length ? "What it takes to pass," : "No evaluation."} fade={d.phases.length ? "and what stays after." : "Only two limits."} />
              </Reveal>
            </div>
            <Reveal delay={0.12}>
              <Lede className="lg:mb-2">
                Dollar values are for a {compactUsd(size)} account. Loss limits are measured on equity, so floating losses count. The daily limit resets at {CONDITIONS.dayRollover}.
              </Lede>
            </Reveal>
          </div>

          <Stagger className={cn("mt-12 grid gap-4", stages.length === 1 ? "lg:max-w-xl" : stages.length === 2 ? "md:grid-cols-2" : stages.length === 3 ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2 xl:grid-cols-4")} gap={0.08}>
            {stages.map((p, i) => (
              <StaggerItem key={p.key}>
                <PhaseCard phase={p} size={size} index={i} total={d.phases.length} />
              </StaggerItem>
            ))}
          </Stagger>

          <Reveal delay={0.1}>
            <ol className="g-hair mt-4 grid gap-px overflow-hidden rounded-[26px] bg-white/[0.06] sm:grid-cols-2 lg:grid-cols-4">
              {d.journey.map((j, i) => (
                <li key={j.title} className="bg-[#121615] p-5 sm:p-6">
                  <span className="g-num text-[12px] font-semibold text-[var(--g-lime)]">{String(i + 1).padStart(2, "0")}</span>
                  <p className="mt-2 text-[15.5px] font-semibold tracking-[-0.02em] text-white">{j.title}</p>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-white/55">{j.body}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </Container>
      </Section>

      {/* payouts + perks, on the light sheet */}
      <section id="payouts" className="g-light relative isolate z-10 -mt-12 scroll-mt-24 overflow-clip rounded-t-[44px] pt-24 pb-24 sm:rounded-t-[56px] sm:pt-32 sm:pb-32">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Reveal className="flex justify-center">
              <Eyebrow tone="light" icon={CircleDollarSign}>
                Payouts and perks
              </Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <Title tone="light" className="mt-6 text-[clamp(2.2rem,4.4vw,3.8rem)]" lead="Paid when you ask." fade="Paid for showing up." />
            </Reveal>
            <Reveal delay={0.12} className="flex justify-center">
              <Lede tone="light" className="mt-6 text-center">
                Your first five payouts have no waiting period, and every active account earns a monthly stipend from the day it opens.
              </Lede>
            </Reveal>
          </div>

          <Stagger className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" gap={0.06}>
            {payoutFacts.map(({ icon: Icon, label, value, note }) => (
              <StaggerItem key={label}>
                <div className="g-card-paper g-hair g-hair-ink flex h-full items-start gap-4 rounded-[24px] p-5">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[var(--g-ink)] text-[var(--g-lime)]">
                    <Icon className="h-5 w-5" strokeWidth={1.9} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12.5px] text-[var(--g-muted-ink)]">{label}</p>
                    <p className="g-num mt-0.5 text-[21px] font-semibold tracking-[-0.03em] text-[var(--g-ink)]">{value}</p>
                    <p className="mt-0.5 text-[13px] text-[var(--g-muted-ink)]">{note}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </Stagger>

          <Stagger className="mt-3 grid gap-3 lg:grid-cols-3" gap={0.08}>
            {perks.map((p) => {
              const Icon = PERK_ICON[p.key];
              const unavailable = p.key === "free-reset" && size < PERKS.freeReset.minSize;
              return (
                <StaggerItem key={p.key}>
                  <article className="g-card-dark g-hair relative flex h-full flex-col overflow-hidden rounded-[28px] p-6 text-white sm:p-7">
                    <span aria-hidden="true" className="pointer-events-none absolute -top-20 -right-16 h-52 w-52 rounded-full bg-[radial-gradient(closest-side,rgba(169,220,207,0.18),transparent)]" />
                    <div className="relative flex items-center justify-between">
                      <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-[var(--g-lime)] text-[var(--g-ink)]">
                        <Icon className="h-5 w-5" strokeWidth={2} />
                      </span>
                      {unavailable ? <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/60">From {compactUsd(PERKS.freeReset.minSize)} accounts</span> : null}
                    </div>
                    <p className="relative mt-6 flex items-baseline gap-2">
                      <span className="g-num g-shade-lime text-[44px] leading-none font-semibold tracking-[-0.04em]">{p.key === "stipend" ? usd(pctOf(size, PERKS.stipend.ratePct)) : p.figure}</span>
                      <span className="text-[13px] text-white/55">{p.key === "stipend" ? "a month" : ""}</span>
                    </p>
                    <h3 className="relative mt-4 text-[19px] font-semibold tracking-[-0.02em]">{p.title}</h3>
                    <p className="relative mt-2 text-[14px] leading-relaxed text-white/60">{p.summary}</p>
                    <ul className="relative mt-5 grid gap-2 border-t border-white/[0.08] pt-5">
                      {p.points.slice(0, 3).map((pt) => (
                        <li key={pt} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-white/60">
                          <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-[var(--g-lime)]" strokeWidth={3} />
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

      {/* guidelines */}
      <section id="guidelines" className="relative isolate bg-white pb-36 text-[var(--g-ink)] sm:pb-44">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <Reveal>
                <Eyebrow tone="light" icon={Info}>
                  Guidelines
                </Eyebrow>
              </Reveal>
              <Reveal delay={0.06}>
                <Title tone="light" className="mt-6 text-[clamp(2rem,3.6vw,3.2rem)]" lead="How you may trade" fade={`a ${d.name} account.`} />
              </Reveal>
              <Reveal delay={0.1}>
                <Lede tone="light" className="mt-5">
                  Only the two loss limits can breach an account. Everything here either is allowed, or is checked when you request a payout.
                </Lede>
                <dl className="mt-7 grid gap-2 text-[13.5px]">
                  {[
                    ["Platform", CONDITIONS.platform],
                    ["Leverage", CONDITIONS.leverage],
                    ["Commission", CONDITIONS.commission],
                    ["Markets", "18 forex pairs, gold, BTC and ETH"],
                  ].map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-4 border-b border-black/[0.07] pb-2">
                      <dt className="text-[var(--g-muted-ink)]">{k}</dt>
                      <dd className="text-right font-semibold">{v}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </div>

            <Stagger className="grid gap-3 sm:grid-cols-2" gap={0.05}>
              {d.guidelines.map((g) => {
                const s = GUIDE[g.status];
                return (
                  <StaggerItem key={g.title}>
                    <article className="g-card-dark g-hair h-full rounded-[24px] p-5 text-white sm:p-6">
                      <div className="flex items-center justify-between gap-3">
                        <span className={cn("grid h-9 w-9 place-items-center rounded-full", s.dot)}>
                          <s.icon className="h-4 w-4" strokeWidth={2.4} />
                        </span>
                        <span className={cn("rounded-full px-2.5 py-1 text-[11.5px] font-semibold ring-1", s.chip)}>{g.tag}</span>
                      </div>
                      <h3 className="mt-4 text-[17px] font-semibold tracking-[-0.02em]">{g.title}</h3>
                      <p className="mt-2 text-[14px] leading-relaxed text-white/60">{g.body}</p>
                    </article>
                  </StaggerItem>
                );
              })}
            </Stagger>
          </div>
        </Container>
      </section>

      {/* terms */}
      <Section id="terms" className="z-10 -mt-12 scroll-mt-24 rounded-t-[44px] pt-24 pb-24 sm:rounded-t-[56px] sm:pt-32 sm:pb-32">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <Reveal>
                <Eyebrow icon={FileText}>Program terms</Eyebrow>
              </Reveal>
              <Reveal delay={0.06}>
                <Title className="mt-6 text-[clamp(2rem,3.6vw,3.2rem)]" lead={`${d.name} terms`} fade="and conditions." />
              </Reveal>
              <Reveal delay={0.1}>
                <Lede className="mt-5">The agreement for this account type, in plain language. It applies together with our general terms and policies.</Lede>
                <ul className="mt-6 grid gap-2 text-[14px]">
                  {[
                    ["Terms of Service", href("terms")],
                    ["Payout Policy", href("payout-policy")],
                    ["Refund Policy", href("refund-policy")],
                    ["Risk Disclosure", href("risk-disclosure")],
                  ].map(([label, to]) => (
                    <li key={to}>
                      <Link href={to} className="group inline-flex items-center gap-1.5 font-semibold text-[var(--g-lime)]">
                        {label} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>

            <ul className="flex flex-col gap-2.5">
              {d.terms.map((t) => {
                const open = openTerm === t.title;
                return (
                  <li key={t.title} className={cn("rounded-[22px] transition-colors duration-500", open ? "g-glass g-hair" : "bg-white/[0.03] hover:bg-white/[0.06]")}>
                    <h3>
                      <button type="button" aria-expanded={open} onClick={() => setOpenTerm(open ? null : t.title)} className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left">
                        <span className={cn("text-[16.5px] font-semibold tracking-[-0.02em]", open ? "text-white" : "text-white/80")}>{t.title}</span>
                        <span className={cn("g-num shrink-0 text-[12.5px]", open ? "text-[var(--g-lime)]" : "text-white/35")}>{t.clauses.length} clauses</span>
                      </button>
                    </h3>
                    {open ? (
                      <ol className="grid gap-3 px-6 pb-6">
                        {t.clauses.map((c, i) => (
                          <li key={i} className="flex gap-3 text-[14.5px] leading-relaxed text-white/65">
                            <span className="g-num mt-0.5 shrink-0 text-[12px] text-white/35">
                              {t.title.split(".")[0]}.{i + 1}
                            </span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ol>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </div>
        </Container>
      </Section>

      {/* FAQ */}
      <section id="faq" className="g-light relative isolate z-10 -mt-12 scroll-mt-24 overflow-clip rounded-t-[44px] pt-24 pb-40 sm:rounded-t-[56px] sm:pt-32 sm:pb-48">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <Reveal>
                <Eyebrow tone="light" icon={MessagesSquare}>
                  {d.name} questions
                </Eyebrow>
              </Reveal>
              <Reveal delay={0.06}>
                <Title tone="light" className="mt-6 text-[clamp(2rem,3.6vw,3.2rem)]" lead="Asked about" fade={`${d.name}.`} />
              </Reveal>
              <Reveal delay={0.1}>
                <Lede tone="light" className="mt-5">
                  Answers specific to this account type. The assistant in the corner can answer anything else from the same rulebook.
                </Lede>
                <Link href={`${href("faqs")}?program=${programKey}`} className="group mt-7 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--g-emerald)]">
                  Search every question <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Reveal>
            </div>
            <ul className="flex flex-col gap-2.5">
              {d.faqs.map((item) => (
                <FaqItem key={item.q} item={item} open={openFaq === item.q} onToggle={() => setOpenFaq(openFaq === item.q ? null : item.q)} />
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <Cta
        size="md"
        title={
          <>
            <span className="g-shade-dark">Ready for </span>
            <span className="g-shade-lime">{d.name}?</span>
          </>
        }
        lede={isAccess ? `Start the evaluation for $${PERKS.accessUpfront}. Pay the rest only after you pass.` : "Your first five payouts are on demand, and your account earns a stipend from day one."}
        primary={{ label: isAccess ? `Start for $${PERKS.accessUpfront}` : `Start ${d.name}`, href: startHref(programKey, size) }}
        secondary={{ label: "Compare all accounts", href: href("challenges") }}
      />
    </>
  );
}
