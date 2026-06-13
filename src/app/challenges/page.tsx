"use client";

import { useState } from "react";
import Link from "next/link";
import {
  V3Layout,
  V3PageHero,
  V3Section,
  Reveal,
  GsapWords,
  Magnetic,
  FaqRow,
  LIME,
} from "@/components/v3";
import { V2ChallengeCalculator } from "@/components/landing/V2ChallengeCalculator";
import { faq } from "@/data/faq";
import { ALL_SIZES, formatSize, programs } from "@/data/programs";
import { ArrowUpRight, ArrowRight } from "lucide-react";

export default function ChallengesPage() {
  const challengeFaq = faq
    .filter((f) => ["rules", "payouts", "general"].includes(f.category ?? ""))
    .slice(0, 6);

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <V3Layout>
      <V3PageHero
        eyebrow="Funded Accounts"
        title="Five paths to a funded account"
        titleHighlight={["funded"]}
        description="Pick the evaluation that fits how you trade — from the fastest 1-Step to our $5 Pay-After-You-Pass route. Up to $400K in scaled allocation, up to 100% split."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Challenges", href: "/challenges" },
        ]}
      />

      {/* Calculator — already has V3 styling */}
      <V2ChallengeCalculator />

      {/* ═══ Fee Matrix — dark section ═══ */}
      <V3Section variant="dark">
        <Reveal>
          <div className="mb-12 text-center">
            <div className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-[#cbfb45]">
              Side by side
            </div>
            <GsapWords
              text="Compare every plan"
              highlight={["every"]}
              className="font-bold tracking-[-0.03em] text-white"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
            />
            <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-white/50">
              Every program, every account size — one transparent table. All
              fees one-time, refunded on your first qualifying payout.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl border border-white/[0.06]">
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] tabular-nums">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.03]">
                    <th className="sticky left-0 bg-[#0c0c0c] px-5 py-3.5 text-left font-medium text-white/60">
                      Program
                    </th>
                    {ALL_SIZES.map((s) => (
                      <th
                        key={s}
                        className="whitespace-nowrap px-4 py-3.5 text-right font-medium text-white/60"
                      >
                        {formatSize(s)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {programs.map((p, idx) => (
                    <tr
                      key={p.key}
                      className={
                        idx % 2 === 1
                          ? "bg-white/[0.02]"
                          : "bg-transparent"
                      }
                    >
                      <td className="sticky left-0 bg-[#0c0c0c] px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">
                            {p.shortLabel}
                          </span>
                          {p.badge && (
                            <span className="rounded-full bg-[#cbfb45] px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-wider text-[#0c0c0c]">
                              {p.badge.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[11.5px] text-white/40">
                          {p.profitTarget} · {p.maxDrawdown} max DD
                        </p>
                      </td>
                      {ALL_SIZES.map((s) => {
                        const fee = p.fees[s];
                        return (
                          <td
                            key={s}
                            className="whitespace-nowrap px-4 py-3.5 text-right"
                          >
                            {fee != null ? (
                              <span className="text-white">
                                ${fee.toLocaleString("en-US")}
                              </span>
                            ) : (
                              <span className="text-white/20">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-white/[0.06] bg-white/[0.02] px-5 py-3 text-[11.5px] text-white/40">
              All prices in USD. One-time fee. Refunded with your first
              qualifying payout. Add-ons (100% split, on-demand payouts) sold
              separately at checkout.
            </div>
          </div>
        </Reveal>
      </V3Section>

      {/* ═══ FAQ — dark section ═══ */}
      <V3Section variant="dark">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Reveal>
            <div className="lg:sticky lg:top-32">
              <div className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-[#cbfb45]">
                Challenge Questions
              </div>
              <GsapWords
                text="What traders ask before buying"
                highlight={["traders"]}
                className="font-bold tracking-[-0.03em] text-white"
                style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)" }}
              />
              <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/50">
                Everything you need to know before purchasing a challenge.
              </p>
              <Magnetic className="mt-8 hidden lg:inline-block">
                <Link
                  href="/rules"
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 px-5 text-[15px] font-medium text-white transition-all duration-300 hover:rounded-lg hover:border-[#cbfb45] hover:text-[#cbfb45]"
                >
                  See all rules
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Magnetic>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="flex flex-col gap-3">
              {challengeFaq.map((item, i) => (
                <FaqRow
                  key={item.q}
                  item={item}
                  open={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              ))}
            </div>
          </Reveal>
        </div>
      </V3Section>

      {/* ═══ Final CTA ═══ */}
      <V3Section variant="cream">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <GsapWords
              text="Ready to get funded?"
              highlight={["funded?"]}
              className="mb-6 font-bold tracking-[-0.03em] text-[#0c0c0c]"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
            />
            <p className="mb-10 text-lg leading-relaxed text-[#6c6a68]">
              Join thousands of traders who chose transparency over gimmicks.
              Your first payout is 14 days away.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Magnetic>
                <Link
                  href="/dashboard/new-challenge"
                  className="group inline-flex h-12 items-center gap-2 rounded-full bg-[#0c0c0c] pl-2 pr-5 text-[15px] font-semibold text-white transition-all duration-300 hover:rounded-xl"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#cbfb45] transition-all duration-300 group-hover:rounded-md">
                    <ArrowUpRight className="h-4 w-4 text-[#0c0c0c] transition-transform duration-300 group-hover:rotate-45" />
                  </span>
                  Start your challenge
                </Link>
              </Magnetic>
              <Magnetic>
                <Link
                  href="/rules"
                  className="inline-flex h-12 items-center rounded-full border border-[#0c0c0c]/20 px-6 text-[15px] font-medium text-[#0c0c0c] transition-all duration-300 hover:rounded-xl hover:bg-[#0c0c0c]/5"
                >
                  Read the rules
                </Link>
              </Magnetic>
            </div>
          </div>
        </Reveal>
      </V3Section>
    </V3Layout>
  );
}