"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "framer-motion";

export const EASE = [0.16, 1, 0.3, 1] as const;

/* ───────────── Reveal: blur-up on enter ───────────── */

export function Reveal({
  children,
  className,
  delay = 0,
  y = 30,
  amount = 0.2,
  style,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  amount?: number;
  style?: CSSProperties;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      style={style}
      initial={reduce ? false : { opacity: 0, y, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
      viewport={{ once: true, amount }}
      transition={{ duration: 1.05, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

const staggerParent: Variants = {
  hidden: {},
  show: (gap: number = 0.08) => ({ transition: { staggerChildren: gap, delayChildren: 0.05 } }),
};
const staggerChild: Variants = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.95, ease: EASE }, transitionEnd: { filter: "none" } },
};

export function Stagger({ children, className, gap = 0.08, amount = 0.15 }: { children: ReactNode; className?: string; gap?: number; amount?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={staggerParent}
      custom={gap}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <motion.div className={className} style={style} variants={staggerChild}>
      {children}
    </motion.div>
  );
}

/* ───────────── Parallax: scroll-linked drift ───────────── */

export function Parallax({
  children,
  className,
  speed = 0.15,
  rotate = 0,
  style,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
  rotate?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`${speed * 100}%`, `${-speed * 100}%`]);
  const r = useTransform(scrollYProgress, [0, 1], [-rotate, rotate]);
  return (
    <motion.div ref={ref} className={className} style={reduce ? style : { ...style, y, rotate: r }}>
      {children}
    </motion.div>
  );
}

/* ───────────── Tilt: pointer-driven 3D + spotlight vars ───────────── */

export function Tilt({
  children,
  className,
  max = 7,
  style,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const rx = useSpring(useMotionValue(0), { stiffness: 160, damping: 18 });
  const ry = useSpring(useMotionValue(0), { stiffness: 160, damping: 18 });
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
    if (reduce || e.pointerType !== "mouse") return;
    ry.set((px - 0.5) * max * 2);
    rx.set(-(py - 0.5) * max * 2);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };
  return (
    <motion.div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={className}
      style={{ ...style, rotateX: rx, rotateY: ry, transformPerspective: 1100 }}
    >
      {children}
    </motion.div>
  );
}

/* ───────────── Number animation without React state ─────────────
   We drive React's own text node (nodeValue), so there are no re-renders
   and React keeps ownership of the DOM. */

function writeText(el: HTMLElement | null, text: string) {
  const node = el?.firstChild;
  if (node && node.nodeType === Node.TEXT_NODE) node.nodeValue = text;
}

/** Tween between values whenever `value` changes (prices, calculator). */
export function AnimatedNumber({
  value,
  format,
  className,
  duration = 0.6,
}: {
  value: number;
  format: (n: number) => string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const from = useRef(value);
  const reduce = useReducedMotion();
  useEffect(() => {
    const start = from.current;
    from.current = value;
    if (reduce || start === value) {
      writeText(ref.current, format(value));
      return;
    }
    const c = animate(start, value, { duration, ease: EASE, onUpdate: (v) => writeText(ref.current, format(v)) });
    return () => c.stop();
    // format is a pure formatter; re-running on identity changes would restart tweens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduce, duration]);
  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  );
}

/** Count up the numeric part of "250+", "$400K"… once it scrolls into view. */
export function CountUp({ value, className, duration = 1.8 }: { value: string; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const reduce = useReducedMotion();

  useEffect(() => {
    const m = value.match(/^([^\d]*)(\d[\d,]*(?:\.\d+)?)(.*)$/);
    if (!m || reduce) {
      writeText(ref.current, value);
      return;
    }
    const [, pre, num, post] = m;
    if (!inView) {
      writeText(ref.current, `${pre}0${post}`); // parked at zero until revealed
      return;
    }
    const target = parseFloat(num.replace(/,/g, ""));
    const decimals = num.includes(".") ? num.split(".")[1].length : 0;
    const c = animate(0, target, {
      duration,
      ease: EASE,
      onUpdate: (v) => writeText(ref.current, `${pre}${decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString("en-US")}${post}`),
    });
    return () => c.stop();
  }, [inView, value, reduce, duration]);

  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
