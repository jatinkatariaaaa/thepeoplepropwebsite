"use client";

import { useState } from "react";
import { Calculator, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

const ACCOUNT_SIZES = [
  5000,
  10000,
  25000,
  50000,
  100000,
  200000,
];

export function ProfitCalculator() {
  const [accountSize, setAccountSize] = useState<number>(200000);
  const [profitRate, setProfitRate] = useState<number>(8);

  // Up to 100% profit split
  const profitSplitPercentage = 1.00;
  const calculatedProfit = Math.round(accountSize * (profitRate / 100) * profitSplitPercentage);

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[800px] h-[800px] bg-[var(--accent)] opacity-[0.02] rounded-full blur-[100px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-5 md:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">
          
          {/* Left Side: Headlines */}
          <div className="flex flex-col relative lg:self-start lg:pt-10">
            <div className="inline-flex items-center gap-2 mb-6 self-start rounded-md bg-slate-100 px-3 py-1.5 border border-slate-200">
              <Calculator className="w-4 h-4 text-[var(--ink-600)]" />
              <span className="text-[11px] font-bold tracking-widest text-[var(--ink-700)] uppercase">
                Calculate Your Profits
              </span>
            </div>
            
            <div className="relative">
              {/* Background Blue Glow & Grain Effect */}
              <div className="absolute top-1/2 left-1/2 -translate-x-[40%] -translate-y-1/2 w-[160%] h-[200%] -z-10 pointer-events-none select-none">
                <div 
                  className="absolute inset-0 blur-[40px] md:blur-[60px]"
                  style={{ background: "radial-gradient(ellipse at center, rgba(37, 99, 235, 0.25) 0%, transparent 65%)" }}
                />
                <div 
                  className="absolute inset-0 mix-blend-overlay opacity-[0.15]"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                />
              </div>

              <h2 className="relative text-[48px] sm:text-[64px] lg:text-[72px] font-bold leading-[0.95] tracking-tight text-[var(--ink-950)] mb-8">
                How much<br />
                can you<br />
                <span className="word-serif text-[var(--accent)]">make?</span>
              </h2>
            </div>


          </div>

          {/* Right Side: Calculator Card */}
          <div className="flex justify-center lg:justify-end w-full">
            <div className="w-full max-w-lg glass-strong rounded-[32px] p-8 sm:p-10 relative overflow-hidden lift">
              {/* Internal subtle glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)] opacity-[0.03] rounded-full blur-[50px] pointer-events-none" />

              <div className="flex items-center gap-2 mb-8">
                <Lock className="w-4 h-4 text-[var(--ink-950)]" strokeWidth={2.5} />
                <span className="text-[13px] font-bold text-[var(--ink-950)]">
                  Reward Guaranteed
                </span>
              </div>

              {/* Account Size Select */}
              <div className="mb-8">
                <label className="block text-[13px] font-medium text-[var(--ink-500)] mb-2">
                  Account Size
                </label>
                <div className="relative">
                  <select 
                    className="w-full appearance-none bg-white border border-[var(--border)] rounded-2xl px-5 py-4 text-[18px] font-semibold text-[var(--ink-950)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all shadow-sm"
                    value={accountSize}
                    onChange={(e) => setAccountSize(Number(e.target.value))}
                  >
                    {ACCOUNT_SIZES.map(size => (
                      <option key={size} value={size}>
                        $ {size.toLocaleString()}
                      </option>
                    ))}
                  </select>
                  {/* Custom Arrow */}
                  <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none">
                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1.5L6 6.5L11 1.5" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Profit Rate Slider */}
              <div className="mb-10">
                <label className="block text-[13px] font-medium text-[var(--ink-500)] mb-3">
                  Profit Rate
                </label>
                <div className="relative pt-2">
                  <input
                    type="range"
                    min="1"
                    max="100"
                    step="1"
                    value={profitRate}
                    onChange={(e) => setProfitRate(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, var(--ink-950) ${(profitRate - 1) / 99 * 100}%, #E2E8F0 ${(profitRate - 1) / 99 * 100}%)`
                    }}
                  />
                  {/* Custom Thumb is handled via global css usually, but we rely on tailwind defaults or simple styling here */}
                  <style jsx>{`
                    input[type=range]::-webkit-slider-thumb {
                      appearance: none;
                      width: 24px;
                      height: 24px;
                      border-radius: 50%;
                      background: var(--ink-950);
                      cursor: pointer;
                      box-shadow: 0 0 0 4px #FAFAFA;
                    }
                    input[type=range]::-moz-range-thumb {
                      width: 24px;
                      height: 24px;
                      border-radius: 50%;
                      background: var(--ink-950);
                      cursor: pointer;
                      border: none;
                      box-shadow: 0 0 0 4px #FAFAFA;
                    }
                  `}</style>
                </div>
                <div className="mt-3 text-[18px] font-semibold text-[var(--ink-950)]">
                  {profitRate}%
                </div>
              </div>

              {/* Result Display */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-[48px] sm:text-[56px] font-bold text-[var(--ink-950)] leading-none tracking-tight">
                    ${calculatedProfit.toLocaleString()}
                  </span>
                  <span className="text-[14px] font-medium text-[var(--ink-500)]">
                    / Month
                  </span>
                </div>
                
                {/* 100% Split Badge */}
                <div className="chip chip-success px-3 py-1.5 shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={3} />
                  <span className="font-bold">
                    Up to 100% Split
                  </span>
                </div>
              </div>

              {/* Start Earning CTA */}
              <Button href="/challenges" variant="primary" size="lg" className="w-full shadow-md rounded-xl h-[56px] text-[16px] font-semibold">
                Start Earning
              </Button>
              
              <p className="text-center text-[12px] text-[var(--ink-500)] font-medium mt-4">
                You&apos;re not liable for any losses.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
