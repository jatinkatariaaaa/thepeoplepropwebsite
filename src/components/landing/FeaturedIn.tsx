"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const logos = [
  { name: "Bloomberg", font: "font-sans font-bold tracking-tight text-[28px] md:text-[36px]" },
  { name: "Forbes", font: "font-serif font-bold italic tracking-wide text-[30px] md:text-[38px]" },
  { name: "Yahoo! Finance", font: "font-sans font-black italic tracking-tighter text-[28px] md:text-[36px]" },
  { name: "MarketWatch", font: "font-serif font-medium text-[28px] md:text-[36px]" },
  { name: "Investing.com", font: "font-sans font-semibold tracking-tight text-[28px] md:text-[36px]" },
  { name: "TradingView", font: "font-sans font-black tracking-tighter text-[26px] md:text-[32px]" },
];

// Duplicate for smooth infinite scroll
const marqueeItems = [...logos, ...logos, ...logos, ...logos];

export function FeaturedIn() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [onScreen, setOnScreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Only run the infinite marquee while the strip is visible in the viewport.
  // This keeps the exact same animation on screen but avoids running the
  // Framer Motion driver off-screen, improving FPS on mobile.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => setOnScreen(entries[0]?.isIntersecting ?? false),
      { rootMargin: "200px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const animate = !reduceMotion && onScreen && !isMobile ? { x: ["0%", "-25%"] } : { x: "0%" };

  return (
    <section className="relative pt-12 md:pt-16 pb-2 md:pb-4 overflow-hidden">
      <div className="mx-auto max-w-7xl px-5 md:px-8 mb-6 md:mb-8 text-center">
        <p className="text-[11px] md:text-[12px] uppercase tracking-[0.2em] text-[var(--ink-400)] font-medium">
          As Featured In & Trusted By Industry Leaders
        </p>
      </div>

      <div 
        ref={containerRef}
        className="relative flex overflow-hidden w-full group"
        style={{
          maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)"
        }}
      >
        <motion.div
          className="flex whitespace-nowrap items-center w-max"
          animate={animate} // move one full set of logos
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: 30, // slow, premium scroll
          }}
        >
          {marqueeItems.map((logo, idx) => (
            <div
              key={idx}
              className={`mx-8 md:mx-16 flex items-center justify-center opacity-40 grayscale hover:opacity-100 hover:grayscale-0 hover:text-[var(--accent)] hover:scale-105 transition-all duration-500 cursor-pointer ${logo.font}`}
            >
              {logo.name}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
