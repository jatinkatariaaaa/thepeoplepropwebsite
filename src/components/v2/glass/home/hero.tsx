"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight, BadgeCheck, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProgramKey } from "@/data/programs";
import { Button, Container } from "../ui";
import { EASE } from "../motion";
import { ACCESS_UPFRONT, compactUsd, entryPrice, findStat, prettyValue, sizesOf, targetRows, usd, useCatalogue, usePrograms, useSelectedProgram, useStats } from "../data";
import { APP } from "../routes";

const WORDS = ["skills", "edge", "talent"];
const CARD_PROGRAMS: ProgramKey[] = ["1-step", "2-step", "instant"];

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 26, filter: "blur(10px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } },
  transition: { duration: 1.1, delay, ease: EASE },
});

/** "Fund your ___." — the last word cycles; every word is laid out once so the line never jumps. */
function RotatingWord() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setI((n) => (n + 1) % WORDS.length), 2800);
    return () => clearInterval(t);
  }, [reduce]);
  return (
    <span className="relative inline-grid">
      {WORDS.map((w) => (
        <span key={w} className="invisible col-start-1 row-start-1">
          {w}.
        </span>
      ))}
      <AnimatePresence initial={false}>
        <motion.span
          key={WORDS[i]}
          className="g-shade-lime col-start-1 row-start-1"
          initial={{ y: "55%", opacity: 0, filter: "blur(10px)" }}
          animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-55%", opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.75, ease: EASE }}
        >
          {WORDS[i]}.
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** A live spec card: pick a program and read its real targets, limits and price at $100K. */
function AccountCard() {
  const programs = usePrograms();
  const [selected, setSelected] = useSelectedProgram();
  const choices = programs.filter((p) => CARD_PROGRAMS.includes(p.key));
  const p = choices.find((c) => c.key === selected) ?? choices[0];
  if (!p) return null;
  const sizes = sizesOf(p);
  const size = sizes.includes(100_000) ? 100_000 : sizes[sizes.length - 1];
  const fee = p.fees[size];
  const rows = [
    ...targetRows(p, size),
    { label: "Max. daily loss", value: p.dailyDrawdown },
    { label: "Max. overall loss", value: p.maxDrawdown },
    { label: "Profit split", value: `${p.profitSplit}% · up to ${p.profitSplitMax}%` },
  ];
  const configure = () => {
    setSelected(p.key);
    document.getElementById("challenges")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="g-glass-ink g-hair w-[330px] rounded-[28px] p-5 shadow-[0_50px_100px_-40px_rgba(0,0,0,0.9)]">
      <div className="flex items-center justify-between">
        <p className="text-[12.5px] font-medium text-white/50">Your account</p>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--g-lime)]/12 px-2.5 py-1 text-[11.5px] font-semibold text-[var(--g-lime-soft)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--g-lime)]" />
          Live spec
        </span>
      </div>
      <p className="g-num g-shade-dark mt-2 text-[34px] leading-none font-semibold tracking-[-0.04em]">{compactUsd(size)}</p>

      <div role="radiogroup" aria-label="Program" className="mt-4 grid grid-cols-3 gap-1 rounded-full bg-white/[0.05] p-1 ring-1 ring-white/10">
        {choices.map((c) => {
          const on = c.key === p.key;
          return (
            <button
              key={c.key}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => setSelected(c.key)}
              className={cn("relative rounded-full py-1.5 text-[12.5px] font-semibold transition-colors", on ? "text-[var(--g-ink)]" : "text-white/60 hover:text-white")}
            >
              {on ? <motion.span layoutId="hero-card-tab" className="absolute inset-0 rounded-full bg-white" transition={{ type: "spring", stiffness: 420, damping: 34 }} /> : null}
              <span className="relative">{c.shortLabel}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.dl key={p.key} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease: EASE }} className="mt-4 divide-y divide-white/[0.06]">
          {rows.map((r) => (
            <div key={r.label} className="flex items-center justify-between py-2.5 text-[13px]">
              <dt className="text-white/50">{r.label}</dt>
              <dd className="g-num font-semibold text-white">{r.value}</dd>
            </div>
          ))}
        </motion.dl>
      </AnimatePresence>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-[18px] bg-white/[0.04] p-3 pl-4 ring-1 ring-white/[0.07]">
        <div>
          <p className="text-[11.5px] text-white/45">One-time fee</p>
          <p className="g-num text-[19px] font-semibold text-white">{fee != null ? usd(fee) : "—"}</p>
        </div>
        <button type="button" onClick={configure} className="g-btn g-btn-lime group h-10 px-4 text-[13px]">
          Configure
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}

