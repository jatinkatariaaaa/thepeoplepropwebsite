"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { ArrowUpRight, ShieldCheck, Zap, TrendingUp, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/* ───────────────────────────────────────────────
   Hero — cinematic split layout with:
   • Animated gradient mesh background
   • Word-by-word kinetic text reveal
   • 3D mouse-tracking tilt on equity card
   • Scroll-driven parallax layers
   • Spring-animated floating chips
   ─────────────────────────────────────────────── */

/* Word-by-word kinetic reveal */
function AnimatedWords({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.5,
            delay: delay + i * 0.06,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="inline-block mr-[0.3em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

function TypewriterWord({ word, className, delay = 0 }: { word: string; className?: string; delay?: number }) {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    let interval: NodeJS.Timeout;

    timeout = setTimeout(() => {
      setIsTyping(true);
      let i = 0;
      interval = setInterval(() => {
        setDisplayText(word.slice(0, i + 1));
        i++;
        if (i >= word.length) {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 120);
    }, delay * 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [word, delay]);

  return (
    <span className={cn("inline-flex items-center", className)}>
      {displayText}
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          repeat: Infinity,
          duration: 0.8,
          ease: "circInOut",
        }}
        className={cn("inline-block w-[3px] h-[0.9em] bg-[var(--accent)] ml-[2px]", isTyping ? "opacity-100" : "")}
      />
    </span>
  );
}

function HeroDashboardVisual() {
  return (
    <div className="hidden lg:block relative w-full h-[520px] perspective-[1200px]">
      <motion.div
        initial={{ opacity: 0, rotateX: 6, rotateY: -12, y: 40 }}
        animate={{ opacity: 1, rotateX: 0, rotateY: 0, y: 0 }}
        transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 preserve-3d"
      >
        {/* Main Card */}
        <motion.div
          animate={{ y: [-8, 8, -8] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-10 left-0 right-0 bottom-10 glass-strong rounded-[2rem] p-8 shadow-[0_32px_80px_rgba(10,37,64,0.12)] border border-white/60 flex flex-col"
        >
          {/* Card Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-[11.5px] font-bold tracking-widest text-[var(--ink-500)] uppercase mb-1">
                Live Equity
              </p>
              <h3 className="text-[2.5rem] leading-none font-medium tracking-tight text-[var(--ink-950)] tabular-nums">
                $108,450<span className="text-[var(--ink-400)]">.00</span>
              </h3>
            </div>
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" strokeWidth={2.5} />
            </div>
          </div>

          {/* Sparkline Chart */}
          <div className="flex-1 relative mt-4">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between opacity-30 pointer-events-none">
              <div className="h-px w-full bg-[var(--border)]" />
              <div className="h-px w-full bg-[var(--border)]" />
              <div className="h-px w-full bg-[var(--border)]" />
              <div className="h-px w-full bg-[var(--border)]" />
            </div>
            
            <svg
              viewBox="0 0 100 40"
              preserveAspectRatio="none"
              className="w-full h-full overflow-visible"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.8, ease: "easeOut" }}
                d="M 0 35 C 15 35, 25 15, 45 20 C 60 25, 75 5, 100 10"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="drop-shadow-[0_4px_6px_rgba(37,99,235,0.2)]"
              />
              <motion.path
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.5 }}
                d="M 0 35 C 15 35, 25 15, 45 20 C 60 25, 75 5, 100 10 L 100 40 L 0 40 Z"
                fill="url(#chartGradient)"
              />
              
              {/* Pulse dot at the end */}
              <motion.circle
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 2, duration: 0.4 }}
                cx="100" cy="10" r="2.5"
                fill="var(--accent)"
                className="drop-shadow-[0_0_8px_rgba(37,99,235,0.6)]"
              />
            </svg>
          </div>
          
          {/* Timeline / labels */}
          <div className="flex justify-between items-center mt-5 text-[10.5px] font-semibold text-[var(--ink-400)] uppercase tracking-wider">
            <span>Day 1</span>
            <span>Day 14</span>
            <span>Day 28</span>
            <span className="text-[var(--accent-700)]">Funded</span>
          </div>
        </motion.div>

        {/* Floating Notification 1 */}
        <motion.div
          initial={{ opacity: 0, x: 30, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.7, delay: 1.3, ease: [0.22, 1, 0.36, 1] }}
          className="absolute -right-8 top-32 glass-strong rounded-2xl p-4 pr-6 flex items-center gap-3.5 shadow-[0_24px_48px_rgba(10,37,64,0.12)] border border-white/80"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-inner">
            <Check className="w-5 h-5 text-white" strokeWidth={3} />
          </div>
          <div>
            <p className="text-[11px] font-bold tracking-widest text-[var(--ink-500)] uppercase mb-0.5">
              Phase 1 Passed
            </p>
            <p className="text-[14px] font-medium text-[var(--ink-950)] leading-tight">
              Profit Target Reached
            </p>
          </div>
        </motion.div>

        {/* Floating Notification 2 */}
        <motion.div
          initial={{ opacity: 0, x: -30, y: -20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.7, delay: 1.8, ease: [0.22, 1, 0.36, 1] }}
          className="absolute -left-12 bottom-32 glass-strong rounded-2xl p-4 pr-6 flex items-center gap-3.5 shadow-[0_24px_48px_rgba(10,37,64,0.12)] border border-white/80"
        >
          <div className="w-10 h-10 rounded-full bg-[var(--accent)] flex items-center justify-center shrink-0 shadow-inner">
            <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[11px] font-bold tracking-widest text-[var(--ink-500)] uppercase mb-0.5">
              Payout Sent
            </p>
            <p className="text-[15px] font-semibold text-[var(--ink-950)] leading-tight tabular-nums">
              $8,450.00
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  /* Scroll parallax */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const bgOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);


  return (
    <section ref={sectionRef} className="relative pt-14 md:pt-20 pb-16 md:pb-24 overflow-hidden">
      {/* ── Background image with scroll parallax ── */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{ scale: reduceMotion ? 1 : bgScale, opacity: bgOpacity }}
      >
        <div className="absolute inset-0 bg-[url('/hero-overlay-mobile.webp')] md:bg-[url('/hero-overlay.webp')] bg-cover bg-[center_top_3rem] md:bg-[center_top_10%] bg-no-repeat opacity-100" />
        {/* Soften the top edge so it doesn't clash with the transparent navbar */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#eef2f7] to-transparent" />
        {/* Soften the bottom edge for a seamless transition into the page */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#e9f0fa] to-transparent" />
        <div className="absolute inset-0 bg-grid bg-grid-fade opacity-20 mix-blend-overlay" />
      </motion.div>

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-16 items-center">
          {/* ── Left column — kinetic text ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-start text-left pt-24 sm:pt-32 lg:pt-0 w-full"
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center justify-center self-center md:self-start w-[90%] sm:w-auto mx-auto md:mx-0 gap-2 chip chip-accent mb-8 md:mb-6 text-[10.5px] md:text-xs font-bold text-center leading-relaxed py-2 md:py-1.5"
            >
              <span className="relative flex w-2 h-2">
                <span className="absolute inset-0 rounded-full bg-[var(--accent)] animate-ping opacity-75" />
                <span className="relative rounded-full w-2 h-2 bg-[var(--accent)]" />
              </span>
              Guaranteed free evaluation Prizes on 1 August 2026
            </motion.div>

            <h1 className="font-medium leading-[0.98] tracking-[-0.035em] text-[var(--ink-950)] text-[clamp(2.6rem,7vw,5.25rem)] max-w-[55%] sm:max-w-[65%] md:max-w-none">
              <AnimatedWords text="Trade our capital." delay={0.15} />
              <br />
              <AnimatedWords text="Keep the" delay={0.5} />
              <br />
              <TypewriterWord word="profits" className="word-serif" delay={1.0} />
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.0 }}
              >.</motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-7 max-w-[55%] sm:max-w-[65%] md:max-w-xl text-[16px] md:text-[18px] leading-[1.4] md:leading-[1.55] text-[var(--ink-700)]"
            >
              The People Prop funds skilled traders up to{" "}
              <span className="text-[var(--ink-950)] font-medium">$200,000</span>.
              Pass one fair evaluation and keep up to{" "}
              <span className="text-[var(--ink-950)] font-medium">90%</span> of
              every dollar you earn — paid bi-weekly, in under 24 hours.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="mt-14 md:mt-9 flex w-full md:w-auto items-center justify-center lg:justify-start gap-3 relative z-20 pb-4 md:pb-0"
            >
              <Button href="#calculator" variant="primary" size="lg" className="flex-1 md:flex-none py-3.5">
                Start Challenge
              </Button>
              <Button href="#how" variant="outline" size="lg" className="flex-1 md:flex-none py-3.5 bg-white/50 backdrop-blur-sm">
                How It Works
              </Button>
            </motion.div>

            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="hidden md:flex mt-10 w-full justify-between sm:justify-center lg:justify-start items-center sm:gap-12 text-[12px] md:text-[13px] text-[var(--ink-500)]"
            >
              {[
                { value: "90%", label: "Profit Split" },
                { value: "$200K", label: "Max Capital" },
                { value: "< 24h", label: "Payouts" },
              ].map((it) => (
                <li key={it.label} className="flex flex-col items-center lg:items-start gap-0.5">
                  <span className="text-2xl md:text-3xl font-semibold tracking-tight text-[var(--ink-950)]">
                    {it.value}
                  </span>
                  <span>{it.label}</span>
                </li>
              ))}
            </motion.ul>
          </motion.div>

          {/* ── Right column (Empty to preserve left column width) ── */}
          <div />
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-5 h-8 rounded-full border-2 border-[var(--ink-200)] flex items-start justify-center pt-1.5"
        >
          <motion.div
            className="w-1 h-1.5 rounded-full bg-[var(--ink-400)]"
            animate={{ opacity: [1, 0.3, 1], y: [0, 4, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}


