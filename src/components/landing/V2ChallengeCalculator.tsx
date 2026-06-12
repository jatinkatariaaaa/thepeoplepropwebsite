"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, ShieldCheck, TrendingUp } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { cn } from "@/lib/utils";
import {
  ALL_SIZES,
  feeFor,
  formatSize,
  platforms,
  programOffersSize,
  programs,
  type AccountSize,
  type PlatformKey,
  type ProgramKey,
} from "@/data/programs";

export function V2ChallengeCalculator() {
  const router = useRouter();
  
  // States
  const [market, setMarket] = useState<"Forex" | "Futures">("Forex");
  const [programKey, setProgramKey] = useState<ProgramKey>("instant");
  const [size, setSize] = useState<AccountSize>(100_000);
  const [platformKey, setPlatformKey] = useState<PlatformKey>("mt5");
  
  const { copied, copy } = useCopyToClipboard();

  // Derived Data
  const program = useMemo(
    () => programs.find((p) => p.key === programKey) ?? programs[0],
    [programKey]
  );

  const effectiveSize = useMemo<AccountSize>(() => {
    if (programOffersSize(program, size)) return size;
    const offered = (Object.keys(program.fees) as unknown as string[])
      .map((s) => Number(s) as AccountSize)
      .sort((a, b) => a - b);
    const lowerOrEqual = offered.filter((s) => s <= size).pop();
    return lowerOrEqual ?? offered[0];
  }, [program, size]);

  const { total } = useMemo(
    () => feeFor(program, effectiveSize, []),
    [program, effectiveSize]
  );

  const finalPrice = total; 
  
  // Calculate Payout
  const profitTargetUsd = useMemo(() => {
    const m = program.profitTarget.match(/(\d+(?:\.\d+)?)/);
    if (!m) return null;
    const pct = parseFloat(m[1]);
    return Math.round((effectiveSize * pct) / 100);
  }, [program, effectiveSize]);

  const averagePayout = Math.round(
    ((profitTargetUsd ?? effectiveSize * 0.05) * program.profitSplit) / 100
  );

  const stepPrograms = [
    { key: "instant", label: "Instant" },
    { key: "1-step", label: "1 Phase" }, // Changed from "1 Step" to "1 Phase" to be unique
    { key: "2-step", label: "2 Phase" },
    { key: "3-step", label: "3 Phase" },
    { key: "access", label: "Paylater" },
  ] as const;

  return (
    <section className="relative w-full pb-32 pt-16 font-sans">
      <div className="max-w-[1300px] mx-auto px-5 md:px-10 flex flex-col items-center">
        
        {/* Top Toggles Container (Market & Phase) */}
        <div className="flex flex-col items-center mb-10 w-full">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 bg-white p-2 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#0c0c0c]/5">
            {/* Market Toggle */}
            <div className="flex p-1.5 bg-[#f8f9fa] rounded-full">
              <button
                onClick={() => setMarket("Forex")}
                className={cn(
                  "px-8 py-3 rounded-full text-[17px] font-bold transition-all duration-300",
                  market === "Forex" ? "bg-[#0c0c0c] text-white shadow-md" : "text-[#6c6a68] hover:text-[#0c0c0c]"
                )}
              >
                Forex
              </button>
              <button
                onClick={() => setMarket("Futures")}
                className={cn(
                  "px-8 py-3 rounded-full text-[17px] font-bold transition-all duration-300",
                  market === "Futures" ? "bg-[#0c0c0c] text-white shadow-md" : "text-[#6c6a68] hover:text-[#0c0c0c]"
                )}
              >
                Futures
              </button>
            </div>
            
            {/* Divider for desktop */}
            <div className="hidden md:block w-px h-10 bg-gray-200"></div>

            {/* Steps Toggle */}
            <div className="flex overflow-x-auto max-w-full pb-2 md:pb-0 scrollbar-hide">
              {stepPrograms.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setProgramKey(p.key as ProgramKey)}
                  className={cn(
                    "px-7 py-3 rounded-full text-[17px] font-semibold transition-all duration-300 whitespace-nowrap mx-1",
                    programKey === p.key ? "bg-[#bcff2e] text-[#0c0c0c] shadow-sm" : "text-[#6c6a68] hover:text-[#0c0c0c] hover:bg-gray-50"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Big Promo Banner */}
        <div className="w-full bg-[#bcff2e] text-[#0c0c0c] rounded-2xl md:rounded-full py-5 px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-4 mb-16 shadow-lg border border-[#0c0c0c]/10">
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5">
            <span className="bg-[#0c0c0c] text-white px-3 py-1 rounded-md text-[14px] font-bold tracking-wider uppercase">Limited Time</span>
            <span className="text-[18px] font-bold">35% OFF + 125% Refund on first payout</span>
          </div>
          
          <button
            onClick={() => copy("WC35")}
            className="group flex items-center gap-3 bg-[#0c0c0c] text-white rounded-full px-6 py-2.5 hover:bg-[#1a1a1a] transition-all"
          >
            <span className="text-[16px] font-bold">Code: WC35</span>
            {copied ? <Check className="w-5 h-5 text-[#bcff2e]" /> : <Copy className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />}
          </button>
        </div>

        {/* 2-Column Main Layout (Uniquely structured, not an Atlas clone) */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] xl:grid-cols-[1.4fr_1fr] gap-8 xl:gap-12 items-start">
          
          {/* LEFT SIDE: Configurator (Platforms & Sizes) */}
          <div className="flex flex-col gap-10">
            
            {/* Platforms */}
            <div>
              <h3 className="text-[22px] font-semibold text-[#0c0c0c] mb-4 flex items-center gap-2">
                <div className="w-2 h-6 bg-[#bcff2e] rounded-sm"></div>
                Select Platform
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {platforms.filter(p => p.key !== "tppdashboard").map(p => (
                  <button
                    key={p.key}
                    disabled={p.status === "soon"}
                    onClick={() => setPlatformKey(p.key)}
                    className={cn(
                      "flex flex-col items-start p-5 rounded-2xl transition-all duration-300 border-2",
                      p.status === "soon" ? "opacity-50 cursor-not-allowed border-transparent" : "cursor-pointer",
                      platformKey === p.key ? "bg-[#bcff2e] border-[#0c0c0c]" : "bg-white border-transparent hover:border-[#0c0c0c]/20 shadow-sm"
                    )}
                  >
                    {/* Mock icons */}
                    <div className="mb-3">
                      {p.key === "tradelocker" && <div className="w-8 h-8 bg-black rounded-[8px] flex items-center justify-center"><span className="text-white font-bold text-[12px]">TL</span></div>}
                      {p.key === "mt5" && <div className="w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-[8px] font-bold text-xl">5</div>}
                      {p.key === "matchtrader" && <div className="w-8 h-8 flex items-center justify-center bg-sky-50 text-sky-500 rounded-[8px] font-bold text-xl">M</div>}
                    </div>
                    <span className="text-[#0c0c0c] text-[18px] font-bold">{p.label}</span>
                    <span className="text-[#6c6a68] text-[14px] mt-1 text-left">{p.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Account Sizes */}
            <div>
              <h3 className="text-[22px] font-semibold text-[#0c0c0c] mb-4 flex items-center gap-2">
                <div className="w-2 h-6 bg-[#bcff2e] rounded-sm"></div>
                Account Balance
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {ALL_SIZES.map(s => {
                  const offered = programOffersSize(program, s);
                  const active = effectiveSize === s;
                  return (
                    <button
                      key={s}
                      disabled={!offered}
                      onClick={() => setSize(s)}
                      className={cn(
                        "py-6 px-2 rounded-2xl transition-all duration-300 flex items-center justify-center border-2",
                        !offered ? "opacity-30 cursor-not-allowed border-transparent" : "cursor-pointer",
                        active ? "bg-[#0c0c0c] text-[#bcff2e] border-[#0c0c0c] shadow-xl scale-[1.02]" : "bg-white text-[#0c0c0c] border-transparent shadow-sm hover:border-[#0c0c0c]/20 hover:-translate-y-1"
                      )}
                    >
                      <span className="text-[24px] font-bold tracking-tight">{formatSize(s).replace("$", "")}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Spec Card (Bigger & Distinct) */}
          <div className="bg-white rounded-[2rem] border border-[#0c0c0c]/10 shadow-[0_20px_60px_rgb(0,0,0,0.06)] overflow-hidden">
            <div className="bg-[#f8f9fa] p-8 border-b border-[#0c0c0c]/5 flex items-center justify-between">
              <div>
                <h4 className="text-[24px] font-bold text-[#0c0c0c] tracking-tight">Challenge Overview</h4>
                <p className="text-[15px] text-[#6c6a68] mt-1">{program.tagline}</p>
              </div>
              <div className="w-12 h-12 bg-[#bcff2e] rounded-full flex items-center justify-center shrink-0 border border-[#0c0c0c]/10">
                <TrendingUp className="w-6 h-6 text-[#0c0c0c]" strokeWidth={2.5} />
              </div>
            </div>

            <div className="p-8">
              <ul className="space-y-1 mb-10">
                {[
                  { label: "Trading Period", value: "Unlimited" },
                  { label: "Minimum Days", value: `${program.minTradingDays} Days` },
                  { label: "Target (Profit)", value: program.profitTarget },
                  { label: "Maximum Loss", value: program.maxDrawdown },
                  { label: "Daily Loss Limit", value: program.dailyDrawdown },
                  { label: "Expert Advisors", value: <ShieldCheck className="w-6 h-6 text-[#bcff2e]" strokeWidth={3} fill="#0c0c0c" /> },
                  { label: "Max Profit Split", value: `${program.profitSplitMax}%` },
                  { label: "Avg. Trader Payout", value: `$${averagePayout.toLocaleString()}` },
                ].map((row, i) => (
                  <li key={i} className={cn("flex items-center justify-between p-4 rounded-xl", i % 2 === 0 ? "bg-[#f8f9fa]" : "bg-transparent")}>
                    <span className="text-[#6c6a68] text-[16px] font-medium">{row.label}</span>
                    <span className="text-[#0c0c0c] text-[17px] font-bold flex items-center">
                      {row.value}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="flex items-end justify-between mb-6">
                <div>
                  <span className="text-[14px] text-[#6c6a68] font-medium block mb-1">One-time fee</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[20px] text-[#0c0c0c]/30 line-through font-bold">${Math.round((total || 0) * 1.35)}</span>
                    <span className="text-[42px] text-[#0c0c0c] font-black leading-none tracking-tighter">${finalPrice}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => router.push('/dashboard/new-challenge')}
                className="w-full bg-[#bcff2e] text-[#0c0c0c] rounded-2xl py-6 flex items-center justify-center hover:bg-[#a5e622] transition-all shadow-[0_8px_20px_rgba(188,255,46,0.4)] group border border-[#0c0c0c]/10"
              >
                <span className="text-[22px] font-bold">Proceed to Checkout</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
