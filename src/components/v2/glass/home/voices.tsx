"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, MessageSquareQuote, Quote, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { testimonialsExtended as STORIES, type Testimonial } from "@/data/testimonials";
import { Container, Eyebrow, Lede, Title } from "../ui";
import { EASE, Parallax, Reveal } from "../motion";
import { findStat, prettyValue, useStats } from "../data";
import { href } from "../routes";

const DURATION = 7000;

/** "Lagos, NG" → city and country code; the code renders as a small badge (flag emoji don't show on Windows). */
function place(location: string) {
  const [city, code] = location.split(",").map((s) => s.trim());
  return { city, code: code ?? "" };
}

function Avatar({ t, size = "md" }: { t: Testimonial; size?: "md" | "lg" }) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-[radial-gradient(circle_at_30%_25%,#a9dccf,#1d6656_55%,#063a31)] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]",
        size === "lg" ? "h-14 w-14 text-[16px]" : "h-10 w-10 text-[12.5px]",
      )}
    >
      {t.initials}
    </span>
  );
}

function Who({ t, tone, size }: { t: Testimonial; tone: "dark" | "light"; size?: "md" | "lg" }) {
  const { city, code } = place(t.location);
  return (
    <div className="flex items-center gap-3">
      <Avatar t={t} size={size} />
      <div className="min-w-0 leading-tight">
        <p className={cn("truncate font-semibold", size === "lg" ? "text-[16px]" : "text-[14px]", tone === "dark" ? "text-white" : "text-[var(--g-ink)]")}>{t.name}</p>
        <p className={cn("mt-1 flex items-center gap-1.5 text-[12.5px]", tone === "dark" ? "text-white/50" : "text-black/45")}>
          {city}
          {code ? (
            <span className={cn("rounded-[5px] px-1 py-px text-[10px] font-bold tracking-wide", tone === "dark" ? "bg-white/10 text-white/70" : "bg-black/[0.06] text-black/55")}>{code}</span>
          ) : null}
          <span aria-hidden="true">·</span>
          {t.handle}
        </p>
      </div>
    </div>
  );
}

/** The big story: one testimonial at a time, auto-advancing, with controls. */
function Featured() {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [hover, setHover] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const running = !reduce && !hover && inView;
  const go = (d: number) => setI((n) => (n + d + STORIES.length) % STORIES.length);

  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => setI((n) => (n + 1) % STORIES.length), DURATION);
    return () => clearTimeout(t);
  }, [i, running]);

  const t = STORIES[i];
  return (
    <div ref={ref} onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)} className="relative h-full">
      <figure className="g-card-dark g-hair relative isolate flex h-full min-h-[520px] flex-col overflow-hidden rounded-[36px] p-7 text-white shadow-[0_60px_120px_-50px_rgba(0,0,0,0.55)] sm:p-10">
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <div className="absolute -top-40 -left-24 h-[420px] w-[520px] rounded-full bg-[radial-gradient(closest-side,rgba(29,102,86,0.55),transparent)]" />
          <div className="absolute right-0 bottom-0 h-[300px] w-[420px] bg-[radial-gradient(closest-side,rgba(203,251,69,0.08),transparent)]" />
          <div className="g-grain" />
        </div>

        <div className="flex items-center justify-between gap-4">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={t.handle}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="g-num rounded-full bg-[var(--g-lime)] px-3.5 py-1.5 text-[13px] font-semibold text-[var(--g-ink)]"
            >
              Payout {t.payout}
            </motion.span>
          </AnimatePresence>
          <Quote aria-hidden="true" className="h-9 w-9 text-white/15" />
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.blockquote
            key={t.handle}
            initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
            transition={{ duration: 0.55, ease: EASE }}
            className="mt-10 flex-1 text-[clamp(1.35rem,2.2vw,1.95rem)] leading-[1.35] font-medium tracking-[-0.025em] text-balance text-white/90"
          >
            “{t.body}”
          </motion.blockquote>
        </AnimatePresence>

        <figcaption className="mt-10 flex flex-col gap-6 border-t border-white/[0.08] pt-7 sm:flex-row sm:items-center sm:justify-between">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={t.handle} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
              <Who t={t} tone="dark" size="lg" />
            </motion.div>
          </AnimatePresence>
          <div className="flex items-center gap-3">
            <span className="g-num text-[13px] text-white/45">
              {String(i + 1).padStart(2, "0")} / {String(STORIES.length).padStart(2, "0")}
            </span>
            <button type="button" onClick={() => go(-1)} aria-label="Previous story" className="grid h-11 w-11 place-items-center rounded-full bg-white/[0.07] text-white ring-1 ring-white/10 transition-colors hover:bg-white hover:text-[var(--g-ink)]">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next story" className="grid h-11 w-11 place-items-center rounded-full bg-[var(--g-lime)] text-[var(--g-ink)] transition-transform hover:scale-105">
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </figcaption>
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[3px] bg-white/[0.05]">
          <motion.span
            key={`${i}-${running}`}
            className="block h-full bg-[linear-gradient(90deg,#1d6656,#cbfb45)]"
            initial={{ width: running ? "0%" : "100%" }}
            animate={{ width: "100%" }}
            transition={{ duration: running ? DURATION / 1000 : 0, ease: "linear" }}
          />
        </span>
      </figure>
    </div>
  );
}

