"use client";

import { useState } from "react";
import { ArrowRight, Calculator } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const ACCOUNT_SIZES = [5000, 10000, 25000, 50000, 100000, 200000];

export function ProfitCalculatorV3() {
  const [accountSize, setAccountSize] = useState<number>(100000);
  const [profitRate, setProfitRate] = useState<number>(8); // default 8%

  // TPP Profit Split is 90%
  const profitSplit = 0.9;
  const estimatedProfit = accountSize * (profitRate / 100) * profitSplit;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfitRate(Number(e.target.value));
  };

  const fillPercentage = ((profitRate - 1) / (20 - 1)) * 100;

  return (
    <section className="px-4 py-16 md:py-24 max-w-7xl mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Left Side: Copy & CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-start"
        >
          <div className="inline-flex items-center gap-2 mb-6 rounded-full bg-[#0c0c0c]/5 px-3 py-1.5 border border-[#0c0c0c]/10">
            <Calculator className="w-4 h-4 text-[#0c0c0c]" />
            <span className="text-[11px] font-bold tracking-[0.1em] text-[#0c0c0c] uppercase">
              Payout Estimator
            </span>
          </div>

          <h2 className="text-[40px] md:text-[56px] font-bold leading-[1.05] tracking-[-0.03em] text-[#0c0c0c] mb-6">
            Calculate your<br />
            potential <span className="text-[#0c0c0c]/50">payouts</span>
          </h2>
          <p className="text-[17px] md:text-[19px] leading-relaxed text-[#0c0c0c]/70 mb-8 max-w-md">
            Trade with our capital and keep up to 90% of the profits. Use the calculator to see how much you could take home based on your performance.
          </p>
          <Link
            href="/challenges"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#cbfb45] text-[#0c0c0c] font-semibold text-[15px] hover:bg-[#b5e03b] transition-all group shadow-[0_0_20px_rgba(203,251,69,0.3)] hover:shadow-[0_0_30px_rgba(203,251,69,0.5)]"
          >
            Start Trading Now
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>

        {/* Right Side: Calculator Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="w-full"
        >
          <div className="w-full bg-[#0c0c0c] rounded-[2rem] p-8 md:p-12 relative overflow-hidden shadow-2xl border border-white/[0.08]">
            {/* Subtle Top Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-32 bg-[#cbfb45] opacity-[0.05] blur-[50px] pointer-events-none" />

            <div className="flex flex-col relative z-10">
              <span className="text-[11px] font-bold tracking-[0.1em] text-white/40 uppercase mb-10">
                Calculator
              </span>

              {/* Challenge Selector */}
              <div className="mb-10">
                <label className="block text-[15px] font-medium text-white/80 mb-4">
                  Account Size
                </label>
                <div className="relative">
                  <select
                    className="w-full appearance-none bg-white/[0.03] border border-white/[0.08] rounded-xl px-5 py-4 text-[24px] font-bold text-white focus:outline-none focus:border-[#cbfb45] transition-all shadow-sm cursor-pointer"
                    value={accountSize}
                    onChange={(e) => setAccountSize(Number(e.target.value))}
                  >
                    {ACCOUNT_SIZES.map((size) => (
                      <option key={size} value={size} className="text-black text-[16px]">
                        ${size.toLocaleString("en-US")}
                      </option>
                    ))}
                  </select>
                  {/* Custom dropdown arrow */}
                  <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-white/40">
                    <svg width="14" height="8" viewBox="0 0 14 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L7 7L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Monthly Percentage Slider */}
              <div className="mb-12">
                <div className="flex justify-between items-end mb-4">
                  <label className="block text-[15px] font-medium text-white/80">
                    Your monthly profit
                  </label>
                  <span className="text-[24px] font-bold text-[#cbfb45]">
                    {profitRate}%
                  </span>
                </div>

                {/* Custom Range Slider */}
                <div className="relative w-full h-2 bg-white/10 rounded-full mt-2">
                  <div
                    className="absolute top-0 left-0 h-full bg-[#cbfb45] rounded-full pointer-events-none"
                    style={{ width: `${fillPercentage}%` }}
                  />
                  <input
                    type="range"
                    min={1}
                    max={20}
                    step={1}
                    value={profitRate}
                    onChange={handleSliderChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />
                  {/* Custom Thumb */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-7 h-7 bg-[#cbfb45] rounded-full shadow-[0_0_20px_rgba(203,251,69,0.5)] pointer-events-none z-10 transition-transform flex items-center justify-center border-[4px] border-[#0c0c0c]"
                    style={{ left: `calc(${fillPercentage}% - 14px)` }}
                  />
                </div>
                <div className="flex justify-between mt-3 text-[12px] font-medium text-white/30">
                  <span>1%</span>
                  <span>20%</span>
                </div>
              </div>

              {/* Estimate Result */}
              <div className="mb-10 pt-8 border-t border-white/[0.08]">
                <label className="block text-[15px] font-medium text-white/80 mb-2">
                  Your estimated payout (90% split)
                </label>
                <div className="text-[40px] md:text-[56px] font-bold text-white tracking-tight">
                  ${estimatedProfit.toLocaleString("en-US")}
                </div>
              </div>

              {/* Footer Note */}
              <p className="text-[12px] text-white/40 leading-relaxed flex items-start gap-2">
                <span className="text-[#cbfb45] mt-0.5">*</span>
                Based on a 90% profit split. Actual payouts may vary depending on trading performance and account rules.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
