"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { Check, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container, Eyebrow, Lede, Title } from "../ui";
import { EASE, Reveal } from "../motion";
import { usePlatformNames } from "../data";

const DURATION = 6500;

/* ───────────── one visual per chapter, staged on dark glass ───────────── */

function Prop({ src, className }: { src: string; className: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" aria-hidden="true" loading="lazy" decoding="async" className={cn("pointer-events-none absolute drop-shadow-[0_40px_40px_rgba(0,0,0,0.55)]", className)} />;
}

function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="g-hair inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-3.5 py-2 text-[13px] font-medium text-white/85 backdrop-blur-md">
      <Check className="h-3.5 w-3.5 text-[var(--g-lime)]" strokeWidth={2.6} />
      {children}
    </span>
  );
}

function Spreads() {
  return (
    <>
      <Prop src="/art/prop-candles.webp" className="-right-6 -bottom-10 w-[70%] max-w-[520px] opacity-90" />
      <div className="relative">
        <p className="text-[13px] font-medium tracking-wide text-white/50 uppercase">Raw spread</p>
        <p className="mt-3 flex items-baseline gap-3">
          <span className="g-num g-shade-dark text-[clamp(6rem,13vw,10rem)] leading-[0.85] font-semibold tracking-[-0.06em]">0.0</span>
          <span className="text-[22px] font-semibold text-white/60">pips</span>
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          <Chip>Tier-1 liquidity</Chip>
          <Chip>Zero markup</Chip>
        </div>
      </div>
    </>
  );
}

