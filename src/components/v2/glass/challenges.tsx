"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useInView } from "framer-motion";
import {
  ArrowRight,
  Bot,
  CalendarDays,
  Check,
  Copy,
  FileText,
  Percent,
  Scale,
  ShieldAlert,
  SlidersHorizontal,
  Target,
  TrendingDown,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { addOns, feeFor, type AccountSize, type AddOnKey } from "@/data/programs";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { href } from "./routes";
import { cn } from "@/lib/utils";
import { Container, Eyebrow, Lede, Section, Title } from "./ui";
import { AnimatedNumber, EASE, Parallax, Reveal } from "./motion";
import { ACCESS_UPFRONT, compactUsd, entryPrice, sizesOf, targetRows, useCatalogue, usd, usePlatformOptions, usePrograms, useSelectedProgram } from "./data";

const POPULAR_SIZE = 25_000; // flagged "Most popular" on the main calculator too
/** The main site's launch offer; the dashboard checkout applies it (50% off + free retry). */
const PROMO = "FIRSTTPP";

function PromoStrip() {
  const { copied, copy } = useCopyToClipboard();
  return (
    <div className="g-hair mx-auto flex w-fit max-w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-full bg-[linear-gradient(90deg,rgba(29,102,86,0.55),rgba(14,61,51,0.55))] py-2 pr-2 pl-5 text-[13px] text-white/80 backdrop-blur-md">
      <span className="font-semibold tracking-wide text-white uppercase">Limited time</span>
      <span className="h-3.5 w-px bg-white/20" />
      <span>50% off + free retry</span>
      <button
        type="button"
        onClick={() => copy(PROMO)}
        aria-label={`Copy promo code ${PROMO}`}
        className="inline-flex items-center gap-2 rounded-full bg-[var(--g-lime)] px-3.5 py-1.5 text-[12.5px] font-semibold text-[var(--g-ink)] transition-transform duration-300 hover:-translate-y-px"
      >
        Code {PROMO}
        {copied ? <Check className="h-3.5 w-3.5" strokeWidth={2.6} /> : <Copy className="h-3.5 w-3.5" strokeWidth={2.4} />}
      </button>
    </div>
  );
}

function Step({ n, title, hint, children }: { n: string; title: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="g-glass g-hair rounded-[28px] p-4 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-4 px-1">
        <h3 className="flex items-center gap-3 text-[16px] font-semibold tracking-[-0.02em] text-white">
          <span className="g-num grid h-7 w-7 place-items-center rounded-full bg-white/[0.08] text-[11.5px] font-semibold text-white/70">{n}</span>
          {title}
        </h3>
        {hint ? <span className="text-right text-[12.5px] text-white/45">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

function Switch({ on }: { on: boolean }) {
  return (
    <span aria-hidden="true" className={cn("relative h-[26px] w-[44px] shrink-0 rounded-full transition-colors duration-300", on ? "bg-[var(--g-lime)]" : "bg-white/[0.14]")}>
      <motion.span
        className="absolute top-[3px] left-[3px] h-5 w-5 rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.35)]"
        animate={{ x: on ? 18 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 34 }}
      />
    </span>
  );
}

export function Challenges({ className }: { className?: string } = {}) {
  const programs = usePrograms();
  const cat = useCatalogue(programs);
  const platformOptions = usePlatformOptions();
  const [programKey, setProgramKey] = useSelectedProgram();
  const program = programs.find((p) => p.key === programKey) ?? programs[0];

  const sizes = useMemo(() => (program ? sizesOf(program) : []), [program]);
  const allSizes = useMemo(() => Array.from(new Set(programs.flatMap(sizesOf))).sort((a, b) => a - b), [programs]);
  const [wanted, setWanted] = useState<AccountSize>(100_000);
  const size = sizes.includes(wanted) ? wanted : (sizes.filter((s) => s <= wanted).pop() ?? sizes[0]);

  const [platformKey, setPlatformKey] = useState<string>("");
  const platform = platformOptions.find((p) => p.key === platformKey) ?? platformOptions[0];

  const [picked, setPicked] = useState<AddOnKey[]>([]);
  const available = program ? addOns.filter((a) => a.appliesTo.includes(program.key)) : [];
  const active = picked.filter((k) => available.some((a) => a.key === k));

  const body = useRef<HTMLDivElement>(null);
  const inView = useInView(body, { amount: 0.12 });

  if (!program || size == null) return null;

  const { base, total, addOnFees } = feeFor(program, size, active);
  const surcharge = platform?.extra ?? 0;
  const grand = total != null ? total + surcharge : null;
  const isAccess = program.key === "access";
  const toggle = (k: AddOnKey) => setPicked((cur) => (cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k]));

  const specs: { icon: LucideIcon; label: string; value: string }[] = [
    { icon: Wallet, label: "Account size", value: usd(size) },
    ...targetRows(program, size).map((r) => ({ icon: Target, label: r.label, value: r.value })),
    { icon: TrendingDown, label: "Max. daily loss", value: program.dailyDrawdown },
    { icon: ShieldAlert, label: "Max. overall loss", value: program.maxDrawdown },
    { icon: CalendarDays, label: "Min. trading days", value: program.key === "instant" ? `${program.minTradingDays} on funded` : `${program.minTradingDays} per phase` },
    { icon: Percent, label: "Profit split", value: active.includes("split-100") ? "100%" : `${program.profitSplit}%` },
    { icon: FileText, label: "Payout cycle", value: active.includes("payout-on-demand") ? "First payout on demand" : program.payoutCycle },
    { icon: Scale, label: "Consistency rule", value: program.consistencyRule },
    { icon: Bot, label: "EAs, news & weekend holds", value: "Allowed" },
  ];

  const priceNow = isAccess ? ACCESS_UPFRONT : (grand ?? 0);

  return (
    <Section id="challenges" shell={false} className={cn("pt-40 pb-28 sm:pt-44 sm:pb-36", className)}>
      {/* light spilling down from the hero, and a floor glow under the configurator */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 h-[620px] w-[1100px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(48,120,100,0.34),transparent)] blur-2xl" />
        <div className="absolute bottom-0 left-1/2 h-[520px] w-[1300px] -translate-x-1/2 translate-y-1/3 rounded-full bg-[radial-gradient(closest-side,rgba(203,251,69,0.07),transparent)]" />
      </div>

      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <Reveal className="flex justify-center">
            <Eyebrow icon={SlidersHorizontal}>Challenges</Eyebrow>
          </Reveal>
          <Reveal delay={0.06}>
            <Title className="mt-6 text-[clamp(2.4rem,5.4vw,4.75rem)]" lead="Build your challenge." fade="Pay once." />
          </Reveal>
          <Reveal delay={0.12} className="flex justify-center">
            <Lede className="mt-6 text-center">
              {cat.count} programs, accounts from {compactUsd(cat.minSize)} to {compactUsd(cat.maxSize)}. One-time fee — no subscriptions, no time limit.
            </Lede>
          </Reveal>
        </div>

        <Reveal delay={0.16} className="mt-10 flex justify-center">
          <PromoStrip />
        </Reveal>

        <div ref={body} className="relative mt-10 grid items-start gap-5 lg:grid-cols-[1.08fr_0.92fr]">
          {/* objects resting behind the glass — the blur sells the depth */}
          <Parallax speed={0.28} rotate={6} className="pointer-events-none absolute -top-24 -left-20 -z-10 hidden w-56 lg:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/v2/pt/prop-coins.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" className="w-full" />
          </Parallax>

          {/* ── choices ── */}
          <div className="flex min-w-0 flex-col gap-4">
            <Reveal>
              <Step n="01" title="Program" hint={program.tagline}>
                <div role="radiogroup" aria-label="Program" className="grid gap-2 sm:grid-cols-2">
                  {programs.map((p) => {
                    const on = p.key === program.key;
                    const price = entryPrice(p);
                    return (
                      <button
                        key={p.key}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => setProgramKey(p.key)}
                        className={cn(
                          "relative flex items-center justify-between gap-3 rounded-[18px] px-4 py-3.5 text-left transition-colors duration-300",
                          p.key === "access" && "sm:col-span-2",
                          on ? "text-[var(--g-ink)]" : "bg-white/[0.035] text-white hover:bg-white/[0.07]",
                        )}
                      >
                        {on ? (
                          <motion.span
                            layoutId="g-program"
                            className="absolute inset-0 -z-0 rounded-[18px] bg-[linear-gradient(180deg,#ffffff,#e9eeec)] shadow-[0_18px_40px_-20px_rgba(0,0,0,0.8),inset_0_1px_0_#fff]"
                            transition={{ type: "spring", stiffness: 380, damping: 36 }}
                          />
                        ) : null}
                        <span className="relative min-w-0">
                          <span className="flex items-center gap-2">
                            <span className="text-[15px] font-semibold tracking-[-0.02em]">{p.shortLabel}</span>
                            {p.badge ? (
                              <span
                                className={cn(
                                  "rounded-full px-2 py-[3px] text-[10px] font-semibold tracking-wide uppercase",
                                  on ? "bg-[var(--g-ink)] text-[var(--g-lime)]" : "bg-[var(--g-lime)]/12 text-[var(--g-lime)]",
                                )}
                              >
                                {p.badge}
                              </span>
                            ) : null}
                          </span>
                          <span className={cn("mt-0.5 block truncate text-[12.5px]", on ? "text-black/55" : "text-white/45")}>
                            {p.phases > 0 ? `${p.phases} phase${p.phases > 1 ? "s" : ""} · ${p.profitTarget}` : p.key === "instant" ? "No evaluation" : "Pay the rest after you pass"}
                          </span>
                        </span>
                        <span className="relative shrink-0 text-right">
                          <span className={cn("block text-[10.5px] tracking-wide uppercase", on ? "text-black/45" : "text-white/40")}>{price.label}</span>
                          <span className="g-num block text-[16px] font-semibold">{price.value}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Step>
            </Reveal>

            <Reveal delay={0.05}>
              <Step n="02" title="Platform" hint="Pick your terminal">
                <div role="radiogroup" aria-label="Platform" className="flex flex-wrap gap-2">
                  {platformOptions.map((p) => {
                    const on = p.key === platform?.key;
                    return (
                      <button
                        key={p.key}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => setPlatformKey(p.key)}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-full py-2.5 pr-2.5 pl-4 text-[14px] font-semibold transition-all duration-300",
                          on ? "bg-white text-[var(--g-ink)] shadow-[0_12px_30px_-16px_rgba(0,0,0,0.9)]" : "bg-white/[0.05] text-white/75 hover:bg-white/[0.09] hover:text-white",
                        )}
                      >
                        {p.label}
                        <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", on ? "bg-[var(--g-ink)]/[0.08] text-black/60" : "bg-white/[0.07] text-white/50")}>
                          {p.extra > 0 ? `+${usd(p.extra)}` : "Included"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </Step>
            </Reveal>

            <Reveal delay={0.1}>
              <Step n="03" title="Account size" hint={`${sizes.length} sizes on ${program.shortLabel}`}>
                <div role="radiogroup" aria-label="Account size" className="grid grid-cols-4 gap-2">
                  {allSizes.map((s) => {
                    const offered = sizes.includes(s);
                    const on = offered && s === size;
                    return (
                      <button
                        key={s}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        disabled={!offered}
                        title={offered ? undefined : `Not offered on ${program.shortLabel}`}
                        onClick={() => setWanted(s)}
                        className={cn(
                          "g-num relative rounded-[14px] py-3 text-[14.5px] font-semibold transition-all duration-300",
                          on && "bg-[var(--g-lime)] text-[var(--g-ink)] shadow-[0_14px_30px_-14px_rgba(203,251,69,0.7),inset_0_1px_0_rgba(255,255,255,0.6)]",
                          !on && offered && "bg-white/[0.05] text-white/80 hover:bg-white/[0.1] hover:text-white",
                          !offered && "cursor-not-allowed bg-white/[0.02] text-white/20 line-through decoration-white/20",
                        )}
                      >
                        {compactUsd(s)}
                        {s === POPULAR_SIZE && offered ? (
                          <span className={cn("absolute -top-1.5 right-1.5 h-2.5 w-2.5 rounded-full ring-2", on ? "bg-[var(--g-ink)] ring-[var(--g-lime)]" : "bg-[var(--g-lime)] ring-[#1c2120]")}>
                            <span className="sr-only">Most popular</span>
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-3 flex items-center gap-2 px-1 text-[12px] text-white/40">
                  <span className="h-2 w-2 rounded-full bg-[var(--g-lime)]" /> Most popular size
                </p>
              </Step>
            </Reveal>

            <Reveal delay={0.15}>
              <Step n="04" title="Add-ons" hint="Optional">
                {available.length ? (
                  <ul className="flex flex-col gap-2">
                    {available.map((a) => {
                      const on = active.includes(a.key);
                      const cost = base != null ? Math.round((base * a.feePct) / 100) : null;
                      return (
                        <li key={a.key}>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={on}
                            onClick={() => toggle(a.key)}
                            className={cn(
                              "flex w-full items-center gap-4 rounded-[18px] px-4 py-3.5 text-left transition-colors duration-300",
                              on ? "bg-[var(--g-lime)]/[0.09] ring-1 ring-[var(--g-lime)]/40" : "bg-white/[0.035] hover:bg-white/[0.065]",
                            )}
                          >
                            <span className="min-w-0 flex-1">
                              <span className="block text-[14.5px] font-semibold text-white">{a.label}</span>
                              <span className="mt-0.5 block text-[12.5px] leading-snug text-white/45">{a.description}</span>
                            </span>
                            <span className="g-num shrink-0 text-[13px] font-semibold text-white/70">
                              {a.feePct === 0 ? "Free" : cost != null ? `+${usd(cost)}` : `+${a.feePct}%`}
                            </span>
                            <Switch on={on} />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="px-1 text-[13.5px] text-white/50">No add-ons for this program.</p>
                )}
              </Step>
            </Reveal>
          </div>

          {/* ── summary ── */}
          <Reveal delay={0.1} className="lg:sticky lg:top-28">
            <aside aria-label="Your challenge" className="g-glass-ink g-hair rounded-[32px] p-2">
              <div className="relative overflow-hidden rounded-[26px] bg-[linear-gradient(160deg,#0b4a3d_0%,#0a3a31_45%,#123f36_100%)] p-6 sm:p-7">
                <div aria-hidden="true" className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(169,220,207,0.35),transparent)]" />
                <div className="relative">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.p
                      key={`${program.key}-${size}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      className="text-[14px] font-semibold text-white/85"
                    >
                      {program.label} · {usd(size)}
                    </motion.p>
                  </AnimatePresence>
                  <p className="mt-6 text-[12.5px] font-medium tracking-wide text-white/55 uppercase">{isAccess ? "Due today" : "One-time fee"}</p>
                  <AnimatedNumber
                    value={priceNow}
                    format={(n) => usd(Math.round(n))}
                    className="g-num g-shade-dark mt-1 block text-[clamp(3.2rem,6vw,4.6rem)] leading-none font-semibold tracking-[-0.05em]"
                  />
                  <p className="mt-3 max-w-[22rem] text-[13.5px] leading-relaxed text-white/65">
                    {isAccess && grand != null ? (
                      <>
                        Then <span className="font-semibold text-white">{usd(grand)}</span>, due within 48 hours of passing.
                      </>
                    ) : (
                      <>Refunded with your first qualifying payout.</>
                    )}
                  </p>
                </div>
              </div>

              {/* receipt lines */}
              {addOnFees.length > 0 || surcharge > 0 ? (
                <ul className="mx-4 mt-4 flex flex-col gap-1.5 border-b border-white/[0.07] pb-4 text-[13px]">
                  <li className="flex justify-between text-white/55">
                    <span>Base fee</span>
                    <span className="g-num">{base != null ? usd(base) : "—"}</span>
                  </li>
                  {addOnFees.map((f) => (
                    <li key={f.key} className="flex justify-between text-white/55">
                      <span>{addOns.find((a) => a.key === f.key)?.label}</span>
                      <span className="g-num">{f.amount ? `+${usd(f.amount)}` : "Free"}</span>
                    </li>
                  ))}
                  {surcharge > 0 ? (
                    <li className="flex justify-between text-white/55">
                      <span>{platform?.label}</span>
                      <span className="g-num">+{usd(surcharge)}</span>
                    </li>
                  ) : null}
                </ul>
              ) : null}

              <dl className="px-4 pt-2 pb-1">
                {specs.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-4 border-b border-white/[0.06] py-3 last:border-b-0">
                    <dt className="flex min-w-0 items-center gap-3 text-[13.5px] text-white/60">
                      <Icon className="h-4 w-4 shrink-0 text-[var(--g-sage)]" strokeWidth={1.8} />
                      <span className="truncate">{label}</span>
                    </dt>
                    <dd className="g-num shrink-0 text-right text-[14px] font-semibold text-white">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                          key={value}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.25, ease: EASE }}
                          className="inline-block"
                        >
                          {value}
                        </motion.span>
                      </AnimatePresence>
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="flex flex-col gap-2 p-2 pt-3">
                <Link href="/dashboard/new-challenge" className="g-btn g-btn-lime group h-14 w-full text-[16px]">
                  Get funded with {program.shortLabel}
                  <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5" strokeWidth={2.2} />
                </Link>
                <Link href={href("rules")} className="g-btn h-11 w-full text-[14px] font-medium text-white/65 hover:text-white">
                  Read the full trading rules
                </Link>
              </div>
            </aside>
            <p className="mt-4 px-3 text-center text-[12px] leading-relaxed text-white/35">You confirm program, size and add-ons at checkout. Prices in USD.</p>
          </Reveal>
        </div>
      </Container>

      {/* mobile: price stays in reach while configuring */}
      <AnimatePresence>
        {inView ? (
          <motion.div
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="fixed inset-x-3 bottom-3 z-40 lg:hidden"
          >
            <div className="g-glass-ink g-hair flex items-center justify-between gap-3 rounded-full py-2 pr-2 pl-5">
              <div className="min-w-0 leading-tight">
                <p className="truncate text-[11.5px] text-white/55">
                  {program.shortLabel} · {compactUsd(size)} {isAccess ? "· due today" : ""}
                </p>
                <AnimatedNumber value={priceNow} format={(n) => usd(Math.round(n))} className="g-num text-[19px] font-semibold text-white" />
              </div>
              <Link href="/dashboard/new-challenge" className="g-btn g-btn-lime h-11 px-5 text-[14.5px]">
                Get funded
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Section>
  );
}
