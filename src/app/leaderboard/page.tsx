"use client";

import Link from "next/link";
import { PageLayout, PageHero, PageSection } from "@/components/layout";
import { Reveal, GsapWords, Magnetic } from "@/components/ui/Animations";
import { getDailyLeaderboard } from "@/lib/daily-leaderboard";
import { ArrowRight, ArrowUpRight, Trophy, TrendingUp, Target } from "lucide-react";

const entries = getDailyLeaderboard(20);
const top3 = entries.slice(0, 3);
const rest = entries.slice(3);

function formatMoney(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export default function LeaderboardPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Live Rankings"
        title="Today's top funded traders"
        titleHighlight={["top", "traders"]}
        description="The leaderboard resets daily and ranks funded traders by realized profit. Real accounts, real rules, real results."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Leaderboard", href: "/leaderboard" },
        ]}
      />

      {/* ═══ Podium — top 3 ═══ */}
      <PageSection variant="cream">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mb-10 flex items-center gap-3 text-sm font-medium uppercase tracking-[0.2em] text-[#0c0c0c]/50">
              <span className="h-px w-8 bg-[#0c0c0c]/20" />
              Today&apos;s podium
            </div>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-3">
            {top3.map((e, i) => (
              <Reveal key={e.rank} delay={i * 0.1}>
                <div
                  className={`relative flex h-full flex-col rounded-3xl p-7 ${
                    i === 0
                      ? "bg-[#0c0c0c] text-white"
                      : "border border-[#0c0c0c]/10 bg-white/60 text-[#0c0c0c]"
                  }`}
                >
                  <div className="mb-6 flex items-center justify-between">
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-full text-lg font-black ${
                        i === 0 ? "bg-[#cbfb45] text-[#0c0c0c]" : "bg-[#0c0c0c]/5 text-[#0c0c0c]"
                      }`}
                    >
                      {e.rank}
                    </span>
                    <Trophy
                      className={`h-5 w-5 ${i === 0 ? "text-[#cbfb45]" : "text-[#0c0c0c]/30"}`}
                      strokeWidth={2}
                    />
                  </div>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="text-xl">{e.country}</span>
                    <h3 className="text-xl font-bold tracking-tight">{e.trader}</h3>
                  </div>
                  <p className={`mb-6 text-sm ${i === 0 ? "text-white/50" : "text-[#0c0c0c]/50"}`}>
                    {e.account_size} account &middot; {e.pair}
                  </p>
                  <div className="mt-auto">
                    <p
                      className={`mb-1 text-[13px] font-medium uppercase tracking-widest ${
                        i === 0 ? "text-white/40" : "text-[#0c0c0c]/40"
                      }`}
                    >
                      Profit today
                    </p>
                    <p className={`text-3xl font-black tracking-tight ${i === 0 ? "text-[#cbfb45]" : "text-[#0c0c0c]"}`}>
                      {formatMoney(e.profit)}
                    </p>
                    <div
                      className={`mt-4 flex items-center gap-4 border-t pt-4 text-[13px] font-medium ${
                        i === 0 ? "border-white/10 text-white/60" : "border-[#0c0c0c]/10 text-[#0c0c0c]/60"
                      }`}
                    >
                      <span className="inline-flex items-center gap-1">
                        <TrendingUp className="h-3.5 w-3.5" /> +{e.profit_percent.toFixed(1)}%
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Target className="h-3.5 w-3.5" /> {e.win_ratio}% win
                      </span>
                      <span>{e.trades} trades</span>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </PageSection>

      {/* ═══ Full table ═══ */}
      <PageSection variant="cream">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mb-8 flex items-center gap-3 text-sm font-medium uppercase tracking-[0.2em] text-[#0c0c0c]/50">
              <span className="h-px w-8 bg-[#0c0c0c]/20" />
              Full rankings
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="overflow-x-auto rounded-3xl border border-[#0c0c0c]/10 bg-white/60">
              <table className="w-full min-w-[760px] text-left">
                <thead>
                  <tr className="border-b border-[#0c0c0c]/10 text-[12px] font-bold uppercase tracking-widest text-[#0c0c0c]/40">
                    <th className="px-6 py-4">Rank</th>
                    <th className="px-6 py-4">Trader</th>
                    <th className="px-6 py-4">Account</th>
                    <th className="px-6 py-4">Instrument</th>
                    <th className="px-6 py-4 text-right">Win ratio</th>
                    <th className="px-6 py-4 text-right">Trades</th>
                    <th className="px-6 py-4 text-right">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {rest.map((e) => (
                    <tr
                      key={e.rank}
                      className="border-b border-[#0c0c0c]/5 text-[15px] font-medium text-[#0c0c0c] transition-colors last:border-0 hover:bg-[#cbfb45]/10"
                    >
                      <td className="px-6 py-4">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0c0c0c]/5 text-[13px] font-bold">
                          {e.rank}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="mr-2">{e.country}</span>
                        {e.trader}
                      </td>
                      <td className="px-6 py-4 text-[#0c0c0c]/60">{e.account_size}</td>
                      <td className="px-6 py-4 text-[#0c0c0c]/60">{e.pair}</td>
                      <td className="px-6 py-4 text-right">{e.win_ratio}%</td>
                      <td className="px-6 py-4 text-right text-[#0c0c0c]/60">{e.trades}</td>
                      <td className="px-6 py-4 text-right font-bold text-[#3d7a1f]">
                        +{formatMoney(e.profit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="mt-4 text-center text-[13px] text-[#0c0c0c]/40">
              Rankings refresh daily at 00:00 UTC. Only funded accounts in good standing are ranked.
            </p>
          </Reveal>
        </div>
      </PageSection>

      {/* ═══ CTA ═══ */}
      <PageSection variant="lime">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <GsapWords
              text="Your name belongs up here"
              highlight={["Your", "here"]}
              as="h2"
              className="mb-6 font-bold tracking-[-0.03em] text-[#0c0c0c]"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
            />
            <p className="mb-10 text-lg leading-relaxed text-[#0c0c0c]/60">
              Pass a challenge, get funded up to $200K, and compete with traders
              from 100+ countries. Bi-weekly payouts at up to 90% profit split.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Magnetic>
                <Link
                  href="/challenges"
                  className="group inline-flex h-12 items-center gap-2 rounded-full bg-[#0c0c0c] pl-2 pr-5 text-[15px] font-semibold text-white transition-all duration-300 hover:rounded-xl"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#cbfb45] transition-all duration-300 group-hover:rounded-md">
                    <ArrowUpRight className="h-4 w-4 text-[#0c0c0c] transition-transform duration-300 group-hover:rotate-45" />
                  </span>
                  Start a challenge
                </Link>
              </Magnetic>
              <Magnetic>
                <Link
                  href="/rules"
                  className="inline-flex h-12 items-center rounded-full border border-[#0c0c0c]/30 px-6 text-[15px] font-medium text-[#0c0c0c] transition-all duration-300 hover:rounded-xl hover:bg-[#0c0c0c]/5"
                >
                  Read the rules
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Magnetic>
            </div>
          </div>
        </Reveal>
      </PageSection>
    </PageLayout>
  );
}