function NoTimeLimit() {
  const reduce = useReducedMotion();
  const marks = ["Day 1", "Day 30", "Day 90", "Day 365"];
  return (
    <>
      <Prop src="/art/prop-hourglass.webp" className="top-6 right-4 w-[38%] max-w-[300px]" />
      <div className="relative w-full">
        <p className="g-num g-shade-dark text-[clamp(6rem,13vw,10rem)] leading-[0.85] font-semibold tracking-[-0.04em]">∞</p>
        <p className="mt-2 text-[15px] text-white/60">Unlimited evaluation period</p>
        <div className="g-glass g-hair mt-10 rounded-[22px] p-5">
          <div className="relative h-1.5 rounded-full bg-white/10">
            <motion.span
              className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-[var(--g-lime)] shadow-[0_0_0_6px_rgba(203,251,69,0.18)]"
              initial={{ left: "0%" }}
              animate={reduce ? { left: "96%" } : { left: ["0%", "96%"] }}
              transition={reduce ? { duration: 0 } : { duration: 6, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
            />
          </div>
          <div className="mt-4 flex justify-between text-[12px] text-white/45">
            {marks.map((m) => (
              <span key={m}>{m}</span>
            ))}
            <span className="font-semibold text-[var(--g-lime-soft)]">No deadline</span>
          </div>
        </div>
      </div>
    </>
  );
}

function News() {
  const events = ["NFP", "FOMC", "CPI"];
  return (
    <>
      <Prop src="/art/prop-stopwatch.webp" className="-top-4 right-2 w-[34%] max-w-[260px]" />
      <div className="relative w-full max-w-[420px]">
        <p className="text-[13px] font-medium tracking-wide text-white/50 uppercase">High-impact releases</p>
        <ul className="g-glass g-hair mt-5 divide-y divide-white/[0.07] overflow-hidden rounded-[24px]">
          {events.map((e) => (
            <li key={e} className="flex items-center justify-between gap-4 px-5 py-4">
              <span className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-[#ff6b5b]" />
                <span className="text-[16px] font-semibold text-white">{e}</span>
                <span className="text-[12px] text-white/45">High impact</span>
              </span>
              <span className="inline-flex items-center gap-2 text-[12.5px] font-semibold text-[var(--g-lime-soft)]">
                Allowed
                <span className="relative h-5 w-9 rounded-full bg-[var(--g-lime)]">
                  <span className="absolute top-0.5 right-0.5 h-4 w-4 rounded-full bg-[var(--g-ink)]" />
                </span>
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[13px] text-white/50">On evaluation and funded accounts.</p>
      </div>
    </>
  );
}

function Weekend() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return (
    <div className="relative w-full">
      <p className="text-[13px] font-medium tracking-wide text-white/50 uppercase">Your week</p>
      <div className="relative mt-5 grid grid-cols-7 gap-1.5">
        {days.map((d, i) => (
          <div key={d} className={cn("g-hair flex h-40 flex-col justify-between rounded-[18px] p-3 sm:h-48", i >= 5 ? "bg-[var(--g-lime)]/[0.08]" : "bg-white/[0.05]")}>
            <span className={cn("text-[12.5px] font-semibold", i >= 5 ? "text-[var(--g-lime-soft)]" : "text-white/55")}>{d}</span>
            <span className={cn("h-1.5 w-1.5 rounded-full", i >= 5 ? "bg-[var(--g-lime)]" : "bg-white/25")} />
          </div>
        ))}
        {/* one position, opened Thursday and still open on Sunday */}
        <motion.div
          className="absolute top-1/2 left-[calc(300%/7_+_4px)] flex h-11 -translate-y-1/2 items-center rounded-full bg-[linear-gradient(90deg,#1d6656,#cbfb45)] pr-4 pl-4 text-[12.5px] font-semibold whitespace-nowrap text-[var(--g-ink)] shadow-[0_20px_40px_-20px_rgba(203,251,69,0.6)]"
          initial={{ width: "8%" }}
          whileInView={{ width: "55%" }}
          viewport={{ once: false, amount: 0.6 }}
          transition={{ duration: 1.6, ease: EASE }}
        >
          Held through the weekend
        </motion.div>
      </div>
      <p className="mt-5 text-[13px] text-white/50">No forced flat at Friday&apos;s close.</p>
    </div>
  );
}

function Retry() {
  return (
    <div className="relative flex w-full flex-col items-center text-center">
      <div className="relative h-56 w-56 sm:h-64 sm:w-64">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
          <motion.circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="url(#g-retry)"
            strokeWidth="8"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.8, ease: EASE }}
          />
          <defs>
            <linearGradient id="g-retry" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1d6656" />
              <stop offset="100%" stopColor="#cbfb45" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div>
            <p className="g-num g-shade-dark text-[72px] leading-none font-semibold tracking-[-0.05em]">1</p>
            <p className="mt-1 text-[14px] font-medium text-white/60">free re-attempt</p>
          </div>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <Chip>Included on 1-Step</Chip>
        <Chip>Add-on for 2-Step & 3-Step</Chip>
      </div>
    </div>
  );
}

function Platforms() {
  const names = usePlatformNames();
  return (
    <>
      <Prop src="/art/prop-tiles.webp" className="-top-8 -right-6 w-[44%] max-w-[340px]" />
      <div className="relative w-full">
        <p className="g-num g-shade-dark text-[clamp(5rem,11vw,8.5rem)] leading-[0.85] font-semibold tracking-[-0.05em]">{names.length}</p>
        <p className="mt-2 text-[15px] text-white/60">platforms, chosen at checkout</p>
        <ul className="mt-8 grid max-w-[460px] grid-cols-2 gap-2">
          {names.map((n) => (
            <li key={n} className="g-glass g-hair flex items-center gap-3 rounded-[18px] p-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-white text-[12px] font-bold text-[var(--g-ink)]">
                {n
                  .split(/\s+/)
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)}
              </span>
              <span className="truncate text-[14px] font-semibold text-white">{n}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap gap-2">
          <Chip>EAs welcome</Chip>
          <Chip>Bots welcome</Chip>
        </div>
      </div>
    </>
  );
}

const CHAPTERS = [
  { key: "spreads", title: "Raw spreads", body: "Tier-1 liquidity, zero markup. Your edge stays yours.", Visual: Spreads },
  { key: "time", title: "No time limit", body: "Pass in a day or a year — your pace, your rules.", Visual: NoTimeLimit },
  { key: "news", title: "News trading allowed", body: "Trade high-impact releases on evaluation and funded accounts.", Visual: News },
  { key: "weekend", title: "Weekend & overnight holding", body: "Keep positions open through the weekend — no forced flat at Friday's close.", Visual: Weekend },
  { key: "retry", title: "Free retry", body: "Missed by a hair? Take one free re-attempt if you breach during evaluation.", Visual: Retry },
  { key: "platforms", title: "Trade on the platform you trust", body: "Pick your terminal at checkout. EAs and bots are welcome.", Visual: Platforms },
];

/** "Why TPP" as a feature theatre: chapters on the left advance on their own, the stage on the right shows each one. */
export function Edge() {
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const inView = useInView(stage, { amount: 0.35 });
  const running = !reduce && !hover && inView;

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => setActive((a) => (a + 1) % CHAPTERS.length), DURATION);
    return () => clearTimeout(t);
  }, [active, running]);

  const { Visual } = CHAPTERS[active];

  return (
    <section id="why" className="g-light relative isolate z-10 -mt-12 scroll-mt-24 overflow-clip rounded-t-[44px] pt-28 pb-28 sm:rounded-t-[56px] sm:pt-36 sm:pb-36">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-60 right-[-10%] h-[620px] w-[900px] rounded-full bg-[radial-gradient(closest-side,rgba(169,220,207,0.6),transparent)]" />
      </div>
      <Container>
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <Reveal>
              <Eyebrow tone="light" icon={ShieldCheck}>
                Why TPP
              </Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <Title tone="light" className="mt-6 text-[clamp(2.4rem,5vw,4.4rem)]" lead="Built for traders." fade="Not against them." />
            </Reveal>
          </div>
          <Reveal delay={0.12}>
            <Lede tone="light" className="lg:mb-2">
              Professional trading conditions, transparent rules, and a funding model built to keep serious traders moving forward.
            </Lede>
          </Reveal>
        </div>

        <div className="mt-14 grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:gap-10" onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)}>
          {/* chapters */}
          <ol className="order-2 flex flex-col gap-2 lg:order-1">
            {CHAPTERS.map((c, i) => {
              const on = i === active;
              return (
                <li key={c.key}>
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-pressed={on}
                    className={cn(
                      "group relative w-full overflow-hidden rounded-[24px] px-6 py-5 text-left transition-[background-color,box-shadow] duration-500",
                      on ? "bg-white shadow-[0_30px_60px_-36px_rgba(16,40,34,0.45),inset_0_0_0_1px_rgba(14,17,16,0.06)]" : "hover:bg-black/[0.035]",
                    )}
                  >
                    <span className="flex items-baseline gap-4">
                      <span className={cn("g-num text-[13px] font-semibold", on ? "text-[var(--g-emerald)]" : "text-black/30")}>{String(i + 1).padStart(2, "0")}</span>
                      <span className={cn("text-[19px] font-semibold tracking-[-0.03em] transition-colors", on ? "text-[var(--g-ink)]" : "text-black/45 group-hover:text-black/70")}>{c.title}</span>
                    </span>
                    <AnimatePresence initial={false}>
                      {on ? (
                        <motion.p
                          key="body"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.45, ease: EASE }}
                          className="overflow-hidden pl-[42px] text-[15px] leading-relaxed text-[var(--g-muted-ink)]"
                        >
                          <span className="block pt-2">{c.body}</span>
                        </motion.p>
                      ) : null}
                    </AnimatePresence>
                    {on ? (
                      <span className="absolute inset-x-6 bottom-0 h-[2px] overflow-hidden rounded-full bg-black/[0.06]">
                        <motion.span
                          key={`${active}-${running}`}
                          className="block h-full rounded-full bg-[var(--g-emerald)]"
                          initial={{ width: running ? "0%" : "100%" }}
                          animate={{ width: "100%" }}
                          transition={{ duration: running ? DURATION / 1000 : 0, ease: "linear" }}
                        />
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ol>

          {/* stage */}
          <div ref={stage} className="order-1 lg:order-2">
            <div className="relative isolate h-[440px] overflow-hidden rounded-[36px] bg-[radial-gradient(120%_90%_at_80%_0%,#1d6656_0%,#0b3a31_38%,#071c18_70%,#050d0b_100%)] shadow-[0_60px_120px_-50px_rgba(4,40,33,0.7)] sm:h-[520px] lg:h-full lg:min-h-[560px]">
              <div aria-hidden="true" className="g-grain" />
              <AnimatePresence mode="wait">
                <motion.div
                  key={CHAPTERS[active].key}
                  initial={{ opacity: 0, scale: 0.97, filter: "blur(10px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 1.02, filter: "blur(10px)" }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="absolute inset-0 flex items-center p-8 sm:p-12"
                >
                  <Visual />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
