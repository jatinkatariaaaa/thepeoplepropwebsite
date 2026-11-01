"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { BadgeDollarSign, CalendarOff, Check, Scale, Target, TrendingUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, Container, Eyebrow, Lede, Title } from "../ui";
import { EASE, Reveal } from "../motion";
import { TppMark } from "../logo";
import { APP } from "../routes";

/* The comparison matrix from the previous landing page, row for row. */
const ROWS = [
  { icon: Target, cat: "Execution", them: "Marked-up spreads", us: "Raw 0.0 pip spreads" },
  { icon: CalendarOff, cat: "Freedom", them: "30-day deadline", us: "No time limit" },
  { icon: BadgeDollarSign, cat: "Payouts", them: "Fixed payout windows", us: "Payout on demand" },
  { icon: TrendingUp, cat: "Growth", them: "Paid resets", us: "Free retry + auto scaling" },
];

/** One split-flap row: the typical firm on the front, TPP on the back. */
function Flap({ row, flipped, delay }: { row: (typeof ROWS)[number]; flipped: boolean; delay: number }) {
  const Icon = row.icon;
  const face = "absolute inset-0 flex items-center justify-between gap-4 rounded-[24px] px-5 [backface-visibility:hidden] sm:px-8";
  return (
    <div className="h-[92px] [perspective:1200px] sm:h-[104px]">
      <motion.div
        className="relative h-full [transform-style:preserve-3d]"
        initial={false}
        animate={{ rotateX: flipped ? -180 : 0 }}
        transition={{ duration: 0.9, delay, ease: EASE }}
      >
        {/* front: industry standard */}
        <div aria-hidden={flipped} className={cn(face, "bg-white/[0.04] ring-1 ring-white/[0.08]")}>
          <span className="flex items-center gap-3 text-[14px] font-semibold text-white/45 sm:text-[15px]">
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
            {row.cat}
          </span>
          <span className="flex items-center gap-3 text-right text-[16px] font-semibold text-white/50 line-through decoration-white/25 sm:text-[21px]">
            {row.them}
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white/[0.06]">
              <X className="h-3.5 w-3.5 text-white/40" strokeWidth={2.4} />
            </span>
          </span>
        </div>
        {/* back: TPP */}
        <div aria-hidden={!flipped} className={cn(face, "[transform:rotateX(180deg)] bg-[linear-gradient(180deg,#145244,#0e3d33)] shadow-[0_30px_60px_-36px_rgba(0,0,0,0.9)] ring-1 ring-white/10")}>
          <span className="flex items-center gap-3 text-[14px] font-semibold text-[var(--g-mint)] sm:text-[15px]">
            <Icon className="h-[18px] w-[18px]" strokeWidth={1.8} />
            {row.cat}
          </span>
          <span className="flex items-center gap-3 text-right text-[16px] font-semibold text-white sm:text-[21px]">
            {row.us}
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--g-lime)]">
              <Check className="h-3.5 w-3.5 text-[var(--g-ink)]" strokeWidth={3} />
            </span>
          </span>
        </div>
      </motion.div>
    </div>
  );
}

/** TPP against a typical prop firm, as a split-flap board that turns over when it scrolls into view. */
export function Versus() {
  const reduce = useReducedMotion();
  const board = useRef<HTMLDivElement>(null);
  const seen = useInView(board, { once: true, amount: 0.5 });
  const [side, setSide] = useState<"them" | "us">("them");
  const [touched, setTouched] = useState(false);

  // turn the board over once on first sight, unless the visitor already chose a side
  useEffect(() => {
    if (!seen || touched) return;
    const t = setTimeout(() => setSide("us"), reduce ? 0 : 500);
    return () => clearTimeout(t);
  }, [seen, touched, reduce]);

  const pick = (s: "them" | "us") => {
    setTouched(true);
    setSide(s);
  };

  return (
    <section id="compare" className="g-shell relative isolate z-10 -mt-12 scroll-mt-24 overflow-clip rounded-t-[44px] pt-28 pb-36 text-white sm:rounded-t-[56px] sm:pt-36 sm:pb-44">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-40 left-1/2 h-[560px] w-[1000px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(29,102,86,0.32),transparent)]" />
        <div className="g-grain" />
      </div>
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <Reveal className="flex justify-center">
            <Eyebrow icon={Scale}>The TPP difference</Eyebrow>
          </Reveal>
          <Reveal delay={0.06}>
            <Title className="mt-6 text-[clamp(2.4rem,5vw,4.4rem)]" lead="The difference is in" fade="the details." />
          </Reveal>
          <Reveal delay={0.12} className="flex justify-center">
            <Lede className="mt-6 text-center">Four places where TPP sets a different standard from a typical prop firm.</Lede>
          </Reveal>
        </div>

        <Reveal delay={0.1} className="mx-auto mt-14 max-w-[880px]">
          <div className="flex justify-center">
            <div role="radiogroup" aria-label="Compare" className="relative grid grid-cols-2 rounded-full bg-white/[0.05] p-1 ring-1 ring-white/10">
              {(["them", "us"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={side === s}
                  onClick={() => pick(s)}
                  className={cn("relative rounded-full px-5 py-2.5 text-[14px] font-semibold transition-colors sm:px-7", side === s ? "text-[var(--g-ink)]" : "text-white/60 hover:text-white")}
                >
                  {side === s ? <motion.span layoutId="versus-pill" className="absolute inset-0 rounded-full bg-white" transition={{ type: "spring", stiffness: 420, damping: 34 }} /> : null}
                  <span className="relative inline-flex items-center gap-2">{s === "them" ? "Typical prop firm" : <TppMark className="h-[15px]" title="The People Prop" />}</span>
                </button>
              ))}
            </div>
          </div>
          <div ref={board} className="mt-8 flex flex-col gap-2.5">
            {ROWS.map((row, i) => (
              <Flap key={row.cat} row={row} flipped={side === "us"} delay={reduce ? 0 : i * 0.12} />
            ))}
          </div>
          <div className="mt-10 flex justify-center">
            <Button href={APP.newChallenge}>Get funded</Button>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