/** The payout step, as a status chip. Illustrates the process, not anyone's payout. */
function PayoutChip() {
  const reduce = useReducedMotion();
  return (
    <div className="g-glass g-hair flex w-[270px] items-center gap-3 rounded-[22px] p-3 pr-4 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.9)]">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[14px] bg-[var(--g-lime)] text-[var(--g-ink)]">
        <BadgeCheck className="h-5 w-5" strokeWidth={2.2} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-white">Payout request</p>
        <p className="text-[11.5px] text-white/55">Processed in under 24 hours</p>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-[linear-gradient(90deg,#8fc21d,#cbfb45)]"
            initial={{ width: "8%" }}
            animate={reduce ? { width: "100%" } : { width: ["8%", "100%", "100%"] }}
            transition={reduce ? { duration: 0 } : { duration: 4.8, times: [0, 0.75, 1], repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </div>
  );
}

function Ticker({ items }: { items: string[] }) {
  const row = (hidden?: boolean) =>
    items.map((t, i) => (
      <li key={`${t}-${i}`} aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-6 pr-6 text-[13.5px] font-medium whitespace-nowrap text-white/70">
        {t}
        <span className="h-1 w-1 rounded-full bg-[var(--g-lime)]" />
      </li>
    ));
  return (
    <div className="g-fade-x g-pause overflow-hidden border-y border-white/[0.07] bg-black/30 py-4 backdrop-blur-md">
      <ul className="g-marquee flex w-max" style={{ ["--g-dur" as string]: "60s" }}>
        {row()}
        {row(true)}
      </ul>
    </div>
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
  const payouts = findStat(stats, "payouts");

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const artY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const hudY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
  const px = useSpring(useMotionValue(0), { stiffness: 50, damping: 20 });
  const py = useSpring(useMotionValue(0), { stiffness: 50, damping: 20 });
  const artX = useTransform(px, (v) => v * -18);
  const artYp = useTransform(py, (v) => v * -10);
  const hudX = useTransform(px, (v) => v * 22);
  const hudYp = useTransform(py, (v) => v * 14);
  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };

  const facts = [
    ...programs.map((p) => (p.key === "access" ? `${p.shortLabel} · $${ACCESS_UPFRONT} today` : `${p.shortLabel} · from ${entryPrice(p).value}`)),
    "Raw 0.0 pip spreads",
    "No time limit",
    "News trading allowed",
    "EAs & bots welcome",
    "Weekend holding",
    `Up to ${cat.maxSplit}% profit split`,
    "Payouts processed in under 24 hours",
    ...(countries ? [`Traders in ${countries.value} countries`] : []),
  ];

  return (
    <section ref={ref} id="top" onPointerMove={onMove} className="relative isolate z-10 overflow-x-clip bg-[#040a08]">
      {/* path-traced plate: glass candles climbing to a lime breakout */}
      <div aria-hidden="true" className="absolute inset-0 -z-20 overflow-hidden">
        <motion.div
          className="absolute inset-x-0 top-0 h-[78svh] lg:inset-0 lg:h-auto"
          initial={reduce ? false : { opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2.2, ease: EASE }}
          style={reduce ? undefined : { y: artY }}
        >
          <motion.div className="absolute inset-[-2%]" style={reduce ? undefined : { x: artX, y: artYp }}>
            <picture>
              <source media="(max-width: 1023px)" srcSet="/art/ascent-mobile.webp" width={1080} height={1920} />
              <img
                src="/art/ascent-hero.webp"
                width={2560}
                height={1600}
                alt=""
                fetchPriority="high"
                decoding="async"
                className="h-full w-full object-cover object-[50%_0%] [mask-image:linear-gradient(180deg,#000_55%,transparent_96%)] lg:[mask-image:none]"
              />
            </picture>
          </motion.div>
        </motion.div>
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 hidden bg-[linear-gradient(90deg,rgba(4,10,8,0.9)_0%,rgba(4,10,8,0.55)_34%,rgba(4,10,8,0)_58%)] lg:block" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-[linear-gradient(0deg,#040a08_10%,rgba(4,10,8,0)_100%)]" />
        <div className="g-grain" />
      </div>

      <Container className="relative pt-[46svh] pb-14 lg:flex lg:min-h-[calc(100svh-174px)] lg:items-center lg:pt-28 lg:pb-16">
        <div className="max-w-[660px]">
          <motion.p {...rise(0.1)} className="g-pill g-hair bg-white/[0.07] text-white/85 backdrop-blur-md">
            <span className="relative grid h-2 w-2 place-items-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-[var(--g-lime)] opacity-60" />
              <span className="relative h-2 w-2 rounded-full bg-[var(--g-lime)]" />
            </span>
            {countries ? `Evaluating traders in ${countries.value} countries` : "Evaluating traders worldwide"}
          </motion.p>

          <motion.h1 {...rise(0.2)} className="g-display mt-7 text-[clamp(2.6rem,5.4vw,5.6rem)]">
            <span className="sr-only">Fund your skills. Trade our capital.</span>
            <span aria-hidden="true" className="block">
              <span className="g-shade-dark">Fund your </span>
              <RotatingWord />
            </span>
            <span aria-hidden="true" className="g-shade-dark block">
              Trade our capital.
            </span>
          </motion.h1>

          <motion.p {...rise(0.34)} className="mt-7 max-w-[32rem] text-[clamp(1.05rem,1.35vw,1.25rem)] leading-[1.55] text-white/70">
            <span className="font-semibold text-white">Payouts processed in under 24 hours.</span> Transparent rules, raw 0.0 pip spreads and no time limit, on accounts up to{" "}
            {compactUsd(cat.maxSize)}.
          </motion.p>

          <motion.div {...rise(0.46)} className="mt-9 flex flex-wrap items-center gap-3">
            <Button href={APP.newChallenge}>Start for ${ACCESS_UPFRONT}</Button>
            <Button href="#challenges" kind="glass" arrow={false}>
              Build your challenge
            </Button>
          </motion.div>

          <motion.div {...rise(0.58)} className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-[13.5px] text-white/60">
            {rating ? (
              <p className="flex items-center gap-2">
                <span className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-[var(--g-lime)] text-[var(--g-lime)]" />
                  ))}
                </span>
                <span>
                  <span className="font-semibold text-white">{prettyValue(rating.value)}</span> {rating.label}
                </span>
              </p>
            ) : null}
            {payouts ? (
              <p>
                <span className="g-num font-semibold text-white">{prettyValue(payouts.value)}</span> {payouts.label.toLowerCase()}
              </p>
            ) : null}
          </motion.div>
        </div>

        {/* floating product UI over the plate — desktop only. Layers: pointer parallax → scroll drift → intro. */}
        <motion.div role="group" aria-label="Account preview" className="absolute right-6 bottom-6 hidden lg:block xl:right-10" style={reduce ? undefined : { x: hudX, y: hudYp }}>
          <motion.div style={reduce ? undefined : { y: hudY }}>
            <motion.div initial={reduce ? false : { opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.9, ease: EASE }}>
              <AccountCard />
            </motion.div>
          </motion.div>
        </motion.div>
        <motion.div aria-hidden="true" className="absolute top-[22%] left-[47%] hidden xl:block" style={reduce ? undefined : { x: hudX, y: hudYp }}>
          <motion.div initial={reduce ? false : { opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 1.2, ease: EASE }}>
            <PayoutChip />
          </motion.div>
        </motion.div>
      </Container>

      {/* the ticker, with room below it for the next sheet to overlap */}
      <motion.div className="relative pb-20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 1 }}>
        <Ticker items={facts} />
      </motion.div>
    </section>
  );
}
