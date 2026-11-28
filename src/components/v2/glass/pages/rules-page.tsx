"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "@/components/IntentLink";
import {
  ArrowRight,
  Ban,
  CalendarDays,
  Check,
  CircleDollarSign,
  Hourglass,
  Newspaper,
  ScrollText,
  Shield,
  SlidersHorizontal,
  UserCheck,
  X,
  type LucideIcon,
} from "lucide-react";
import { CONDITIONS, PERKS, PROGRAM_ORDER, programDetails, prohibitedPractices } from "@/data/catalogue";
import { cn } from "@/lib/utils";
import { LossLimitLab } from "@/components/tools/loss-limit-lab";
import { Button, Container, Eyebrow, Lede, Section, Title } from "../ui";
import { Reveal } from "../motion";
import { PageHero } from "../page-hero";
import { Cta } from "../cta";
import { href, programHref } from "../routes";
import { compactUsd, sizesOf, usePrograms } from "../data";

/* ───────────────────────── objectives matrix ───────────────────────── */

function ObjectivesMatrix() {
  const programs = usePrograms();
  const rows: { label: string; note?: string; cell: (k: (typeof PROGRAM_ORDER)[number]) => string }[] = [
    { label: "Evaluation", cell: (k) => (programDetails[k].phases.length ? `${programDetails[k].phases.length} ${programDetails[k].phases.length === 1 ? "phase" : "phases"}` : "None") },
    { label: "Profit targets", cell: (k) => (programDetails[k].phases.length ? programDetails[k].phases.map((p) => `${p.targetPct}%`).join(" · ") : "—") },
    { label: "Max daily loss", note: "of the day's starting balance", cell: (k) => `${programDetails[k].funded.dailyLossPct}%` },
    { label: "Max overall loss", note: "static, from the starting balance", cell: (k) => `${programDetails[k].funded.maxLossPct}%` },
    { label: "Min trading days", note: "per phase", cell: (k) => (programDetails[k].phases.length ? String(programDetails[k].phases[0].minTradingDays) : "—") },
    { label: "Time limit", cell: () => "None" },
    { label: "Payout consistency", note: "best day's share of a payout", cell: (k) => `${programDetails[k].funded.consistencyPct}%` },
    { label: "Payouts", cell: () => `First ${PERKS.onDemandPayouts} on demand` },
    { label: "Fee refunded", note: "with the first payout", cell: (k) => (programDetails[k].feeRefund ? "yes" : "no") },
    {
      label: "Largest account",
      cell: (k) => {
        const p = programs.find((x) => x.key === k);
        const sizes = p ? sizesOf(p) : [];
        return sizes.length ? compactUsd(Math.max(...sizes)) : "—";
      },
    },
  ];

  return (
    <Section id="objectives" shell={false} className="scroll-mt-24 pt-10 pb-24 sm:pb-32">
      <Container>
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <Reveal>
              <Eyebrow icon={SlidersHorizontal}>Objectives by account</Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <Title className="mt-6 text-[clamp(2.2rem,4.4vw,3.8rem)]" lead="Every number," fade="side by side." />
            </Reveal>
          </div>
          <Reveal delay={0.12}>
            <Lede className="lg:mb-2">The objectives differ by account type. The conduct rules further down are the same for everyone. Open an account type for its full terms.</Lede>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="mt-12">
          <div className="g-glass g-hair overflow-hidden rounded-[30px]">
            <div className="g-noscroll overflow-x-auto">
              <table className="w-full min-w-[820px] border-collapse text-left">
                <thead>
                  <tr>
                    <th scope="col" className="sticky left-0 z-10 w-[230px] bg-[#171c1b] px-6 py-5 text-[12.5px] font-medium text-white/45">
                      Objective
                    </th>
                    {PROGRAM_ORDER.map((k) => (
                      <th key={k} scope="col" className="px-4 py-5 text-center">
                        <Link href={programHref(k)} className="group inline-flex flex-col items-center">
                          <span className="text-[16px] font-semibold tracking-[-0.02em] text-white group-hover:text-[var(--g-lime)]">{programDetails[k].name}</span>
                          <span className="mt-0.5 inline-flex items-center gap-1 text-[11.5px] text-white/40 group-hover:text-white/70">
                            Details <ArrowRight className="h-3 w-3" />
                          </span>
                        </Link>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.label} className="border-t border-white/[0.06]">
                      <th scope="row" className="sticky left-0 z-10 bg-[#171c1b] px-6 py-4 font-normal">
                        <span className="block text-[14px] font-medium text-white/85">{r.label}</span>
                        {r.note ? <span className="block text-[11.5px] text-white/40">{r.note}</span> : null}
                      </th>
                      {PROGRAM_ORDER.map((k) => {
                        const v = r.cell(k);
                        return (
                          <td key={k} className="g-num px-4 py-4 text-center text-[15px] font-semibold text-white">
                            {v === "yes" ? (
                              <Check className="mx-auto h-[18px] w-[18px] text-[var(--g-lime)]" strokeWidth={2.6} aria-label="Yes" />
                            ) : v === "no" ? (
                              <X className="mx-auto h-[18px] w-[18px] text-white/25" strokeWidth={2.4} aria-label="No" />
                            ) : (
                              v
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

/* ───────────────────────── chapters ───────────────────────── */

type Chapter = { id: string; title: string; icon: LucideIcon; summary: string; points: string[]; list?: { tone: "no"; items: string[] } };

const CHAPTERS: Chapter[] = [
  {
    id: "loss-limits",
    title: "Loss limits",
    icon: Shield,
    summary: "Two limits protect every account, and they are the only two things that can breach it.",
    points: [
      `The daily loss limit is a percentage of your balance at ${CONDITIONS.dayRollover}. It is checked against equity, so floating losses count the moment they appear.`,
      "The maximum loss limit is a percentage of the starting balance. It is static: it does not trail your profit and it never moves.",
      "If equity touches either limit, open positions are closed at market, pending orders are cancelled and the account is closed for trading.",
      "A closed position's profit raises your balance, and tomorrow's daily limit is measured from that higher balance.",
    ],
  },
  {
    id: "trading-days",
    title: "Trading days and time",
    icon: CalendarDays,
    summary: "No deadline on any phase. A small minimum number of trading days on evaluations.",
    points: [
      "A trading day is a day on which you open at least one trade. Days run from 5:00pm to 5:00pm New York time.",
      "Each evaluation phase needs at least 3 trading days. A phase passes as soon as the target is reached and the days are done.",
      "The No Minimum Trading Days add-on removes the minimum, so a phase can pass on its first day.",
      "There is no maximum time. Trade when your setup is there.",
    ],
  },
  {
    id: "news",
    title: "News trading",
    icon: Newspaper,
    summary: "Unrestricted in evaluation. On funded accounts, a two-minute window either side of high-impact releases.",
    points: [
      "Evaluation phases: trade through any release with no restriction.",
      "Funded accounts, including Instant from day one: profit from trades opened or closed within 2 minutes before or after a high-impact release is removed when your payout is reviewed.",
      "Holding a position through a release that was opened more than 2 minutes earlier is fine.",
      "The news rule can reduce a payout. It never breaches the account.",
    ],
  },
  {
    id: "holding",
    title: "Holding and inactivity",
    icon: Hourglass,
    summary: "Hold overnight and over the weekend. Just do not leave the account untouched for a month.",
    points: [
      "Positions may stay open overnight and over the weekend on every account type and phase. There are no swap charges.",
      "Forex and gold are closed from Friday 22:00 to Sunday 22:00 UTC. A gap at the open counts toward your loss limits.",
      "Crypto trades 24 hours a day, 7 days a week.",
      `An account with no trade for ${PERKS.inactivityDays} consecutive days is closed for inactivity.`,
    ],
  },
  {
    id: "conduct",
    title: "What is not permitted",
    icon: Ban,
    summary: "Trade the account the way you would trade real capital. These practices do not.",
    points: ["If we find one of these we may remove the profit it produced, refuse a payout or close the account, and we will tell you which trades were involved."],
    list: { tone: "no", items: prohibitedPractices },
  },
  {
    id: "payouts",
    title: "Payout checks",
    icon: CircleDollarSign,
    summary: "What we look at when you request a payout from a funded account.",
    points: [
      `Timing: payouts 1 to ${PERKS.onDemandPayouts} are on demand. From payout ${PERKS.onDemandPayouts + 1} you can request once every ${PERKS.payoutCycleDays} days.`,
      "Consistency: no single trading day may make up more than 40% of the profit you withdraw, or 25% on Instant accounts. If one day is too large a share, keep trading until it is not.",
      `Amount: the minimum payout is $${PERKS.minPayout} after the split. All positions must be closed when you request.`,
      "The amount you withdraw leaves the account balance, and your daily loss limit is adjusted so the withdrawal is never counted as a loss.",
    ],
  },
  {
    id: "identity",
    title: "Identity and accounts",
    icon: UserCheck,
    summary: "One trader per account, verified before the first payout.",
    points: [
      "You must be 18 or over. Identity verification (KYC) must be approved before your first payout is sent.",
      "Payouts are only sent to a wallet or bank account in your own name.",
      "You may hold several accounts. The combined size of your funded accounts is capped at $400,000.",
      "An account cannot be sold, transferred or traded by anyone else.",
    ],
  },
];

function Chapters() {
  const [active, setActive] = useState(CHAPTERS[0].id);
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-40% 0px -55% 0px" });
    CHAPTERS.forEach((c) => {
      const el = document.getElementById(c.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <Section id="chapters" className="z-10 -mt-12 scroll-mt-24 rounded-t-[44px] pt-24 pb-28 sm:rounded-t-[56px] sm:pt-32 sm:pb-36">
      <Container>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-16">
          <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <Eyebrow icon={ScrollText}>The rulebook</Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <p className="mt-5 text-[14px] leading-relaxed text-white/50">Seven chapters. They apply to every account type.</p>
            </Reveal>
            <nav aria-label="Rules" className="g-noscroll -mx-5 mt-6 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0">
              {CHAPTERS.map((c, i) => (
                <a
                  key={c.id}
                  href={`#${c.id}`}
                  className={cn(
                    "flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-[14px] font-medium transition-colors duration-300 lg:rounded-[14px]",
                    active === c.id ? "bg-white/[0.09] text-white" : "text-white/50 hover:text-white",
                  )}
                >
                  <span className={cn("g-num text-[12px]", active === c.id ? "text-[var(--g-lime)]" : "text-white/30")}>{String(i + 1).padStart(2, "0")}</span>
                  {c.title}
                </a>
              ))}
            </nav>
          </aside>

          <div className="flex min-w-0 flex-col gap-4">
            {CHAPTERS.map((c, i) => (
              <Reveal key={c.id}>
                <article id={c.id} className="g-card-dark g-hair scroll-mt-28 rounded-[30px] p-6 sm:p-9">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <span className="g-num text-[13px] font-semibold text-[var(--g-lime)]">Chapter {String(i + 1).padStart(2, "0")}</span>
                      <h2 className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-white sm:text-[30px]">{c.title}</h2>
                    </div>
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-[16px] bg-[var(--g-lime)]/10 text-[var(--g-lime)] ring-1 ring-[var(--g-lime)]/25">
                      <c.icon className="h-5 w-5" strokeWidth={1.8} />
                    </span>
                  </div>
                  <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-white/80">{c.summary}</p>
                  <ul className="mt-6 grid gap-2.5 border-t border-white/[0.07] pt-6">
                    {c.points.map((p) => (
                      <li key={p} className="flex items-start gap-3 text-[15px] leading-relaxed text-white/60">
                        <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/[0.07]">
                          <Check className="h-3 w-3 text-[var(--g-lime)]" strokeWidth={3} />
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>
                  {c.list ? (
                    <ul className="mt-4 grid gap-2">
                      {c.list.items.map((it) => (
                        <li key={it} className="flex items-start gap-3 rounded-[16px] bg-red-400/[0.07] px-4 py-3 text-[14.5px] leading-relaxed text-white/75 ring-1 ring-red-300/15">
                          <X className="mt-0.5 h-4 w-4 shrink-0 text-red-300" strokeWidth={2.6} />
                          {it}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

export function RulesPage() {
  return (
    <>
      <PageHero
        art="/art/page-rules.webp"
        crumb="Rules"
        eyebrow="Trading rules"
        icon={ScrollText}
        lead="Two limits."
        fade="Everything else is yours."
        lede="Only the daily and the maximum loss limit can close an account. Here is exactly how they are measured, and every other rule that applies to your trading and your payouts."
      >
        <div className="flex flex-wrap gap-3">
          <Button href="#objectives">Compare the objectives</Button>
          <Button href="#chapters" kind="glass" arrow={false}>
            Read the rulebook
          </Button>
        </div>
      </PageHero>

      <ObjectivesMatrix />

      <section id="limits" className="g-light relative isolate z-10 -mt-12 scroll-mt-24 overflow-clip rounded-t-[44px] pt-24 pb-36 sm:rounded-t-[56px] sm:pt-32 sm:pb-44">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Reveal className="flex justify-center">
              <Eyebrow tone="light" icon={Shield}>
                See your limits
              </Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <Title tone="light" className="mt-6 text-[clamp(2.2rem,4.4vw,3.8rem)]" lead="Where the floor is," fade="today." />
            </Reveal>
            <Reveal delay={0.12} className="flex justify-center">
              <Lede tone="light" className="mt-6 text-center">
                Choose an account and move the slider to the balance you start the day with. The closer of the two floors is the one that matters.
              </Lede>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="mt-12">
            <LossLimitLab />
          </Reveal>
          <Reveal delay={0.14}>
            <p className="mx-auto mt-6 max-w-2xl text-center text-[13.5px] text-[var(--g-muted-ink)]">
              Sizing a trade to fit inside these limits?{" "}
              <Link href={href("tools")} className="font-semibold text-[var(--g-emerald)] underline-offset-4 hover:underline">
                Open the position calculator
              </Link>
              .
            </p>
          </Reveal>
        </Container>
      </section>

      <Chapters />

      <Cta
        title={
          <Fragment>
            <span className="g-shade-dark">Still have </span>
            <span className="g-shade-lime">questions?</span>
          </Fragment>
        }
        lede="The help centre has an answer for every account type, and the assistant answers from this same rulebook."
        primary={{ label: "Open the help centre", href: href("faqs") }}
        secondary={{ label: "View account types", href: href("challenges") }}
      />
    </>
  );
}
