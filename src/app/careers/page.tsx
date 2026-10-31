"use client";

import Link from "next/link";
import { PageLayout, PageHero, PageSection } from "@/components/layout";
import { Reveal, GsapWords, Magnetic } from "@/components/ui/Animations";
import {
  ArrowRight,
  ArrowUpRight,
  Globe,
  Laptop,
  TrendingUp,
  HeartPulse,
  GraduationCap,
  Coins,
} from "lucide-react";

const perks = [
  {
    icon: Globe,
    title: "Remote-first, always",
    body: "Work from anywhere in the world. Our team spans 12 time zones and we have no office to commute to — just great work, wherever you do it best.",
  },
  {
    icon: Coins,
    title: "Competitive pay + funded account",
    body: "Market-rate salaries paid in your currency of choice — plus every employee gets a funded trading account. We think you should experience the product you build.",
  },
  {
    icon: TrendingUp,
    title: "Equity in the upside",
    body: "Early team members receive meaningful equity. When the firm grows, everyone who built it grows with it.",
  },
  {
    icon: HeartPulse,
    title: "Health & wellness budget",
    body: "A monthly stipend for health insurance, gym memberships, or whatever keeps you at your best. Burned-out people build bad products.",
  },
  {
    icon: GraduationCap,
    title: "Learning budget",
    body: "Annual budget for courses, books, and conferences. If it makes you better at your craft, we want to pay for it.",
  },
  {
    icon: Laptop,
    title: "Top-tier equipment",
    body: "New laptop, monitors, and any tools you need on day one. No ticket queues, no three-year refresh cycles.",
  },
];

const openings = [
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

export default function CareersPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="Careers"
        title="Help us fund the world's traders"
        titleHighlight={["fund", "traders"]}
        description="We're a remote-first team building the fairest prop firm in the industry. If you care about traders getting a fair deal, you'll fit right in."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Careers", href: "/careers" },
        ]}
      />

      {/* ═══ Why TPP ═══ */}
      <PageSection variant="cream">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mb-5 flex items-center gap-3 text-sm font-medium uppercase tracking-[0.2em] text-[#0c0c0c]/50">
              <span className="h-px w-8 bg-[#0c0c0c]/20" />
              Why work here
            </div>
            <GsapWords
              text="Small team. Real ownership. Global impact."
              highlight={["Real", "Global"]}
              as="h2"
              className="mb-12 max-w-2xl font-bold tracking-[-0.03em] text-[#0c0c0c]"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", lineHeight: 1.05 }}
            />
          </Reveal>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {perks.map((p, i) => (
              <Reveal key={p.title} delay={(i % 3) * 0.08}>
                <div className="flex h-full flex-col rounded-3xl border border-[#0c0c0c]/10 bg-white/60 p-7">
                  <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#cbfb45]">
                    <p.icon className="h-5 w-5 text-[#0c0c0c]" strokeWidth={2} />
                  </span>
                  <h3 className="mb-3 text-lg font-bold tracking-tight text-[#0c0c0c]">
                    {p.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-[#0c0c0c]/60">{p.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </PageSection>

      {/* ═══ Open roles ═══ */}
      <PageSection variant="dark">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <div className="mb-5 flex items-center gap-3 text-sm font-medium uppercase tracking-[0.2em] text-white/40">
              <span className="h-px w-8 bg-white/20" />
              Open positions
            </div>
            <GsapWords
              text="Current openings"
              highlight={["openings"]}
              as="h2"
              className="mb-12 font-bold tracking-[-0.03em] text-white"
              style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)", lineHeight: 1.05 }}
            />
          </Reveal>
          <div className="space-y-4">
            {openings.map((o, i) => (
              <Reveal key={o.role} delay={i * 0.06}>
                <div className="group flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-7 transition-colors duration-300 hover:border-[#cbfb45]/40 sm:flex-row sm:items-center sm:justify-between">
                  <div className="max-w-xl">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-bold tracking-tight text-white">{o.role}</h3>
                      <span className="rounded-full bg-[#cbfb45]/15 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-[#cbfb45]">
                        {o.team}
                      </span>
                    </div>
                    <p className="mb-1 text-[13px] font-medium text-white/40">{o.type}</p>
                    <p className="text-[14px] leading-relaxed text-white/50">{o.blurb}</p>
                  </div>
                  <Link
                    href="/contact"
                    className="inline-flex h-11 w-fit shrink-0 items-center gap-2 rounded-full bg-[#cbfb45] px-5 text-[14px] font-semibold text-[#0c0c0c] transition-all duration-300 hover:rounded-xl"
                  >
                    Apply now
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.2}>
            <p className="mt-8 text-center text-[14px] text-white/40">
              Don&apos;t see your role? We hire exceptional people even without an
              opening —{" "}
              <Link href="/contact" className="font-semibold text-[#cbfb45] underline-offset-4 hover:underline">
                send us a pitch
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </PageSection>

      {/* ═══ CTA ═══ */}
      <PageSection variant="lime">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <GsapWords
              text="Build the firm you wish existed"
              highlight={["you", "existed"]}
              as="h2"
              className="mb-6 font-bold tracking-[-0.03em] text-[#0c0c0c]"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
            />
            <p className="mb-10 text-lg leading-relaxed text-[#0c0c0c]/60">
              We read every application personally and reply within one week —
              usually much faster. Tell us what you would improve about TPP and
              you have our attention.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Magnetic>
                <Link
                  href="/contact"
                  className="group inline-flex h-12 items-center gap-2 rounded-full bg-[#0c0c0c] pl-2 pr-5 text-[15px] font-semibold text-white transition-all duration-300 hover:rounded-xl"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#cbfb45] transition-all duration-300 group-hover:rounded-md">
                    <ArrowUpRight className="h-4 w-4 text-[#0c0c0c] transition-transform duration-300 group-hover:rotate-45" />
                  </span>
                  Get in touch
                </Link>
              </Magnetic>
              <Magnetic>
                <Link
                  href="/about"
                  className="inline-flex h-12 items-center rounded-full border border-[#0c0c0c]/30 px-6 text-[15px] font-medium text-[#0c0c0c] transition-all duration-300 hover:rounded-xl hover:bg-[#0c0c0c]/5"
                >
                  About the company
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
