"use client";

import Link from "next/link";
import { PageLayout, PageHero, PageSection } from "@/components/layout";
import { Reveal, GsapWords, Magnetic } from "@/components/ui/Animations";
import {
  ArrowRight,
  ArrowUpRight,
  Users,
  Globe,
  Banknote,
  ShieldCheck,
  Scale,
  Zap,
  HeartHandshake,
} from "lucide-react";

const stats = [
  { icon: Users, value: "12,000+", label: "Traders evaluated" },
  { icon: Globe, value: "100+", label: "Countries" },
  { icon: Banknote, value: "$2.5M+", label: "Paid in rewards" },
  { icon: ShieldCheck, value: "24h", label: "Avg payout time" },
];

const values = [
  {
    icon: Scale,
    title: "Radical fairness",
    body: "Every rule we enforce is published before you pay a single dollar. No hidden consistency clauses, no mid-evaluation changes, no fine-print traps. If a rule is not in the public rulebook, it does not exist.",
  },
  {
    icon: Zap,
    title: "Speed as a promise",
    body: "Payouts processed in under 24 hours. Support replies in under 5 minutes. Account upgrades triggered automatically the moment you hit a milestone. Your time is trading capital — we do not waste it.",
  },
  {
    icon: HeartHandshake,
    title: "Traders first, always",
    body: "We are traders who got tired of firms designed around trader failure. Our business model only works when you succeed long-term — so every decision starts with one question: does this help the trader win?",
  },
];

const timeline = [
  {
    year: "2024",
    title: "The idea",
    body: "Frustrated by prop firms with predatory rules and delayed payouts, a group of funded traders started sketching what a fair firm would look like — one built by people who had actually sat through evaluations themselves.",
  },
  {
    year: "2025",
    title: "The launch",
    body: "The People Prop went live with one-step and two-step challenges from $59, a public rulebook, and a bi-weekly payout guarantee. The first 1,000 traders joined within months, drawn by transparent rules and real payout proof.",
  },
  {
    year: "2026",
    title: "The scale",
    body: "Today TPP evaluates traders in over 100 countries, has paid out more than $2.5M in rewards, and funds accounts up to $200K with auto-scaling built in. The mission has not changed: real capital for real skill.",
  },
];

export default function AboutPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="About Us"
        title="Built by traders, for traders"
        titleHighlight={["traders,", "traders"]}
        description="The People Prop exists for one reason: skilled traders deserve access to serious capital without predatory rules standing in the way."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "About", href: "/about" },
        ]}
      />

      {/* ═══ Mission ═══ */}
      <PageSection variant="cream">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <div>
                <div className="mb-5 flex items-center gap-3 text-sm font-medium uppercase tracking-[0.2em] text-[#0c0c0c]/50">
                  <span className="h-px w-8 bg-[#0c0c0c]/20" />
                  Our mission
                </div>
                <GsapWords
                  text="Talent is everywhere. Capital is not."
                  highlight={["Talent", "Capital"]}
                  as="h2"
                  className="mb-8 font-bold tracking-[-0.03em] text-[#0c0c0c]"
                  style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", lineHeight: 1.05 }}
                />
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="space-y-5 text-[16px] leading-relaxed text-[#0c0c0c]/60">
                <p>
                  A brilliant trader in Mumbai, Lagos, or Manila has the same
                  skill as one in London or New York — but nowhere near the same
                  access to capital. We built The People Prop to close that gap.
                </p>
                <p>
                  Our model is simple: you prove your skill in a transparent
                  evaluation, we provide the capital, and you keep up to 90% of
                  the profits — paid every two weeks, processed in under 24
                  hours. No hidden rules. No moving goalposts. No games.
                </p>
                <p>
                  Everything we publish — the rulebook, the payout proof, the
                  scaling milestones — is written by people who have personally
                  passed evaluations at other firms and know exactly where the
                  industry cuts corners. We refuse to cut them.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </PageSection>

      {/* ═══ Stats ═══ */}
      <PageSection variant="cream">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08}>
                <div className="rounded-3xl border border-[#0c0c0c]/10 bg-white/60 p-7">
                  <s.icon className="mb-4 h-6 w-6 text-[#0c0c0c]/40" strokeWidth={1.75} />
                  <p className="mb-1 text-3xl font-black tracking-tight text-[#0c0c0c] lg:text-4xl">
                    {s.value}
                  </p>
                  <p className="text-[13px] font-medium uppercase tracking-widest text-[#0c0c0c]/50">
                    {s.label}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </PageSection>

      {/* ═══ Values ═══ */}
      <PageSection variant="dark">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mb-5 flex items-center gap-3 text-sm font-medium uppercase tracking-[0.2em] text-white/40">
              <span className="h-px w-8 bg-white/20" />
              What we stand for
            </div>
            <GsapWords
              text="Three principles we never trade away"
              highlight={["never"]}
              as="h2"
              className="mb-12 max-w-xl font-bold tracking-[-0.03em] text-white"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", lineHeight: 1.05 }}
            />
          </Reveal>
          <div className="grid gap-4 md:grid-cols-3">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.1}>
                <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.03] p-7">
                  <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#cbfb45]">
                    <v.icon className="h-5 w-5 text-[#0c0c0c]" strokeWidth={2} />
                  </span>
                  <h3 className="mb-3 text-xl font-bold tracking-tight text-white">{v.title}</h3>
                  <p className="text-[15px] leading-relaxed text-white/50">{v.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </PageSection>

      {/* ═══ Timeline ═══ */}
      <PageSection variant="cream">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mb-12 flex items-center gap-3 text-sm font-medium uppercase tracking-[0.2em] text-[#0c0c0c]/50">
              <span className="h-px w-8 bg-[#0c0c0c]/20" />
              The story so far
            </div>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-3">
            {timeline.map((t, i) => (
              <Reveal key={t.year} delay={i * 0.1}>
                <div className="flex h-full flex-col rounded-3xl border border-[#0c0c0c]/10 bg-white/60 p-7">
                  <span className="mb-6 inline-flex w-fit rounded-full bg-[#cbfb45] px-4 py-1.5 text-[14px] font-black text-[#0c0c0c]">
                    {t.year}
                  </span>
                  <h3 className="mb-3 text-xl font-bold tracking-tight text-[#0c0c0c]">{t.title}</h3>
                  <p className="text-[15px] leading-relaxed text-[#0c0c0c]/60">{t.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </PageSection>

      {/* ═══ CTA ═══ */}
      <PageSection variant="lime">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <GsapWords
              text="Trade with a firm that wants you to win"
              highlight={["win"]}
              as="h2"
              className="mb-6 font-bold tracking-[-0.03em] text-[#0c0c0c]"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
            />
            <p className="mb-10 text-lg leading-relaxed text-[#0c0c0c]/60">
              Challenges from $59. Funding up to $200K. Payouts every two weeks
              at up to 90% split. The rest is up to your skill.
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
                  href="/contact"
                  className="inline-flex h-12 items-center rounded-full border border-[#0c0c0c]/30 px-6 text-[15px] font-medium text-[#0c0c0c] transition-all duration-300 hover:rounded-xl hover:bg-[#0c0c0c]/5"
                >
                  Talk to us
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
