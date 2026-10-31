"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowRight, Calculator, ChevronDown } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const ACCOUNT_SIZES = [
  { value: 5000, label: "5,000" },
  { value: 10000, label: "10,000" },
  { value: 25000, label: "25,000" },
  { value: 50000, label: "50,000" },
  { value: 100000, label: "100,000" },
  { value: 200000, label: "200,000" },
];

export function ProfitCalculator() {
  const [accountSize, setAccountSize] = useState<number>(100000);
  const [profitRate, setProfitRate] = useState<number>(8); // default 8%
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // TPP Profit Split is 90%
  const profitSplit = 0.9;
  const estimatedProfit = accountSize * (profitRate / 100) * profitSplit;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfitRate(Number(e.target.value));
  };

  const fillPercentage = ((profitRate - 1) / (100 - 1)) * 100;

  return (
    <section className="px-4 py-10 md:py-16 max-w-6xl mx-auto w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left Side: Copy & CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-start"
        >
          <div className="inline-flex items-center gap-2 mb-4 rounded-full bg-[#0c0c0c]/5 px-3 py-1.5 border border-[#0c0c0c]/10">
            <Calculator className="w-4 h-4 text-[#0c0c0c]" />
            <span className="text-[11px] font-bold tracking-[0.1em] text-[#0c0c0c] uppercase">
              Payout Estimator
            </span>
          </div>

          <h2 className="text-[32px] md:text-[48px] font-bold leading-[1.05] tracking-[-0.03em] text-[#0c0c0c] mb-4">
            Calculate your<br />
            potential <span className="text-[#0c0c0c]/50">payouts</span>
          </h2>
          <p className="text-[15px] md:text-[17px] leading-relaxed text-[#0c0c0c]/70 mb-6 max-w-sm">
            Trade with our capital and keep up to 90% of the profits. See exactly how much you could take home.
          </p>
          <Link
            href="/challenges"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#cbfb45] text-[#0c0c0c] font-semibold text-[14px] hover:bg-[#b5e03b] transition-all group shadow-[0_0_20px_rgba(203,251,69,0.3)] hover:shadow-[0_0_30px_rgba(203,251,69,0.5)]"
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
          <div className="w-full bg-[#0c0c0c] rounded-[1.5rem] p-6 md:p-8 relative overflow-hidden shadow-2xl border border-white/[0.08]">
            {/* Subtle Top Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-24 bg-[#cbfb45] opacity-[0.05] blur-[40px] pointer-events-none" />

            <div className="flex flex-col relative z-10">
              <span className="text-[10px] font-bold tracking-[0.1em] text-white/40 uppercase mb-6">
                Calculator
              </span>

              {/* Challenge Selector (Custom Dropdown) */}
              <div className="mb-8" ref={dropdownRef}>
                <label className="block text-[13px] font-medium text-white/80 mb-3">
                  Account Size
                </label>
                <div className="relative">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between bg-white/[0.03] border border-white/[0.08] hover:border-white/[0.15] rounded-xl px-5 py-4 text-[24px] font-bold text-white transition-all focus:outline-none"
                  >
                    <span>${accountSize.toLocaleString("en-US")}</span>
                    <ChevronDown className={`w-5 h-5 text-white/40 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {isDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 w-full mt-2 bg-[#121212] border border-white/[0.08] rounded-xl overflow-hidden shadow-2xl z-50"
                      >
                        {ACCOUNT_SIZES.map((size) => (
                          <button
                            key={size.value}
                            onClick={() => {
                              setAccountSize(size.value);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-5 py-3 text-[18px] font-semibold transition-colors flex items-center justify-between ${
                              accountSize === size.value
                                ? "bg-[#cbfb45]/10 text-[#cbfb45]"
                                : "text-white/70 hover:bg-white/[0.05] hover:text-white"
                            }`}
                          >
                            ${size.label}
                            {accountSize === size.value && (
                              <div className="w-1.5 h-1.5 rounded-full bg-[#cbfb45]" />
                            )}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Monthly Percentage Slider */}
              <div className="mb-8">
                <div className="flex justify-between items-end mb-3">
                  <label className="block text-[13px] font-medium text-white/80">
                    Your monthly profit
                  </label>
                  <span className="text-[20px] font-bold text-[#cbfb45]">
                    {profitRate}%
                  </span>
                </div>

                {/* Custom Range Slider */}
                <div className="relative w-full h-1.5 bg-white/10 rounded-full mt-1">
                  <div
                    className="absolute top-0 left-0 h-full bg-[#cbfb45] rounded-full pointer-events-none"
                    style={{ width: `${fillPercentage}%` }}
                  />
                  <input
                    type="range"
                    min={1}
                    max={100}
                    step={1}
                    value={profitRate}
                    onChange={handleSliderChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />
                  {/* Custom Thumb */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-[#cbfb45] rounded-full shadow-[0_0_15px_rgba(203,251,69,0.5)] pointer-events-none z-10 transition-transform flex items-center justify-center border-[3px] border-[#0c0c0c]"
                    style={{ left: `calc(${fillPercentage}% - 10px)` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-[11px] font-medium text-white/30">
                  <span>1%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Estimate Result */}
              <div className="mb-4 pt-6 border-t border-white/[0.08]">
                <label className="block text-[13px] font-medium text-white/80 mb-1">
                  Your estimated payout (90% split)
                </label>
                <div className="text-[36px] md:text-[48px] font-bold text-white tracking-tight">
                  ${estimatedProfit.toLocaleString("en-US")}
                </div>
              </div>

              {/* Footer Note */}
              <p className="text-[11px] text-white/30 leading-relaxed flex items-start gap-1.5">
                <span className="text-[#cbfb45] mt-0.5">*</span>
                Based on a 90% profit split.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
