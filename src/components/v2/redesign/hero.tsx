"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Container, GhostButton } from "./primitives";

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

/** Single orchestrated entrance — everything rises out of the dark in sequence. */
const rise = (delay: number) => ({
  initial: { opacity: 0, y: 26, filter: "blur(6px)" },
  animate: { opacity: 1, y: 0, filter: "blur(0px)" },
  transition: { duration: 0.9, delay, ease: EASE },
});

const TRUST = [
  { value: "$4.2M", label: "Paid to traders" },
  { value: "12h", label: "Avg. payout time" },
  { value: "100%", label: "Profit split" },
  { value: "31k", label: "Funded traders" },
];

export function Hero() {
  return (
    <section className="v2-grain relative isolate overflow-hidden pt-36 pb-0 sm:pt-44">
      {/* ── Atmosphere plate: generated horizon glow ── */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <Image
          src="/images/v2r/hero-atmosphere.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="scale-110 object-cover object-[50%_76%]"
        />
        {/* Deepen the top so the headline sits in pure void */}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,var(--background)_0%,color-mix(in_oklab,var(--background)_80%,transparent)_26%,transparent_62%,transparent_88%,color-mix(in_oklab,var(--background)_78%,transparent)_100%)]" />
        {/* Vignette the sides */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_50%_55%,transparent,var(--background))]" />
        <div className="v2-stars opacity-70" />
        <div className="v2-grid opacity-60" />
        {/* Drifting fog off the horizon */}
        <div className="v2-fog v2-drift bottom-[-12%] left-1/2 h-[420px] w-[900px] -translate-x-1/2 opacity-40" />
      </div>

      <Container className="relative z-10 flex flex-col items-center text-center">
        <motion.div {...rise(0)}>
          <a
            href="#pricing"
            className="v2-glass v2-litedge group inline-flex items-center gap-2.5 rounded-full py-1.5 pr-4 pl-2"
          >
            <span className="rounded-full bg-primary/15 px-2.5 py-1 font-mono text-[10px] tracking-[0.16em] text-highlight uppercase">
              New
            </span>
            <span className="text-[13px] text-muted-foreground">
              Instant funding accounts are live
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </motion.div>

        <motion.h1
          {...rise(0.12)}
          className="v2-fadetext font-heading mt-8 max-w-4xl text-5xl leading-[0.98] text-balance sm:text-6xl lg:text-[5.25rem]"
        >
          Trade institutional capital. Keep every dollar of the upside.
        </motion.h1>

        <motion.p
          {...rise(0.24)}
          className="mt-7 max-w-lg text-[15px] leading-relaxed text-muted-foreground text-pretty"
        >
          One fair evaluation stands between you and a funded account up to
          $500,000. No consistency rules, no hidden targets, no waiting weeks to
          get paid.
        </motion.p>

        <motion.div
          {...rise(0.34)}
          className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
        >
          <a
            href="#pricing"
            className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-medium text-background shadow-[0_0_0_1px_rgba(255,255,255,0.16),0_16px_50px_-10px_color-mix(in_oklab,var(--primary)_85%,transparent)] transition-transform duration-300 hover:-translate-y-0.5"
          >
            Start your challenge
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
          <GhostButton href="#edge" className="px-7 py-3.5">
            See how it works
          </GhostButton>
        </motion.div>

        {/* ── Trust row, sitting on the light ── */}
        <motion.dl
          {...rise(0.46)}
          className="mt-20 grid w-full max-w-3xl grid-cols-2 gap-y-8 sm:grid-cols-4"
        >
          {TRUST.map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1.5">
              <dt className="font-heading text-2xl text-foreground sm:text-[1.75rem]">
                {item.value}
              </dt>
              <dd className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
                {item.label}
              </dd>
            </div>
          ))}
        </motion.dl>
      </Container>

      {/* ── Terminal panel emerging from the fog ── */}
      <motion.div
        initial={{ opacity: 0, y: 70, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 1.2, delay: 0.6, ease: EASE }}
        className="relative z-10 mx-auto mt-24 w-full max-w-5xl px-6 lg:px-8"
      >
        <TerminalPanel />
      </motion.div>
    </section>
  );
}

const ROWS = [
  { pair: "XAU / USD", price: "2,418.60", change: "+1.42%", up: true, w: "78%" },
  { pair: "EUR / USD", price: "1.0914", change: "+0.31%", up: true, w: "54%" },
  { pair: "NAS100", price: "20,146.5", change: "-0.18%", up: false, w: "36%" },
  { pair: "BTC / USD", price: "68,204", change: "+2.07%", up: true, w: "88%" },
];

function TerminalPanel() {
  return (
    <div className="v2-glass v2-litedge relative overflow-hidden rounded-t-[28px] border-b-0 pt-px">
      {/* light pooling at the bottom of the panel, as in the reference */}
      <div
        aria-hidden="true"
        className="v2-fog bottom-[-160px] left-1/2 h-[300px] w-[70%] -translate-x-1/2 opacity-55"
      />

      <div className="relative flex items-center gap-3 border-b border-border px-5 py-3.5">
        <div className="flex gap-1.5" aria-hidden="true">
          <span className="h-2 w-2 rounded-full bg-white/15" />
          <span className="h-2 w-2 rounded-full bg-white/15" />
          <span className="h-2 w-2 rounded-full bg-white/15" />
        </div>
        <span className="font-mono text-[11px] tracking-[0.14em] text-muted-foreground uppercase">
          TPP Terminal — Evaluation $200,000
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[11px] text-highlight">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary shadow-[0_0_8px_2px_var(--primary)]" />
          Live
        </span>
      </div>

      <div className="relative grid gap-px bg-white/[0.05] sm:grid-cols-3">
        <Stat label="Account balance" value="$212,480.12" sub="+6.24% this cycle" />
        <Stat label="Drawdown used" value="2.1%" sub="of 10% allowance" />
        <Stat label="Next payout" value="4 days" sub="100% split, 12h transfer" />
      </div>

      <div className="relative bg-background/40 px-5 pt-5 pb-14">
        <ul className="flex flex-col">
          {ROWS.map((row) => (
            <li
              key={row.pair}
              className="flex items-center gap-4 border-b border-border py-3 last:border-b-0"
            >
              <span className="w-24 shrink-0 font-mono text-[12px] text-foreground/85">
                {row.pair}
              </span>
              <span className="hidden w-24 shrink-0 font-mono text-[12px] text-muted-foreground sm:block">
                {row.price}
              </span>
              <span
                aria-hidden="true"
                className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]"
              >
                <span
                  className="block h-full rounded-full"
                  style={{
                    width: row.w,
                    background: row.up
                      ? "linear-gradient(to right, color-mix(in oklab, var(--primary) 30%, transparent), var(--highlight))"
                      : "linear-gradient(to right, rgba(255,255,255,0.08), rgba(255,255,255,0.28))",
                  }}
                />
              </span>
              <span
                className={
                  row.up
                    ? "w-16 shrink-0 text-right font-mono text-[12px] text-highlight"
                    : "w-16 shrink-0 text-right font-mono text-[12px] text-muted-foreground"
                }
              >
                {row.change}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="bg-background/60 px-5 py-6">
      <p className="font-mono text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="font-heading mt-2.5 text-2xl text-foreground">{value}</p>
      <p className="mt-1 text-[12px] text-muted-foreground">{sub}</p>
    </div>
  );
}
