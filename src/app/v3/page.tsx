"use client";

import {
  useRef,
  useEffect,
  useState,
  type ReactNode,
  type CSSProperties,
} from "react";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
} from "framer-motion";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  TrendingUp,
  Shield,
  Clock,
  Award,
  CheckCircle2,
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

import { cn } from "@/lib/utils";
import { faq } from "@/data/faq";
import { V2ChallengeCalculator } from "@/components/landing/V2ChallengeCalculator";

/* ═══════════════════════════════════════════════════════════════
   V3 Landing Page — "Ultra-Premium" evolution of V2

   Design language (kept + refined from V2):
   • Page bg = warm cream (#f1eade)
   • Full-width ROUNDED CARDS with tiny inset, alternating
     BLACK → CREAM → BLACK → LIME
   • Matte dark #0c0c0c + neon lime #bcff2e accent
   • Giant, tight-tracked typography

   What V3 adds:
   • GSAP ScrollTrigger word-reveal + section parallax
   • Framer-Motion 3D tilt cards (pointer-driven)
   • Floating / parallax graphics
   • Buttery micro-interactions on every CTA
   • Mobile-first section variety: horizontal snap rails,
     swipeable testimonial deck, native accordions
   • Merged-in V1 sections: Evaluation Steps + FAQ
   ═══════════════════════════════════════════════════════════════ */

gsap.registerPlugin(ScrollTrigger);

const EASE = [0.22, 1, 0.36, 1] as const;
const LIME = "#bcff2e";

/* ─────────────────────────────────────────────────────────────
   Hook: prefers-reduced-motion (respect accessibility)
   ───────────────────────────────────────────────────────────── */
function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

/* ─────────────────────────────────────────────────────────────
   Animated Counter (IntersectionObserver-driven)
   ───────────────────────────────────────────────────────────── */
function AnimatedCounter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1800;
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

/* ─────────────────────────────────────────────────────────────
   Reveal — base fade-up (Framer Motion)
   ───────────────────────────────────────────────────────────── */
function Reveal({
  children,
  className = "",
  delay = 0,
  style,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  style?: CSSProperties;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay, ease: EASE }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   GsapWords — per-word scrub reveal for big headings.
   Splits text into words and animates them on scroll.
   ───────────────────────────────────────────────────────────── */
function GsapWords({
  text,
  className = "",
  highlight = [],
  as: Tag = "h2",
  style,
}: {
  text: string;
  className?: string;
  highlight?: string[];
  as?: "h1" | "h2" | "h3";
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const words = text.split(" ");

  useEffect(() => {
    if (reduced || !ref.current) return;
    const targets = ref.current.querySelectorAll<HTMLElement>("[data-word]");
    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          ease: "power3.out",
          stagger: 0.06,
          duration: 0.9,
          scrollTrigger: {
            trigger: ref.current,
            start: "top 85%",
          },
        }
      );
    }, ref);
    return () => ctx.revert();
  }, [reduced]);

  const MotionTag = Tag as "h2";
  return (
    <MotionTag ref={ref as React.RefObject<HTMLHeadingElement>} className={className} style={style}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <span
            data-word
            className={cn(
              "inline-block",
              highlight.includes(w) && "text-[#bcff2e]"
            )}
          >
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </span>
        </span>
      ))}
    </MotionTag>
  );
}

/* ─────────────────────────────────────────────────────────────
   TiltCard — neutral wrapper.
   Hover 3D tilt + lime glare were intentionally removed for a
   calmer, more stable feel. Kept as a passthrough so existing
   call sites (and their `intensity` / `glare` props) stay valid.
   ───────────────────────────────────────────────────────────── */
function TiltCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
  /** Accepted for API compatibility; no longer used. */
  intensity?: number;
  /** Accepted for API compatibility; no longer used. */
  glare?: boolean;
}) {
  return (
    <div className={cn("relative", className)}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Floating — gentle infinite float for accent graphics.
   ───────────────────────────────────────────────────────────── */
function Floating({
  children,
  className = "",
  amplitude = 12,
  duration = 6,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  amplitude?: number;
  duration?: number;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      animate={{ y: [-amplitude, amplitude, -amplitude] }}
      transition={{ duration, delay, ease: "easeInOut", repeat: Infinity }}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MagneticButton wrapper — subtle pull toward cursor.
   ───────────────────────────────────────────────────────────── */
function Magnetic({ children, className = "" }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const mx = useSpring(useMotionValue(0), { stiffness: 250, damping: 18 });
  const my = useSpring(useMotionValue(0), { stiffness: 250, damping: 18 });

  return (
    <motion.div
      ref={ref}
      style={{ x: reduced ? 0 : mx, y: reduced ? 0 : my, display: "inline-block" }}
      onPointerMove={(e) => {
        if (reduced || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        mx.set((e.clientX - (r.left + r.width / 2)) * 0.25);
        my.set((e.clientY - (r.top + r.height / 2)) * 0.25);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   FAQ accordion item (native, animated)
   ───────────────────────────────────────────────────────────── */
function FaqRow({
  item,
  open,
  onToggle,
}: {
  item: { q: string; a: string };
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border transition-colors duration-300",
        open ? "border-[#bcff2e]/40 bg-white/[0.05]" : "border-white/[0.08] bg-white/[0.02]"
      )}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left lg:px-7"
        aria-expanded={open}
      >
        <span className="text-[15px] font-medium text-white lg:text-[17px]">{item.q}</span>
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-all duration-300",
            open
              ? "rotate-180 border-[#bcff2e] bg-[#bcff2e] text-[#0c0c0c]"
              : "border-white/20 text-white/60"
          )}
        >
          <ChevronDown className="h-4 w-4" strokeWidth={2.2} />
        </span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.4, ease: EASE }}
        className="overflow-hidden"
      >
        <p className="px-5 pb-6 text-[14px] leading-relaxed text-white/55 lg:px-7">{item.a}</p>
      </motion.div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   CustomCursor — lime dot + trailing ring. Fine-pointer only.
   Grows over interactive elements; hidden for touch / reduced-motion.
   ───────────────────────────────────────────────────────────── */
function CustomCursor() {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [hidden, setHidden] = useState(true);

  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);
  const ringX = useSpring(dotX, { stiffness: 350, damping: 28, mass: 0.4 });
  const ringY = useSpring(dotY, { stiffness: 350, damping: 28, mass: 0.4 });

  useEffect(() => {
    if (reduced || !window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);

    const move = (e: PointerEvent) => {
      dotX.set(e.clientX);
      dotY.set(e.clientY);
      setHidden(false);
      const target = e.target as HTMLElement | null;
      setHovering(!!target?.closest('a, button, [data-cursor="hover"], input, [role="button"]'));
    };
    const leave = () => setHidden(true);

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerout", leave);
    document.documentElement.classList.add("v3-has-cursor");
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerout", leave);
      document.documentElement.classList.remove("v3-has-cursor");
    };
  }, [reduced, dotX, dotY]);

  if (!enabled) return null;

  return (
    <>
      <style>{`.v3-has-cursor, .v3-has-cursor * { cursor: none !important; }`}</style>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] rounded-full border border-[#bcff2e] mix-blend-difference"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{
          width: hovering ? 56 : 34,
          height: hovering ? 56 : 34,
          opacity: hidden ? 0 : hovering ? 0.9 : 0.55,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 24 }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-2 w-2 rounded-full bg-[#bcff2e]"
        style={{ x: dotX, y: dotY, translateX: "-50%", translateY: "-50%" }}
        animate={{ opacity: hidden ? 0 : 1, scale: hovering ? 0.4 : 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   Shared evaluation-step data — used by BOTH the mobile stacked
   grid and the desktop pinned horizontal-scroll rail.
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

function StepBullets({ step }: { step: Step }) {
  return (
    <div className="flex flex-col gap-4">
      {step.bullets.map((b) => (
        <div key={b.t} className="flex gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0c0c0c]">
            <b.icon className="h-4 w-4 text-[#bcff2e]" strokeWidth={2} />
          </span>
          <div>
            <div className={cn("text-[14px] font-semibold", step.dark ? "text-white" : "text-[#0c0c0c]")}>{b.t}</div>
            <div className={cn("text-[13px]", step.dark ? "text-white/45" : "text-[#6c6a68]")}>{b.s}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   PinnedSteps — desktop only. Pins the section and translates a
   horizontal rail of step panels via GSAP ScrollTrigger
   (synced with Lenis through the global ticker).
   ───────────────────────────────────────────────────────────── */
function PinnedSteps() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced || !sectionRef.current || !trackRef.current) return;
    const ctx = gsap.context(() => {
      const track = trackRef.current!;
      const getShift = () => Math.max(0, track.scrollWidth - window.innerWidth);

      gsap.to(track, {
        x: () => -getShift(),
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: () => "+=" + getShift(),
          scrub: 1,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      gsap.fromTo(
        "[data-steps-progress]",
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: () => "+=" + getShift(),
            scrub: 1,
          },
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <div ref={sectionRef} className="relative hidden h-dvh overflow-hidden lg:block">
      <div className="absolute left-10 right-10 top-[calc(7.5rem+1rem)] z-20 h-[2px] bg-[#0c0c0c]/10">
        <div data-steps-progress className="h-full w-full origin-left scale-x-0 bg-[#0c0c0c]" />
      </div>

      <div ref={trackRef} className="flex h-full w-max items-center will-change-transform">
        {/* Intro panel */}
        <div className="flex h-full w-screen shrink-0 flex-col justify-center px-10 xl:px-20">
          <div className="max-w-xl">
            <div className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-[#6c6a68]">How It Works</div>
            <h2 className="font-medium tracking-[-0.03em] text-[#0c0c0c]" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>
              Three steps from
              <br />
              signup to <span className="text-[#bcff2e]">funded</span>
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#6c6a68]">
              No second phases. No 60-day clocks. No hidden gotchas. Just keep scrolling — then trade and get paid.
            </p>
            <div className="mt-8 inline-flex items-center gap-2 text-[14px] font-medium text-[#0c0c0c]/50">
              Scroll to explore <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>

        {/* Step panels */}
        {STEPS.map((step, i) => (
          <div key={step.badge} className="flex h-full w-screen shrink-0 items-center px-10 xl:px-20">
            <div className="grid w-full max-w-6xl grid-cols-[auto_1fr] items-center gap-10 xl:gap-16">
              <div
                className="select-none font-black leading-none tracking-[-0.05em] text-[#0c0c0c]/[0.08]"
                style={{ fontSize: "clamp(8rem, 20vw, 22rem)" }}
              >
                {String(i + 1).padStart(2, "0")}
              </div>
              <div
                data-cursor="hover"
                className={cn(
                  "max-w-md rounded-[2rem] p-9 shadow-xl",
                  step.dark ? "bg-[#0c0c0c]" : "border border-[#0c0c0c]/10 bg-white/50 backdrop-blur-sm"
                )}
              >
                <span
                  className={cn(
                    "mb-5 inline-flex w-fit items-center rounded-full px-3 py-1 text-[12px] font-semibold uppercase tracking-wider",
                    step.dark ? "bg-[#bcff2e] text-[#0c0c0c]" : "bg-[#0c0c0c] text-[#bcff2e]"
                  )}
                >
                  {step.badge}
                </span>
                <h3 className={cn("mb-6 text-2xl font-bold tracking-tight", step.dark ? "text-white" : "text-[#0c0c0c]")}>
                  {step.title}
                </h3>
                <StepBullets step={step} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════ MAIN PAGE ═══════════════════════════════════════ */

export default function V3Page() {
  const reduced = useReducedMotion();

  /* Hero parallax */
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroTitleY = useTransform(heroProgress, [0, 1], ["0%", "40%"]);
  const heroFade = useTransform(heroProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(heroProgress, [0, 1], [1, 1.08]);

  /* Swipeable testimonial deck (mobile) */
  const [activeT, setActiveT] = useState(0);

  /* FAQ */
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const faqItems = faq.slice(0, 6);

  const testimonials = [
    { name: "Marcus Adeyemi", handle: "@marcus.fx · Lagos", body: "The execution feels like a real institutional desk — no slippage tricks, no shifting goalposts. Got my first payout in 11 days.", payout: "$18,420" },
    { name: "Sofía Carrasco", handle: "@sofi.trades · Madrid", body: "The consistency rule is actually fair here. The 90% split on the 25K is the highest I've seen anywhere.", payout: "$9,610" },
    { name: "Daniel Park", handle: "@dpfx · Seoul", body: "Scaling plan got me from 25K to 75K in 8 months. Bi-weekly payouts always land on time.", payout: "$24,300" },
    { name: "Aisha Okafor", handle: "@aisha.fx · Abuja", body: "Sub-24h payouts aren't marketing fluff — my withdrawal hit in 9 hours. The dashboard is clean.", payout: "$14,850" },
    { name: "Chen Wei", handle: "@chen.markets · Singapore", body: "Auto-scaling bumped me from $25K to $50K without paperwork. The profit split at this level is 90%.", payout: "$21,400" },
    { name: "Grace Nwankwo", handle: "@grace.fx · London", body: "100% refund on first payout means the challenge is essentially free if you're profitable.", payout: "$13,750" },
  ];

  /* Refresh ScrollTrigger once mounted so it cooperates with Lenis. */
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      className="v3-page min-h-screen bg-[#f1eade] text-[#0c0c0c] antialiased"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <CustomCursor />

      {/* ═══════════════ FIXED HEADER ═══════════════ */}
      <header className="fixed left-0 top-0 z-50 h-20 w-full px-[5px] lg:h-[7.5rem] lg:px-[10px]">
        <div className="relative z-20 flex h-full w-full items-center px-[10px] lg:px-[25px]">
          <Link href="/v3" className="relative z-30 flex items-center transition-opacity hover:opacity-80">
            <img src="/images/logo-v2.png" alt="TPP Logo" className="h-6 w-auto object-contain md:h-8" />
          </Link>
          <nav className="absolute left-1/2 top-1/2 z-30 hidden -translate-x-1/2 -translate-y-1/2 items-center rounded-full border border-white/10 bg-white/[0.03] p-1.5 shadow-2xl backdrop-blur-md lg:flex">
            {[
              { name: "Home", path: "/v3" },
              { name: "Challenges", path: "/challenges" },
              { name: "Rules", path: "/rules" },
              { name: "Referrals", path: "/referral" },
              { name: "Heatmap", path: "/heatmap" },
              { name: "Contact", path: "/contact" },
            ].map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className="relative rounded-full px-4 py-1.5 text-[13px] font-medium tracking-wide text-white/60 transition-all duration-300 hover:bg-white/10 hover:text-white"
              >
                {link.name}
              </Link>
            ))}
          </nav>
          <div className="relative z-30 ml-auto flex items-center gap-4 lg:gap-6">
            <Magnetic>
              <Link
                href="/login"
                className="group inline-flex h-8 items-center gap-2 rounded-full border border-white/40 pl-1 pr-3 text-[15px] text-white transition-all duration-300 hover:rounded-lg hover:border-[#bcff2e]"
              >
                <span className="h-6 w-6 shrink-0 rounded-full bg-[#bcff2e] transition-all duration-300 group-hover:rounded-sm" />
                Let&apos;s trade
              </Link>
            </Magnetic>
          </div>
        </div>
        <div className="absolute inset-[5px] z-10 rounded-xl bg-black/90 backdrop-blur-sm lg:rounded-2xl" />
      </header>

      {/* ═══════════════ SECTION 1 — HERO ═══════════════ */}
      <section ref={heroRef} className="h-dvh px-[5px] py-[5px]">
        <motion.div
          style={{ scale: reduced ? 1 : heroScale }}
          className="relative flex h-full flex-col items-center justify-center overflow-hidden rounded-xl bg-black px-6 py-20 lg:rounded-2xl lg:px-10"
        >
          {/* Ambient parallax orbs */}
          <Floating className="pointer-events-none absolute left-[8%] top-[16%] h-[46vw] w-[46vw] rounded-full bg-[#bcff2e]/[0.07] blur-[120px]" amplitude={24} duration={9} />
          <Floating className="pointer-events-none absolute bottom-[-12%] right-[8%] h-[36vw] w-[36vw] rounded-full bg-[#bcff2e]/[0.09] blur-[100px]" amplitude={30} duration={11} delay={1} />

          {/* Subtle grid texture */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
              backgroundSize: "64px 64px",
              maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
            }}
          />

          <motion.div style={{ y: reduced ? 0 : heroTitleY, opacity: reduced ? 1 : heroFade }} className="relative z-10 flex flex-col items-center">
            {/* Trust badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 backdrop-blur-md">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#bcff2e] opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#bcff2e]" />
                </span>
                <span className="text-[13px] font-medium tracking-wide text-white/80">
                  Evaluating traders in 150+ countries
                </span>
              </div>
            </motion.div>

            <GsapWords
              as="h1"
              text="The prop firm that funds real traders"
              highlight={["prop", "firm", "real", "traders"]}
              className="relative z-10 w-full max-w-[1300px] text-center font-medium leading-[0.9] tracking-[-0.03em] text-white"
              style={{ fontSize: "clamp(2.8rem, 9vw, 9rem)" }}
            />

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.5, ease: EASE }}
              className="mt-8 max-w-[560px] text-center text-[15px] leading-relaxed text-white/55 lg:text-base"
            >
              Transparent rules. Real capital up to $200,000. Payouts in under 24 hours.
              Built for traders — not against them.
            </motion.p>

            {/* CTA row */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.65, ease: EASE }}
              className="mt-10 flex flex-wrap items-center justify-center gap-3"
            >
              <Magnetic>
                <Link
                  href="/dashboard/new-challenge"
                  className="group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-full bg-[#bcff2e] pl-2 pr-5 text-[15px] font-semibold text-[#0c0c0c] transition-all duration-300 hover:rounded-xl"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0c0c0c] transition-all duration-300 group-hover:rounded-md">
                    <ArrowUpRight className="h-4 w-4 text-[#bcff2e] transition-transform duration-300 group-hover:rotate-45" />
                  </span>
                  Start your challenge
                </Link>
              </Magnetic>
              <Magnetic>
                <Link
                  href="/rules"
                  className="inline-flex h-12 items-center rounded-full border border-white/25 px-6 text-[15px] font-medium text-white transition-all duration-300 hover:rounded-xl hover:border-white/60 hover:bg-white/[0.04]"
                >
                  Read the rules
                </Link>
              </Magnetic>
            </motion.div>
          </motion.div>

          {/* Scroll cue */}
          <motion.div
            style={{ opacity: reduced ? 1 : heroFade }}
            className="absolute bottom-7 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="flex h-9 w-6 items-start justify-center rounded-full border border-white/25 p-1.5"
            >
              <span className="h-1.5 w-1 rounded-full bg-[#bcff2e]" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════ SECTION 2 — INTRO ═══════════════ */}
      <section className="w-full py-16 lg:py-24">
        <div className="w-full px-5 lg:px-10">
          <div className="grid items-center gap-x-7 gap-y-16 md:grid-cols-12">
            <Reveal className="hidden md:col-span-3 md:block lg:col-span-2">
              <Floating amplitude={10} duration={7}>
                <div className="aspect-[9/10] w-full overflow-hidden rounded-2xl bg-black lg:rounded-3xl">
                  <video src="/videos/left-video.webm" autoPlay loop muted playsInline className="h-full w-full object-cover" />
                </div>
              </Floating>
            </Reveal>

            <div className="md:col-span-6 lg:col-span-8">
              <div className="relative">
                <div className="pointer-events-none relative z-20 text-center mix-blend-difference">
                  <GsapWords
                    text="We're The People Prop"
                    className="font-medium tracking-tight text-white"
                    style={{ fontSize: "clamp(3rem, 10vw, 8rem)", lineHeight: 1 }}
                  />
                </div>

                <Reveal delay={0.1} className="relative z-10 flex flex-col items-center gap-y-8 lg:px-[12.5%]" style={{ marginTop: "-3vw" }}>
                  <TiltCard intensity={6} className="relative w-full">
                    <div className="relative z-10 aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#e5ddd0] shadow-2xl lg:rounded-3xl">
                      <img src="/images/dashboard-v2.webp" alt="TPP Dashboard" className="h-full w-full object-cover" loading="lazy" />
                    </div>
                  </TiltCard>

                  <h3 className="mx-auto max-w-[620px] text-center font-medium tracking-[-0.02em] text-[#0c0c0c]" style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)" }}>
                    The prop firm that rebels against industry cliches
                  </h3>
                  <p className="mx-auto max-w-[480px] text-center text-base leading-relaxed text-[#6c6a68]">
                    Ever noticed how every prop firm looks the same? Impossible rules, hidden gotchas, and payouts that never arrive. We built TPP to be the opposite — transparent rules, real capital, and payouts in under 24 hours.
                  </p>

                  <div className="flex flex-wrap justify-center gap-2">
                    <Magnetic>
                      <Link href="/dashboard/new-challenge" className="group inline-flex h-9 items-center gap-2 rounded-full border border-[#0c0c0c] bg-[#0c0c0c] pl-1.5 pr-4 text-[15px] font-medium text-white transition-all duration-300 hover:rounded-lg">
                        <span className="h-6 w-6 shrink-0 rounded-full bg-[#bcff2e] transition-all duration-300 group-hover:rounded-sm" />
                        Start trading
                      </Link>
                    </Magnetic>
                    <Link href="/rules" className="inline-flex h-9 items-center rounded-full border border-[#0c0c0c]/30 px-5 text-[15px] text-[#0c0c0c] transition-all duration-300 hover:rounded-lg hover:bg-[#0c0c0c]/5">
                      About TPP
                    </Link>
                  </div>
                </Reveal>
              </div>
            </div>

            <Reveal delay={0.2} className="hidden items-end md:col-span-3 md:flex lg:col-span-2">
              <Floating amplitude={12} duration={8} delay={0.5} className="-translate-y-full w-full">
                <div className="aspect-[9/10] w-full overflow-hidden rounded-2xl bg-[#e5ddd0] lg:rounded-3xl">
                  <img src="/images/features/1.webp" alt="Feature" className="h-full w-full object-cover" loading="lazy" />
                </div>
              </Floating>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 3 — STATS ═══════════════ */}
      <section className="w-full pb-16 lg:pb-24">
        <div className="w-full px-5 lg:px-10">
          <div className="flex flex-col gap-16 text-center md:flex-row md:text-left">
            {[
              { end: 250, suffix: "+", label: "Successful payouts", mt: "" },
              { end: 142, suffix: "+", label: "Countries served", mt: "md:mt-20" },
            ].map((s, i) => (
              <Reveal key={s.label} delay={i * 0.1} className={cn("flex-1", s.mt)}>
                <div className="flex flex-col items-center gap-2 md:items-start lg:gap-4">
                  <div className="text-6xl font-medium leading-none tracking-tight text-[#0c0c0c] lg:text-[8rem]">
                    <AnimatedCounter end={s.end} suffix={s.suffix} />
                  </div>
                  <span className="text-base font-medium text-[#6c6a68] lg:text-lg">{s.label}</span>
                </div>
              </Reveal>
            ))}
            <Reveal delay={0.2} className="flex-1 md:mt-12">
              <div className="flex flex-col items-center gap-2 md:items-start lg:gap-4">
                <div className="text-6xl font-medium leading-none tracking-tight text-[#0c0c0c] lg:text-[8rem]">
                  5<span className="text-[#bcff2e]">*</span>
                </div>
                <span className="text-base font-medium text-[#6c6a68] lg:text-lg">Trader rating</span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 4 — CALCULATOR ═══════════════ */}
      <V2ChallengeCalculator />

      {/* ═══════════════ SECTION 5 — WHY TPP (feature rail) ═══════════════ */}
      <section className="w-full pb-16 lg:pb-24">
        <div className="px-[5px] py-[5px]">
          <div className="relative overflow-hidden rounded-2xl bg-black px-[15px] py-20 lg:px-[35px] xl:py-32">
            <Reveal>
              <div className="pb-12 text-center lg:pb-20">
                <div className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-[#bcff2e]">Why TPP</div>
                <GsapWords
                  text="Built different from every other prop firm"
                  highlight={["prop", "firm"]}
                  className="font-medium tracking-[-0.03em] text-white"
                  style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
                />
              </div>
            </Reveal>

            {/* Mobile: horizontal snap rail. Desktop: grid. */}
            <div className="mx-auto w-full max-w-[1100px]">
              <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
                {[
                  { stat: "0.0", unit: "pips", title: "Raw Spreads", desc: "Tier-1 liquidity, zero markup. Your edge stays yours.", icon: TrendingUp, accent: false },
                  { stat: "0", unit: "days min", title: "No Time Pressure", desc: "Pass in a day or a year — your pace, your rules.", icon: CalendarOff, accent: false },
                  { stat: "FREE", unit: "retry", title: "Second Chance, On Us", desc: "Missed by a hair? We reset your challenge at zero cost.", icon: RotateCcw, accent: true },
                  { stat: "$0", unit: "upfront", title: "Pass First, Pay Later", desc: "Prove your skill first. We only charge after you pass.", icon: BadgeDollarSign, accent: true },
                  { stat: "NFP", unit: "& FOMC", title: "News Trading Allowed", desc: "No restrictions on high-impact events. Trade the volatility.", icon: Newspaper, accent: false },
                  { stat: "24/7", unit: "hold", title: "Weekend & Overnight", desc: "Keep positions through swaps, weekends & holidays.", icon: MoonStar, accent: false },
                  { stat: "3", unit: "platforms", title: "MT5 · DXTrade · TPP Terminal", desc: "Trade on the platform you trust, plus our own proprietary terminal.", icon: Monitor, accent: false, fullWidth: true },
                ].map((item, i) => (
                  <Reveal key={item.title} delay={i * 0.06} className={cn("min-w-[80%] snap-center sm:min-w-0", item.fullWidth && "sm:col-span-2")}>
                    <TiltCard intensity={7} glare={!item.accent} className="h-full">
                      <div
                        className={cn(
                          "group relative h-full overflow-hidden rounded-2xl border p-6 transition-all duration-300 md:rounded-3xl md:p-8",
                          item.accent
                            ? "border-transparent bg-[#bcff2e]"
                            : "border-white/[0.06] bg-[#1A2326] hover:border-white/[0.12]"
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="mb-3 flex items-baseline gap-2">
                              <span className={cn("font-black leading-none tracking-[-0.04em]", item.accent ? "text-[#0c0c0c]" : "text-white", item.fullWidth ? "text-4xl md:text-5xl" : "text-4xl md:text-[56px]")}>
                                {item.stat}
                              </span>
                              <span className={cn("text-sm font-semibold uppercase tracking-wider md:text-base", item.accent ? "text-[#0c0c0c]/50" : "text-[#bcff2e]/70")}>
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
                            <item.icon className={cn("h-5 w-5", item.accent ? "text-[#0c0c0c]/70" : "text-[#bcff2e]")} strokeWidth={2} />
                          </div>
                        </div>
                      </div>
                    </TiltCard>
                  </Reveal>
                ))}
              </div>
            </div>

            <Reveal className="mt-12 text-center lg:mt-16">
              <Link href="/rules" className="text-lg font-medium text-white underline underline-offset-4 transition-colors hover:text-[#bcff2e]">
                Read the full rules
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 6 — EVALUATION STEPS (merged from V1) ═══════════════ */}
      {/* Desktop: full-bleed pinned horizontal-scroll steps */}
      <PinnedSteps />

      {/* Mobile / tablet: header + stacked step cards */}
      <section className="w-full pb-16 lg:hidden">
        <div className="w-full px-5">
          <Reveal>
            <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
              <div className="max-w-xl">
                <div className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-[#6c6a68]">How It Works</div>
                <GsapWords
                  text="Three steps from signup to funded"
                  highlight={["funded"]}
                  className="font-medium tracking-[-0.03em] text-[#0c0c0c]"
                  style={{ fontSize: "clamp(2rem, 5vw, 3.25rem)" }}
                />
                <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[#6c6a68]">
                  No second phases. No 60-day clocks. No hidden gotchas. Just trade — and get paid.
                </p>
              </div>
              <Magnetic className="hidden md:inline-block">
                <Link href="/rules" className="inline-flex h-11 items-center gap-2 rounded-full border border-[#0c0c0c]/20 px-5 text-[15px] font-medium text-[#0c0c0c] transition-all duration-300 hover:rounded-lg hover:bg-[#0c0c0c]/5">
                  Read the full rules
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Magnetic>
            </div>
          </Reveal>

          <div className="grid gap-4 md:gap-5 sm:grid-cols-2">
            {/* Step 01 */}
            <Reveal>
              <TiltCard intensity={5} glare={false} className="h-full">
                <div className="flex h-full flex-col rounded-3xl border border-[#0c0c0c]/10 bg-white/40 p-7 backdrop-blur-sm">
                  <span className="mb-5 inline-flex w-fit items-center rounded-full bg-[#0c0c0c] px-3 py-1 text-[12px] font-semibold uppercase tracking-wider text-[#bcff2e]">Step 01</span>
                  <h3 className="mb-4 text-xl font-bold tracking-tight text-[#0c0c0c]">Pass the evaluation</h3>
                  <div className="flex flex-col gap-4">
                    {[
                      { icon: Target, t: "Hit a 10% profit target", s: "Reach and maintain a 10% profit target." },
                      { icon: Shield, t: "Respect 4% daily / 8% max drawdown", s: "Stay within 4% daily and 8% overall limits." },
                      { icon: Clock, t: "Minimum 3 trading days, no time limit", s: "Trade for at least 3 days. No time limit." },
                    ].map((b) => (
                      <div key={b.t} className="flex gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0c0c0c]">
                          <b.icon className="h-4 w-4 text-[#bcff2e]" strokeWidth={2} />
                        </span>
                        <div>
                          <div className="text-[14px] font-semibold text-[#0c0c0c]">{b.t}</div>
                          <div className="text-[13px] text-[#6c6a68]">{b.s}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TiltCard>
            </Reveal>

            {/* Step 02 */}
            <Reveal delay={0.1}>
              <TiltCard intensity={5} className="h-full">
                <div className="flex h-full flex-col rounded-3xl bg-[#0c0c0c] p-7">
                  <span className="mb-5 inline-flex w-fit items-center rounded-full bg-[#bcff2e] px-3 py-1 text-[12px] font-semibold uppercase tracking-wider text-[#0c0c0c]">Step 02</span>
                  <h3 className="mb-6 text-xl font-bold tracking-tight text-white">Unlock funded account</h3>
                  <div className="flex flex-col gap-4">
                    {[
                      { icon: KeyRound, label: "Account credentials", value: "In under 24 hours" },
                      { icon: DollarSign, label: "Up to $200,000", value: "In scaled capital" },
                      { icon: Shield, label: "Same rules", value: "No daily target pressure" },
                    ].map((s) => (
                      <div key={s.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-4">
                        <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06]">
                          <s.icon className="h-4 w-4 text-[#bcff2e]" strokeWidth={1.8} />
                        </span>
                        <div className="text-[14px] font-semibold text-white">{s.label}</div>
                        <div className="text-[13px] text-white/45">{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </TiltCard>
            </Reveal>

            {/* Step 03 */}
            <Reveal delay={0.2}>
              <TiltCard intensity={5} glare={false} className="h-full">
                <div className="flex h-full flex-col rounded-3xl border border-[#0c0c0c]/10 bg-white/40 p-7 backdrop-blur-sm">
                  <span className="mb-5 inline-flex w-fit items-center rounded-full bg-[#0c0c0c] px-3 py-1 text-[12px] font-semibold uppercase tracking-wider text-[#bcff2e]">Step 03</span>
                  <h3 className="mb-4 text-xl font-bold tracking-tight text-[#0c0c0c]">Trade &amp; get paid</h3>
                  <div className="flex flex-col gap-4">
                    {[
                      { icon: CalendarCheck, t: "First payout 14 days", s: "Receive your first payout 14 days after your first trade." },
                      { icon: Percent, t: "Up to 90% profit split", s: "Keep up to 90% of profits. Paid bi-weekly." },
                      { icon: RotateCcw, t: "100% refund on payout #1", s: "We refund your full challenge fee with payout #1." },
                    ].map((b) => (
                      <div key={b.t} className="flex gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0c0c0c]">
                          <b.icon className="h-4 w-4 text-[#bcff2e]" strokeWidth={2} />
                        </span>
                        <div>
                          <div className="text-[14px] font-semibold text-[#0c0c0c]">{b.t}</div>
                          <div className="text-[13px] text-[#6c6a68]">{b.s}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 7 — FEATURES (lime card, orbit) ═══════════════ */}
      <section className="w-full pb-16 lg:pb-24">
        <div className="px-[5px] py-[5px]">
          <div className="rounded-[2rem] bg-[#bcff2e] px-[15px] py-20 lg:rounded-[3.5rem] lg:px-[35px] xl:py-32">
            <Reveal>
              <div className="mb-16 text-center">
                <div className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-[#0c0c0c]/60">Why TPP</div>
                <GsapWords
                  text="Built for traders, not against them"
                  className="font-medium tracking-[-0.03em] text-[#0c0c0c]"
                  style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
                />
              </div>
            </Reveal>

            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 lg:flex-row lg:gap-0">
              <div className="flex w-full flex-col gap-5 lg:w-[28%]">
                {[
                  { icon: TrendingUp, title: "Tier-1 Liquidity", desc: "Raw spreads, no re-quotes. Your strategy deserves real market conditions." },
                  { icon: Shield, title: "Transparent Rules", desc: "4% daily drawdown, 8% max. No hidden gotchas. What you see is what you get." },
                ].map((f, i) => (
                  <Reveal key={f.title} delay={i * 0.08}>
                    <TiltCard>
                      <div className="flex min-h-[200px] flex-col overflow-hidden rounded-3xl border border-white/[0.05] bg-[#0c0c0c] p-7">
                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]">
                          <f.icon className="h-5 w-5 text-[#bcff2e]" strokeWidth={2} />
                        </div>
                        <h3 className="mb-1.5 text-lg font-bold tracking-tight text-white">{f.title}</h3>
                        <p className="text-[13px] leading-relaxed text-white/50">{f.desc}</p>
                      </div>
                    </TiltCard>
                  </Reveal>
                ))}
              </div>

              {/* Orbit graphic */}
              <div className="relative hidden w-[44%] items-center justify-center py-8 lg:flex">
                <Floating amplitude={10} duration={7}>
                  <div className="relative flex h-[340px] w-[340px] items-center justify-center">
                    <div className="absolute inset-[-30px] animate-[spin_20s_linear_infinite]">
                      <div className="absolute inset-0 rounded-full border border-[#0c0c0c]/10" />
                      <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 animate-[spin_20s_linear_infinite_reverse]">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#0c0c0c] shadow-lg">
                          <img src="/images/icon-mt5.svg" alt="MT5" className="h-8 w-8 rounded-lg" />
                        </div>
                      </div>
                      <div className="absolute bottom-[13%] left-[3%] -translate-x-1/2 animate-[spin_20s_linear_infinite_reverse]">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#0c0c0c] shadow-lg">
                          <img src="/images/icon-dxtrade.svg" alt="DXTrade" className="h-8 w-8 rounded-lg" />
                        </div>
                      </div>
                      <div className="absolute bottom-[13%] right-[3%] translate-x-1/2 animate-[spin_20s_linear_infinite_reverse]">
                        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-[#0c0c0c] shadow-lg">
                          <img src="/images/icon-tpp-terminal.webp" alt="TPP Terminal" className="h-10 w-10 rounded-lg object-cover" />
                        </div>
                      </div>
                    </div>
                    <div className="absolute inset-4 rounded-full border border-[#0c0c0c]/15 animate-[spin_12s_linear_infinite_reverse]" />
                    <div className="absolute inset-10 rounded-full border border-[#0c0c0c]/20 animate-[spin_8s_linear_infinite]" />
                    <div className="relative z-10 flex h-[160px] w-[160px] items-center justify-center rounded-full border border-white/[0.05] bg-[#0c0c0c]">
                      <span className="text-5xl font-bold tracking-tighter text-[#bcff2e]">TPP</span>
                    </div>
                  </div>
                </Floating>
              </div>

              <div className="flex w-full flex-col gap-5 lg:w-[28%]">
                {[
                  { icon: Clock, title: "No Time Limit", desc: "Trade at your own pace. Pass the evaluation whenever you're ready." },
                  { icon: Award, title: "Auto-Scaling", desc: "Hit targets and grow automatically. $25K → $50K → $100K → $200K." },
                ].map((f, i) => (
                  <Reveal key={f.title} delay={i * 0.08}>
                    <TiltCard>
                      <div className="flex min-h-[200px] flex-col overflow-hidden rounded-3xl border border-white/[0.05] bg-[#0c0c0c] p-7">
                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]">
                          <f.icon className="h-5 w-5 text-[#bcff2e]" strokeWidth={2} />
                        </div>
                        <h3 className="mb-1.5 text-lg font-bold tracking-tight text-white">{f.title}</h3>
                        <p className="text-[13px] leading-relaxed text-white/50">{f.desc}</p>
                      </div>
                    </TiltCard>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 8 — TESTIMONIALS (swipe deck on mobile) ═══════════════ */}
      <section className="w-full pb-16 lg:pb-24">
        <div className="px-[5px] py-[5px]">
          <div className="rounded-[2rem] bg-black px-[15px] py-20 lg:rounded-[3.5rem] lg:px-[35px] xl:py-32">
            <Reveal>
              <div className="mb-16 text-center">
                <div className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-white/60">Trader Voices</div>
                <GsapWords
                  text="What our traders are saying"
                  highlight={["saying"]}
                  className="font-medium tracking-[-0.03em] text-white"
                  style={{ fontSize: "clamp(2rem, 6vw, 3.5rem)" }}
                />
              </div>
            </Reveal>

            {/* Mobile swipe deck */}
            <div className="sm:hidden">
              <div
                className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                onScroll={(e) => {
                  const el = e.currentTarget;
                  setActiveT(Math.round(el.scrollLeft / (el.scrollWidth / testimonials.length)));
                }}
              >
                {testimonials.map((t) => (
                  <div key={t.name} className="min-w-[85%] snap-center">
                    <div className="h-full rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#bcff2e] text-[12px] font-bold text-[#0c0c0c]">
                          {t.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-[14px] font-medium text-white">{t.name}</p>
                          <p className="text-[12px] text-white/40">{t.handle}</p>
                        </div>
                      </div>
                      <p className="mb-3 text-[13px] leading-relaxed text-white/60">&ldquo;{t.body}&rdquo;</p>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#bcff2e]" strokeWidth={2.5} />
                        <span className="text-[12px] font-semibold text-[#bcff2e]">{t.payout} paid</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex justify-center gap-1.5">
                {testimonials.map((_, i) => (
                  <span key={i} className={cn("h-1.5 rounded-full transition-all duration-300", i === activeT ? "w-6 bg-[#bcff2e]" : "w-1.5 bg-white/20")} />
                ))}
              </div>
            </div>

            {/* Desktop grid */}
            <div className="mx-auto hidden max-w-6xl grid-cols-2 gap-5 sm:grid lg:grid-cols-3">
              {testimonials.map((t, i) => (
                <Reveal key={t.name} delay={i * 0.06}>
                  <TiltCard intensity={6}>
                    <div className="h-full rounded-3xl border border-white/[0.08] bg-white/[0.04] p-7 transition-colors duration-500 hover:bg-white/[0.08]">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#bcff2e] text-[12px] font-bold text-[#0c0c0c]">
                          {t.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="text-[14px] font-medium text-white">{t.name}</p>
                          <p className="text-[12px] text-white/40">{t.handle}</p>
                        </div>
                      </div>
                      <p className="mb-3 text-[13px] leading-relaxed text-white/60">&ldquo;{t.body}&rdquo;</p>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-[#bcff2e]" strokeWidth={2.5} />
                        <span className="text-[12px] font-semibold text-[#bcff2e]">{t.payout} paid</span>
                      </div>
                    </div>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 9 — FAQ (merged from V1) ═══════════════ */}
      <section className="w-full pb-16 lg:pb-24">
        <div className="px-[5px] py-[5px]">
          <div className="rounded-[2rem] bg-[#0c0c0c] px-[15px] py-20 lg:rounded-[3.5rem] lg:px-[35px] xl:py-28">
            <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
              <Reveal>
                <div className="lg:sticky lg:top-32">
                  <div className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-[#bcff2e]">Frequently Asked</div>
                  <GsapWords
                    text="The questions traders ask first"
                    highlight={["traders"]}
                    className="font-medium tracking-[-0.03em] text-white"
                    style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)" }}
                  />
                  <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/50">
                    Everything you need to know before getting started. For the full list, see the rules page.
                  </p>
                  <Magnetic className="mt-8 hidden lg:inline-block">
                    <Link href="/rules" className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 px-5 text-[15px] font-medium text-white transition-all duration-300 hover:rounded-lg hover:border-[#bcff2e] hover:text-[#bcff2e]">
                      See all questions
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Magnetic>
                </div>
              </Reveal>

              <Reveal delay={0.1}>
                <div className="flex flex-col gap-3">
                  {faqItems.map((item, i) => (
                    <FaqRow key={item.q} item={item} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? null : i)} />
                  ))}
                  <Link href="/rules" className="mt-3 inline-flex items-center justify-center gap-2 text-[15px] font-medium text-[#bcff2e] underline underline-offset-4 lg:hidden">
                    See all questions
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 10 — FINAL CTA ═══════════════ */}
      <section className="w-full py-16 lg:py-24">
        <div className="w-full px-5 lg:px-10">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <GsapWords
                text="Ready to get funded?"
                highlight={["funded?"]}
                className="mb-6 font-medium tracking-[-0.03em] text-[#0c0c0c]"
                style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
              />
              <p className="mb-10 text-lg leading-relaxed text-[#6c6a68]">
                Join thousands of traders who chose transparency over gimmicks. Your first payout is 14 days away.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Magnetic>
                  <Link href="/dashboard/new-challenge" className="group inline-flex h-12 items-center gap-2 rounded-full bg-[#0c0c0c] pl-2 pr-5 text-[15px] font-semibold text-white transition-all duration-300 hover:rounded-xl">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#bcff2e] transition-all duration-300 group-hover:rounded-md">
                      <ArrowUpRight className="h-4 w-4 text-[#0c0c0c] transition-transform duration-300 group-hover:rotate-45" />
                    </span>
                    Start your challenge
                  </Link>
                </Magnetic>
                <Magnetic>
                  <Link href="/rules" className="inline-flex h-12 items-center rounded-full border border-[#0c0c0c]/20 px-6 text-[15px] font-medium text-[#0c0c0c] transition-all duration-300 hover:rounded-xl hover:bg-[#0c0c0c]/5">
                    Read the rules
                  </Link>
                </Magnetic>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══════════════ FOOTER ═══════════════ */}
      <footer className="rounded-t-[2rem] bg-[#bcff2e] text-[#0c0c0c] lg:rounded-t-[3rem]">
        <div className="mx-auto max-w-[1440px] px-5 pb-8 pt-16 lg:px-10">
          <div className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row">
            <div>
              <span className="text-xl font-bold">The People Prop</span>
              <p className="mt-1 text-[14px] opacity-60">Prop Trading · Global</p>
            </div>
            <Magnetic>
              <Link href="/dashboard/new-challenge" className="group inline-flex h-8 items-center gap-2 rounded-full border border-[#0c0c0c]/30 pl-1 pr-3 text-[15px] text-[#0c0c0c] transition-all duration-300 hover:rounded-lg">
                <span className="h-6 w-6 shrink-0 rounded-full bg-[#0c0c0c] transition-all duration-300 group-hover:rounded-sm" />
                Start trading
              </Link>
            </Magnetic>
          </div>

          <div className="mb-16 grid grid-cols-1 gap-12 md:grid-cols-[1.5fr_1fr]">
            <div>
              <h3 className="mb-6 max-w-[400px] text-3xl font-medium tracking-tight md:text-4xl">
                Keep up to date with TPP news
              </h3>
              <div className="flex max-w-md border-b-2 border-[#0c0c0c] pb-3">
                <input type="email" placeholder="Your email address" className="flex-1 bg-transparent text-lg outline-none placeholder:text-[#0c0c0c]/40" />
                <button className="text-2xl font-medium" aria-label="Subscribe">→</button>
              </div>
            </div>
            <div className="flex gap-12 md:gap-16">
              <div className="flex flex-col gap-3">
                <Link href="/challenges" className="font-medium transition-opacity hover:opacity-60">Challenges</Link>
                <Link href="/rules" className="font-medium transition-opacity hover:opacity-60">Rules</Link>
                <Link href="/contact" className="font-medium transition-opacity hover:opacity-60">Contact</Link>
              </div>
              <div className="flex flex-col gap-3">
                <Link href="/login" className="font-medium transition-opacity hover:opacity-60">Dashboard</Link>
                <Link href="/referral" className="font-medium transition-opacity hover:opacity-60">Referral</Link>
                <Link href="#" className="font-medium transition-opacity hover:opacity-60">Discord</Link>
              </div>
            </div>
          </div>

          <h2 className="my-8 select-none text-center font-extrabold leading-[0.8] tracking-[-0.05em]" style={{ fontSize: "clamp(4rem, 18vw, 20rem)" }}>
            TPP
          </h2>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-[#0c0c0c]/10 pt-8 text-[14px] opacity-60 sm:flex-row">
            <span>&copy; 2026 The People Prop</span>
            <Link href="#" className="transition-opacity hover:opacity-100">Privacy Policy</Link>
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="inline-flex items-center gap-1 transition-opacity hover:opacity-100">
              <ChevronUp className="h-4 w-4" /> Take me back to top
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
