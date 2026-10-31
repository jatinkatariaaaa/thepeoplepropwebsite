"use client";

import { useRef, type PointerEvent } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ChevronRight, Globe2, Star } from "lucide-react";
import { Button, Container } from "./ui";
import { CountUp, EASE } from "./motion";
import { entryPrice, findStat, prettyValue, useCatalogue, usePrograms, useSelectedProgram, useStats, compactUsd, ACCESS_UPFRONT } from "./data";
import type { ProgramKey } from "@/data/programs";

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 24, filter: "blur(8px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } },
  transition: { duration: 1.1, delay, ease: EASE },
});

/** Every program as a glass chip — picking one pre-selects it in the configurator below. */
function ProgramChips() {
  const programs = usePrograms();
  const [, setProgram] = useSelectedProgram();
  const pick = (k: ProgramKey) => {
    setProgram(k);
    document.getElementById("challenges")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  return (
    <ul aria-label="Programs" className="flex flex-wrap gap-2">
      {programs.map((p) => {
        const price = entryPrice(p);
        return (
          <li key={p.key}>
            <button
              type="button"
              onClick={() => pick(p.key)}
              className="g-hair group inline-flex items-center gap-2 rounded-full bg-white/[0.06] py-2 pr-2 pl-4 text-[13px] text-white/80 backdrop-blur-md transition-colors duration-300 hover:bg-white/[0.12] hover:text-white"
            >
              <span className="font-semibold text-white">{p.shortLabel}</span>
              <span className="g-num rounded-full bg-black/25 px-2 py-0.5 text-[12px] font-semibold text-[var(--g-lime-soft)]">
                {price.label === "today" ? `${price.value} today` : `from ${price.value}`}
              </span>
              <ChevronRight className="h-3.5 w-3.5 text-white/40 transition-transform group-hover:translate-x-0.5 group-hover:text-white" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const stats = useStats();
  const programs = usePrograms();
  const cat = useCatalogue(programs);
  const countries = findStat(stats, "countries");
  const rating = findStat(stats, "rating");

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const artY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const artS = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const px = useSpring(useMotionValue(0), { stiffness: 50, damping: 20 });
  const py = useSpring(useMotionValue(0), { stiffness: 50, damping: 20 });
  const artX = useTransform(px, (v) => v * -16);
  const artYp = useTransform(py, (v) => v * -10);
  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };

  const tiles = [
    ...stats.slice(0, 3).map((s) => ({ value: prettyValue(s.value), label: s.label })),
    { value: compactUsd(cat.maxSize), label: "Max. allocation" },
  ];

  return (
    <section ref={ref} id="top" onPointerMove={onMove} className="relative isolate z-10 overflow-x-clip bg-[#06100d]">
      {/* path-traced plate: the glass wordmark on a lacquered showroom floor.
          The static wrapper clips at the section edge, so the drifting plate never spills into the next section. */}
      <div aria-hidden="true" className="absolute inset-0 -z-20 overflow-hidden">
        {/* phones: the plate fills the first screen only, then the section continues in its floor colour */}
        <motion.div className="absolute inset-x-0 top-0 h-[100svh] overflow-hidden lg:bottom-0 lg:h-auto" style={reduce ? undefined : { y: artY, scale: artS }}>
          <motion.div className="absolute inset-[-2%]" style={reduce ? undefined : { x: artX, y: artYp }}>
            <picture>
              <source media="(max-width: 1023px)" srcSet="/art/hero-mobile.webp" width={1080} height={1920} />
              <img src="/art/hero-desktop.webp" width={2560} height={1600} alt="" fetchPriority="high" decoding="async" className="h-auto w-full [mask-image:linear-gradient(180deg,#000_60%,transparent_97%)] lg:[mask-image:none]" />
            </picture>
          </motion.div>
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(0deg,#06100d,transparent)] lg:hidden" />
        </motion.div>
      </div>

      {/* the plate is already dark where the type sits — only a light hand here */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-[100svh] bg-[linear-gradient(180deg,rgba(6,16,13,0)_32%,rgba(6,16,13,0.6)_60%,#06100d_100%)] lg:inset-0 lg:h-auto lg:bg-[linear-gradient(90deg,rgba(6,16,13,0.72)_0%,rgba(6,16,13,0.35)_38%,rgba(6,16,13,0)_58%)]" />
        <div className="g-drift absolute top-[8%] right-[6%] h-[60%] w-[55%] rounded-full bg-[radial-gradient(closest-side,rgba(56,212,156,0.12),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(0deg,#0e1110_8%,rgba(14,17,16,0)_100%)]" />
        <div className="g-grain" />
      </div>

      <div>
        <Container className="flex flex-col justify-center pt-[44svh] pb-10 lg:min-h-[100svh] lg:pt-28 lg:pb-44">
          <div className="max-w-[640px]">
            <motion.p {...rise(0.05)} className="g-pill g-hair bg-white/[0.08] text-white/85 backdrop-blur-md">
              <Globe2 className="h-3.5 w-3.5 text-[var(--g-lime)]" />
              Evaluating traders in {countries?.value ?? "142+"} countries
            </motion.p>

            <motion.h1 {...rise(0.15)} className="g-display mt-7 text-[clamp(2.75rem,5vw,4.8rem)]">
              <span className="g-shade-dark block">Fund your skills.</span>
              <span className="g-shade-dark block">Trade our capital.</span>
            </motion.h1>

            <motion.p {...rise(0.3)} className="mt-6 text-[clamp(1.15rem,1.6vw,1.45rem)] font-semibold tracking-[-0.02em] text-white">
              Payouts processed in under 24 hours.
            </motion.p>
            <motion.p {...rise(0.38)} className="mt-3 max-w-[30rem] text-[16.5px] leading-[1.6] text-white/65">
              Transparent rules and real capital up to {cat.maxSize ? `$${cat.maxSize.toLocaleString("en-US")}` : "—"}. Built for traders — not against them.
            </motion.p>

            <motion.div {...rise(0.5)} className="mt-9 flex flex-wrap items-center gap-3">
              <Button href="/dashboard/new-challenge">Start for ${ACCESS_UPFRONT}</Button>
              <Button href="#challenges" kind="glass" arrow={false}>
                Explore challenges
              </Button>
            </motion.div>

            <motion.div {...rise(0.6)} className="mt-9">
              <p className="mb-3 text-[12.5px] font-medium text-white/45">Choose your program</p>
              <ProgramChips />
            </motion.div>

            {rating ? (
              <motion.p {...rise(0.7)} className="mt-8 flex items-center gap-2 text-[13.5px] text-white/60">
                <span className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-[var(--g-lime)] text-[var(--g-lime)]" />
                  ))}
                </span>
                {prettyValue(rating.value)} {rating.label}
              </motion.p>
            ) : null}
          </div>
        </Container>
      </div>

      {/* stats band — overlaps into the next section */}
      <Container className="relative z-20 -mb-16 lg:-mt-36">
        <motion.dl
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.8, ease: EASE }}
          className="g-glass-ink g-hair grid grid-cols-2 overflow-hidden rounded-[28px] lg:grid-cols-4"
        >
          {tiles.map((t, i) => (
            <div key={t.label} className={`px-6 py-6 sm:px-8 sm:py-7 ${i % 2 ? "border-l border-white/[0.07]" : ""} ${i > 1 ? "border-t border-white/[0.07] lg:border-t-0" : ""} ${i === 2 ? "lg:border-l" : ""}`}>
              <dt className="text-[13px] text-white/55">{t.label}</dt>
              <dd className="mt-2">
                <CountUp value={t.value} className="g-num text-[clamp(2rem,3.4vw,3rem)] leading-none font-semibold text-[var(--g-lime-soft)]" />
              </dd>
            </div>
          ))}
        </motion.dl>
      </Container>
    </section>
  );
}
