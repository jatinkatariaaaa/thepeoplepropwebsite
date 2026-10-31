"use client";

/**
 * V2 data layer — every number on the page comes from here, and here only
 * reads the same sources as the main site: Supabase (`tpp_stats`,
 * `tpp_platforms`), the hydrated program catalogue and the static data files.
 * Nothing is invented: when Supabase isn't configured we fall back to the
 * exact defaults the main landing page uses.
 */

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { useHydratedPrograms } from "@/hooks/useHydratedPrograms";
import { platforms as staticPlatforms, programs as staticPrograms, type Program, type AccountSize, type ProgramKey } from "@/data/programs";

const SUPABASE_READY = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/* ───────────────────────── stats ───────────────────────── */

export type Stat = { value: string; label: string; key_name?: string };

/** Same defaults as src/app/page.tsx — editable from the `tpp_stats` table. */
export const FALLBACK_STATS: Stat[] = [
  { value: "250+", label: "Successful payouts", key_name: "total_payouts" },
  { value: "142+", label: "Countries served", key_name: "countries" },
  { value: "5*", label: "TrustPilot rating", key_name: "trustpilot" },
];

function useStatsQuery() {
  const [stats, setStats] = useState<Stat[]>(FALLBACK_STATS);
  useEffect(() => {
    if (!SUPABASE_READY) return;
    let alive = true;
    supabase
      .from("tpp_stats")
      .select("*")
      .order("key_name")
      .then(({ data }) => {
        if (!alive || !data || data.length === 0) return;
        setStats(data.map((d: Stat) => ({ value: String(d.value), label: String(d.label), key_name: d.key_name })));
      });
    return () => {
      alive = false;
    };
  }, []);
  return stats;
}

export function findStat(stats: Stat[], kind: "countries" | "payouts" | "rating") {
  const test = {
    countries: (s: Stat) => s.key_name === "countries" || /countr/i.test(s.label),
    payouts: (s: Stat) => s.key_name === "total_payouts" || /payout/i.test(s.label),
    rating: (s: Stat) => s.key_name === "trustpilot" || /trust|rating/i.test(s.label),
  }[kind];
  return stats.find(test);
}

/** "5*" → "5★" for display; everything else untouched. */
export const prettyValue = (v: string) => v.replace(/\*$/, "★");

/* ───────────────────────── platforms ───────────────────────── */

/** A platform as the configurator sells it. `extra` is the absolute USD surcharge from `tpp_platforms.extra_fee_pct`
 *  (the main ChallengeCalculator treats that column as dollars, so we do too). */
export type PlatformOption = { key: string; label: string; extra: number };

const STATIC_PLATFORM_OPTIONS: PlatformOption[] = staticPlatforms
  .filter((p) => p.status !== "soon")
  .map((p) => ({ key: p.key, label: p.label, extra: p.extraFeePct ?? 0 }));

function usePlatformQuery() {
  const [list, setList] = useState<PlatformOption[]>(STATIC_PLATFORM_OPTIONS);
  useEffect(() => {
    if (!SUPABASE_READY) return;
    let alive = true;
    supabase
      .from("tpp_platforms")
      .select("*")
      .eq("is_active", true)
      .order("created_at")
      .then(({ data }) => {
        if (!alive || !data || data.length === 0) return;
        setList(
          data.map((p: { name: string; extra_fee_pct?: number | null }) => ({
            key: p.name.toLowerCase().replace(/[^a-z0-9]/g, ""),
            label: p.name,
            extra: Number(p.extra_fee_pct) || 0,
          })),
        );
      });
    return () => {
      alive = false;
    };
  }, []);
  return list;
}

/* ───────────────────────── programs ───────────────────────── */

export const usd = (n: number) => `$${n.toLocaleString("en-US")}`;
export const compactUsd = (n: number) => (n >= 1000 ? `$${Math.round(n / 1000)}K` : `$${n}`);

export function sizesOf(p: Program): AccountSize[] {
  return (Object.keys(p.fees) as unknown as string[])
    .map(Number)
    .filter((n) => p.fees[n as AccountSize] != null)
    .sort((a, b) => a - b) as AccountSize[];
}

