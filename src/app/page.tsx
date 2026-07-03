"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { createBrowserClient } from "@supabase/ssr";
import {
  TrendingUp,
  Shield,
  Clock,
  CircleCheck as CheckCircle2,
  ChevronUp,
  ChevronDown,
  CalendarOff,
  Monitor,
  Newspaper,
  MoonStar,
  RotateCcw,
  BadgeDollarSign,
  Target,
  KeyRound,
  DollarSign,
  Percent,
  CalendarCheck,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";

import { FeaturedIn } from "@/components/landing/FeaturedIn";
import { cn } from "@/lib/utils";
import { faq } from "@/data/faq";

/* ═══════════════════════════════════════════════════════════════
   V4 Landing Page — "Minimal / CSS-first"

   Design language (unchanged brand identity):
   • Page bg = warm cream (#f1eade)
   • Full-width ROUNDED CARDS with tiny inset, alternating
     BLACK → CREAM → BLACK
   • Matte dark #0c0c0c + neon lime #cbfb45 accent
   • Giant, tight-tracked typography, generous whitespace

   Performance architecture (why V4 is fast):
   • ZERO animation libraries on this route — no GSAP, no
     ScrollTrigger, no framer-motion, no Lenis, no custom cursor
   • One shared IntersectionObserver toggles a CSS class for
     reveals; the transitions themselves are pure CSS
   • No scroll hijacking of any kind → scroll lock is impossible
   • FAQ = native <details>; testimonials = CSS-only marquee
     (desktop) / static grid (mobile)
   • Heavy calculators are code-split via next/dynamic
   • Below-fold sections use content-visibility:auto
   • Decorative backgrounds are static paint-once gradients —
     no blur() filters, no mix-blend-mode, no infinite rAF
   ═══════════════════════════════════════════════════════════════ */

/* Heavy interactive sections — split out of the initial bundle. */
const ChallengeCalculator = dynamic(
  () => import("@/components/landing/ChallengeCalculator").then((m) => m.ChallengeCalculator),
  { ssr: false, loading: () => <div className="min-h-[480px]" aria-hidden /> }
);
const ProfitCalculator = dynamic(
  () => import("@/components/landing/ProfitCalculator").then((m) => m.ProfitCalculator),
  { ssr: false, loading: () => <div className="min-h-[480px]" aria-hidden /> }
);

/* ─────────────────────────────────────────────────────────────
   Reveal system — ONE IntersectionObserver for the whole page.
   Elements opt in with `data-reveal`; CSS in globals.css does the
   actual animating. Stagger via `--reveal-delay` inline style.
   ───────────────────────────────────────────────────────────── */
function useRevealObserver() {
  useEffect(() => {
    // Gate reveal styles behind .js so content is never hidden without JS.
    document.documentElement.classList.add("js");

    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ─────────────────────────────────────────────────────────────
   Shared data
   ───────────────────────────────────────────────────────────── */
type StepBullet = { icon: typeof Target; t: string; s: string };
type Step = { badge: string; title: string; dark: boolean; bullets: StepBullet[] };

const STEPS: Step[] = [
  {
    badge: "Step 01",
    title: "Pass the evaluation",
    dark: false,
    bullets: [
      { icon: Target, t: "Hit a 10% profit target", s: "Reach and maintain a 10% profit target." },
      { icon: Shield, t: "Respect 4% daily / 8% max drawdown", s: "Stay within 4% daily and 8% overall limits." },
      { icon: Clock, t: "Minimum 3 trading days, no time limit", s: "Trade for at least 3 days. No time limit." },
    ],
  },
  {
    badge: "Step 02",
    title: "Unlock funded account",
    dark: true,
    bullets: [
      { icon: KeyRound, t: "Account credentials", s: "Delivered in under 24 hours." },
      { icon: DollarSign, t: "Up to $200,000", s: "In scaled capital." },
      { icon: Shield, t: "Same rules", s: "No daily target pressure." },
    ],
  },
  {
    badge: "Step 03",
    title: "Trade & get paid",
    dark: false,
    bullets: [
      { icon: CalendarCheck, t: "First payout 14 days", s: "Receive your first payout 14 days after your first trade." },
      { icon: Percent, t: "Up to 90% profit split", s: "Keep up to 90% of profits. Paid bi-weekly." },
      { icon: RotateCcw, t: "100% refund on payout #1", s: "We refund your full challenge fee with payout #1." },
    ],
  },
];

const TESTIMONIALS = [
  { name: "Marcus Adeyemi", handle: "@marcus.fx · Lagos", body: "The execution feels like a real institutional desk — no slippage tricks, no shifting goalposts. Got my first payout in 11 days.", payout: "$18,420" },
  { name: "Sofía Carrasco", handle: "@sofi.trades · Madrid", body: "The consistency rule is actually fair here. The 90% split on the 25K is the highest I've seen anywhere.", payout: "$9,610" },
  { name: "Daniel Park", handle: "@dpfx · Seoul", body: "Scaling plan got me from 25K to 75K in 8 months. Bi-weekly payouts always land on time.", payout: "$24,300" },
  { name: "Aisha Okafor", handle: "@aisha.fx · Abuja", body: "Sub-24h payouts aren't marketing fluff — my withdrawal hit in 9 hours. The dashboard is clean.", payout: "$14,850" },
  { name: "Chen Wei", handle: "@chen.markets · Singapore", body: "Auto-scaling bumped me from $25K to $50K without paperwork. The profit split at this level is 90%.", payout: "$21,400" },
  { name: "Grace Nwankwo", handle: "@grace.fx · London", body: "100% refund on first payout means the challenge is essentially free if you're profitable.", payout: "$13,750" },
];

/* ─────────────────────────────────────────────────────────────
   Small building blocks (all static / CSS-driven)
   ───────────────────────────────────────────────────────────── */
function Eyebrow({ children, tone = "dark" }: { children: React.ReactNode; tone?: "dark" | "light" | "lime" }) {
  return (
    <div
      className={cn(
        "mb-4 text-sm font-medium uppercase tracking-[0.3em]",
        tone === "lime" && "text-[#cbfb45]",
        tone === "dark" && "text-[#6c6a68]",
        tone === "light" && "text-white/50"
      )}
    >
      {children}
    </div>
  );
}

function PillCta({
  href,
  children,
  variant = "lime",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "lime" | "outline-light" | "dark" | "outline-dark";
}) {
  if (variant === "lime") {
    return (
      <Link
        href={href}
        className="group inline-flex h-12 items-center gap-2 rounded-full bg-[#cbfb45] pl-2 pr-5 text-[15px] font-semibold text-[#0c0c0c] transition-all duration-300 hover:rounded-xl"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0c0c0c] transition-all duration-300 group-hover:rounded-md">
          <ArrowUpRight className="h-4 w-4 text-[#cbfb45] transition-transform duration-300 group-hover:rotate-45" />
        </span>
        {children}
      </Link>
    );
  }
  if (variant === "dark") {
    return (
      <Link
        href={href}
        className="group inline-flex h-12 items-center gap-2 rounded-full bg-[#0c0c0c] pl-2 pr-5 text-[15px] font-semibold text-white transition-all duration-300 hover:rounded-xl"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#cbfb45] transition-all duration-300 group-hover:rounded-md">
          <ArrowUpRight className="h-4 w-4 text-[#0c0c0c] transition-transform duration-300 group-hover:rotate-45" />
        </span>
        {children}
      </Link>
    );
  }
  if (variant === "outline-light") {
    return (
      <Link
        href={href}
        className="inline-flex h-12 items-center rounded-full border border-white/25 px-6 text-[15px] font-medium text-white transition-all duration-300 hover:rounded-xl hover:border-white/60 hover:bg-white/[0.04]"
      >
        {children}
      </Link>
    );
  }
  return (
    <Link
      href={href}
      className="inline-flex h-12 items-center rounded-full border border-[#0c0c0c]/20 px-6 text-[15px] font-medium text-[#0c0c0c] transition-all duration-300 hover:rounded-xl hover:bg-[#0c0c0c]/5"
    >
      {children}
    </Link>
  );
}

function TestimonialCard({ t, wide = false }: { t: (typeof TESTIMONIALS)[number]; wide?: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-[1rem] bg-[#cbfb45] p-6 text-[#0c0c0c] shadow-sm",
        wide ? "h-[200px] w-[350px] shrink-0" : "min-h-[180px]"
      )}
    >
      <p className="text-[13px] font-semibold leading-relaxed lg:text-[14px]">&ldquo;{t.body}&rdquo;</p>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0c0c0c] text-[13px] font-bold text-white">
          {t.name.split(" ").map((n) => n[0]).join("")}
        </div>
        <div>
          <div className="text-[14px] font-bold">{t.name}</div>
          <div className="flex items-center gap-1 text-[12px] font-semibold opacity-70">
            <CheckCircle2 className="h-3 w-3" strokeWidth={3} /> {t.payout} paid
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════ MAIN PAGE ═══════════════════════════════════════ */

export default function HomePage() {
  useRevealObserver();

  const [platformsText, setPlatformsText] = useState("MT5 · DXTrade · TPP Terminal");
  const [dbStats, setDbStats] = useState<{ value: string; label: string; key_name: string }[]>([
    { value: "250+", label: "Successful payouts", key_name: "total_payouts" },
    { value: "142+", label: "Countries served", key_name: "countries" },
    { value: "5*", label: "TrustPilot rating", key_name: "trustpilot" },
  ]);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    supabase
      .from("tpp_platforms")
      .select("name")
      .eq("is_active", true)
      .order("created_at")
      .then(({ data }) => {
        if (data && data.length > 0) setPlatformsText(data.map((p) => p.name).join(" · "));
      });

    supabase
      .from("tpp_stats")
      .select("*")
      .order("key_name")
      .then(({ data }) => {
        if (data && data.length > 0) setDbStats(data);
      });
  }, []);

  const faqItems = faq.slice(0, 6);

  const whyCards: {
    stat: string;
    unit: string;
    title: string;
    desc: string;
    icon: typeof TrendingUp;
    accent: boolean;
    fullWidth?: boolean;
  }[] = [
    { stat: "0.0", unit: "pips", title: "Raw Spreads", desc: "Tier-1 liquidity, zero markup. Your edge stays yours.", icon: TrendingUp, accent: false },
    { stat: "0", unit: "days min", title: "No Time Pressure", desc: "Pass in a day or a year — your pace, your rules.", icon: CalendarOff, accent: false },
    { stat: "FREE", unit: "retry", title: "Second Chance, On Us", desc: "Missed by a hair? We reset your challenge at zero cost.", icon: RotateCcw, accent: true },
    { stat: "$5", unit: "upfront", title: "Pass First, Pay Later", desc: "Prove your skill first. We only charge after you pass.", icon: BadgeDollarSign, accent: true },
    { stat: "NFP", unit: "& FOMC", title: "News Trading Allowed", desc: "No restrictions on high-impact events. Trade the volatility.", icon: Newspaper, accent: false },
    { stat: "24/7", unit: "hold", title: "Weekend & Overnight", desc: "Keep positions through swaps, weekends & holidays.", icon: MoonStar, accent: false },
    { stat: "3", unit: "platforms", title: platformsText, desc: "Trade on the platform you trust, plus our own proprietary terminal.", icon: Monitor, accent: false, fullWidth: true },
  ];

  return (
    <div className="page-wrapper min-h-screen bg-[#f1eade] text-[#0c0c0c] antialiased">
      {/* ═══════════════ SECTION 1 — HERO ═══════════════ */}
      <section className="px-[5px] py-[5px]">
        <div className="relative flex min-h-[92svh] flex-col items-center justify-center overflow-hidden rounded-xl bg-[#0a0a0a] px-6 py-24 lg:min-h-[94vh] lg:rounded-2xl lg:px-10">
          {/* Static lime glow — paint-once radial gradient, no filters */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-[30%] left-1/2 h-[90vw] w-[90vw] max-w-[1100px] -translate-x-1/2 rounded-full"
            style={{ background: "radial-gradient(closest-side, rgba(203,251,69,0.09), transparent)" }}
          />
          {/* Subtle grid texture — static */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "64px 64px",
              maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
              WebkitMaskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
            }}
          />

          <div className="relative z-10 flex w-full max-w-[1300px] flex-col items-center">
            {/* Trust badge */}
            <div data-reveal className="mb-8">
              <div className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2">
                <span className="pulse-dot relative inline-flex h-2.5 w-2.5 rounded-full bg-[#cbfb45]" />
                <span className="text-[13px] font-medium tracking-wide text-white/80">
                  Evaluating traders in 150+ countries
                </span>
              </div>
            </div>

            <h1
              data-reveal
              className="w-full text-center font-bold leading-[0.92] tracking-[-0.03em] text-white"
              style={{ fontSize: "clamp(2.8rem, 9vw, 8.5rem)", ["--reveal-delay" as string]: "80ms" }}
            >
              The <span className="text-[#cbfb45]">prop firm</span> that funds{" "}
              <span className="text-[#cbfb45]">real traders</span>
            </h1>

            <p
              data-reveal
              className="mt-8 max-w-[560px] text-center text-[15px] leading-relaxed text-white/55 lg:text-base"
              style={{ ["--reveal-delay" as string]: "160ms" }}
            >
              Transparent rules. Real capital up to $200,000. Payouts in under 24 hours.
              Built for traders — not against them.
            </p>

            <div
              data-reveal
              className="mt-10 flex flex-wrap items-center justify-center gap-3"
              style={{ ["--reveal-delay" as string]: "240ms" }}
            >
              <PillCta href="/dashboard/new-challenge" variant="lime">Start your challenge</PillCta>
              <PillCta href="/rules" variant="outline-light">Read the rules</PillCta>
            </div>

            {/* Inline stat strip — replaces animated counters */}
            <div
              data-reveal
              className="mt-14 grid w-full max-w-[640px] grid-cols-3 gap-4 border-t border-white/10 pt-8 lg:mt-16"
              style={{ ["--reveal-delay" as string]: "320ms" }}
            >
              {[
                { value: "90%", label: "Profit split" },
                { value: "$200K", label: "Max capital" },
                { value: "< 24h", label: "Payouts" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center gap-1">
                  <span className="text-2xl font-semibold tracking-tight text-white lg:text-4xl">{s.value}</span>
                  <span className="text-[12px] font-medium text-white/45 lg:text-[13px]">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURED LOGOS ═══════════════ */}
      <FeaturedIn />

      {/* ═══════════════ SECTION 2 — MANIFESTO ═══════════════ */}
      <section className="cv-auto w-full py-16 lg:py-24">
        <div className="mx-auto w-full max-w-[1100px] px-5 lg:px-10">
          <div className="flex flex-col items-center gap-y-8 text-center">
            <h2
              data-reveal
              className="font-bold tracking-tight text-[#0c0c0c]"
              style={{ fontSize: "clamp(2.6rem, 8vw, 6.5rem)", lineHeight: 1 }}
            >
              We&rsquo;re The People Prop
            </h2>

            <div data-reveal className="w-full" style={{ ["--reveal-delay" as string]: "100ms" }}>
              <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#e5ddd0] shadow-2xl md:aspect-[16/9] lg:rounded-3xl">
                <img
                  src="/images/dashboard-v2.webp"
                  alt="TPP Dashboard"
                  className="h-full w-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>

            <h3
              data-reveal
              className="mx-auto max-w-[620px] font-bold tracking-[-0.02em] text-[#0c0c0c]"
              style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)" }}
            >
              The prop firm that rebels against industry cliches
            </h3>
            <p data-reveal className="mx-auto max-w-[480px] text-base leading-relaxed text-[#6c6a68]">
              Ever noticed how every prop firm looks the same? Impossible rules, hidden gotchas, and
              payouts that never arrive. We built TPP to be the opposite — transparent rules, real
              capital, and payouts in under 24 hours.
            </p>

            <div data-reveal className="flex flex-wrap justify-center gap-2">
              <Link
                href="/dashboard/new-challenge"
                className="group inline-flex h-9 items-center gap-2 rounded-full border border-[#0c0c0c] bg-[#0c0c0c] pl-1.5 pr-4 text-[15px] font-medium text-white transition-all duration-300 hover:rounded-lg"
              >
                <span className="h-6 w-6 shrink-0 rounded-full bg-[#cbfb45] transition-all duration-300 group-hover:rounded-sm" />
                Start trading
              </Link>
              <Link
                href="/rules"
                className="inline-flex h-9 items-center rounded-full border border-[#0c0c0c]/30 px-5 text-[15px] text-[#0c0c0c] transition-all duration-300 hover:rounded-lg hover:bg-[#0c0c0c]/5"
              >
                About TPP
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 3 — STATS ═══════════════ */}
      <section className="cv-auto w-full pb-16 lg:pb-24">
        <div className="w-full px-5 lg:px-10">
          <div data-reveal className="flex flex-col gap-12 text-center md:flex-row md:text-left xl:gap-16">
            {dbStats.map((s) => (
              <div key={s.key_name || s.label} className="min-w-[200px] flex-1">
                <div className="flex flex-col items-center gap-2 md:items-start lg:gap-3">
                  <div className="text-5xl font-medium leading-tight tracking-tight text-[#0c0c0c] sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
                    {s.value}
                  </div>
                  <span className="text-base font-medium text-[#6c6a68] lg:text-lg">{s.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 4 — CHALLENGE CALCULATOR (lazy) ═══════════════ */}
      <ChallengeCalculator />

      {/* ═══════════════ SECTION 5 — WHY TPP ═══════════════ */}
      <section className="cv-auto w-full pb-16 lg:pb-24">
        <div className="px-[5px] py-[5px]">
          <div className="relative overflow-hidden rounded-2xl bg-black px-[15px] py-20 lg:px-[35px] xl:py-32">
            <div data-reveal className="pb-12 text-center lg:pb-20">
              <div className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-[#cbfb45]">Why TPP</div>
              <h2 className="font-bold tracking-[-0.03em] text-white" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
                Built different from every other <span className="text-[#cbfb45]">prop firm</span>
              </h2>
            </div>

            <div className="mx-auto w-full max-w-[1100px]">
              <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
                {whyCards.map((item, i) => (
                  <div
                    key={item.title}
                    data-reveal
                    className={cn(item.fullWidth && "sm:col-span-2")}
                    style={{ ["--reveal-delay" as string]: `${Math.min(i, 3) * 60}ms` }}
                  >
                    <div
                      className={cn(
                        "group relative h-full overflow-hidden rounded-2xl border p-6 transition-colors duration-300 md:rounded-3xl md:p-8",
                        item.accent
                          ? "border-transparent bg-[#cbfb45]"
                          : "border-white/[0.06] bg-[#141414] hover:border-white/[0.12]"
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="mb-3 flex items-baseline gap-2">
                            <span
                              className={cn(
                                "font-black leading-none tracking-[-0.04em]",
                                item.accent ? "text-[#0c0c0c]" : "text-white",
                                item.fullWidth ? "text-4xl md:text-5xl" : "text-4xl md:text-[56px]"
                              )}
                            >
                              {item.stat}
                            </span>
                            <span
                              className={cn(
                                "text-sm font-semibold uppercase tracking-wider md:text-base",
                                item.accent ? "text-[#0c0c0c]/50" : "text-[#cbfb45]/70"
                              )}
                            >
                              {item.unit}
                            </span>
                          </div>
                          <h3 className={cn("mb-1.5 text-[17px] font-bold tracking-tight md:text-lg", item.accent ? "text-[#0c0c0c]" : "text-white")}>
                            {item.title}
                          </h3>
                          <p className={cn("max-w-md text-[13px] leading-relaxed md:text-[14px]", item.accent ? "text-[#0c0c0c]/60" : "text-white/50")}>
                            {item.desc}
                          </p>
                        </div>
                        <div className={cn("mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", item.accent ? "bg-[#0c0c0c]/10" : "bg-white/[0.06]")}>
                          <item.icon className={cn("h-5 w-5", item.accent ? "text-[#0c0c0c]/70" : "text-[#cbfb45]")} strokeWidth={2} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div data-reveal className="mt-12 text-center lg:mt-16">
              <Link href="/rules" className="text-lg font-medium text-white underline underline-offset-4 transition-colors hover:text-[#cbfb45]">
                Read the full rules
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 6 — HOW IT WORKS (3 static cards, no scroll hijack) ═══════════════ */}
      <section className="cv-auto w-full pb-16 lg:pb-24">
        <div className="mx-auto w-full max-w-[1200px] px-5 lg:px-10">
          <div data-reveal className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-xl">
              <Eyebrow>How It Works</Eyebrow>
              <h2 className="font-bold tracking-[-0.03em] text-[#0c0c0c]" style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)" }}>
                Three steps from signup to <span className="text-[#a8d92f]">funded</span>
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#6c6a68]">
                No second phases. No 60-day clocks. No hidden gotchas. Just trade — and get paid.
              </p>
            </div>
            <Link
              href="/rules"
              className="hidden h-11 items-center gap-2 rounded-full border border-[#0c0c0c]/20 px-5 text-[15px] font-medium text-[#0c0c0c] transition-all duration-300 hover:rounded-lg hover:bg-[#0c0c0c]/5 md:inline-flex"
            >
              Read the full rules
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 md:gap-5 lg:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.badge} data-reveal style={{ ["--reveal-delay" as string]: `${i * 80}ms` }}>
                <div
                  className={cn(
                    "relative flex h-full flex-col overflow-hidden rounded-3xl p-7",
                    step.dark ? "bg-[#0c0c0c]" : "border border-[#0c0c0c]/10 bg-white/40"
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "pointer-events-none absolute -right-3 -top-6 select-none text-[7rem] font-black leading-none tracking-[-0.05em]",
                      step.dark ? "text-white/[0.05]" : "text-[#0c0c0c]/[0.05]"
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={cn(
                      "mb-5 inline-flex w-fit items-center rounded-full px-3 py-1 text-[12px] font-semibold uppercase tracking-wider",
                      step.dark ? "bg-[#cbfb45] text-[#0c0c0c]" : "bg-[#0c0c0c] text-[#cbfb45]"
                    )}
                  >
                    {step.badge}
                  </span>
                  <h3 className={cn("mb-6 text-xl font-bold tracking-tight", step.dark ? "text-white" : "text-[#0c0c0c]")}>
                    {step.title}
                  </h3>
                  <div className="flex flex-col gap-4">
                    {step.bullets.map((b) => (
                      <div key={b.t} className="flex gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0c0c0c]">
                          <b.icon className="h-4 w-4 text-[#cbfb45]" strokeWidth={2} />
                        </span>
                        <div>
                          <div className={cn("text-[14px] font-semibold", step.dark ? "text-white" : "text-[#0c0c0c]")}>{b.t}</div>
                          <div className={cn("text-[13px]", step.dark ? "text-white/45" : "text-[#6c6a68]")}>{b.s}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 7 — PROFIT CALCULATOR (lazy) ═══════════════ */}
      <ProfitCalculator />

      {/* ═══════════════ SECTION 8 — TESTIMONIALS ═══════════════ */}
      <section className="cv-auto w-full pb-16 pt-8 lg:pb-24">
        <div data-reveal className="mb-12 text-center">
          <h2 className="font-bold tracking-tight text-[#0c0c0c]" style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}>
            Trader <span className="text-[#a8d92f]">Voices</span>
          </h2>
          <p className="mt-2 text-[15px] font-medium text-[#0c0c0c]/60">What our traders are saying</p>
        </div>

        {/* Mobile / tablet: static grid — zero animation */}
        <div data-reveal className="grid grid-cols-1 gap-3 px-5 sm:grid-cols-2 lg:hidden">
          {TESTIMONIALS.slice(0, 4).map((t) => (
            <TestimonialCard key={t.name} t={t} />
          ))}
        </div>

        {/* Desktop: CSS-only marquee (compositor thread, pauses on hover) */}
        <div
          className="marquee relative hidden w-full flex-col gap-3 py-4 lg:flex"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
          }}
        >
          <div className="marquee-track">
            {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
              <TestimonialCard key={`r1-${i}`} t={t} wide />
            ))}
          </div>
          <div className="marquee-track marquee-reverse">
            {[...TESTIMONIALS.slice().reverse(), ...TESTIMONIALS.slice().reverse()].map((t, i) => (
              <TestimonialCard key={`r2-${i}`} t={t} wide />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 9 — FAQ (native <details>, zero JS) ═══════════════ */}
      <section className="cv-auto w-full pb-16 lg:pb-24">
        <div className="px-[5px] py-[5px]">
          <div className="rounded-[2rem] bg-[#0c0c0c] px-[15px] py-20 lg:rounded-[3.5rem] lg:px-[35px] xl:py-28">
            <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
              <div data-reveal>
                <div className="lg:sticky lg:top-32">
                  <div className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-[#cbfb45]">Frequently Asked</div>
                  <h2 className="font-bold tracking-[-0.03em] text-white" style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)" }}>
                    The questions <span className="text-[#cbfb45]">traders</span> ask first
                  </h2>
                  <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/50">
                    Everything you need to know before getting started. For the full list, see the rules page.
                  </p>
                  <Link
                    href="/rules"
                    className="mt-8 hidden h-11 items-center gap-2 rounded-full border border-white/20 px-5 text-[15px] font-medium text-white transition-all duration-300 hover:rounded-lg hover:border-[#cbfb45] hover:text-[#cbfb45] lg:inline-flex"
                  >
                    See all questions
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div data-reveal className="flex flex-col gap-3" style={{ ["--reveal-delay" as string]: "100ms" }}>
                {faqItems.map((item, i) => (
                  <details
                    key={item.q}
                    className="faq-item group rounded-2xl border border-white/[0.08] bg-white/[0.02] transition-colors duration-300 open:border-[#cbfb45]/40 open:bg-white/[0.05]"
                    open={i === 0}
                  >
                    <summary className="flex w-full cursor-pointer list-none items-center justify-between gap-4 px-5 py-5 text-left lg:px-7 [&::-webkit-details-marker]:hidden">
                      <span className="text-[15px] font-medium text-white lg:text-[17px]">{item.q}</span>
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 text-white/60 transition-all duration-300 group-open:rotate-180 group-open:border-[#cbfb45] group-open:bg-[#cbfb45] group-open:text-[#0c0c0c]">
                        <ChevronDown className="h-4 w-4" strokeWidth={2.2} />
                      </span>
                    </summary>
                    <p className="px-5 pb-6 text-[14px] leading-relaxed text-white/55 lg:px-7">{item.a}</p>
                  </details>
                ))}
                <Link
                  href="/rules"
                  className="mt-3 inline-flex items-center justify-center gap-2 text-[15px] font-medium text-[#cbfb45] underline underline-offset-4 lg:hidden"
                >
                  See all questions
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 10 — FINAL CTA ═══════════════ */}
      <section className="cv-auto w-full py-16 lg:py-24">
        <div className="w-full px-5 lg:px-10">
          <div data-reveal className="mx-auto max-w-2xl text-center">
            <h2 className="mb-6 font-bold tracking-[-0.03em] text-[#0c0c0c]" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
              Ready to get <span className="text-[#a8d92f]">funded?</span>
            </h2>
            <p className="mb-10 text-lg leading-relaxed text-[#6c6a68]">
              Join thousands of traders who chose transparency over gimmicks. Your first payout is 14 days away.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <PillCta href="/dashboard/new-challenge" variant="dark">Start your challenge</PillCta>
              <PillCta href="/rules" variant="outline-dark">Read the rules</PillCta>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="mt-4 rounded-t-[2rem] bg-[#cbfb45] text-[#0c0c0c] lg:rounded-t-[3rem]">
        <div className="mx-auto max-w-[1440px] px-5 pb-8 pt-16 lg:px-10 lg:pt-24">
          <div className="mb-16 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_2fr]">
            {/* Left Col - Brand & Newsletter */}
            <div className="flex flex-col">
              <span className="mb-2 text-3xl font-black tracking-tight">The People Prop</span>
              <p className="mb-8 max-w-[300px] text-[15px] font-medium opacity-70">
                Evaluating traders worldwide. Built by traders, for traders. No hidden rules, just real capital scaling.
              </p>

              <h4 className="mb-4 text-[14px] font-bold uppercase tracking-widest opacity-50">Newsletter</h4>
              <div className="mb-8 flex max-w-[320px] border-b-2 border-[#0c0c0c] pb-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 bg-transparent text-base font-medium outline-none placeholder:text-[#0c0c0c]/40"
                />
                <button className="text-xl font-medium transition-transform hover:translate-x-1" aria-label="Subscribe">→</button>
              </div>

              <div className="flex gap-4">
                <Link href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0c0c0c]/20 transition-all hover:bg-[#0c0c0c] hover:text-[#cbfb45]" aria-label="X (Twitter)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </Link>
                <Link href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0c0c0c]/20 transition-all hover:bg-[#0c0c0c] hover:text-[#cbfb45]" aria-label="Instagram">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                </Link>
                <Link href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0c0c0c]/20 transition-all hover:bg-[#0c0c0c] hover:text-[#cbfb45]" aria-label="YouTube">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                  </svg>
                </Link>
                <Link href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0c0c0c]/20 transition-all hover:bg-[#0c0c0c] hover:text-[#cbfb45]" aria-label="Discord">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Right Col - Navigation Links */}
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:justify-items-end">
              <div className="flex flex-col gap-4">
                <h4 className="mb-2 text-[14px] font-bold uppercase tracking-widest opacity-50">Platform</h4>
                <Link href="/dashboard" className="text-[15px] font-medium transition-opacity hover:opacity-60">Dashboard</Link>
                <Link href="/challenges" className="text-[15px] font-medium transition-opacity hover:opacity-60">Challenges</Link>
                <Link href="/heatmap" className="text-[15px] font-medium transition-opacity hover:opacity-60">Heatmap</Link>
                <Link href="/leaderboard" className="text-[15px] font-medium transition-opacity hover:opacity-60">Leaderboard</Link>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="mb-2 text-[14px] font-bold uppercase tracking-widest opacity-50">Resources</h4>
                <Link href="/rules" className="text-[15px] font-medium transition-opacity hover:opacity-60">Trading Rules</Link>
                <Link href="/faq" className="text-[15px] font-medium transition-opacity hover:opacity-60">FAQ</Link>
                <Link href="/blog" className="text-[15px] font-medium transition-opacity hover:opacity-60">Blog</Link>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="mb-2 text-[14px] font-bold uppercase tracking-widest opacity-50">Company</h4>
                <Link href="/about" className="text-[15px] font-medium transition-opacity hover:opacity-60">About Us</Link>
                <Link href="/contact" className="text-[15px] font-medium transition-opacity hover:opacity-60">Contact</Link>
                <Link href="/careers" className="text-[15px] font-medium transition-opacity hover:opacity-60">Careers</Link>
                <Link href="/reviews" className="text-[15px] font-medium transition-opacity hover:opacity-60">Reviews</Link>
              </div>
              <div className="flex flex-col gap-4">
                <h4 className="mb-2 text-[14px] font-bold uppercase tracking-widest opacity-50">Legal</h4>
                <Link href="/terms" className="text-[15px] font-medium transition-opacity hover:opacity-60">Terms</Link>
                <Link href="/privacy" className="text-[15px] font-medium transition-opacity hover:opacity-60">Privacy Policy</Link>
                <Link href="/refund" className="text-[15px] font-medium transition-opacity hover:opacity-60">Refund Policy</Link>
                <Link href="/kyc" className="text-[15px] font-medium transition-opacity hover:opacity-60">KYC/AML</Link>
              </div>
            </div>
          </div>

          <h2 className="my-8 select-none text-center font-black leading-[0.8] tracking-[-0.05em] text-[#0c0c0c]" style={{ fontSize: "clamp(5rem, 20vw, 22rem)" }}>
            TPP
          </h2>

          <div className="flex flex-col gap-8 border-t border-[#0c0c0c]/10 pt-8">
            <p className="mx-auto max-w-6xl text-center text-[12px] leading-relaxed opacity-60 md:text-left">
              <strong>Risk Warning:</strong> The People Prop provides simulated trading environments. All accounts provided to clients are simulated accounts. Trading in financial markets involves a high degree of risk and may not be suitable for all investors. The simulated capital provided is not real money and cannot be lost by the trader. Past performance is not indicative of future results. Please ensure you fully understand the risks involved and seek independent advice if necessary. The People Prop is not a broker and does not accept deposits.
            </p>
            <div className="flex flex-col items-center justify-between gap-4 text-[13px] font-medium opacity-80 sm:flex-row">
              <span>&copy; {new Date().getFullYear()} The People Prop. All rights reserved.</span>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#0c0c0c]/5 px-4 py-2 transition-opacity hover:opacity-100"
              >
                <ChevronUp className="h-4 w-4" strokeWidth={2.5} /> Back to top
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
