"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  TrendingUp,
  Shield,
  Zap,
  DollarSign,
  Users,
  BarChart3,
  Target,
  Award,
  Clock,
  CheckCircle2,
  Star,
  Mail,
  ChevronUp,
  Menu,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   V2 Landing Page — Noramble-Inspired Brutalist Design
   
   Design Language:
   • Deep black (#0c0c0c) background
   • Neon lime (#bcff2e) accent
   • Giant tight-tracked typography
   • Large rounded corners (2rem)
   • Pill-shaped buttons
   ═══════════════════════════════════════════════════════════════ */

/* ---------- Animated Counter ---------- */
function AnimatedCounter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, end]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

/* ---------- Section Reveal ---------- */
function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Feature Card ---------- */
function FeatureCard({
  icon: Icon,
  title,
  desc,
  color = "#bcff2e",
  delay = 0,
}: {
  icon: any;
  title: string;
  desc: string;
  color?: string;
  delay?: number;
}) {
  return (
    <Reveal delay={delay}>
      <div className="group relative rounded-[2rem] border border-white/[0.06] bg-white/[0.03] p-8 md:p-10 transition-all duration-500 hover:bg-white/[0.06] hover:border-white/[0.12]">
        <div
          className="mb-6 w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-6 h-6" style={{ color }} strokeWidth={2} />
        </div>
        <h3 className="text-xl md:text-2xl font-semibold text-white mb-3 tracking-tight">{title}</h3>
        <p className="text-[#a0a0a0] leading-relaxed text-[15px]">{desc}</p>
      </div>
    </Reveal>
  );
}

/* ---------- Testimonial Card ---------- */
function TestimonialCardV2({
  name,
  handle,
  body,
  payout,
  delay = 0,
}: {
  name: string;
  handle: string;
  body: string;
  payout: string;
  delay?: number;
}) {
  return (
    <Reveal delay={delay}>
      <div className="rounded-[2rem] border border-white/[0.06] bg-white/[0.03] p-8 hover:bg-white/[0.06] transition-all duration-500">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#bcff2e] text-[#0c0c0c] text-[13px] font-bold flex items-center justify-center shrink-0">
            {name.split(" ").map((n) => n[0]).join("")}
          </div>
          <div>
            <p className="text-white font-semibold text-[15px]">{name}</p>
            <p className="text-[#6c6a68] text-[13px]">{handle}</p>
          </div>
        </div>
        <p className="text-[#a0a0a0] text-[14px] leading-relaxed mb-4 line-clamp-3">
          &ldquo;{body}&rdquo;
        </p>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#bcff2e]" strokeWidth={2.5} />
          <span className="text-[#bcff2e] text-[13px] font-semibold">{payout} paid out</span>
        </div>
      </div>
    </Reveal>
  );
}

/* ═══════════════════════════════════════ MAIN PAGE ═══════════════════════════════════════ */

export default function V2Page() {
  const testimonials = [
    { name: "Marcus Adeyemi", handle: "@marcus.fx · Lagos, NG", body: "I've evaluated with four prop firms before TPP. The execution feels like a real institutional desk — no slippage tricks, no shifting goalposts. Got my first payout in 11 days.", payout: "$18,420" },
    { name: "Sofía Carrasco", handle: "@sofi.trades · Madrid, ES", body: "The consistency rule is actually fair here. It's about being a real trader, not gaming the system. The 90% split on the 25K is the highest I've seen anywhere.", payout: "$9,610" },
    { name: "Daniel Park", handle: "@dpfx · Seoul, KR", body: "Scaling plan got me from a 25K to a 75K in 8 months. Bi-weekly payouts always land on time. The whole experience just feels premium.", payout: "$24,300" },
    { name: "Aisha Okafor", handle: "@aisha.fx · Abuja, NG", body: "Sub-24h payouts aren't marketing fluff — my withdrawal hit in 9 hours. The dashboard is clean, the rules are transparent, and the execution is razor-sharp.", payout: "$14,850" },
    { name: "Chen Wei", handle: "@chen.markets · Singapore, SG", body: "I've been funded for 6 months now. Auto-scaling bumped me from $25K to $50K without any paperwork. The profit split at this level is 90%.", payout: "$21,400" },
    { name: "Grace Nwankwo", handle: "@grace.fx · London, UK", body: "The Founders' Cohort pricing is genuinely competitive. 100% refund on first payout means the challenge is essentially free if you're profitable.", payout: "$13,750" },
  ];

  return (
    <div className="v2-page bg-[#0c0c0c] text-white min-h-screen" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ═══════════════ HEADER ═══════════════ */}
      <header className="fixed top-0 left-0 w-full z-50 py-5">
        <div className="max-w-[1440px] mx-auto px-[5%] flex items-center justify-between">
          <Link href="/v2" className="text-white font-bold text-xl tracking-tight hover:text-[#bcff2e] transition-colors">
            TPP
          </Link>
          <p className="hidden md:block text-[14px] text-white/60 max-w-[220px]">
            Your friendly neighbourhood prop trading firm
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center gap-2 text-[14px] border border-white/20 text-white px-5 py-2.5 rounded-full hover:bg-white hover:text-[#0c0c0c] transition-all duration-300"
            >
              Let&apos;s trade <ArrowUpRight className="w-4 h-4" />
            </Link>
            <button className="text-white text-[14px] font-medium sm:hidden" aria-label="Menu">
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="min-h-screen flex items-center justify-center text-center px-[5%]">
        <div className="max-w-5xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="font-medium leading-[0.88] tracking-[-0.03em]"
            style={{ fontSize: "clamp(2.8rem, 9vw, 9rem)" }}
          >
            The prop firm
            <br />
            <span className="text-[#bcff2e]">that funds</span>
            <br />
            real traders
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-8 md:mt-10 text-[#a0a0a0] text-lg md:text-xl max-w-xl mx-auto leading-relaxed"
          >
            Pass one fair evaluation. Get funded up to $200,000. Keep up to 90% of everything you earn.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              href="/dashboard/new-challenge"
              className="inline-flex items-center gap-2 bg-[#bcff2e] text-[#0c0c0c] font-semibold px-8 py-4 rounded-full text-[15px] hover:brightness-110 transition-all duration-300 hover:scale-[1.02]"
            >
              Start Your Challenge <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="#how"
              className="inline-flex items-center gap-2 border border-white/20 text-white px-8 py-4 rounded-full text-[15px] hover:bg-white hover:text-[#0c0c0c] transition-all duration-300"
            >
              How It Works
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ INTRO (2-col) ═══════════════ */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1440px] mx-auto px-[5%]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            <Reveal>
              <div className="rounded-[2rem] overflow-hidden aspect-[4/3] bg-[#1a1a1a]">
                <img
                  src="/images/dashboard-mockup.webp"
                  alt="TPP Dashboard"
                  className="w-full h-full object-cover"
                />
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <div>
                <h2
                  className="font-medium tracking-[-0.03em] mb-6 text-white"
                  style={{ fontSize: "clamp(2rem, 5vw, 3.75rem)" }}
                >
                  We&apos;re The People Prop
                </h2>
                <p className="text-[#a0a0a0] text-lg md:text-xl leading-relaxed mb-8">
                  Ever noticed how every prop firm looks the same? Impossible rules, hidden gotchas,
                  and payouts that never arrive. We built TPP to be the opposite — transparent rules,
                  real capital, and payouts in under 24 hours.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/dashboard/new-challenge"
                    className="inline-flex items-center gap-2 border border-white/20 text-white px-6 py-3 rounded-full text-[15px] hover:bg-white hover:text-[#0c0c0c] transition-all duration-300"
                  >
                    Start Trading
                  </Link>
                  <Link
                    href="/rules"
                    className="inline-flex items-center gap-1 text-white/60 text-[15px] underline underline-offset-4 decoration-white/20 hover:text-white hover:decoration-white/60 transition-all"
                  >
                    About TPP
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════ STATS ═══════════════ */}
      <section className="pb-24 md:pb-32">
        <div className="max-w-[1440px] mx-auto px-[5%]">
          <div className="border-t border-white/[0.08] pt-16">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 text-center sm:text-left">
              <Reveal>
                <div>
                  <span className="block text-5xl md:text-7xl font-semibold tracking-tight text-white">
                    <AnimatedCounter end={250} suffix="+" />
                  </span>
                  <span className="block text-[#6c6a68] text-base mt-2">Successful payouts</span>
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <div>
                  <span className="block text-5xl md:text-7xl font-semibold tracking-tight text-white">
                    <AnimatedCounter end={142} suffix="+" />
                  </span>
                  <span className="block text-[#6c6a68] text-base mt-2">Countries served</span>
                </div>
              </Reveal>
              <Reveal delay={0.2}>
                <div>
                  <span className="block text-5xl md:text-7xl font-semibold tracking-tight text-white">
                    90<span className="text-[#bcff2e]">%</span>
                  </span>
                  <span className="block text-[#6c6a68] text-base mt-2">Profit split</span>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section id="how" className="py-24 md:py-32">
        <div className="max-w-[1440px] mx-auto px-[5%]">
          <Reveal>
            <div className="mb-16">
              <span className="text-[#bcff2e] text-[13px] font-semibold uppercase tracking-[0.2em] mb-4 block">
                How It Works
              </span>
              <h2
                className="font-medium tracking-[-0.03em] text-white"
                style={{ fontSize: "clamp(2rem, 5vw, 3.75rem)" }}
              >
                Three steps from
                <br />
                signup to funded
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Pass the Evaluation",
                desc: "Hit 10% profit target with 4% daily / 8% max drawdown. Minimum 3 trading days. No time limit.",
                icon: Target,
              },
              {
                step: "02",
                title: "Get Your Funded Account",
                desc: "Receive your funded account credentials in under 24 hours. Up to $200,000 in real trading capital.",
                icon: Zap,
              },
              {
                step: "03",
                title: "Trade & Get Paid",
                desc: "First payout in 14 days. Up to 90% profit split paid bi-weekly. 100% fee refund on your first payout.",
                icon: DollarSign,
              },
            ].map((s, i) => (
              <Reveal key={s.step} delay={i * 0.1}>
                <div className="relative rounded-[2rem] border border-white/[0.06] bg-white/[0.03] p-8 md:p-10 h-full hover:bg-white/[0.06] transition-all duration-500 group">
                  <span className="text-[#bcff2e] text-[13px] font-bold tracking-[0.2em] uppercase mb-6 block">
                    Step {s.step}
                  </span>
                  <s.icon className="w-8 h-8 text-white/40 mb-6 group-hover:text-[#bcff2e] transition-colors duration-500" strokeWidth={1.5} />
                  <h3 className="text-xl md:text-2xl font-semibold text-white mb-3 tracking-tight">
                    {s.title}
                  </h3>
                  <p className="text-[#a0a0a0] leading-relaxed text-[15px]">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURES (2x2 Grid) ═══════════════ */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1440px] mx-auto px-[5%]">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-[#bcff2e] text-[13px] font-semibold uppercase tracking-[0.2em] mb-4 block">
                Why Traders Choose Us
              </span>
              <h2
                className="font-medium tracking-[-0.03em] text-white"
                style={{ fontSize: "clamp(2rem, 5vw, 3.75rem)" }}
              >
                Built for traders,
                <br />
                not against them
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FeatureCard
              icon={TrendingUp}
              title="Tier-1 Liquidity"
              desc="Raw spreads, no re-quotes, institutional-grade execution. Your strategy deserves real market conditions."
              delay={0}
            />
            <FeatureCard
              icon={Shield}
              title="Transparent Rules"
              desc="4% daily drawdown, 8% max. No hidden gotchas, no surprise consistency rules. What you see is what you get."
              color="#bcff2e"
              delay={0.1}
            />
            <FeatureCard
              icon={Clock}
              title="No Time Limit"
              desc="Trade at your own pace. No 30-day pressure. Pass the evaluation whenever you're ready — in 3 days or 3 months."
              delay={0.2}
            />
            <FeatureCard
              icon={Award}
              title="Auto-Scaling"
              desc="Hit your targets and your account grows automatically. $25K → $50K → $100K → $200K. No paperwork required."
              color="#bcff2e"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════ SERVICES LIST ═══════════════ */}
      <section className="py-24 md:py-32 border-t border-white/[0.06]">
        <div className="max-w-[1440px] mx-auto px-[5%]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <Reveal>
              <div className="sticky top-32">
                <span className="text-[#bcff2e] text-[13px] font-semibold uppercase tracking-[0.2em] mb-4 block">
                  What We Offer
                </span>
                <h2
                  className="font-medium tracking-[-0.03em] text-white mb-6"
                  style={{ fontSize: "clamp(2rem, 5vw, 3.75rem)" }}
                >
                  Challenge Plans
                </h2>
                <p className="text-[#a0a0a0] text-lg leading-relaxed">
                  Choose the account size that matches your ambition. All plans come with the same fair rules and industry-leading profit splits.
                </p>
              </div>
            </Reveal>
            <div className="space-y-4">
              {[
                { size: "$10,000", price: "$99", popular: false },
                { size: "$25,000", price: "$199", popular: true },
                { size: "$50,000", price: "$299", popular: false },
                { size: "$100,000", price: "$449", popular: false },
                { size: "$200,000", price: "$899", popular: false },
              ].map((plan, i) => (
                <Reveal key={plan.size} delay={i * 0.08}>
                  <Link
                    href="/dashboard/new-challenge"
                    className="group flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] px-8 py-6 hover:bg-white/[0.06] hover:border-[#bcff2e]/30 transition-all duration-500"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl md:text-3xl font-semibold text-white tracking-tight">{plan.size}</span>
                      {plan.popular && (
                        <span className="bg-[#bcff2e] text-[#0c0c0c] text-[10px] font-bold uppercase tracking-[0.15em] px-3 py-1 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-[#6c6a68] text-lg">from {plan.price}</span>
                      <ArrowRight className="w-5 h-5 text-white/30 group-hover:text-[#bcff2e] group-hover:translate-x-1 transition-all duration-300" />
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ TESTIMONIALS ═══════════════ */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1440px] mx-auto px-[5%]">
          <Reveal>
            <div className="text-center mb-16 md:mb-20">
              <span className="text-[#bcff2e] text-[13px] font-semibold uppercase tracking-[0.2em] mb-4 block">
                Trader Voices
              </span>
              <h2
                className="font-medium tracking-[-0.03em] text-white"
                style={{ fontSize: "clamp(2rem, 6vw, 3.75rem)" }}
              >
                What our traders
                <br />
                are saying
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <TestimonialCardV2 key={t.name} {...t} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA SECTION ═══════════════ */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1440px] mx-auto px-[5%]">
          <Reveal>
            <div className="rounded-[2rem] bg-white/[0.03] border border-white/[0.06] p-12 md:p-20 text-center">
              <h2
                className="font-medium tracking-[-0.03em] text-white mb-6"
                style={{ fontSize: "clamp(2rem, 5vw, 3.75rem)" }}
              >
                Ready to get <span className="text-[#bcff2e]">funded</span>?
              </h2>
              <p className="text-[#a0a0a0] text-lg md:text-xl max-w-xl mx-auto leading-relaxed mb-10">
                Join thousands of traders who chose transparency over gimmicks. Your first payout is 14 days away.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/dashboard/new-challenge"
                  className="inline-flex items-center gap-2 bg-[#bcff2e] text-[#0c0c0c] font-semibold px-8 py-4 rounded-full text-[15px] hover:brightness-110 transition-all duration-300 hover:scale-[1.02]"
                >
                  Start Your Challenge <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/rules"
                  className="inline-flex items-center gap-2 border border-white/20 text-white px-8 py-4 rounded-full text-[15px] hover:bg-white hover:text-[#0c0c0c] transition-all duration-300"
                >
                  Read the Rules
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════ LIME FOOTER ═══════════════ */}
      <footer className="bg-[#bcff2e] text-[#0c0c0c] rounded-t-[3rem] mt-8">
        <div className="max-w-[1440px] mx-auto px-[5%] pt-16 pb-8">
          {/* Footer Top */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-16">
            <div>
              <span className="font-bold text-xl">The People Prop</span>
              <p className="text-[14px] opacity-60 mt-1">Prop Trading · Global</p>
            </div>
            <Link
              href="/dashboard/new-challenge"
              className="inline-flex items-center gap-2 border border-[#0c0c0c]/30 text-[#0c0c0c] px-6 py-3 rounded-full text-[14px] font-medium hover:bg-[#0c0c0c] hover:text-[#bcff2e] transition-all duration-300"
            >
              Start Trading <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Footer Main */}
          <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-12 mb-16">
            <div>
              <h3 className="text-3xl md:text-4xl font-medium tracking-tight mb-6 max-w-[400px]">
                Keep up to date with TPP news
              </h3>
              <div className="flex border-b-2 border-[#0c0c0c] pb-3 max-w-md">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 bg-transparent text-lg outline-none placeholder:text-[#0c0c0c]/40"
                />
                <button className="text-2xl font-medium" aria-label="Subscribe">→</button>
              </div>
            </div>
            <div className="flex gap-12 md:gap-16">
              <div className="flex flex-col gap-3">
                <Link href="/challenges" className="font-medium hover:opacity-60 transition-opacity">Challenges</Link>
                <Link href="/rules" className="font-medium hover:opacity-60 transition-opacity">Rules</Link>
                <Link href="/contact" className="font-medium hover:opacity-60 transition-opacity">Contact</Link>
              </div>
              <div className="flex flex-col gap-3">
                <Link href="/login" className="font-medium hover:opacity-60 transition-opacity">Dashboard</Link>
                <Link href="/referral" className="font-medium hover:opacity-60 transition-opacity">Referral</Link>
                <Link href="#" className="font-medium hover:opacity-60 transition-opacity">Discord</Link>
              </div>
            </div>
          </div>

          {/* Giant Brand */}
          <h1
            className="font-extrabold text-center tracking-[-0.05em] leading-[0.8] my-8 select-none"
            style={{ fontSize: "clamp(4rem, 18vw, 20rem)" }}
          >
            TPP
          </h1>

          {/* Footer Bottom */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-[#0c0c0c]/10 text-[14px] opacity-60">
            <span>&copy; 2026 The People Prop</span>
            <Link href="#" className="hover:opacity-100 transition-opacity">Privacy Policy</Link>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="inline-flex items-center gap-1 hover:opacity-100 transition-opacity"
            >
              <ChevronUp className="w-4 h-4" /> Take me back to top
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
