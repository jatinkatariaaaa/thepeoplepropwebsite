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
  useMotionTemplate,
} from "framer-motion";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
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

import { FeaturedIn } from "@/components/landing/FeaturedIn";
import { cn } from "@/lib/utils";
import { faq } from "@/data/faq";
import { ChallengeCalculator } from "@/components/landing/ChallengeCalculator";
import { ProfitCalculator } from "@/components/landing/ProfitCalculator";

/* ═══════════════════════════════════════════════════════════════
   V3 Landing Page — "Ultra-Premium" evolution of V2

   Design language (kept + refined from V2):
   • Page bg = warm cream (#f1eade)
   • Full-width ROUNDED CARDS with tiny inset, alternating
     BLACK → CREAM → BLACK → LIME
   • Matte dark #0c0c0c + neon lime #cbfb45 accent
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
const LIME = "#cbfb45";

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
              highlight.includes(w) && "text-[#cbfb45]"
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
  children?: ReactNode;
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
        open ? "border-[#cbfb45]/40 bg-white/[0.05]" : "border-white/[0.08] bg-white/[0.02]"
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
              ? "rotate-180 border-[#cbfb45] bg-[#cbfb45] text-[#0c0c0c]"
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
    document.documentElement.classList.add("custom-cursor");
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerout", leave);
      document.documentElement.classList.remove("custom-cursor");
    };
  }, [reduced, dotX, dotY]);

  if (!enabled) return null;

  return (
    <>
      <style>{`.custom-cursor, .custom-cursor * { cursor: none !important; }`}</style>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[9999] rounded-full border border-[#cbfb45] mix-blend-difference"
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
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-2 w-2 rounded-full bg-[#cbfb45]"
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
            <b.icon className="h-4 w-4 text-[#cbfb45]" strokeWidth={2} />
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
            <h2 className="font-bold tracking-[-0.03em] text-[#0c0c0c]" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>
              Three steps from
              <br />
              signup to <span className="text-[#cbfb45]">funded</span>
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
                  step.dark ? "bg-[#0c0c0c]" : "border border-[#0c0c0c]/10 bg-white/50 md:backdrop-blur-sm"
                )}
              >
                <span
                  className={cn(
                    "mb-5 inline-flex w-fit items-center rounded-full px-3 py-1 text-[12px] font-semibold uppercase tracking-wider",
                    step.dark ? "bg-[#cbfb45] text-[#0c0c0c]" : "bg-[#0c0c0c] text-[#cbfb45]"
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

export default function HomePage() {
  
  const [dynamicPlatformsText, setDynamicPlatformsText] = useState("MT5 · DXTrade · TPP Terminal");
  const [dbStats, setDbStats] = useState<any[]>([
    { value: "250+", label: "Successful payouts", key_name: "total_payouts", mt: "" },
    { value: "142+", label: "Countries served", key_name: "countries", mt: "md:mt-20" },
    { value: "5*", label: "TrustPilot rating", key_name: "trustpilot", mt: "md:mt-12" }
  ]);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    
    // Fetch platforms
    supabase.from("tpp_platforms").select("name").eq("is_active", true).order("created_at")
      .then(({data}) => {
        if (data && data.length > 0) setDynamicPlatformsText(data.map(p => p.name).join(" · "));
      });

    // Fetch stats
    supabase.from("tpp_stats").select("*").order("key_name")
      .then(({data}) => {
        if (data && data.length > 0) {
          // Merge with default margins
          const margins = ["", "md:mt-20", "md:mt-12", "md:-mt-8"];
          setDbStats(data.map((d, i) => ({ ...d, mt: margins[i % margins.length] })));
        }
      });
  }, []);

  
  const reduced = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const skipHeroAnim = reduced || isMobile;

  /* Spotlight X-Ray Mouse Tracking */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

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
      className="page-wrapper min-h-screen bg-[#f1eade] text-[#0c0c0c] antialiased"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <CustomCursor />



      {/* ═══════════════ SECTION 1 — HERO ═══════════════ */}
      <section ref={heroRef} className="min-h-[100svh] lg:h-dvh px-[5px] py-[5px]">
        <motion.div
          style={{ scale: skipHeroAnim ? 1 : heroScale }}
          onPointerMove={(e) => {
            if (reduced || isMobile || !heroRef.current) return;
            const { left, top } = heroRef.current.getBoundingClientRect();
            mouseX.set(e.clientX - left);
            mouseY.set(e.clientY - top);
          }}
          className="relative flex h-full flex-col items-center justify-center overflow-hidden rounded-xl bg-[#0a0a0a] px-6 py-20 lg:rounded-2xl lg:px-10"
        >
          {/* Middle Layer: X-Ray Reveal Image */}
          <motion.div
            className="hidden md:block absolute inset-0 z-0 bg-[url('/images/hero-bg.webp')] bg-cover bg-center bg-no-repeat opacity-80 pointer-events-none"
            style={{
              maskImage: useMotionTemplate`radial-gradient(450px circle at ${smoothMouseX}px ${smoothMouseY}px, black 0%, transparent 100%)`,
              WebkitMaskImage: useMotionTemplate`radial-gradient(450px circle at ${smoothMouseX}px ${smoothMouseY}px, black 0%, transparent 100%)`,
            }}
          />
          {/* Ambient parallax orbs - hidden on mobile to fix GPU lag */}
          <Floating className="pointer-events-none absolute left-[8%] top-[16%] hidden h-[46vw] w-[46vw] rounded-full bg-[#cbfb45]/[0.07] blur-[120px] md:block" amplitude={24} duration={9} />
          <Floating className="pointer-events-none absolute bottom-[-12%] right-[8%] hidden h-[36vw] w-[36vw] rounded-full bg-[#cbfb45]/[0.09] blur-[100px] md:block" amplitude={30} duration={11} delay={1} />

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

          <motion.div style={{ y: skipHeroAnim ? 0 : heroTitleY, opacity: skipHeroAnim ? 1 : heroFade }} className="relative z-10 flex flex-col items-center">
            {/* Trust badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 md:backdrop-blur-md">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#cbfb45] opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#cbfb45]" />
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
              className="relative z-10 w-full max-w-[1300px] text-center font-bold leading-[0.9] tracking-[-0.03em] text-white"
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
                  className="group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-full bg-[#cbfb45] pl-2 pr-5 text-[15px] font-semibold text-[#0c0c0c] transition-all duration-300 hover:rounded-xl"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0c0c0c] transition-all duration-300 group-hover:rounded-md">
                    <ArrowUpRight className="h-4 w-4 text-[#cbfb45] transition-transform duration-300 group-hover:rotate-45" />
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
            style={{ opacity: skipHeroAnim ? 1 : heroFade }}
            className="absolute bottom-7 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              className="flex h-9 w-6 items-start justify-center rounded-full border border-white/25 p-1.5"
            >
              <span className="h-1.5 w-1 rounded-full bg-[#cbfb45]" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════ FEATURED LOGOS ═══════════════ */}
      <FeaturedIn />

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
                    className="font-bold tracking-tight text-white"
                    style={{ fontSize: "clamp(3rem, 10vw, 8rem)", lineHeight: 1 }}
                  />
                </div>

                <Reveal delay={0.1} className="relative z-10 flex flex-col items-center gap-y-8 lg:px-[12.5%]" style={{ marginTop: "-3vw" }}>
                  <TiltCard intensity={6} className="relative w-full">
                    <div className="relative z-10 aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[#e5ddd0] shadow-2xl lg:rounded-3xl">
                      <img src="/images/dashboard-v2.webp" alt="TPP Dashboard" className="h-full w-full object-cover" loading="lazy" />
                    </div>
                  </TiltCard>

                  <h3 className="mx-auto max-w-[620px] text-center font-bold tracking-[-0.02em] text-[#0c0c0c]" style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)" }}>
                    The prop firm that rebels against industry cliches
                  </h3>
                  <p className="mx-auto max-w-[480px] text-center text-base leading-relaxed text-[#6c6a68]">
                    Ever noticed how every prop firm looks the same? Impossible rules, hidden gotchas, and payouts that never arrive. We built TPP to be the opposite — transparent rules, real capital, and payouts in under 24 hours.
                  </p>

                  <div className="flex flex-wrap justify-center gap-2">
                    <Magnetic>
                      <Link href="/dashboard/new-challenge" className="group inline-flex h-9 items-center gap-2 rounded-full border border-[#0c0c0c] bg-[#0c0c0c] pl-1.5 pr-4 text-[15px] font-medium text-white transition-all duration-300 hover:rounded-lg">
                        <span className="h-6 w-6 shrink-0 rounded-full bg-[#cbfb45] transition-all duration-300 group-hover:rounded-sm" />
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
          
          <div className="flex flex-col gap-12 text-center md:flex-row md:flex-wrap md:text-left xl:flex-nowrap xl:gap-16">
            {dbStats.map((s, i) => (
              <Reveal key={s.label || s.key_name} delay={i * 0.1} className={cn("flex-1 min-w-[200px]", s.mt)}>
                <div className="flex flex-col items-center gap-2 md:items-start lg:gap-3">
                  <div className="text-5xl font-medium leading-tight tracking-tight text-[#0c0c0c] sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
                    {s.value}
                  </div>
                  <span className="text-base font-medium text-[#6c6a68] lg:text-lg">{s.label}</span>
                </div>
              </Reveal>
            ))}
          </div>

        </div>
      </section>

      {/* ═══════════════ SECTION 4 — CALCULATOR ═══════════════ */}
      <ChallengeCalculator />

      {/* ═══════════════ TPP PHONE MOCKUP ═══════════════ */}
      <section className="relative w-full -mb-1" style={{ background: '#f1eade' }}>
        {/* Top gradient fade into creme - subtle */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16" style={{ background: 'linear-gradient(to bottom, #f1eade, transparent)' }} />
        {/* Left gradient fade - strong */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-[15%] sm:w-[20%] lg:w-[25%]" style={{ background: 'linear-gradient(to right, #f1eade 20%, transparent)' }} />
        {/* Right gradient fade - strong */}
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-[15%] sm:w-[20%] lg:w-[25%]" style={{ background: 'linear-gradient(to left, #f1eade 20%, transparent)' }} />
        <img
          src="/traders-community.webp"
          alt="TPP Trading App - Payout Dashboard"
          className="relative mx-auto block w-full max-w-5xl object-cover"
          loading="lazy"
        />
      </section>

      {/* ═══════════════ SECTION 5 — WHY TPP (feature rail) ═══════════════ */}
      <section className="w-full pb-16 lg:pb-24">
        <div className="px-[5px] py-[5px]">
          <div className="relative overflow-hidden rounded-2xl bg-black px-[15px] py-20 lg:px-[35px] xl:py-32">
            <Reveal>
              <div className="pb-12 text-center lg:pb-20">
                <div className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-[#cbfb45]">Why TPP</div>
                <GsapWords
                  text="Built different from every other prop firm"
                  highlight={["prop", "firm"]}
                  className="font-bold tracking-[-0.03em] text-white"
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
                  { stat: "$5", unit: "upfront", title: "Pass First, Pay Later", desc: "Prove your skill first. We only charge after you pass.", icon: BadgeDollarSign, accent: true },
                  { stat: "NFP", unit: "& FOMC", title: "News Trading Allowed", desc: "No restrictions on high-impact events. Trade the volatility.", icon: Newspaper, accent: false },
                  { stat: "24/7", unit: "hold", title: "Weekend & Overnight", desc: "Keep positions through swaps, weekends & holidays.", icon: MoonStar, accent: false },
                  { stat: "3", unit: "platforms", title: dynamicPlatformsText, desc: "Trade on the platform you trust, plus our own proprietary terminal.", icon: Monitor, accent: false, fullWidth: true },
                ].map((item, i) => (
                  <Reveal key={item.title} delay={i * 0.06} className={cn("min-w-[80%] snap-center sm:min-w-0", item.fullWidth && "sm:col-span-2")}>
                    <TiltCard intensity={7} glare={!item.accent} className="h-full">
                      <div
                        className={cn(
                          "group relative h-full overflow-hidden rounded-2xl border p-6 transition-all duration-300 md:rounded-3xl md:p-8",
                          item.accent
                            ? "border-transparent bg-[#cbfb45]"
                            : "border-white/[0.06] bg-[#1A2326] hover:border-white/[0.12]"
                        )}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0 flex-1">
                            <div className="mb-3 flex items-baseline gap-2">
                              <span className={cn("font-black leading-none tracking-[-0.04em]", item.accent ? "text-[#0c0c0c]" : "text-white", item.fullWidth ? "text-4xl md:text-5xl" : "text-4xl md:text-[56px]")}>
                                {item.stat}
                              </span>
                              <span className={cn("text-sm font-semibold uppercase tracking-wider md:text-base", item.accent ? "text-[#0c0c0c]/50" : "text-[#cbfb45]/70")}>
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
                    </TiltCard>
                  </Reveal>
                ))}
              </div>
            </div>

            <Reveal className="mt-12 text-center lg:mt-16">
              <Link href="/rules" className="text-lg font-medium text-white underline underline-offset-4 transition-colors hover:text-[#cbfb45]">
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
                  className="font-bold tracking-[-0.03em] text-[#0c0c0c]"
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
                <div className="flex h-full flex-col rounded-3xl border border-[#0c0c0c]/10 bg-white/40 p-7 md:backdrop-blur-sm">
                  <span className="mb-5 inline-flex w-fit items-center rounded-full bg-[#0c0c0c] px-3 py-1 text-[12px] font-semibold uppercase tracking-wider text-[#cbfb45]">Step 01</span>
                  <h3 className="mb-4 text-xl font-bold tracking-tight text-[#0c0c0c]">Pass the evaluation</h3>
                  <div className="flex flex-col gap-4">
                    {[
                      { icon: Target, t: "Hit a 10% profit target", s: "Reach and maintain a 10% profit target." },
                      { icon: Shield, t: "Respect 4% daily / 8% max drawdown", s: "Stay within 4% daily and 8% overall limits." },
                      { icon: Clock, t: "Minimum 3 trading days, no time limit", s: "Trade for at least 3 days. No time limit." },
                    ].map((b) => (
                      <div key={b.t} className="flex gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0c0c0c]">
                          <b.icon className="h-4 w-4 text-[#cbfb45]" strokeWidth={2} />
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
                  <span className="mb-5 inline-flex w-fit items-center rounded-full bg-[#cbfb45] px-3 py-1 text-[12px] font-semibold uppercase tracking-wider text-[#0c0c0c]">Step 02</span>
                  <h3 className="mb-6 text-xl font-bold tracking-tight text-white">Unlock funded account</h3>
                  <div className="flex flex-col gap-4">
                    {[
                      { icon: KeyRound, label: "Account credentials", value: "In under 24 hours" },
                      { icon: DollarSign, label: "Up to $200,000", value: "In scaled capital" },
                      { icon: Shield, label: "Same rules", value: "No daily target pressure" },
                    ].map((s) => (
                      <div key={s.label} className="rounded-2xl border border-white/[0.06] bg-white/[0.04] p-4">
                        <span className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.06]">
                          <s.icon className="h-4 w-4 text-[#cbfb45]" strokeWidth={1.8} />
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
                <div className="flex h-full flex-col rounded-3xl border border-[#0c0c0c]/10 bg-white/40 p-7 md:backdrop-blur-sm">
                  <span className="mb-5 inline-flex w-fit items-center rounded-full bg-[#0c0c0c] px-3 py-1 text-[12px] font-semibold uppercase tracking-wider text-[#cbfb45]">Step 03</span>
                  <h3 className="mb-4 text-xl font-bold tracking-tight text-[#0c0c0c]">Trade &amp; get paid</h3>
                  <div className="flex flex-col gap-4">
                    {[
                      { icon: CalendarCheck, t: "First payout 14 days", s: "Receive your first payout 14 days after your first trade." },
                      { icon: Percent, t: "Up to 90% profit split", s: "Keep up to 90% of profits. Paid bi-weekly." },
                      { icon: RotateCcw, t: "100% refund on payout #1", s: "We refund your full challenge fee with payout #1." },
                    ].map((b) => (
                      <div key={b.t} className="flex gap-3">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0c0c0c]">
                          <b.icon className="h-4 w-4 text-[#cbfb45]" strokeWidth={2} />
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
          <div className="rounded-[2rem] bg-[#cbfb45] px-[15px] py-20 lg:rounded-[3.5rem] lg:px-[35px] xl:py-32">
            <Reveal>
              <div className="mb-16 text-center">
                <div className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-[#0c0c0c]/60">Why TPP</div>
                <GsapWords
                  text="Built for traders, not against them"
                  className="font-bold tracking-[-0.03em] text-[#0c0c0c]"
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
                          <f.icon className="h-5 w-5 text-[#cbfb45]" strokeWidth={2} />
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
                      <span className="text-5xl font-bold tracking-tighter text-[#cbfb45]">TPP</span>
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
                          <f.icon className="h-5 w-5 text-[#cbfb45]" strokeWidth={2} />
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

      <ProfitCalculator />

      {/* ═══════════════ SECTION 8 — TESTIMONIALS (MARQUEE) ═══════════════ */}
      <section className="w-full pb-16 pt-8 lg:pb-24">
        <div className="mb-12 text-center">
          <GsapWords
            text="Trader Voices"
            highlight={["Voices"]}
            className="font-bold tracking-tight text-[#0c0c0c]"
            style={{ fontSize: "clamp(2rem, 5vw, 3rem)" }}
          />
          <p className="mt-2 text-[15px] font-medium text-[#0c0c0c]/60">What our traders are saying</p>
        </div>

        <div 
          className="relative flex w-full flex-col gap-3 overflow-hidden py-4"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)"
          }}
        >
          {/* Row 1 */}
          <motion.div
            className="flex w-max items-center gap-3"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 40 }}
          >
            {[...testimonials, ...testimonials].map((t, i) => (
              <div key={i} className="flex h-[180px] w-[300px] flex-col justify-between rounded-[1rem] bg-[#cbfb45] p-6 text-[#0c0c0c] shadow-sm md:h-[200px] md:w-[350px]">
                <p className="text-[13px] font-semibold leading-relaxed md:text-[14px]">&ldquo;{t.body}&rdquo;</p>
                <div className="flex items-center gap-3">
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
            ))}
          </motion.div>

          {/* Row 2 */}
          <motion.div
            className="flex w-max items-center gap-3"
            animate={{ x: ["-50%", "0%"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 45 }}
          >
            {[...testimonials.slice().reverse(), ...testimonials.slice().reverse()].map((t, i) => (
              <div key={i} className="flex h-[180px] w-[300px] flex-col justify-between rounded-[1rem] bg-[#cbfb45] p-6 text-[#0c0c0c] shadow-sm md:h-[200px] md:w-[350px]">
                <p className="text-[13px] font-semibold leading-relaxed md:text-[14px]">&ldquo;{t.body}&rdquo;</p>
                <div className="flex items-center gap-3">
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
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════ SECTION 9 — FAQ (merged from V1) ═══════════════ */}
      <section className="w-full pb-16 lg:pb-24">
        <div className="px-[5px] py-[5px]">
          <div className="rounded-[2rem] bg-[#0c0c0c] px-[15px] py-20 lg:rounded-[3.5rem] lg:px-[35px] xl:py-28">
            <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
              <Reveal>
                <div className="lg:sticky lg:top-32">
                  <div className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-[#cbfb45]">Frequently Asked</div>
                  <GsapWords
                    text="The questions traders ask first"
                    highlight={["traders"]}
                    className="font-bold tracking-[-0.03em] text-white"
                    style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)" }}
                  />
                  <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/50">
                    Everything you need to know before getting started. For the full list, see the rules page.
                  </p>
                  <Magnetic className="mt-8 hidden lg:inline-block">
                    <Link href="/rules" className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 px-5 text-[15px] font-medium text-white transition-all duration-300 hover:rounded-lg hover:border-[#cbfb45] hover:text-[#cbfb45]">
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
                  <Link href="/rules" className="mt-3 inline-flex items-center justify-center gap-2 text-[15px] font-medium text-[#cbfb45] underline underline-offset-4 lg:hidden">
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
                className="mb-6 font-bold tracking-[-0.03em] text-[#0c0c0c]"
                style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
              />
              <p className="mb-10 text-lg leading-relaxed text-[#6c6a68]">
                Join thousands of traders who chose transparency over gimmicks. Your first payout is 14 days away.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                <Magnetic>
                  <Link href="/dashboard/new-challenge" className="group inline-flex h-12 items-center gap-2 rounded-full bg-[#0c0c0c] pl-2 pr-5 text-[15px] font-semibold text-white transition-all duration-300 hover:rounded-xl">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#cbfb45] transition-all duration-300 group-hover:rounded-md">
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
                <input type="email" placeholder="Enter your email" className="flex-1 bg-transparent text-base font-medium outline-none placeholder:text-[#0c0c0c]/40" />
                <button className="text-xl font-medium transition-transform hover:translate-x-1" aria-label="Subscribe">→</button>
              </div>

              <div className="flex gap-4">
                <Link href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#0c0c0c]/20 transition-all hover:bg-[#0c0c0c] hover:text-[#cbfb45]" aria-label="X (Twitter)">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
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
                    <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/>
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
                <Link href="/referral" className="text-[15px] font-medium transition-opacity hover:opacity-60">Affiliate</Link>
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
              <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="inline-flex items-center gap-1.5 rounded-full bg-[#0c0c0c]/5 px-4 py-2 transition-opacity hover:opacity-100">
                <ChevronUp className="h-4 w-4" strokeWidth={2.5} /> Back to top
              </button>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
