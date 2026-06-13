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
  useSpring,
  useMotionValue,
} from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

export const EASE = [0.22, 1, 0.36, 1] as const;
export const LIME = "#cbfb45";
export const DARK = "#0c0c0c";
export const CREAM = "#f1eade";
export const MUTED = "#6c6a68";

/* ── prefers-reduced-motion ── */
export function useReducedMotion() {
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

/* ── AnimatedCounter ── */
export function AnimatedCounter({
  end,
  suffix = "",
}: {
  end: number;
  suffix?: string;
}) {
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

/* ── Reveal — base fade-up ── */
export function Reveal({
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

/* ── GsapWords — per-word scrub reveal ── */
export function GsapWords({
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
    <MotionTag
      ref={ref as React.RefObject<HTMLHeadingElement>}
      className={className}
      style={style}
    >
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <span
            data-word
            className={cn(
              "inline-block",
              highlight.includes(w) && `text-[${LIME}]`
            )}
            style={highlight.includes(w) ? { color: LIME } : undefined}
          >
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </span>
        </span>
      ))}
    </MotionTag>
  );
}

/* ── Floating — infinite float ── */
export function Floating({
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

/* ── Magnetic button wrapper ── */
export function Magnetic({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const mx = useSpring(useMotionValue(0), { stiffness: 250, damping: 18 });
  const my = useSpring(useMotionValue(0), { stiffness: 250, damping: 18 });

  return (
    <motion.div
      ref={ref}
      style={{
        x: reduced ? 0 : mx,
        y: reduced ? 0 : my,
        display: "inline-block",
      }}
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

/* ── FAQ accordion item ── */
export function FaqRow({
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
        open
          ? "border-[#cbfb45]/40 bg-white/[0.05]"
          : "border-white/[0.08] bg-white/[0.02]"
      )}
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left lg:px-7"
        aria-expanded={open}
      >
        <span className="text-[15px] font-medium text-white lg:text-[17px]">
          {item.q}
        </span>
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
        <p className="px-5 pb-6 text-[14px] leading-relaxed text-white/55 lg:px-7">
          {item.a}
        </p>
      </motion.div>
    </div>
  );
}

/* ── CustomCursor ── */
export function CustomCursor() {
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
      setHovering(
        !!target?.closest(
          'a, button, [data-cursor="hover"], input, [role="button"]'
        )
      );
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
        className="pointer-events-none fixed left-0 top-0 z-[9999] rounded-full border border-[#cbfb45] mix-blend-difference"
        style={{
          x: ringX,
          y: ringY,
          translateX: "-50%",
          translateY: "-50%",
        }}
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
        style={{
          x: dotX,
          y: dotY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        animate={{ opacity: hidden ? 0 : 1, scale: hovering ? 0.4 : 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      />
    </>
  );
}
