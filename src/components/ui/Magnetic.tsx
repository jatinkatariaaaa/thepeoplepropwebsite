"use client";

import { ReactNode, useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

export function Magnetic({ children, className = "" }: { children: ReactNode; className?: string }) {
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
