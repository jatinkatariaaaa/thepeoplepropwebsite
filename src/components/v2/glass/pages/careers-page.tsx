"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Briefcase, Coins, Globe, GraduationCap, HeartPulse, Laptop, Sparkles, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, Container, Eyebrow, Section, Title } from "../ui";
import { Reveal, Stagger, StaggerItem } from "../motion";
import { PageHero } from "../page-hero";
import { Cta } from "../cta";
import { href } from "../routes";

const PERKS = [
  { icon: Globe, title: "Remote-first, always", body: "Work from anywhere in the world. Our team spans 12 time zones and we have no office to commute to — just great work, wherever you do it best." },
  {
    icon: Coins,
    title: "Competitive pay + funded account",
    body: "Market-rate salaries paid in your currency of choice — plus every employee gets a funded trading account. We think you should experience the product you build.",
  },
  { icon: TrendingUp, title: "Equity in the upside", body: "Early team members receive meaningful equity. When the firm grows, everyone who built it grows with it." },
  { icon: HeartPulse, title: "Health & wellness budget", body: "A monthly stipend for health insurance, gym memberships, or whatever keeps you at your best. Burned-out people build bad products." },
  { icon: GraduationCap, title: "Learning budget", body: "Annual budget for courses, books, and conferences. If it makes you better at your craft, we want to pay for it." },
  { icon: Laptop, title: "Top-tier equipment", body: "New laptop, monitors, and any tools you need on day one. No ticket queues, no three-year refresh cycles." },
];

const OPENINGS = [
  {
    role: "Senior Full-Stack Engineer",
    team: "Engineering",
    type: "Full-time · Remote",
    blurb: "Build the trading dashboard, payout systems, and evaluation engine used by thousands of funded traders daily. Next.js, TypeScript, Postgres.",
  },
  {
    role: "Risk Analyst",
    team: "Trading Operations",
    type: "Full-time · Remote",
    blurb: "Monitor funded account risk, refine evaluation parameters, and help design rules that are strict on discipline but fair to traders.",
  },
  {
    role: "Customer Support Specialist (APAC hours)",
    team: "Support",
    type: "Full-time · Remote",
    blurb: "Be the under-5-minute response time our traders rave about. Trading knowledge strongly preferred — many of our best support staff are traders.",
  },
  {
    role: "Content & SEO Manager",
    team: "Marketing",
    type: "Full-time · Remote",
    blurb: "Own the blog, education hub, and organic growth. You know prop trading and can write about drawdown rules without putting readers to sleep.",
  },
  {
    role: "Community Manager (Discord)",
    team: "Community",
    type: "Part-time · Remote",
    blurb: "Grow and moderate our trader community across Discord and social. You will be the voice traders hear every day.",
  },
];

function Perks() {
  return (
    <Section shell={false} className="pt-10 pb-28 sm:pb-36">
      <Container>
        <div className="max-w-2xl">
          <Reveal>
            <Eyebrow icon={Sparkles}>Why work here</Eyebrow>
          </Reveal>
          <Reveal delay={0.06}>
            <Title className="mt-6 text-[clamp(2.2rem,4.4vw,3.8rem)]" lead="Small team. Real ownership." fade="Global impact." />
          </Reveal>
        </div>
        <Stagger className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" gap={0.07}>
          {PERKS.map(({ icon: Icon, title, body }, i) => (
            <StaggerItem key={title}>
              <article className={cn("g-hair g-spot h-full rounded-[28px] p-7", i === 1 ? "g-card-emerald" : "g-card-dark")}>
                <span className="grid h-12 w-12 place-items-center rounded-[16px] bg-white/[0.07] text-[var(--g-lime)] ring-1 ring-white/10">
                  <Icon className="h-5 w-5" strokeWidth={1.9} />
                </span>
                <h3 className="mt-6 text-[19px] font-semibold tracking-[-0.02em] text-white">{title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-white/60">{body}</p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </Section>
  );
}

function Openings() {
  const teams = useMemo(() => ["All", ...Array.from(new Set(OPENINGS.map((o) => o.team)))], []);
  const [team, setTeam] = useState("All");
  const list = OPENINGS.filter((o) => team === "All" || o.team === team);
  return (
    <section id="openings" className="g-light relative isolate z-10 -mt-12 scroll-mt-24 overflow-clip rounded-t-[44px] pt-24 pb-40 sm:rounded-t-[56px] sm:pt-32 sm:pb-48">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Reveal>
              <Eyebrow tone="light" icon={Briefcase}>
                Open positions
              </Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <Title tone="light" className="mt-6 text-[clamp(2.2rem,4.4vw,3.8rem)]" lead="Current" fade="openings." />
            </Reveal>
          </div>
          <Reveal delay={0.1} className="g-noscroll -mx-1 flex gap-1 overflow-x-auto px-1">
            <div className="flex gap-1 rounded-full bg-black/[0.04] p-1">
              {teams.map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={team === t}
                  onClick={() => setTeam(t)}
                  className={cn("shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors", team === t ? "bg-[var(--g-ink)] text-white" : "text-black/55 hover:text-black")}
                >
                  {t}
                </button>
              ))}
            </div>
          </Reveal>
        </div>

        <ul className="mt-12 flex flex-col gap-3">
          {list.map((o) => (
            <li key={o.role}>
              <article className="g-card-paper g-hair g-hair-ink group grid gap-4 rounded-[26px] p-6 sm:grid-cols-[1fr_auto] sm:items-center sm:p-7">
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="text-[20px] font-semibold tracking-[-0.02em] text-[var(--g-ink)]">{o.role}</h3>
                    <span className="rounded-full bg-[var(--g-ink)] px-2.5 py-1 text-[11px] font-semibold text-[var(--g-lime)]">{o.team}</span>
                  </div>
                  <p className="mt-1 text-[13px] font-medium text-[var(--g-emerald)]">{o.type}</p>
                  <p className="mt-3 max-w-3xl text-[15px] leading-relaxed text-[var(--g-muted-ink)]">{o.blurb}</p>
                </div>
                <Link href={href("contact")} className="g-btn h-11 justify-self-start bg-[var(--g-ink)] px-5 text-[14px] text-white sm:justify-self-end">
                  Apply now
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:rotate-45" />
                </Link>
              </article>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-center text-[14.5px] text-[var(--g-muted-ink)]">
          Don&apos;t see your role? We hire exceptional people even without an opening —{" "}
          <Link href={href("contact")} className="font-semibold text-[var(--g-emerald)] underline decoration-[var(--g-emerald)]/30 underline-offset-4">
            send us a pitch
          </Link>
          .
        </p>
      </Container>
    </section>
  );
}

export function CareersPage() {
  return (
    <>
      <PageHero
        art="/art/page-careers.webp"
        crumb="Careers"
        eyebrow="Careers"
        icon={Briefcase}
        lead="Help us fund"
        fade="the world's traders."
        lede="We're a remote-first team building the fairest prop firm in the industry. If you care about traders getting a fair deal, you'll fit right in."
      >
        <Button href="#openings">See open roles</Button>
      </PageHero>
      <Perks />
      <Openings />
      <Cta
        title={
          <>
            <span className="g-shade-dark">Build the firm you wish </span>
            <span className="g-shade-lime">existed.</span>
          </>
        }
        lede="We read every application personally and reply within one week — usually much faster. Tell us what you would improve about TPP and you have our attention."
        primary={{ label: "Get in touch", href: href("contact") }}
        secondary={{ label: "About the company", href: href("about") }}
        size="md"
      />
    </>
  );
}