function MiniCard({ t, hidden }: { t: Testimonial; hidden?: boolean }) {
  return (
    <figure aria-hidden={hidden || undefined} className="g-card-paper g-hair g-hair-ink rounded-[24px] p-5">
      <span className="g-num inline-flex rounded-full bg-[var(--g-ink)] px-2.5 py-1 text-[11.5px] font-semibold text-[var(--g-lime)]">Payout {t.payout}</span>
      <blockquote className="mt-3 line-clamp-5 text-[14px] leading-relaxed text-[var(--g-ink)]/80">“{t.body}”</blockquote>
      <figcaption className="mt-4">
        <Who t={t} tone="light" />
      </figcaption>
    </figure>
  );
}

/** A column of stories drifting vertically; the copy below the first set makes the loop seamless. */
function Column({ items, reverse, dur }: { items: Testimonial[]; reverse?: boolean; dur: string }) {
  return (
    <div className="g-fade-y g-pause h-[600px] overflow-hidden">
      <div className={cn("g-marquee-y flex flex-col gap-3", reverse && "g-marquee-rev")} style={{ ["--g-dur" as string]: dur }}>
        {items.map((t) => (
          <MiniCard key={t.handle} t={t} />
        ))}
        {items.map((t) => (
          <MiniCard key={`${t.handle}-b`} t={t} hidden />
        ))}
      </div>
    </div>
  );
}

export function Voices() {
  const stats = useStats();
  const rating = findStat(stats, "rating");
  const half = Math.ceil(STORIES.length / 2);
  const left = STORIES.slice(half);
  const right = STORIES.slice(0, half);

  return (
    <section id="stories" className="g-light relative isolate z-10 -mt-12 scroll-mt-24 overflow-clip rounded-t-[44px] pt-28 pb-28 sm:rounded-t-[56px] sm:pt-36 sm:pb-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 h-[560px] w-[760px] rounded-full bg-[radial-gradient(closest-side,rgba(203,251,69,0.2),transparent)]" />
        <div className="absolute right-[-10%] bottom-0 h-[520px] w-[820px] rounded-full bg-[radial-gradient(closest-side,rgba(169,220,207,0.45),transparent)]" />
      </div>

      <Container>
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
          <div className="max-w-2xl">
            <Reveal>
              <Eyebrow tone="light" icon={MessageSquareQuote}>
                Trader stories
              </Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <Title tone="light" className="mt-6 text-[clamp(2.4rem,5vw,4.4rem)]" lead="In their" fade="own words." />
            </Reveal>
            <Reveal delay={0.12}>
              <Lede tone="light" className="mt-6">
                What changed when the rules stopped working against them.
              </Lede>
            </Reveal>
          </div>
          {rating ? (
            <Reveal delay={0.18}>
              <div className="g-card-dark g-hair flex items-center gap-5 rounded-[28px] p-5 pr-7 text-white">
                <span className="g-num g-shade-dark text-[56px] leading-none font-semibold tracking-[-0.05em]">{prettyValue(rating.value)}</span>
                <div>
                  <span className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, k) => (
                      <Star key={k} className="h-4 w-4 fill-[var(--g-lime)] text-[var(--g-lime)]" />
                    ))}
                  </span>
                  <p className="mt-1.5 text-[13.5px] text-white/60">{rating.label}</p>
                </div>
              </div>
            </Reveal>
          ) : null}
        </div>
      </Container>

      <Container className="relative mt-14">
        <Parallax speed={0.16} rotate={5} className="pointer-events-none absolute -top-28 left-[44%] z-20 hidden w-[200px] lg:block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/art/prop-paid.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" className="g-float w-full drop-shadow-[0_40px_36px_rgba(16,40,34,0.3)]" />
        </Parallax>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
          <Reveal>
            <Featured />
          </Reveal>
          <Reveal delay={0.1} className="hidden grid-cols-2 gap-3 lg:grid">
            <Column items={left} dur="80s" />
            <Column items={right} dur="95s" reverse />
          </Reveal>
        </div>

        {/* phones: a swipeable row instead of the drifting columns */}
        <ul className="g-noscroll -mx-5 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 lg:hidden">
          {STORIES.slice(1, 11).map((t) => (
            <li key={t.handle} className="w-[78%] max-w-[320px] shrink-0 snap-start">
              <MiniCard t={t} />
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-[12px] text-black/40">Individual results vary. Accounts are simulated and trading involves risk.</p>
          <Link href={href("reviews")} className="group inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--g-emerald)]">
            Read more reviews <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
