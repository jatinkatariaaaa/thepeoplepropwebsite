"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle2,
  Award,
  ChevronUp,
  Menu,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { V2ChallengeCalculator } from "@/components/landing/V2ChallengeCalculator";

/* ═══════════════════════════════════════════════════════════════
   V2 Landing Page — Noramble Card-Stacking Design
   
   Design System (from deep analysis):
   • Page bg = warm cream (#f1eade / beige)
   • Sections are full-width ROUNDED CARDS with 5px inset
   • Cards alternate: BLACK → CREAM → BLACK → LIME
   • Each card has rounded-xl / rounded-2xl corners
   • Giant typography, tight tracking
   • Neon lime (#bcff2e) accent
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

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ---------- Section Reveal ---------- */
function Reveal({ children, className = "", delay = 0, style }: { children: React.ReactNode; className?: string; delay?: number; style?: React.CSSProperties }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* ═══════════════════════════════════════ MAIN PAGE ═══════════════════════════════════════ */

export default function V2Page() {
  const testimonials = [
    { name: "Marcus Adeyemi", handle: "@marcus.fx · Lagos", body: "The execution feels like a real institutional desk — no slippage tricks, no shifting goalposts. Got my first payout in 11 days.", payout: "$18,420" },
    { name: "Sofía Carrasco", handle: "@sofi.trades · Madrid", body: "The consistency rule is actually fair here. The 90% split on the 25K is the highest I've seen anywhere.", payout: "$9,610" },
    { name: "Daniel Park", handle: "@dpfx · Seoul", body: "Scaling plan got me from 25K to 75K in 8 months. Bi-weekly payouts always land on time.", payout: "$24,300" },
    { name: "Aisha Okafor", handle: "@aisha.fx · Abuja", body: "Sub-24h payouts aren't marketing fluff — my withdrawal hit in 9 hours. The dashboard is clean.", payout: "$14,850" },
    { name: "Chen Wei", handle: "@chen.markets · Singapore", body: "Auto-scaling bumped me from $25K to $50K without paperwork. The profit split at this level is 90%.", payout: "$21,400" },
    { name: "Grace Nwankwo", handle: "@grace.fx · London", body: "100% refund on first payout means the challenge is essentially free if you're profitable.", payout: "$13,750" },
  ];

  return (
    <div className="v2-page bg-[#f1eade] text-[#0c0c0c] min-h-screen" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>

      {/* ═══════════════ FIXED HEADER ═══════════════ */}
      <header className="fixed top-0 left-0 w-full z-50 h-20 lg:h-[7.5rem] px-[5px] lg:px-[10px]">
        <div className="relative z-20 flex h-full w-full items-center px-[10px] lg:px-[25px]">
          <Link href="/v2" className="transition-opacity hover:opacity-80 z-30 relative flex items-center">
            <img src="/images/logo-v2.png" alt="TPP Logo" className="h-6 md:h-8 w-auto object-contain" />
          </Link>
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-y-1/2 items-center p-1.5 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md z-30 shadow-2xl">
            {[
              { name: "Home", path: "/v2" },
              { name: "Challenges", path: "/challenges" },
              { name: "Rules", path: "/rules" },
              { name: "Referrals", path: "/referral" },
              { name: "Heatmap", path: "/heatmap" },
              { name: "Contact", path: "/contact" },
            ].map((link) => (
              <Link 
                key={link.name} 
                href={link.path} 
                className="relative px-4 py-1.5 text-white/60 hover:text-white text-[13px] font-medium tracking-wide transition-all duration-300 rounded-full hover:bg-white/10 hover:shadow-inner"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-4 lg:gap-6 z-30 relative">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 h-8 pl-1 pr-3 border border-white/40 rounded-full hover:rounded-lg transition-all duration-300 text-white text-[15px]"
            >
              <span className="h-6 w-6 rounded-full bg-[#bcff2e] group-hover:rounded-sm transition-all duration-300 shrink-0" />
              Let&apos;s trade
            </Link>
            <button className="text-white font-medium flex items-center gap-2 text-[15px]">
              <div className="w-5 flex flex-col gap-1.5">
                <div className="w-full h-px bg-white" />
                <div className="w-1/2 h-px bg-white ml-auto group-hover:w-full transition-all" />
              </div>
              Menu
            </button>
          </div>
        </div>
        {/* Header bg card — visible only after scrolling */}
        <div className="absolute inset-[5px] z-10 rounded-xl lg:rounded-2xl bg-black/90 backdrop-blur-sm" />
      </header>

      {/* ═══════════════════════════════════════════════
          SECTION 1: HERO — Black Card on Cream
          ═══════════════════════════════════════════════ */}
      <section className="h-dvh px-[5px] py-[5px]">
        <div className="relative flex flex-col h-full items-center justify-center rounded-xl lg:rounded-2xl bg-black px-6 lg:px-10 py-20 overflow-hidden">
          
          {/* Ambient Glow Orbs */}
          <div className="absolute top-[20%] left-[10%] w-[45vw] h-[45vw] bg-[#bcff2e]/[0.06] rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-[-10%] right-[10%] w-[35vw] h-[35vw] bg-[#bcff2e]/[0.08] rounded-full blur-[100px] pointer-events-none" />

          {/* Floating Trust Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8 relative z-10"
          >
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#bcff2e] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#bcff2e]"></span>
              </span>
              <span className="text-white/80 text-[13px] font-medium tracking-wide">Evaluating traders in 150+ countries</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 text-white font-medium tracking-[-0.03em] text-center w-full max-w-[1300px] leading-[0.88]"
            style={{ fontSize: "clamp(2.8rem, 9vw, 9rem)" }}
          >
            The <span className="text-[#bcff2e]">prop firm</span>
            <br />
            that funds
            <br />
            <span className="text-[#bcff2e]">real traders</span>
          </motion.h1>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 2: INTRO — Cream (page bg), No card
          ═══════════════════════════════════════════════ */}
      <section className="w-full py-16 lg:py-24">
        <div className="w-full px-5 lg:px-10">
          <div className="grid gap-y-16 md:grid-cols-12 gap-x-7 items-center">
            {/* Left small video */}
            <Reveal className="hidden md:block md:col-span-3 lg:col-span-2">
              <div className="aspect-[9/10] w-full rounded-2xl lg:rounded-3xl overflow-hidden bg-black">
                <video src="/videos/left-video.webm" autoPlay loop muted playsInline className="w-full h-full object-cover" />
              </div>
            </Reveal>

            {/* Center content */}
            <div className="md:col-span-6 lg:col-span-8">
              <div className="relative">
                {/* mix-blend-difference with white text automatically becomes dark on the light background and light on the dark image, flawlessly. */}
                <div className="relative z-20 text-center pointer-events-none mix-blend-difference">
                  <h2 className="tracking-tight font-medium text-white" style={{ 
                    fontSize: "clamp(3rem, 10vw, 8rem)", 
                    lineHeight: "1"
                  }}>
                    We&apos;re The People Prop
                  </h2>
                </div>

                <Reveal delay={0.1} className="flex flex-col items-center gap-y-8 relative z-10 lg:px-[12.5%]" style={{ marginTop: "-3vw" }}>
                  {/* Main image */}
                  <div className="relative w-full">
                    <div className="relative z-10 overflow-hidden w-full rounded-2xl lg:rounded-3xl aspect-[4/3] bg-[#e5ddd0]">
                      <img src="/images/dashboard-v2.webp" alt="TPP Dashboard" className="w-full h-full object-cover relative z-0" loading="lazy" />
                    </div>
                  </div>

                  <h3 className="tracking-[-0.02em] text-[#0c0c0c] font-medium text-center max-w-[620px] mx-auto" style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)" }}>
                    The prop firm that rebels against industry cliches
                  </h3>
                  <p className="text-[#6c6a68] text-base leading-relaxed text-center max-w-[480px] mx-auto">
                    Ever noticed how every prop firm looks the same? Impossible rules, hidden gotchas, and payouts that never arrive. We built TPP to be the opposite — transparent rules, real capital, and payouts in under 24 hours.
                  </p>

                  <div className="flex flex-wrap gap-2 justify-center">
                    <Link
                      href="/dashboard/new-challenge"
                      className="group inline-flex items-center gap-2 h-8 pl-1 pr-3 rounded-full hover:rounded-lg transition-all duration-300 bg-[#bcff2e] border border-[#bcff2e] text-[#0c0c0c] text-[15px]"
                    >
                      <span className="h-6 w-6 rounded-full bg-white group-hover:rounded-sm transition-all duration-300 shrink-0 overflow-hidden" />
                      Start trading
                    </Link>
                    <Link
                      href="/rules"
                      className="inline-flex items-center h-8 px-4 rounded-full hover:rounded-lg transition-all duration-300 border border-[#0c0c0c]/30 text-[#0c0c0c] text-[15px]"
                    >
                      About TPP
                    </Link>
                  </div>
                </Reveal>
              </div>
            </div>

            {/* Right small image */}
            <Reveal delay={0.2} className="hidden md:flex md:col-span-3 lg:col-span-2 items-end">
              <div className="-translate-y-full w-full">
                <div className="aspect-[9/10] w-full rounded-2xl lg:rounded-3xl overflow-hidden bg-[#e5ddd0]">
                  <img src="/images/features/1.webp" alt="Feature" className="w-full h-full object-cover" loading="lazy" />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 3: STATS — Cream bg, giant numbers
          ═══════════════════════════════════════════════ */}
      <section className="w-full pb-16 lg:pb-24">
        <div className="w-full px-5 lg:px-10">
          <div className="flex flex-col md:flex-row gap-16 text-center md:text-left">
            <Reveal className="flex-1">
              <div className="flex flex-col items-center md:items-start gap-2 lg:gap-4">
                <div className="text-6xl lg:text-[8rem] font-medium tracking-tight leading-none text-[#0c0c0c]">
                  <AnimatedCounter end={250} suffix="+" />
                </div>
                <span className="text-base lg:text-lg font-medium text-[#6c6a68]">Successful payouts</span>
              </div>
            </Reveal>
            <Reveal delay={0.1} className="flex-1 md:mt-20">
              <div className="flex flex-col items-center md:items-start gap-2 lg:gap-4">
                <div className="text-6xl lg:text-[8rem] font-medium tracking-tight leading-none text-[#0c0c0c]">
                  <AnimatedCounter end={142} suffix="+" />
                </div>
                <span className="text-base lg:text-lg font-medium text-[#6c6a68]">Countries served</span>
              </div>
            </Reveal>
            <Reveal delay={0.2} className="flex-1 md:mt-12">
              <div className="flex flex-col items-center md:items-start gap-2 lg:gap-4">
                <div className="text-6xl lg:text-[8rem] font-medium tracking-tight leading-none text-[#0c0c0c]">
                  5<span className="text-[#bcff2e]">*</span>
                </div>
                <span className="text-base lg:text-lg font-medium text-[#6c6a68]">Trader rating</span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 4: WORK/HOW IT WORKS — Black Card
          ═══════════════════════════════════════════════ */}
      <section className="w-full pb-16 lg:pb-24">
        <div className="w-full px-0">
          <div className="px-[5px] py-[5px]">
            <div className="relative rounded-2xl bg-black py-20 xl:py-32 px-[15px] lg:px-[35px]">
              {/* Header */}
              <Reveal>
                <div className="pb-16 lg:pb-24 text-center">
                  <div className="text-lg font-medium text-white mb-4">How It Works</div>
                  <h2 className="tracking-[-0.03em] text-white font-medium" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
                    Three steps from signup
                    <br />to <span className="text-[#bcff2e]">funded</span>
                  </h2>
                </div>
              </Reveal>

              {/* Bento Box Grid - Blank Cards for Future Content */}
              <div className="w-full max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 auto-rows-[240px] gap-4 md:gap-5 lg:gap-6">
                  {[
                    /* Block 1: Left Tall, Right Two Wides */
                    { id: 1, span: "md:col-span-1 md:row-span-2", bg: "dark", title: "Card Title 1", subtitle: "Tall placeholder card" },
                    { id: 2, span: "md:col-span-2 md:row-span-1", bg: "dark", title: "Card Title 2", subtitle: "Wide placeholder card" },
                    { id: 3, span: "md:col-span-2 md:row-span-1", bg: "dark", title: "Card Title 3", subtitle: "Wide placeholder card" },
                  ].map((s, i) => (
                    <Reveal key={s.id} delay={i * 0.1} className={cn("w-full h-full", s.span)}>
                      <div 
                        className={cn(
                          "relative w-full h-full rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] overflow-hidden group cursor-pointer",
                          s.bg === "lime" 
                            ? "bg-[#bcff2e] shadow-[0_0_30px_rgba(188,255,46,0.15)]" 
                            : "bg-white/[0.04] hover:bg-white/[0.06] backdrop-blur-xl border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
                        )}
                      >
                        {/* Text Content */}
                        <div className="relative z-10">
                          <h3 className={cn(
                            "text-xl md:text-2xl font-bold tracking-tight mb-2", 
                            s.bg === "lime" ? "text-[#0c0c0c]" : "text-white"
                          )}>
                            {s.title}
                          </h3>
                          <p className={cn(
                            "text-sm md:text-[15px] font-medium leading-snug", 
                            s.bg === "lime" ? "text-[#0c0c0c]/70" : "text-white/50"
                          )}>
                            {s.subtitle}
                          </p>
                        </div>
                        
                        {/* Placeholder for future PNG/3D Image */}
                        <div className="absolute right-0 bottom-0 w-3/4 h-3/4 opacity-10 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none flex items-end justify-end p-4">
                          <div className={cn(
                            "w-full h-full rounded-tl-full blur-3xl", 
                            s.bg === "lime" ? "bg-white/60" : "bg-white/20"
                          )} />
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </div>

              {/* View More */}
              <Reveal className="text-center mt-16">
                <Link href="/rules" className="text-white underline underline-offset-4 text-lg font-medium hover:text-[#bcff2e] transition-colors">
                  Read the full rules
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 5: CALCULATOR — Imported from V1
          ═══════════════════════════════════════════════ */}
      <V2ChallengeCalculator />

      {/* ═══════════════════════════════════════════════
          SECTION 6: FEATURES — Lime Green Card
          ═══════════════════════════════════════════════ */}
      <section className="w-full pb-16 lg:pb-24">
        <div className="w-full px-0">
          <div className="px-[5px] py-[5px]">
            <div className="rounded-[2rem] lg:rounded-[3.5rem] bg-[#bcff2e] py-20 xl:py-32 px-[15px] lg:px-[35px]">
              <Reveal>
                <div className="text-center mb-16">
                  <div className="text-lg font-medium text-[#0c0c0c]/60 mb-4">Why TPP</div>
                  <h2 className="tracking-[-0.03em] text-[#0c0c0c] font-medium" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
                    Built for traders,
                    <br />not against them
                  </h2>
                </div>
              </Reveal>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {[
                  { icon: TrendingUp, title: "Tier-1 Liquidity", desc: "Raw spreads, no re-quotes. Your strategy deserves real market conditions." },
                  { icon: Shield, title: "Transparent Rules", desc: "4% daily drawdown, 8% max. No hidden gotchas. What you see is what you get." },
                  { icon: Clock, title: "No Time Limit", desc: "Trade at your own pace. Pass the evaluation whenever you're ready." },
                  { icon: Award, title: "Auto-Scaling", desc: "Hit targets and grow automatically. $25K → $50K → $100K → $200K." },
                ].map((f, i) => (
                  <Reveal key={f.title} delay={i * 0.08}>
                    <div className="rounded-2xl bg-[#0c0c0c] p-8 lg:p-10 h-full group hover:scale-[1.02] transition-transform duration-500">
                      <f.icon className="w-7 h-7 text-[#bcff2e] mb-5" strokeWidth={1.5} />
                      <h3 className="text-xl font-medium text-white mb-2 tracking-tight">{f.title}</h3>
                      <p className="text-white/60 text-[15px] leading-relaxed">{f.desc}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 7: TESTIMONIALS — Black Card
          ═══════════════════════════════════════════════ */}
      <section className="w-full pb-16 lg:pb-24">
        <div className="w-full px-0">
          <div className="px-[5px] py-[5px]">
            <div className="rounded-[2rem] lg:rounded-[3.5rem] bg-black py-20 xl:py-32 px-[15px] lg:px-[35px]">
              <Reveal>
                <div className="text-center mb-16">
                  <div className="text-lg font-medium text-white/60 mb-4">Trader Voices</div>
                  <h2 className="tracking-[-0.03em] text-white font-medium" style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)" }}>
                    What our traders
                    <br />are <span className="text-[#bcff2e]">saying</span>
                  </h2>
                </div>
              </Reveal>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
                {testimonials.map((t, i) => (
                  <Reveal key={t.name} delay={i * 0.06}>
                    <div className="rounded-2xl lg:rounded-3xl border border-white/[0.08] bg-white/[0.04] p-6 lg:p-7 hover:bg-white/[0.08] transition-all duration-500">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-9 h-9 rounded-full bg-[#bcff2e] text-[#0c0c0c] text-[12px] font-bold flex items-center justify-center shrink-0">
                          {t.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-white font-medium text-[14px]">{t.name}</p>
                          <p className="text-white/40 text-[12px]">{t.handle}</p>
                        </div>
                      </div>
                      <p className="text-white/60 text-[13px] leading-relaxed mb-3 line-clamp-3">&ldquo;{t.body}&rdquo;</p>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#bcff2e]" strokeWidth={2.5} />
                        <span className="text-[#bcff2e] text-[12px] font-semibold">{t.payout} paid</span>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 8: CTA — Cream bg
          ═══════════════════════════════════════════════ */}
      <section className="w-full py-16 lg:py-24">
        <div className="w-full px-5 lg:px-10">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="tracking-[-0.03em] text-[#0c0c0c] font-medium mb-6" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
                Ready to get <span className="text-[#bcff2e]">funded</span>?
              </h2>
              <p className="text-[#6c6a68] text-lg leading-relaxed mb-10">
                Join thousands of traders who chose transparency over gimmicks. Your first payout is 14 days away.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Link
                  href="/dashboard/new-challenge"
                  className="group inline-flex items-center gap-2 h-10 pl-1.5 pr-4 rounded-full hover:rounded-lg transition-all duration-300 bg-[#0c0c0c] text-white text-[15px] font-medium"
                >
                  <span className="h-7 w-7 rounded-full bg-[#bcff2e] group-hover:rounded-sm transition-all duration-300 shrink-0" />
                  Start Your Challenge
                </Link>
                <Link
                  href="/rules"
                  className="inline-flex items-center h-10 px-5 rounded-full hover:rounded-lg transition-all duration-300 border border-[#0c0c0c]/20 text-[#0c0c0c] text-[15px] font-medium"
                >
                  Read the Rules
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          FOOTER — Lime Green, rounded top
          ═══════════════════════════════════════════════ */}
      <footer className="bg-[#bcff2e] text-[#0c0c0c] rounded-t-[2rem] lg:rounded-t-[3rem]">
        <div className="max-w-[1440px] mx-auto px-5 lg:px-10 pt-16 pb-8">
          {/* Footer Top */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-16">
            <div>
              <span className="font-bold text-xl">The People Prop</span>
              <p className="text-[14px] opacity-60 mt-1">Prop Trading · Global</p>
            </div>
            <Link
              href="/dashboard/new-challenge"
              className="group inline-flex items-center gap-2 h-8 pl-1 pr-3 border border-[#0c0c0c]/30 rounded-full hover:rounded-lg transition-all duration-300 text-[#0c0c0c] text-[15px]"
            >
              <span className="h-6 w-6 rounded-full bg-[#0c0c0c] group-hover:rounded-sm transition-all duration-300 shrink-0" />
              Start trading
            </Link>
          </div>

          {/* Footer Main */}
          <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-12 mb-16">
            <div>
              <h3 className="text-3xl md:text-4xl font-medium tracking-tight mb-6 max-w-[400px]">
                Keep up to date with TPP news
              </h3>
              <div className="flex border-b-2 border-[#0c0c0c] pb-3 max-w-md">
                <input type="email" placeholder="Your email address" className="flex-1 bg-transparent text-lg outline-none placeholder:text-[#0c0c0c]/40" />
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
          <h1 className="font-extrabold text-center tracking-[-0.05em] leading-[0.8] my-8 select-none" style={{ fontSize: "clamp(4rem, 18vw, 20rem)" }}>
            TPP
          </h1>

          {/* Footer Bottom */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-[#0c0c0c]/10 text-[14px] opacity-60">
            <span>&copy; 2026 The People Prop</span>
            <Link href="#" className="hover:opacity-100 transition-opacity">Privacy Policy</Link>
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="inline-flex items-center gap-1 hover:opacity-100 transition-opacity">
              <ChevronUp className="w-4 h-4" /> Take me back to top
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
