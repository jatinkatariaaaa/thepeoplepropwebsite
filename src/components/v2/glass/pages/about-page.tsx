"use client";

import { Compass, HeartHandshake, Scale, Users, Zap } from "lucide-react";
import { Button, Container, Eyebrow, Section, Title } from "../ui";
import { CountUp, Reveal, Stagger, StaggerItem } from "../motion";
import { PageHero } from "../page-hero";
import { Cta } from "../cta";
import { compactUsd, prettyValue, usd, useCatalogue, usePrograms, useStats } from "../data";
import { href } from "../routes";

const VALUES = [
  {
    icon: Scale,
    title: "Radical fairness",
    body: "Every rule we enforce is published before you pay a single dollar. No hidden consistency clauses, no mid-evaluation changes, no fine-print traps. If a rule is not in the public rulebook, it does not exist.",
  },
  {
    icon: Zap,
    title: "Speed as a promise",
    body: "Approved payouts are sent within 24 hours on business days. Eligibility, review checks and payment methods are published in the payout policy.",
  },
  {
    icon: HeartHandshake,
    title: "Traders first, always",
    body: "We are traders who got tired of firms designed around trader failure. Our business model only works when you succeed long-term — so every decision starts with one question: does this help the trader win?",
  },
];

function Mission({ maxSplit }: { maxSplit: number }) {
  return (
    <Section shell={false} className="pt-10 pb-24 sm:pb-32">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
          <div>
            <Reveal>
              <Eyebrow icon={Compass}>Our mission</Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <h2 className="g-display mt-6 text-[clamp(2.6rem,5vw,4.6rem)]">
                <span className="g-shade-dark block">Talent is everywhere.</span>
                <span className="g-shade-lime block">Capital is not.</span>
              </h2>
            </Reveal>
          </div>
          <Reveal delay={0.12}>
            <div className="g-glass g-hair space-y-5 rounded-[30px] p-7 text-[16.5px] leading-[1.7] text-white/70 sm:p-9">
              <p>
                A brilliant trader in Mumbai, Lagos, or Manila has the same skill as one in London or New York — but nowhere near the same access to capital. We built The People
                Prop to close that gap.
              </p>
              <p>
                Trade a simulated account under published rules and keep up to {maxSplit}% of eligible profit. The first five payout requests are on demand. Later requests follow a 14-day cycle.
              </p>
              <p>
                Use the trading rulebook and payout policy to check your account's loss limits, trading costs and withdrawal conditions.
              </p>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

function StatsBand() {
  const stats = useStats();
  const cat = useCatalogue(usePrograms());
  const tiles = [...stats.slice(0, 3).map((s) => ({ value: prettyValue(s.value), label: s.label })), { value: compactUsd(cat.maxSize), label: "Largest simulated account" }];
  return (
    <Section shell={false} className="pb-24 sm:pb-32">
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

function Values() {
  return (
    <Section shell={false} className="pb-32 sm:pb-40">
      <Container>
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow icon={Users}>What we stand for</Eyebrow>
          </Reveal>
          <Reveal delay={0.06}>
            <Title className="mt-6 text-[clamp(2.2rem,4.4vw,3.8rem)]" lead="Three principles" fade="we never trade away." />
          </Reveal>
        </div>
        <Stagger className="mt-12 grid gap-4 lg:grid-cols-3" gap={0.1}>
          {VALUES.map(({ icon: Icon, title, body }, i) => (
            <StaggerItem key={title}>
              <article className={`g-hair h-full rounded-[30px] p-7 sm:p-8 ${i === 1 ? "g-card-emerald" : "g-card-dark"}`}>
                <span className="grid h-12 w-12 place-items-center rounded-[16px] bg-[var(--g-lime)] text-[var(--g-ink)]">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <h3 className="mt-6 text-[22px] font-semibold tracking-[-0.03em] text-white">{title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-white/65">{body}</p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </Section>
  );
}

export function AboutPage() {
  const programs = usePrograms();
  const cat = useCatalogue(programs);
  return (
    <>
      <PageHero
        art="/art/page-about.webp"
        crumb="About"
        eyebrow="About us"
        icon={Users}
        lead="Built by traders,"
        fade="for traders."
        lede="The People Prop offers simulated trading accounts with published rules and real payouts on eligible profits."
      >
        <div className="flex flex-wrap gap-3">
          <Button href={href("challenges")}>Start a challenge</Button>
          <Button href={href("contact")} kind="glass" arrow={false}>
            Talk to us
          </Button>
        </div>
      </PageHero>
      <Mission maxSplit={cat.maxSplit} />
      <StatsBand />
      <Values />
      <Cta
        title={
          <>
            <span className="g-shade-dark">Trade with a firm that wants you to </span>
            <span className="g-shade-lime">win.</span>
          </>
        }
        lede={`Challenges from ${usd(cat.minFee)}. Simulated accounts up to ${compactUsd(cat.maxSize)} and up to ${cat.maxSplit}% profit split on eligible payouts.`}
        primary={{ label: "Start a challenge", href: href("challenges") }}
        secondary={{ label: "Talk to us", href: href("contact") }}
        size="md"
      />
    </>
  );
}