/** Catalogue-wide facts derived from the live program data. */
export function useCatalogue(programs: Program[]) {
  return useMemo(() => {
    const sizes = programs.flatMap(sizesOf);
    const evalFees = programs
      .filter((p) => p.key !== "access")
      .flatMap((p) => Object.values(p.fees).filter((f): f is number => typeof f === "number"));
    return {
      maxSize: sizes.length ? Math.max(...sizes) : 0,
      minSize: sizes.length ? Math.min(...sizes) : 0,
      minFee: evalFees.length ? Math.min(...evalFees) : 0,
      baseSplit: programs.length ? Math.min(...programs.map((p) => p.profitSplit)) : 0,
      maxSplit: programs.length ? Math.max(...programs.map((p) => p.profitSplitMax)) : 0,
      count: programs.length,
    };
  }, [programs]);
}

/** Access accounts are "pass first, pay later": $5 today (see ChallengeCalculator). */
export const ACCESS_UPFRONT = 5;

/** Profit-target rows exactly as the main configurator computes them. */
export function targetRows(p: Program, size: number): { label: string; value: string }[] {
  const pct = [...p.profitTarget.matchAll(/(\d+(?:\.\d+)?)%/g)].map((m) => parseFloat(m[1]));
  if (p.key === "2-step" && pct.length >= 2)
    return [
      { label: "Phase 1 target", value: `${pct[0]}% · ${usd(Math.round((size * pct[0]) / 100))}` },
      { label: "Phase 2 target", value: `${pct[1]}% · ${usd(Math.round((size * pct[1]) / 100))}` },
    ];
  if (p.key === "3-step") {
    const v = pct[0] ?? parseFloat(p.profitTarget);
    return [{ label: "Target per phase", value: `${v}% · ${usd(Math.round((size * v) / 100))}` }];
  }
  if (p.key === "1-step" && pct.length) return [{ label: "Profit target", value: `${pct[0]}% · ${usd(Math.round((size * pct[0]) / 100))}` }];
  return [{ label: "Profit target", value: p.profitTarget === "—" ? "None" : p.profitTarget }];
}

/* ───────────────────────── provider ─────────────────────────
   Every section reads from one provider so the page makes a single
   request per source instead of one per component. */

type V2Data = {
  programs: Program[];
  stats: Stat[];
  platforms: PlatformOption[];
  /** program highlighted in the configurator (hero card rows select it) */
  program: ProgramKey;
  setProgram: (k: ProgramKey) => void;
};

const V2DataContext = createContext<V2Data | null>(null);

export function V2DataProvider({ children }: { children: ReactNode }) {
  const { programs } = useHydratedPrograms();
  const stats = useStatsQuery();
  const platforms = usePlatformQuery();
  const [program, setProgram] = useState<ProgramKey>("1-step");
  const value = useMemo(() => ({ programs, stats, platforms, program, setProgram }), [programs, stats, platforms, program]);
  return <V2DataContext.Provider value={value}>{children}</V2DataContext.Provider>;
}

export const usePrograms = () => useContext(V2DataContext)?.programs ?? staticPrograms;
export const useStats = () => useContext(V2DataContext)?.stats ?? FALLBACK_STATS;
export const usePlatformOptions = () => useContext(V2DataContext)?.platforms ?? STATIC_PLATFORM_OPTIONS;
export const usePlatformNames = () => usePlatformOptions().map((p) => p.label);

const NOOP = () => {};
export function useSelectedProgram(): [ProgramKey, (k: ProgramKey) => void] {
  const ctx = useContext(V2DataContext);
  return [ctx?.program ?? "1-step", ctx?.setProgram ?? NOOP];
}

/** Lowest one-time fee a program sells, and how Access is priced (pay $5 now). */
export function entryPrice(p: Program): { label: string; value: string } {
  if (p.key === "access") return { label: "today", value: `$${ACCESS_UPFRONT}` };
  const fees = Object.values(p.fees).filter((f): f is number => typeof f === "number");
  return { label: "from", value: fees.length ? `$${Math.min(...fees)}` : "—" };
}
