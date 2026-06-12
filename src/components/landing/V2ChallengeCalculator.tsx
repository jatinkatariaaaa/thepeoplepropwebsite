"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, ShieldCheck } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { cn } from "@/lib/utils";
import {
  ALL_SIZES,
  feeFor,
  formatSize,
  formatSizeLong,
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

  const { base, total } = useMemo(
    () => feeFor(program, effectiveSize, []),
    [program, effectiveSize]
  );

  const finalPrice = total; // Apply discount logic if needed
  
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

  // Mapped programs for Step toggle based on screenshot: 
  // Instant, 1 Step, 2 Step, 3 Step, Paylater (access)
  const stepPrograms = [
    { key: "instant", label: "Instant" },
    { key: "1-step", label: "1 Step" },
    { key: "2-step", label: "2 Step" },
    { key: "3-step", label: "3 Step" },
    { key: "access", label: "Paylater" },
  ] as const;

  return (
    <section className="relative w-full pb-20 pt-10">
      <div className="max-w-6xl mx-auto px-4 md:px-8 flex flex-col items-center">
        
        {/* Market Toggle */}
        <div className="flex flex-col items-center mb-6">
          <span className="text-[14px] text-[#6c6a68] mb-3">Choose your market</span>
          <div className="flex p-1.5 bg-white rounded-full shadow-sm">
            <button
              onClick={() => setMarket("Forex")}
              className={cn(
                "px-8 py-2.5 rounded-full text-[15px] font-medium transition-all duration-300",
                market === "Forex" ? "bg-[#bcff2e] text-[#0c0c0c]" : "text-[#6c6a68] hover:text-[#0c0c0c] hover:bg-gray-50"
              )}
            >
              Forex
            </button>
            <button
              onClick={() => setMarket("Futures")}
              className={cn(
                "px-8 py-2.5 rounded-full text-[15px] font-medium transition-all duration-300",
                market === "Futures" ? "bg-[#bcff2e] text-[#0c0c0c]" : "text-[#6c6a68] hover:text-[#0c0c0c] hover:bg-gray-50"
              )}
            >
              Futures
            </button>
          </div>
        </div>

        {/* Steps Toggle */}
        <div className="flex p-1.5 bg-white rounded-full shadow-sm mb-8 overflow-x-auto max-w-full">
          {stepPrograms.map((p) => (
            <button
              key={p.key}
              onClick={() => setProgramKey(p.key as ProgramKey)}
              className={cn(
                "px-6 sm:px-8 py-2.5 rounded-full text-[14px] sm:text-[15px] font-medium transition-all duration-300 whitespace-nowrap",
                programKey === p.key ? "bg-[#bcff2e] text-[#0c0c0c]" : "text-[#6c6a68] hover:text-[#0c0c0c] hover:bg-gray-50"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Promo Banner */}
        <div className="w-full bg-[#1c2b2a] text-white rounded-full py-4 px-6 flex flex-wrap items-center justify-center gap-3 sm:gap-6 mb-12 shadow-lg">
          <span className="text-[13px] font-bold tracking-wider">LIMITED TIME</span>
          <span className="w-1 h-1 rounded-full bg-white/40"></span>
          <span className="text-[14px] font-medium">35% OFF + 125% Refund</span>
          <span className="w-1 h-1 rounded-full bg-white/40"></span>
          <a href="#" className="text-[#bcff2e] underline underline-offset-4 text-[14px] font-medium hover:text-white transition-colors">Get Funded</a>
          
          <button
            onClick={() => copy("WC35")}
            className="ml-auto bg-[#bcff2e] text-[#1c2b2a] rounded-full px-4 py-1.5 flex items-center gap-2 text-[13px] font-bold hover:bg-[#a5e622] transition-colors"
          >
            Code: WC35
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* 3-Column Grid */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-[240px_280px_1fr] gap-4 xl:gap-6 items-start">
          
          {/* Column 1: Platforms */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[26px] sm:text-[32px] leading-tight font-medium text-[#6c6a68] mb-2">
              Choose a<br />platform
            </h3>
            <div className="flex flex-col p-2 bg-white rounded-3xl shadow-sm gap-2">
              {platforms.filter(p => p.key !== "tppdashboard").map(p => (
                <button
                  key={p.key}
                  disabled={p.status === "soon"}
                  onClick={() => setPlatformKey(p.key)}
                  className={cn(
                    "flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-300",
                    p.status === "soon" ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                    platformKey === p.key ? "bg-[#bcff2e]" : "bg-[#f8f9fa] hover:bg-gray-100"
                  )}
                >
                  <span className="text-[#0c0c0c] text-[15px] font-medium">{p.label}</span>
                  {/* Mock icons based on screenshot */}
                  {p.key === "tradelocker" && <div className="w-6 h-6 bg-black rounded-md flex items-center justify-center"><span className="text-white font-bold text-[10px]">TL</span></div>}
                  {p.key === "mt5" && <div className="w-6 h-6 flex items-center justify-center text-blue-600 font-bold text-lg">5</div>}
                  {p.key === "matchtrader" && <div className="w-6 h-6 flex items-center justify-center text-sky-500 font-bold text-lg">M</div>}
                </button>
              ))}
            </div>
          </div>

          {/* Column 2: Account Size */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[26px] sm:text-[32px] leading-tight font-medium text-[#6c6a68] mb-2">
              Choose<br />account size
            </h3>
            <div className="grid grid-cols-2 p-2 bg-white rounded-3xl shadow-sm gap-2">
              {ALL_SIZES.map(s => {
                const offered = programOffersSize(program, s);
                const active = effectiveSize === s;
                return (
                  <button
                    key={s}
                    disabled={!offered}
                    onClick={() => setSize(s)}
                    className={cn(
                      "px-2 py-4 rounded-2xl transition-all duration-300 flex items-center justify-center",
                      !offered ? "opacity-30 cursor-not-allowed" : "cursor-pointer",
                      active ? "bg-[#bcff2e]" : "bg-[#f8f9fa] hover:bg-gray-100"
                    )}
                  >
                    <span className="text-[#0c0c0c] text-[16px] font-medium">{formatSize(s).replace("$", "")}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Column 3: Spec Card */}
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-xl shadow-black/[0.03]">
            <ul className="space-y-4 mb-8">
              {[
                { label: "Trading Period", value: "Unlimited" },
                { label: "Min Trading Days", value: program.minTradingDays },
                { label: "Profit Target", value: program.profitTarget },
                { label: "Max. Overall Loss", value: program.maxDrawdown },
                { label: "Max. Daily Loss", value: program.dailyDrawdown },
                { label: "Expert Advisors", value: <ShieldCheck className="w-5 h-5 text-[#5e4b8b]" strokeWidth={2.5} /> },
                { label: "Profit Split", value: `${program.profitSplitMax}%*` },
                { label: "Average Payout", value: `$${averagePayout.toLocaleString()}` },
              ].map((row, i) => (
                <li key={i} className="flex items-center gap-4">
                  <span className="text-[#1c2b2a] text-[15px] font-medium shrink-0">{row.label}</span>
                  <div className="flex-1 border-b border-dashed border-gray-200"></div>
                  <span className="text-[#1c2b2a] text-[15px] font-semibold shrink-0 flex items-center justify-end">
                    {row.value}
                  </span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => router.push('/dashboard/new-challenge')}
              className="w-full bg-[#1c2b2a] text-white rounded-2xl py-4 flex flex-col items-center justify-center hover:bg-[#14201f] transition-all duration-300 shadow-md mb-4 group"
            >
              <div className="flex items-center gap-2 text-[18px] font-medium">
                Get Funded <span className="text-white/40 line-through text-[16px]">${Math.round((total || 0) * 1.35)}</span> ${finalPrice}
              </div>
            </button>
            


            {/* Payment Methods */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[
                { name: "Crypto", bg: "bg-[#e5e7eb]", text: "text-gray-600" },
                { name: "G Pay", bg: "bg-[#e5e7eb]", text: "text-gray-600" },
                { name: "Mastercard", bg: "bg-[#e5e7eb]", text: "text-gray-600" },
                { name: "Apple Pay", bg: "bg-[#e5e7eb]", text: "text-gray-600" },
                { name: "VISA", bg: "bg-[#e0e7ff]", text: "text-blue-800", font: "font-bold italic" },
              ].map(p => (
                <div key={p.name} className={cn("px-4 py-2 rounded-xl flex items-center justify-center text-[12px] font-medium", p.bg, p.text, p.font)}>
                  {p.name}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
