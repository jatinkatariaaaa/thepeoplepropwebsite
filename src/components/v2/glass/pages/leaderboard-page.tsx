"use client";

import { useMemo } from "react";
import { BarChart3, Info, Target, TrendingUp, Trophy } from "lucide-react";
import { getDailyLeaderboard, type LeaderboardEntry } from "@/lib/daily-leaderboard";
import { cn } from "@/lib/utils";
import { Button, Container, Eyebrow, Section, Title } from "../ui";
import { Reveal, Stagger, StaggerItem } from "../motion";
import { PageHero } from "../page-hero";
import { Cta } from "../cta";
import { compactUsd, useCatalogue, usePrograms } from "../data";
import { href } from "../routes";

const money = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/**
 * The current site builds this board with a date-seeded generator
 * (src/lib/daily-leaderboard.ts) — there is no live account feed yet — so
 * the glass page says so plainly instead of calling the entries real.
 */
function SampleNote({ className }: { className?: string }) {
  return (
    <p className={cn("inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3.5 py-1.5 text-[12.5px] text-white/65 ring-1 ring-white/10", className)}>
      <Info className="h-3.5 w-3.5 text-[var(--g-lime)]" />
      Sample rankings — live account data is not connected yet
    </p>
  );
}

function Podium({ top }: { top: LeaderboardEntry[] }) {
  // 2 · 1 · 3 on wide screens, 1 · 2 · 3 when stacked
  const order = [top[1], top[0], top[2]].filter(Boolean);
  return (
    <Section shell={false} className="pt-10 pb-20 sm:pb-24">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <Reveal>
              <Eyebrow icon={Trophy}>Today&apos;s podium</Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <Title className="mt-6 text-[clamp(2.2rem,4.4vw,3.8rem)]" lead="Top three," fade="ranked by realized profit." />
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <SampleNote />
          </Reveal>
        </div>
        <Stagger className="mt-12 grid items-end gap-4 lg:grid-cols-3" gap={0.1}>
          {order.map((e) => {
            const first = e.rank === 1;
            return (
              <StaggerItem key={e.rank} className={first ? "order-first lg:order-none" : undefined}>
                <article className={cn("g-hair relative overflow-hidden rounded-[30px] p-7", first ? "g-card-emerald lg:pb-14" : "g-card-dark")}>
                  {first ? <div aria-hidden="true" className="absolute -top-24 -right-20 h-64 w-64 rounded-full bg-[radial-gradient(closest-side,rgba(203,251,69,0.25),transparent)]" /> : null}
                  <div className="relative flex items-center justify-between">
                    <span className={cn("g-num grid h-12 w-12 place-items-center rounded-full text-[18px] font-semibold", first ? "bg-[var(--g-lime)] text-[var(--g-ink)]" : "bg-white/[0.08] text-white")}>{e.rank}</span>
                    <Trophy className={cn("h-6 w-6", first ? "text-[var(--g-lime)]" : "text-white/30")} strokeWidth={1.8} />
                  </div>
                  <p className="relative mt-6 flex items-center gap-2 text-[22px] font-semibold tracking-[-0.03em] text-white">
                    <span aria-hidden="true">{e.country}</span>
                    {e.trader}
                  </p>
                  <p className="relative mt-1 text-[13.5px] text-white/55">
                    {e.account_size} account · {e.pair}
                  </p>
                  <p className="relative mt-6 text-[12px] tracking-wide text-white/45 uppercase">Profit today</p>
                  <p className="g-num g-shade-dark relative text-[clamp(2.2rem,3.6vw,3rem)] leading-tight font-semibold">{money(e.profit)}</p>
                  <div className="relative mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-4 text-[13px] text-white/65">
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-[var(--g-lime)]" />+{e.profit_percent.toFixed(1)}%
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Target className="h-3.5 w-3.5 text-[var(--g-lime)]" />
                      {e.win_ratio}% win
                    </span>
                    <span>{e.trades} trades</span>
                  </div>
                </article>
              </StaggerItem>
            );
          })}
        </Stagger>
      </Container>
    </Section>
  );
}

function Rankings({ rest }: { rest: LeaderboardEntry[] }) {
  return (
    <section className="g-light relative isolate z-10 -mt-12 overflow-clip rounded-t-[44px] pt-24 pb-40 sm:rounded-t-[56px] sm:pt-32 sm:pb-48">
      <Container>
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <Reveal>
              <Eyebrow tone="light" icon={BarChart3}>
                Full rankings
              </Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <Title tone="light" className="mt-6 text-[clamp(2.2rem,4.4vw,3.8rem)]" lead="Ranks 4" fade={`to ${rest.length + 3}.`} />
            </Reveal>
          </div>
          <p className="text-[13px] text-[var(--g-muted-ink)]">Rankings refresh daily at 00:00 UTC.</p>
        </div>
        <Reveal delay={0.1} className="mt-10">
          <div className="g-card-paper g-hair g-hair-ink overflow-hidden rounded-[28px]">
            <div className="g-noscroll overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead>
                  <tr className="border-b border-black/[0.07] text-[12px] text-[var(--g-muted-ink)]">
                    {["Rank", "Trader", "Account", "Instrument", "Win ratio", "Trades", "Profit"].map((h, i) => (
                      <th key={h} scope="col" className={cn("px-5 py-4 font-semibold", i > 3 && "text-right")}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rest.map((e) => (
                    <tr key={e.rank} className="border-b border-black/[0.05] text-[14.5px] text-[var(--g-ink)] last:border-b-0 hover:bg-black/[0.02]">
                      <td className="px-5 py-3.5">
                        <span className="g-num grid h-8 w-8 place-items-center rounded-full bg-black/[0.05] text-[13px] font-semibold">{e.rank}</span>
                      </td>
                      <td className="px-5 py-3.5 font-semibold">
                        <span aria-hidden="true" className="mr-2">
                          {e.country}
                        </span>
                        {e.trader}
                      </td>
                      <td className="g-num px-5 py-3.5">{e.account_size}</td>
                      <td className="px-5 py-3.5">{e.pair}</td>
                      <td className="g-num px-5 py-3.5 text-right">{e.win_ratio}%</td>
                      <td className="g-num px-5 py-3.5 text-right">{e.trades}</td>
                      <td className="g-num px-5 py-3.5 text-right font-semibold text-[var(--g-emerald)]">+{money(e.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

export function LeaderboardPage() {
  const entries = useMemo(() => getDailyLeaderboard(20), []);
  const cat = useCatalogue(usePrograms());
  return (
    <>
      <PageHero
        art="/art/page-leaderboard.webp"
        crumb="Leaderboard"
        eyebrow="Leaderboard"
        icon={Trophy}
        lead="The daily"
        fade="leaderboard."
        lede="The board resets every day at 00:00 UTC and ranks traders by realized profit."
      >
        <Button href={href("challenges")}>Start a challenge</Button>
      </PageHero>
      <Podium top={entries.slice(0, 3)} />
      <Rankings rest={entries.slice(3)} />
      <Cta
        title={
          <>
            <span className="g-shade-dark">Your name belongs </span>
            <span className="g-shade-lime">up here.</span>
          </>
        }
        lede={`Pass a challenge, get funded up to ${compactUsd(cat.maxSize)}, and keep up to ${cat.maxSplit}% of the profit.`}
        primary={{ label: "Start a challenge", href: href("challenges") }}
        size="md"
      />
    </>
  );
}
