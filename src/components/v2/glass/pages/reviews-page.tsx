"use client";

import { BadgeCheck, MessageSquareQuote, Quote, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, Container, Eyebrow, Section, Title } from "../ui";
import { CountUp, Reveal } from "../motion";
import { PageHero } from "../page-hero";
import { Cta } from "../cta";
import { compactUsd, prettyValue, usd, useCatalogue, usePrograms, useStats } from "../data";
import { href } from "../routes";

/* The current reviews page's testimonials, unchanged. */
const REVIEWS = [
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

function Stars({ count, tone = "dark" }: { count: number; tone?: "dark" | "light" }) {
  return (
    <div className="flex gap-0.5" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          strokeWidth={1.5}
          className={cn("h-4 w-4", i < count ? "fill-[var(--g-lime)] text-[var(--g-lime)]" : tone === "dark" ? "text-white/20" : "text-black/15")}
        />
      ))}
    </div>
  );
}

function StatsBand() {
  const stats = useStats();
  const cat = useCatalogue(usePrograms());
  const tiles = [...stats.slice(0, 3).map((s) => ({ value: prettyValue(s.value), label: s.label })), { value: compactUsd(cat.maxSize), label: "Max. allocation" }];
  return (
    <Section shell={false} className="pt-10 pb-20 sm:pb-24">
      <Container>
        <Reveal>
          <dl className="g-glass-ink g-hair grid grid-cols-2 overflow-hidden rounded-[28px] lg:grid-cols-4">
            {tiles.map((t, i) => (
              <div key={t.label} className={`px-6 py-7 sm:px-8 ${i % 2 ? "border-l border-white/[0.07]" : ""} ${i > 1 ? "border-t border-white/[0.07] lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}>
                <dt className="text-[13px] text-white/55">{t.label}</dt>
                <dd className="mt-2">
                  <CountUp value={t.value} className="g-num text-[clamp(2rem,3.4vw,3rem)] leading-none font-semibold text-[var(--g-lime-soft)]" />
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </Container>
    </Section>
  );
}

function Featured() {
  const r = REVIEWS[0];
  return (
    <Section shell={false} className="pb-32 sm:pb-40">
      <Container>
        <Reveal>
          <figure className="g-card-emerald g-hair relative overflow-hidden rounded-[36px] p-8 sm:p-14">
            <Quote aria-hidden="true" className="absolute -top-6 right-8 h-40 w-40 text-white/[0.06]" />
            <Stars count={r.rating} />
            <blockquote className="g-title g-shade-dark mt-6 max-w-4xl text-[clamp(1.8rem,3.4vw,3rem)]">“{r.title}.”</blockquote>
            <p className="mt-5 max-w-3xl text-[16.5px] leading-relaxed text-white/75">{r.body}</p>
            <figcaption className="mt-8 flex flex-wrap items-center gap-3 text-[14px] text-white/80">
              <span className="font-semibold text-white">{r.name}</span>
              <span className="text-white/50">{r.country}</span>
              <span className="rounded-full bg-black/25 px-3 py-1 text-[12.5px] text-[var(--g-lime-soft)] ring-1 ring-white/10">{r.account}</span>
              <span className="inline-flex items-center gap-1 text-[12.5px] text-white/60">
                <BadgeCheck className="h-4 w-4 text-[var(--g-lime)]" /> Verified
              </span>
            </figcaption>
          </figure>
        </Reveal>
      </Container>
    </Section>
  );
}

function Wall() {
  return (
    <section className="g-light relative isolate z-10 -mt-12 overflow-clip rounded-t-[44px] pt-24 pb-40 sm:rounded-t-[56px] sm:pt-32 sm:pb-48">
      <Container>
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow tone="light" icon={MessageSquareQuote}>
              Verified reviews
            </Eyebrow>
          </Reveal>
          <Reveal delay={0.06}>
            <Title tone="light" className="mt-6 text-[clamp(2.2rem,4.4vw,3.8rem)]" lead="In their" fade="own words." />
          </Reveal>
        </div>
        <div className="mt-12 gap-4 [column-fill:_balance] sm:columns-2 lg:columns-3">
          {REVIEWS.slice(1).map((r, i) => (
            <Reveal key={r.name} delay={(i % 3) * 0.06} className="mb-4 break-inside-avoid">
              <article className="g-card-paper g-hair g-hair-ink rounded-[26px] p-6">
                <div className="flex items-center justify-between">
                  <Stars count={r.rating} tone="light" />
                  <span className="inline-flex items-center gap-1 text-[12px] font-medium text-[var(--g-emerald)]">
                    <BadgeCheck className="h-4 w-4" /> Verified
                  </span>
                </div>
                <h3 className="mt-4 text-[17.5px] font-semibold tracking-[-0.02em] text-[var(--g-ink)]">{r.title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--g-muted-ink)]">{r.body}</p>
                <div className="mt-5 flex items-center justify-between border-t border-black/[0.06] pt-4">
                  <div className="leading-tight">
                    <p className="text-[14px] font-semibold text-[var(--g-ink)]">{r.name}</p>
                    <p className="text-[12.5px] text-black/45">{r.country}</p>
                  </div>
                  <span className="rounded-full bg-[var(--g-ink)] px-3 py-1 text-[12px] font-semibold text-[var(--g-lime)]">{r.account}</span>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}

export function ReviewsPage() {
  const cat = useCatalogue(usePrograms());
  return (
    <>
      <PageHero
        art="/v2/pt/page-reviews.webp"
        crumb="Reviews"
        eyebrow="Trader reviews"
        icon={Star}
        lead="Real traders,"
        fade="real words."
        lede="Unfiltered feedback from funded traders across 100+ countries. Every review below is from a verified account holder."
      >
        <Button href={href("challenges")}>Get funded now</Button>
      </PageHero>
      <StatsBand />
      <Featured />
      <Wall />
      <Cta
        title={
          <>
            <span className="g-shade-dark">Write the next </span>
            <span className="g-shade-lime">success story.</span>
          </>
        }
        lede={`Challenges from ${usd(cat.minFee)}, funding up to ${compactUsd(cat.maxSize)}, and payouts every two weeks at up to ${cat.maxSplit}% split.`}
        primary={{ label: "Get funded now", href: href("challenges") }}
        secondary={{ label: "See the leaderboard", href: href("leaderboard") }}
        size="md"
      />
    </>
  );
}
