"use client";

import Link from "next/link";
import { PageLayout, PageHero, PageSection } from "@/components/layout";
import { Reveal, GsapWords, Magnetic } from "@/components/ui/Animations";
import { ArrowRight, ArrowUpRight, Star, BadgeCheck } from "lucide-react";

const stats = [
  { value: "4.8/5", label: "Average rating" },
  { value: "2,300+", label: "Verified reviews" },
  { value: "$2.5M+", label: "Paid to traders" },
  { value: "100+", label: "Countries served" },
];

const reviews = [
  {
    name: "Arjun Mehta",
    country: "🇮🇳 India",
    account: "$100K funded",
    rating: 5,
    title: "Payout hit my account in 9 hours",
    body: "I was skeptical after bad experiences with other firms, but my first payout from TPP was processed in under 24 hours as promised. The rules are exactly as published — no surprises, no hidden clauses. Already scaled to $100K.",
  },
  {
    name: "Daniel Okafor",
    country: "🇳🇬 Nigeria",
    account: "$50K funded",
    rating: 5,
    title: "The one-step challenge is genuinely fair",
    body: "Passed the one-step in 12 days trading gold only. Drawdown rules are clear, spreads are tight, and support answered every question I had within minutes. The free retry took all the pressure off my first attempt.",
  },
  {
    name: "Sofia Alvarez",
    country: "🇲🇽 Mexico",
    account: "$25K funded",
    rating: 5,
    title: "Best support team of any prop firm",
    body: "I have accounts with three firms and TPP support is by far the fastest. Real humans, real answers. When I had a question about news trading rules mid-evaluation, they replied in 4 minutes with a direct answer.",
  },
  {
    name: "Viktor Petrov",
    country: "🇧🇬 Bulgaria",
    account: "$200K funded",
    rating: 5,
    title: "Scaled from $25K to $200K in 7 months",
    body: "The auto-scaling is real. Hit my milestones, and the account upgrades happened automatically — no emails, no renegotiation. Now trading the max allocation with a 90% split. This is how prop firms should work.",
  },
  {
    name: "Priya Sharma",
    country: "🇮🇳 India",
    account: "$50K funded",
    rating: 4,
    title: "Fair rules, honest payouts",
    body: "Failed my first challenge by breaking the daily drawdown — completely my fault, the dashboard showed everything clearly. Passed the retry and have received three bi-weekly payouts since. Wish there were more account size options, but everything promised is delivered.",
  },
  {
    name: "Marco Rossi",
    country: "🇮🇹 Italy",
    account: "$100K funded",
    rating: 5,
    title: "No games with the rules",
    body: "What sold me: the rulebook is public, short, and written in plain English. I have never had a trade questioned or a payout delayed. Six payouts in, TPP has earned my trust completely.",
  },
  {
    name: "Aisha Rahman",
    country: "🇦🇪 UAE",
    account: "$25K funded",
    rating: 5,
    title: "Perfect for evening traders",
    body: "I trade the New York session after work. Platform never lags during high volatility, and holding through news is allowed on funded accounts. First payout covered my challenge fee twelve times over.",
  },
  {
    name: "Chen Wei",
    country: "🇸🇬 Singapore",
    account: "$200K funded",
    rating: 5,
    title: "The 90% split changes everything",
    body: "Ran the math against every major firm before choosing TPP. The combination of 90% split, bi-weekly payouts, and $59 entry cost is unbeatable. Eight months in, zero complaints — it simply works.",
  },
  {
    name: "Samuel Johansson",
    country: "🇸🇪 Sweden",
    account: "$50K funded",
    rating: 4,
    title: "Straightforward and transparent",
    body: "Passed the two-step in about five weeks. The consistency of the platform impressed me — same spreads in the challenge as on the funded account. Payouts arrive like clockwork every two weeks.",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < count ? "fill-[#cbfb45] text-[#0c0c0c]" : "text-[#0c0c0c]/20"}`}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Trader Reviews"
        title="Real traders, real payouts, real words"
        titleHighlight={["Real", "payouts"]}
        description="Unfiltered feedback from funded traders across 100+ countries. Every review below is from a verified account holder."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Reviews", href: "/reviews" },
        ]}
      />

      {/* ═══ Stats bar ═══ */}
      <PageSection variant="cream">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08}>
                <div className="rounded-3xl border border-[#0c0c0c]/10 bg-white/60 p-7 text-center">
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

      {/* ═══ Reviews grid ═══ */}
      <PageSection variant="cream">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mb-10 flex items-center gap-3 text-sm font-medium uppercase tracking-[0.2em] text-[#0c0c0c]/50">
              <span className="h-px w-8 bg-[#0c0c0c]/20" />
              Verified reviews
            </div>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r, i) => (
              <Reveal key={r.name} delay={(i % 3) * 0.08}>
                <article className="flex h-full flex-col rounded-3xl border border-[#0c0c0c]/10 bg-white/60 p-7 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
                  <div className="mb-4 flex items-center justify-between">
                    <Stars count={r.rating} />
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#cbfb45]/40 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#0c0c0c]">
                      <BadgeCheck className="h-3.5 w-3.5" /> Verified
                    </span>
                  </div>
                  <h3 className="mb-3 text-lg font-bold leading-snug tracking-tight text-[#0c0c0c] text-balance">
                    {r.title}
                  </h3>
                  <p className="mb-6 flex-1 text-[15px] leading-relaxed text-[#0c0c0c]/60">
                    {r.body}
                  </p>
                  <div className="flex items-center justify-between border-t border-[#0c0c0c]/10 pt-4">
                    <div>
                      <p className="text-[14px] font-bold text-[#0c0c0c]">{r.name}</p>
                      <p className="text-[13px] text-[#0c0c0c]/50">{r.country}</p>
                    </div>
                    <span className="rounded-full bg-[#0c0c0c]/5 px-3 py-1 text-[12px] font-semibold text-[#0c0c0c]/70">
                      {r.account}
                    </span>
                  </div>
                </article>
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
              text="Write the next success story"
              highlight={["success", "story"]}
              as="h2"
              className="mb-6 font-bold tracking-[-0.03em] text-[#0c0c0c]"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
            />
            <p className="mb-10 text-lg leading-relaxed text-[#0c0c0c]/60">
              Join thousands of funded traders. Challenges from $59, funding up
              to $200K, and payouts every two weeks at up to 90% split.
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
                  Get funded now
                </Link>
              </Magnetic>
              <Magnetic>
                <Link
                  href="/leaderboard"
                  className="inline-flex h-12 items-center rounded-full border border-[#0c0c0c]/30 px-6 text-[15px] font-medium text-[#0c0c0c] transition-all duration-300 hover:rounded-xl hover:bg-[#0c0c0c]/5"
                >
                  See the leaderboard
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
