"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";

/* Word-by-word kinetic reveal */
function AnimatedWords({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{
            duration: 0.5,
            delay: delay + i * 0.06,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="inline-block mr-[0.3em]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  return (
    <section ref={sectionRef} className="relative w-full min-h-[100vh] flex flex-col justify-center overflow-hidden bg-gradient-to-b from-[#eef2f7] via-white to-[#e9f0fa]">
      
      {/* Subtle grid pattern background */}
      <div className="absolute inset-0 bg-grid bg-grid-fade opacity-20 mix-blend-overlay pointer-events-none" />

      <div className="relative mx-auto w-full max-w-7xl px-5 md:px-8 pt-32 pb-16 lg:pt-0 lg:pb-0 flex-grow flex items-center">
        
        {/* Main CSS Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] w-full items-center">
          
          {/* ── Left Column — Content Area ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-start text-left w-full lg:max-w-[600px] z-10"
          >
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center justify-center self-center lg:self-start w-[90%] sm:w-auto mx-auto lg:mx-0 gap-2 chip chip-accent mb-8 md:mb-6 text-[10.5px] md:text-xs font-bold text-center leading-relaxed py-2 md:py-1.5"
            >
              <span className="relative flex w-2 h-2">
                <span className="absolute inset-0 rounded-full bg-[var(--accent)] animate-ping opacity-75" />
                <span className="relative rounded-full w-2 h-2 bg-[var(--accent)]" />
              </span>
              Guaranteed free evaluation Prizes on 1 August 2026
            </motion.div>

            <h1 className="font-medium leading-[0.98] tracking-[-0.035em] text-[var(--ink-950)] text-[clamp(2.6rem,7vw,5.25rem)]">
              <AnimatedWords text="Trade our capital." delay={0.15} />
              <br />
              <AnimatedWords text="Keep the" delay={0.5} />
              <motion.span
                className="word-serif"
                initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.7, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
              >
                profits
              </motion.span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.85 }}
              >.</motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-7 max-w-xl text-[17px] md:text-[18px] leading-[1.55] text-[var(--ink-700)]"
            >
              The People Prop funds skilled traders up to{" "}
              <span className="text-[var(--ink-950)] font-medium">$200,000</span>.
              Pass one fair evaluation and keep up to{" "}
              <span className="text-[var(--ink-950)] font-medium">90%</span> of
              every dollar you earn — paid bi-weekly, in under 24 hours.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              className="mt-10 lg:mt-9 flex w-full lg:w-auto items-center justify-center lg:justify-start gap-3 relative z-20"
            >
              <Button href="#calculator" variant="primary" size="lg" className="flex-1 lg:flex-none py-3.5">
                Start Challenge
              </Button>
              <Button href="#how" variant="outline" size="lg" className="flex-1 lg:flex-none py-3.5 bg-white/50 backdrop-blur-sm">
                How It Works
              </Button>
            </motion.div>
          </motion.div>

          {/* ── Right Column — Trophy Area ── */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center lg:justify-end mt-8 lg:mt-0 w-full h-full lg:items-end"
          >
            <div className="relative w-[75%] sm:w-[70%] lg:w-full h-[400px] lg:h-[80vh] flex items-end justify-center lg:justify-end">
              <img 
                src="/hero-overlay.webp" 
                alt="The People Prop Trophy" 
                className="w-full h-full object-contain object-bottom lg:object-right-bottom drop-shadow-2xl"
              />
            </div>
          </motion.div>

        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 hidden lg:flex"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="w-5 h-8 rounded-full border-2 border-[var(--ink-200)] flex items-start justify-center pt-1.5"
        >
          <motion.div
            className="w-1 h-1.5 rounded-full bg-[var(--ink-400)]"
            animate={{ opacity: [1, 0.3, 1], y: [0, 4, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}


