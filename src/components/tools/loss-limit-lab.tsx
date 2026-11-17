"use client";

import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { ProgramKey } from "@/data/programs";
import { CONDITIONS, PROGRAM_ORDER, programDetails } from "@/data/catalogue";

/**
 * Shows where the two loss limits sit for an account, exactly as the risk
 * engine computes them: the daily floor from the balance at the 5pm New York
 * rollover, the overall floor from the starting balance. The closer one is the
 * limit that matters today. Light surfaces only.
 */

const SIZES = [5_000, 10_000, 25_000, 50_000, 100_000, 200_000];
const usd = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

export function LossLimitLab({ className, defaultProgram = "2-step" }: { className?: string; defaultProgram?: ProgramKey }) {
  const [program, setProgram] = useState<ProgramKey>(defaultProgram);
  const [size, setSize] = useState(100_000);
  const [dayPct, setDayPct] = useState(2); // balance at the rollover, as % above the starting balance

  const d = programDetails[program].funded;
  const m = useMemo(() => {
    const dayStart = size * (1 + dayPct / 100);
    const dailyFloor = dayStart * (1 - d.dailyLossPct / 100);
    const overallFloor = size * (1 - d.maxLossPct / 100);
    const floor = Math.max(dailyFloor, overallFloor);
    const binding = dailyFloor >= overallFloor ? "daily" : "overall";
    const lo = size * (1 - (d.maxLossPct + 2) / 100);
    const hi = size * 1.12;
    const pos = (v: number) => `${Math.min(100, Math.max(0, ((v - lo) / (hi - lo)) * 100))}%`;
    return { dayStart, dailyFloor, overallFloor, floor, binding, room: dayStart - floor, pos };
  }, [size, dayPct, d]);

  const marker = (value: number, label: string, tone: "ink" | "red" | "amber", up = false) => (
    <div className="absolute top-0 h-full" style={{ left: m.pos(value) }}>
      <span className={cn("absolute top-1/2 h-9 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full", tone === "ink" ? "bg-[var(--g-ink)]" : tone === "red" ? "bg-red-500" : "bg-amber-500")} />
      <span className={cn("absolute left-0 -translate-x-1/2 text-center whitespace-nowrap", up ? "bottom-[calc(50%+26px)]" : "top-[calc(50%+26px)]")}>
        <span className="block text-[11px] font-semibold tracking-wide text-[var(--g-muted-ink)] uppercase">{label}</span>
        <span className="g-num block text-[14px] font-semibold text-[var(--g-ink)]">{usd(value)}</span>
      </span>
    </div>
  );

  return (
    <div className={cn("g-card-paper g-hair g-hair-ink rounded-[32px] p-6 sm:p-9", className)}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10">
        <div>
          <p className="text-[12px] font-semibold tracking-[0.12em] text-[var(--g-muted-ink)] uppercase">Account type</p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {PROGRAM_ORDER.map((k) => (
              <button key={k} type="button" aria-pressed={program === k} onClick={() => setProgram(k)} className={cn("h-9 rounded-full px-4 text-[13px] font-semibold ring-1 transition-colors", program === k ? "bg-[var(--g-ink)] text-white ring-[var(--g-ink)]" : "bg-white/70 text-[var(--g-muted-ink)] ring-black/10 hover:text-[var(--g-ink)]")}>
                {programDetails[k].name}
              </button>
            ))}
          </div>

          <p className="mt-6 text-[12px] font-semibold tracking-[0.12em] text-[var(--g-muted-ink)] uppercase">Account size</p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {SIZES.map((s) => (
              <button key={s} type="button" aria-pressed={size === s} onClick={() => setSize(s)} className={cn("g-num h-9 rounded-full px-4 text-[13px] font-semibold ring-1 transition-colors", size === s ? "bg-[var(--g-ink)] text-white ring-[var(--g-ink)]" : "bg-white/70 text-[var(--g-muted-ink)] ring-black/10 hover:text-[var(--g-ink)]")}>
                ${s / 1000}K
              </button>
            ))}
          </div>

          <label className="mt-6 block">
            <span className="flex items-baseline justify-between">
              <span className="text-[12px] font-semibold tracking-[0.12em] text-[var(--g-muted-ink)] uppercase">Balance at today&apos;s rollover</span>
              <span className="g-num text-[15px] font-semibold text-[var(--g-ink)]">
                {usd(m.dayStart)} <span className="text-[12px] font-medium text-[var(--g-muted-ink)]">({dayPct >= 0 ? "+" : ""}{dayPct}%)</span>
              </span>
            </span>
            <input type="range" min={-Math.max(0, d.maxLossPct - 1)} max={10} step={0.5} value={dayPct} onChange={(e) => setDayPct(Number(e.target.value))} className="mt-3 w-full accent-[var(--g-emerald)]" />
          </label>
        </div>

        <div>
          <div className="relative mt-12 h-3 rounded-full bg-[linear-gradient(90deg,#ef4444_0%,#f59e0b_22%,#e9eeec_38%,#e9eeec_100%)]">
            {marker(m.overallFloor, `Max loss ${d.maxLossPct}%`, "red")}
            {marker(m.dailyFloor, `Daily ${d.dailyLossPct}%`, "amber", true)}
            {marker(m.dayStart, "Today starts", "ink")}
          </div>

          <dl className="mt-24 grid gap-2 sm:grid-cols-3">
            {[
              ["Today's floor", usd(m.floor)],
              ["Room today", usd(m.room)],
              ["Set by", m.binding === "daily" ? "Daily limit" : "Max loss limit"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-[18px] bg-black/[0.035] px-4 py-3.5">
                <dt className="text-[12px] text-[var(--g-muted-ink)]">{k}</dt>
                <dd className="g-num mt-0.5 text-[18px] font-semibold tracking-[-0.02em] text-[var(--g-ink)]">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-4 text-[13.5px] leading-relaxed text-[var(--g-muted-ink)]">
            {m.binding === "daily"
              ? `Today your equity may not touch ${usd(m.dailyFloor)}: ${d.dailyLossPct}% below the balance you held at ${CONDITIONS.dayRollover}. The overall floor of ${usd(m.overallFloor)} is further away.`
              : `The overall floor of ${usd(m.overallFloor)} is closer than today's daily floor, so it is the limit that matters. It sits ${d.maxLossPct}% below the starting balance and never moves.`}
          </p>
        </div>
      </div>
    </div>
  );
}
