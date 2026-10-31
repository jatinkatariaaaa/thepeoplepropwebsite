"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export function SectionReveal3D({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 60,
        rotateX: 15,
        scale: 0.96,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        rotateX: 0,
        scale: 1,
      }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{
        duration: 0.9,
        ease: [0.16, 1, 0.3, 1], // Custom spring-like easing
      }}
      style={{
        transformPerspective: 1200,
        transformOrigin: "top center",
      }}
      className="will-change-transform w-full h-full"
    >
      {children}
    </motion.div>
  );
}
