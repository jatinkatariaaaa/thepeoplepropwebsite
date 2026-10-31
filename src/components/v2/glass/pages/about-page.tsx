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
    body: "Payouts processed in under 24 hours. Support replies in under 5 minutes. Account upgrades triggered automatically the moment you hit a milestone. Your time is trading capital — we do not waste it.",
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
                Our model is simple: you prove your skill in a transparent evaluation, we provide the capital, and you keep up to {maxSplit}% of the profits — paid every two weeks,
                processed in under 24 hours. No hidden rules. No moving goalposts. No games.
              </p>
              <p>
                Everything we publish — the rulebook, the payout proof, the scaling milestones — is written by people who have personally passed evaluations at other firms and know
                exactly where the industry cuts corners. We refuse to cut them.
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
  const tiles = [...stats.slice(0, 3).map((s) => ({ value: prettyValue(s.value), label: s.label })), { value: compactUsd(cat.maxSize), label: "Max. allocation" }];
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

function Timeline({ maxSize }: { maxSize: number }) {
  const steps = [
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
      body: `Today TPP evaluates traders in over 100 countries, has paid out more than $2.5M in rewards, and funds accounts up to ${compactUsd(maxSize)} with auto-scaling built in. The mission has not changed: real capital for real skill.`,
    },
  ];
  return (
    <section className="g-light relative isolate z-10 -mt-12 overflow-clip rounded-t-[44px] pt-24 pb-40 sm:rounded-t-[56px] sm:pt-32 sm:pb-48">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <Reveal className="flex justify-center">
            <Eyebrow tone="light">The story so far</Eyebrow>
          </Reveal>
          <Reveal delay={0.06}>
            <Title tone="light" className="mt-6 text-[clamp(2.2rem,4.4vw,3.8rem)]" lead="From a sketch" fade="to a firm." />
          </Reveal>
        </div>
        <div className="relative mx-auto mt-16 max-w-4xl">
          <div aria-hidden="true" className="absolute top-2 bottom-2 left-[27px] w-px bg-[linear-gradient(180deg,transparent,rgba(14,17,16,0.15)_10%,rgba(14,17,16,0.15)_90%,transparent)] sm:left-1/2" />
          <ol className="flex flex-col gap-10">
            {steps.map((s, i) => (
              <Reveal key={s.year} delay={i * 0.06}>
                <li className="relative grid gap-4 pl-16 sm:grid-cols-2 sm:gap-14 sm:pl-0">
                  <span className="absolute top-1 left-[14px] grid h-7 w-7 place-items-center rounded-full bg-[var(--g-ink)] ring-4 ring-[var(--g-lime)]/30 sm:left-1/2 sm:-translate-x-1/2">
                    <span className="h-2 w-2 rounded-full bg-[var(--g-lime)]" />
                  </span>
                  <div className={i % 2 ? "sm:order-2 sm:pl-6" : "sm:pr-6 sm:text-right"}>
                    <span className="g-num g-shade-light text-[56px] leading-none font-semibold tracking-[-0.05em]">{s.year}</span>
                    <h3 className="mt-2 text-[22px] font-semibold tracking-[-0.03em] text-[var(--g-ink)]">{s.title}</h3>
                  </div>
                  <p className={`g-card-paper g-hair g-hair-ink rounded-[22px] p-6 text-[15px] leading-relaxed text-[var(--g-muted-ink)] ${i % 2 ? "sm:order-1" : ""}`}>{s.body}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </Container>
    </section>
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
        lede="The People Prop exists for one reason: skilled traders deserve access to serious capital without predatory rules standing in the way."
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
      <Timeline maxSize={cat.maxSize} />
      <Cta
        title={
          <>
            <span className="g-shade-dark">Trade with a firm that wants you to </span>
            <span className="g-shade-lime">win.</span>
          </>
        }
        lede={`Challenges from ${usd(cat.minFee)}. Funding up to ${compactUsd(cat.maxSize)}. Payouts every two weeks at up to ${cat.maxSplit}% split. The rest is up to your skill.`}
        primary={{ label: "Start a challenge", href: href("challenges") }}
        secondary={{ label: "Talk to us", href: href("contact") }}
        size="md"
      />
    </>
  );
}
