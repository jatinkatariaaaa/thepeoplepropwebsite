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
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";

import { FeaturedIn } from "@/components/landing/FeaturedIn";
import { Testimonials } from "@/components/landing/Testimonials";
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

  /* FAQ */
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const faqItems = faq.slice(0, 6);

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
      <section ref={heroRef} className="relative z-0 overflow-hidden min-h-[100svh] lg:h-dvh px-[5px] py-[5px]">
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

            {/* Right card hidden - image will be added later */}
            {/*
            <Reveal delay={0.2} className="hidden items-end md:col-span-3 md:flex lg:col-span-2">
              <Floating amplitude={12} duration={8} delay={0.5} className="-translate-y-full w-full">
                <div className="aspect-[9/10] w-full overflow-hidden rounded-2xl bg-[#e5ddd0] lg:rounded-3xl">
                  <img src="/images/features/1.webp" alt="Feature" className="h-full w-full object-cover" loading="lazy" />
                </div>
              </Floating>
            </Reveal>
            */}
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

              {/* Mobile swipe hint */}
              <div className="mt-1 flex items-center justify-center gap-2 text-[12px] font-medium text-white/40 sm:hidden" aria-hidden="true">
                <motion.span
                  animate={{ x: [0, 6, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-flex"
                >
                  <ArrowRight className="h-3.5 w-3.5 text-[#cbfb45]/70" />
                </motion.span>
                Swipe to explore
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

      {/* ═══════════════ SECTION 6 — HOW IT WORKS (Atlas-style timeline + 3 cards) ═══════════════ */}
      <section id="how" className="w-full pb-16 lg:pb-24">
        <div className="w-full px-5 md:px-8">
          {/* Timeline bar (desktop only) */}
          <Reveal>
            <div className="relative mb-8 hidden lg:block">
              <div className="relative flex h-16 items-center rounded-full border border-[#0c0c0c]/10 bg-white/40">
                {/* dotted line */}
                <div
                  className="absolute left-10 right-10 top-1/2 h-px -translate-y-1/2 opacity-40"
                  style={{
                    backgroundImage: "radial-gradient(circle, rgba(12,12,12,0.55) 1px, transparent 1.3px)",
                    backgroundSize: "8px 1px",
                    backgroundRepeat: "repeat-x",
                  }}
                  aria-hidden="true"
                />
                <ArrowRight className="absolute right-5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0c0c0c]/40" strokeWidth={2} />
                {/* First Step pill — above middle card center */}
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#6c6a68] px-4 py-1.5 text-[12.5px] font-semibold text-white whitespace-nowrap">
                  First Step
                </span>
                {/* Final Step pill — above right card center */}
                <span className="absolute left-[83.33%] top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0c0c0c] px-4 py-1.5 text-[12.5px] font-semibold text-[#cbfb45] whitespace-nowrap">
                  Final Step
                </span>
              </div>
              {/* connector stems */}
              <span className="absolute left-1/2 top-full h-8 w-px -translate-x-1/2 bg-[#0c0c0c]/20" aria-hidden="true" />
              <span className="absolute left-[83.33%] top-full h-8 w-px -translate-x-1/2 bg-[#0c0c0c]/20" aria-hidden="true" />
            </div>
          </Reveal>

          {/* Cards */}
          <div className="grid gap-3 lg:grid-cols-3 lg:gap-5">
            {/* Card 1 — intro */}
            <Reveal>
              <div className="flex h-full flex-col rounded-[2rem] border border-[#0c0c0c]/10 bg-white/40 p-7 md:backdrop-blur-sm lg:min-h-[460px] lg:p-9">
                <div className="text-[15px] font-medium text-[#6c6a68]">How it works</div>
                <h2
                  className="mt-3 font-bold tracking-[-0.03em] text-balance lg:mt-4"
                  style={{ fontSize: "clamp(2.75rem, 4.5vw, 4rem)", lineHeight: 1.02 }}
                >
                  <span className="block text-[#0c0c0c]">It&apos;s super</span>
                  <span className="block text-[#0c0c0c]/40">simple</span>
                </h2>
                <div className="mt-auto flex flex-wrap items-center gap-3 pt-7 lg:pt-10">
                  <Link
                    href="/dashboard/new-challenge"
                    className="inline-flex h-12 items-center rounded-full bg-[#0c0c0c] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-[#0c0c0c]/85"
                  >
                    Get Funded
                  </Link>
                  <Link
                    href="/rules"
                    className="inline-flex h-12 items-center rounded-full bg-[#cbfb45] px-6 text-[15px] font-semibold text-[#0c0c0c] transition-colors hover:bg-[#b9ef2e]"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            </Reveal>

            {/* Mobile connector: intro → step 1 */}
            <div aria-hidden="true" className="-my-1 flex flex-col items-center lg:hidden">
              <span className="h-5 w-px bg-[#0c0c0c]/25" />
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#0c0c0c]/15 bg-white/60 text-[#0c0c0c]/60">
                <ChevronDown className="h-4 w-4" strokeWidth={2.2} />
              </span>
              <span className="h-5 w-px bg-[#0c0c0c]/25" />
            </div>

            {/* Card 2 — Unlock Account (dark) */}
            <Reveal delay={0.1}>
              <div className="relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-[#1d2523] p-7 lg:min-h-[460px] lg:p-9">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-2 -top-5 select-none text-[110px] font-black leading-none tracking-[-0.06em] text-white/[0.06] lg:hidden"
                >
                  01
                </span>
                <span className="mb-4 inline-flex w-fit items-center rounded-full bg-[#6c6a68] px-3.5 py-1 text-[12px] font-semibold text-white lg:hidden">
                  First Step
                </span>
                <h3 className="text-[28px] font-bold tracking-tight text-white lg:text-[38px]">Unlock Account</h3>
                <span className="mt-3 inline-flex w-fit items-center rounded-full bg-white px-3.5 py-1.5 text-[13px] font-semibold text-[#0c0c0c] lg:mt-4">
                  Up to $200k
                </span>
                <p className="mt-auto max-w-sm pt-6 text-[15px] leading-relaxed text-white/45 lg:pt-10 lg:text-[19px]">
                  Take a challenge or get an instant funding account today.
                </p>
              </div>
            </Reveal>

            {/* Mobile connector: step 1 → step 2 */}
            <div aria-hidden="true" className="-my-1 flex flex-col items-center lg:hidden">
              <span className="h-5 w-px bg-[#0c0c0c]/25" />
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#0c0c0c]/15 bg-white/60 text-[#0c0c0c]/60">
                <ChevronDown className="h-4 w-4" strokeWidth={2.2} />
              </span>
              <span className="h-5 w-px bg-[#0c0c0c]/25" />
            </div>

            {/* Card 3 — Trade & Get Paid (lime) */}
            <Reveal delay={0.2}>
              <div className="relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-[#cbfb45] p-7 lg:min-h-[460px] lg:p-9">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-2 -top-5 select-none text-[110px] font-black leading-none tracking-[-0.06em] text-[#0c0c0c]/[0.07] lg:hidden"
                >
                  02
                </span>
                <span className="mb-4 inline-flex w-fit items-center rounded-full bg-[#0c0c0c] px-3.5 py-1 text-[12px] font-semibold text-[#cbfb45] lg:hidden">
                  Final Step
                </span>
                <h3 className="text-[28px] font-bold tracking-tight text-[#0c0c0c] lg:text-[38px]">Trade &amp; Get Paid</h3>
                <span className="mt-3 inline-flex w-fit items-center rounded-full bg-[#0c0c0c] px-3.5 py-1.5 text-[13px] font-semibold text-[#cbfb45] lg:mt-4">
                  Up to 90% of the Profit
                </span>
                <p className="mt-auto max-w-sm pt-6 text-[15px] leading-relaxed text-[#0c0c0c]/75 lg:pt-10 lg:text-[19px]">
                  Trade on your favorite platform and get paid on demand.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════ SECTION 7 — WHY TPP (evidence matrix) ═══════════════ */}
      <section id="why-tpp" className="w-full scroll-mt-20 pb-16 lg:pb-24" aria-label="Why The People's Prop">
        <div className="px-[5px] py-[5px]">
          <div className="rounded-[2rem] bg-[#f0ece2] p-3 md:p-5 lg:rounded-[3.5rem] lg:p-7">
            {/* ── Dark header card ── */}
            <Reveal>
              <div className="rounded-[1.6rem] bg-[#0c0c0c] px-7 py-10 md:px-11 md:py-12 lg:rounded-[2.4rem] lg:px-14 lg:py-14">
                <div className="flex flex-col gap-9 lg:flex-row lg:items-center lg:justify-between lg:gap-14">
                  <div className="max-w-2xl">
                    <div className="mb-5 text-[13px] font-bold uppercase tracking-[0.24em] text-[#cbfb45]">
                      Why TPP
                    </div>
                    <h2
                      className="text-balance font-bold leading-[1.04] tracking-[-0.04em] text-[#f0ece2]"
                      style={{ fontSize: "clamp(2.5rem, 5.5vw, 4.75rem)" }}
                    >
                      The difference is in the details.
                    </h2>
                  </div>
                  <div className="flex w-full flex-col gap-6 lg:w-[330px] lg:shrink-0">
                    <p className="text-[14px] leading-relaxed text-white/45 md:text-[15px]">
                      Professional trading conditions, transparent rules, and a funding model built to keep serious traders moving forward.
                    </p>
                    <Link
                      href="/challenges"
                      className="inline-flex h-[52px] w-full items-center justify-center rounded-full bg-[#cbfb45] px-8 text-[16px] font-bold text-[#0c0c0c] transition-colors hover:bg-[#b9ef2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#cbfb45] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0c0c]"
                    >
                      Get Funded
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* ── Comparison matrix ── */}
            <Reveal delay={0.08}>
              <div className="relative mt-2 px-1 py-9 md:px-3 lg:px-6 lg:py-12">
                {/* dashed blueprint frame + registration marks */}
                <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden="true">
                  <div className="absolute inset-x-3 top-4 border-t border-dashed border-[#0c0c0c]/25 lg:inset-x-6" />
                  <div className="absolute inset-x-3 bottom-4 border-t border-dashed border-[#0c0c0c]/25 lg:inset-x-6" />
                  <div className="absolute bottom-4 left-3 top-4 border-l border-dashed border-[#0c0c0c]/25 lg:left-6" />
                  <div className="absolute bottom-4 right-3 top-4 border-r border-dashed border-[#0c0c0c]/25 lg:right-6" />
                  {[
                    "left-3 top-4 lg:left-6",
                    "right-3 top-4 lg:right-6",
                    "left-3 bottom-4 lg:left-6",
                    "right-3 bottom-4 lg:right-6",
                  ].map((pos) => (
                    <span key={pos} className={cn("absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center", pos.includes("right") && "translate-x-1/2", pos.includes("bottom") && "translate-y-1/2")}>
                      <span className="absolute h-full w-px bg-[#0c0c0c]/40" />
                      <span className="absolute h-px w-full bg-[#0c0c0c]/40" />
                      <span className="absolute h-2.5 w-2.5 rounded-full border border-[#0c0c0c]/45 bg-[#f0ece2]" />
                    </span>
                  ))}
                </div>

                {/* Desktop matrix */}
                <div className="relative mx-auto hidden max-w-6xl lg:block">
                  <div className="grid grid-cols-[0.58fr_1fr_1fr] gap-x-4">
                    {/* Categories */}
                    <div className="pt-[76px]">
                      {[
                        { icon: Target, label: "Execution" },
                        { icon: CalendarOff, label: "Freedom" },
                        { icon: BadgeDollarSign, label: "Payouts" },
                        { icon: TrendingUp, label: "Growth" },
                      ].map(({ icon: Icon, label }) => (
                        <div key={label} className="flex h-[84px] items-center gap-4 border-b border-dashed border-[#0c0c0c]/20 px-2 text-[#0c0c0c] last:border-b-0">
                          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#0c0c0c]/35">
                            <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden="true" />
                          </span>
                          <span className="text-[18px] font-semibold">{label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Industry Standard */}
                    <div className="overflow-hidden rounded-[1.5rem] bg-[#55544d] text-[#f0ece2]">
                      <div className="flex h-[76px] items-center justify-center bg-[#3f3e39] px-6 text-center text-[16px] font-bold uppercase tracking-[0.05em]">
                        Industry Standard
                      </div>
                      {["Marked-up spreads", "30-day deadline", "Fixed payout windows", "Paid resets"].map((item) => (
                        <div key={item} className="flex h-[84px] items-center gap-3.5 border-b border-white/10 px-7 text-white/75 last:border-b-0">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15 text-[16px] leading-none text-white/45" aria-hidden="true">×</span>
                          <span className="text-[17px] font-medium">{item}</span>
                        </div>
                      ))}
                    </div>

                    {/* The People's Prop */}
                    <div className="relative">
                      <div className="overflow-hidden rounded-[1.5rem] bg-[#cbfb45] text-[#0c0c0c]">
                        <div className="flex h-[76px] items-center justify-center border-b border-[#0c0c0c]/10 px-6 text-center text-[16px] font-extrabold uppercase tracking-[0.04em]">
                          The People&apos;s Prop
                        </div>
                        {["Raw 0.0 pip spreads", "No time limit", "Payout on demand", "Free retry + auto scaling"].map((item) => (
                          <div key={item} className="flex h-[84px] items-center gap-3.5 border-b border-[#0c0c0c]/10 px-7 last:border-b-0">
                            <CheckCircle2 className="h-7 w-7 shrink-0 fill-[#0c0c0c] text-[#cbfb45]" strokeWidth={2.5} aria-hidden="true" />
                            <span className="text-[17px] font-bold">{item}</span>
                          </div>
                        ))}
                      </div>
                      <div className="absolute -left-2 top-1/2 z-10 flex h-[66px] w-[66px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#0c0c0c] text-[20px] font-black text-[#f0ece2] shadow-xl ring-4 ring-[#f0ece2]">
                        VS
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile / tablet stacked matrix */}
                <div className="relative mx-auto lg:hidden">
                  <div className="overflow-hidden rounded-[1.4rem] bg-[#55544d] text-[#f0ece2]">
                    <div className="flex h-[64px] items-center justify-center bg-[#3f3e39] px-5 text-center text-[14px] font-bold uppercase tracking-[0.05em]">
                      Industry Standard
                    </div>
                    {[
                      { cat: "Execution", value: "Marked-up spreads" },
                      { cat: "Freedom", value: "30-day deadline" },
                      { cat: "Payouts", value: "Fixed payout windows" },
                      { cat: "Growth", value: "Paid resets" },
                    ].map(({ cat, value }) => (
                      <div key={value} className="flex items-center gap-3 border-b border-white/10 px-5 py-4 last:border-b-0">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-[14px] leading-none text-white/45" aria-hidden="true">×</span>
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/40">{cat}</div>
                          <div className="text-[15px] font-medium text-white/80">{value}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="relative z-10 mx-auto -my-[26px] flex h-[58px] w-[58px] items-center justify-center rounded-full bg-[#0c0c0c] text-[17px] font-black text-[#f0ece2] shadow-xl ring-4 ring-[#f0ece2]">
                    VS
                  </div>

                  <div className="overflow-hidden rounded-[1.4rem] bg-[#cbfb45] text-[#0c0c0c]">
                    <div className="flex h-[64px] items-center justify-center border-b border-[#0c0c0c]/10 px-5 pt-3 text-center text-[14px] font-extrabold uppercase tracking-[0.04em]">
                      The People&apos;s Prop
                    </div>
                    {[
                      { cat: "Execution", value: "Raw 0.0 pip spreads" },
                      { cat: "Freedom", value: "No time limit" },
                      { cat: "Payouts", value: "Payout on demand" },
                      { cat: "Growth", value: "Free retry + auto scaling" },
                    ].map(({ cat, value }) => (
                      <div key={value} className="flex items-center gap-3 border-b border-[#0c0c0c]/10 px-5 py-4 last:border-b-0">
                        <CheckCircle2 className="h-6 w-6 shrink-0 fill-[#0c0c0c] text-[#cbfb45]" strokeWidth={2.5} aria-hidden="true" />
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0c0c0c]/50">{cat}</div>
                          <div className="text-[15px] font-bold">{value}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Reveal>

            {/* ── Metrics rail ── */}
            <Reveal delay={0.12}>
              <div className="mx-1 mb-4 border-y-2 border-[#0c0c0c]/70 md:mx-3 lg:mx-6">
                <div className="grid grid-cols-2 md:grid-cols-4">
                  {[
                    { value: "0.0", label: "average spread", dark: false, bars: [7, 10, 8, 14, 11, 18, 15, 24, 19, 33, 40, 22] },
                    { value: "90%", label: "profit split", dark: false, bars: [12, 20, 26, 22, 30, 26, 36, 31, 28, 34, 30, 38] },
                    { value: "$200K", label: "max allocation", dark: true, bars: [6, 9, 12, 15, 18, 26, 21, 38, 30, 20, 14, 9] },
                    { value: "24h", label: "average payout", dark: false, bars: [8, 12, 17, 26, 40, 21, 15, 30, 23, 18, 13, 9] },
                  ].map((metric, index) => (
                    <div
                      key={metric.label}
                      className={cn(
                        "flex min-h-[210px] flex-col px-5 py-8 md:min-h-[240px] lg:px-9",
                        index % 2 !== 0 && "border-l-2 border-[#0c0c0c]/25",
                        index > 1 && "border-t-2 border-[#0c0c0c]/25 md:border-t-0",
                        index === 2 && "md:border-l-2",
                      )}
                    >
                      <div className="text-center">
                        <div className="text-[44px] font-bold leading-none tracking-[-0.05em] text-[#0c0c0c] lg:text-[58px]">
                          {metric.value}
                        </div>
                        <div className="mt-2.5 text-[15px] font-medium text-[#0c0c0c]/70 lg:text-[17px]">{metric.label}</div>
                      </div>
                      <div className="mt-auto flex items-end gap-2 pt-8" aria-hidden="true">
                        <div className="flex h-12 flex-1 items-end gap-[3px] border-b border-dashed border-[#0c0c0c]/30 pb-0.5">
                          {metric.bars.map((height, barIndex) => (
                            <span
                              key={`${metric.label}-${barIndex}`}
                              className={cn("min-w-1 flex-1 rounded-t-[2px]", metric.dark ? "bg-[#3f3e39]" : "bg-[#a8dc23]")}
                              style={{ height }}
                            />
                          ))}
                        </div>
                        <span className="mb-1 shrink-0 rounded-full bg-[#dcf0b4] px-2.5 py-1 text-[9px] font-black uppercase tracking-wide text-[#0c0c0c]">
                          Verified
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <ProfitCalculator />

      {/* ═══════════════ SECTION 8 — TESTIMONIALS (BENTO GRID) ═══════════════ */}
      <Testimonials />

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
