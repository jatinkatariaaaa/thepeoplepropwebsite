"use client";

import { useRef, useState, useCallback } from "react";
import { motion, useInView } from "framer-motion";
import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import { Counter } from "@/components/ui/Counter";

const stats = [
  { value: 28400, prefix: "", suffix: "+", label: "Funded traders", color: "#2563EB", glow: "rgba(37,99,235,0.15)" },
  { value: 24.6, prefix: "$", suffix: "M", label: "Paid out in 2025", decimals: 1, color: "#7C3AED", glow: "rgba(124,58,237,0.15)" },
  { value: 96, prefix: "", suffix: "%", label: "Payouts under 24h", color: "#D97706", glow: "rgba(217,119,6,0.15)" },
  { value: 142, prefix: "", suffix: "", label: "Countries served", color: "#E11D48", glow: "rgba(225,29,72,0.15)" },
];

function StatCard({ stat, index }: { stat: typeof stats[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, []);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative text-center md:text-left group rounded-2xl p-6 md:p-8 transition-colors"
      style={{ cursor: "default" }}
    >
      <motion.div
        className="relative font-medium text-[44px] md:text-[62px] tabular-nums leading-none tracking-[-0.03em]"
        style={{ color: stat.color }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <Counter
          value={stat.value}
          prefix={stat.prefix}
          suffix={stat.suffix}
          decimals={stat.decimals ?? 0}
        />
      </motion.div>
      <p className="relative mt-3 text-[13.5px] text-[var(--ink-500)] font-serif italic">
        {stat.label}
      </p>
    </motion.div>
  );
}

export function Stats() {
  return (
    <section className="relative py-20 md:py-28 text-[var(--ink-950)] overflow-hidden">
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <motion.p
          className="text-center text-[11px] tracking-eyebrow text-[var(--ink-500)] mb-12"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          The People Prop · By the numbers
        </motion.p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
          {stats.map((s, i) => (
            <StatCard key={s.label} stat={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}