"use client";

import { useRef, ReactNode } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

/* ── Reveal container — scroll-triggered with blur + scale ── */
const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 36,
    filter: "blur(6px)",
    scale: 0.97,
  },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    scale: 1,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/* Slide-in from left */
const slideLeftVariants: Variants = {
  hidden: { opacity: 0, x: -40, filter: "blur(4px)" },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

/* Slide-in from right */
const slideRightVariants: Variants = {
  hidden: { opacity: 0, x: 40, filter: "blur(4px)" },
  show: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

/* Scale-up reveal */
const scaleVariants: Variants = {
  hidden: { opacity: 0, scale: 0.88, filter: "blur(8px)" },
  show: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

export function AnimatedSection({
  children,
  className,
  stagger = false,
  variant = "default",
}: {
  children: ReactNode;
  className?: string;
  stagger?: boolean;
  variant?: "default" | "slideLeft" | "slideRight" | "scale";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.15 });

  const getVariants = () => {
    if (stagger) return containerVariants;
    switch (variant) {
      case "slideLeft": return slideLeftVariants;
      case "slideRight": return slideRightVariants;
      case "scale": return scaleVariants;
      default: return itemVariants;
    }
  };

  return (
    <motion.div
      ref={ref}
      variants={getVariants()}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function AnimatedItem({
  children,
  className,
  variant = "default",
}: {
  children: ReactNode;
  className?: string;
  variant?: "default" | "slideLeft" | "slideRight" | "scale";
}) {
  const getVariants = () => {
    switch (variant) {
      case "slideLeft": return slideLeftVariants;
      case "slideRight": return slideRightVariants;
      case "scale": return scaleVariants;
      default: return itemVariants;
    }
  };

  return (
    <motion.div variants={getVariants()} className={cn(className)}>
      {children}
    </motion.div>
  );
}
