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
    <section className="w-full py-10 md:py-16">
      {/* Mobile: immersive dark tool stage. Desktop: split copy + card on cream. */}
      <div className="px-[5px] lg:px-4">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#0c0c0c] px-5 py-14 lg:mx-auto lg:max-w-6xl lg:overflow-visible lg:rounded-none lg:bg-transparent lg:px-0 lg:py-0">
          {/* Stage glow + line details (mobile only) */}
          <div
            className="pointer-events-none absolute -top-24 left-1/2 h-56 w-[85%] -translate-x-1/2 rounded-full bg-[#cbfb45] opacity-[0.07] blur-[70px] lg:hidden"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-5 top-[52px] border-t border-dashed border-white/[0.08] lg:hidden"
            aria-hidden="true"
          />

          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2 lg:gap-12">
            {/* Copy & CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex flex-col items-start"
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#cbfb45]/25 bg-[#cbfb45]/10 px-3 py-1.5 lg:border-[#0c0c0c]/10 lg:bg-[#0c0c0c]/5">
                <Calculator className="h-4 w-4 text-[#cbfb45] lg:text-[#0c0c0c]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#cbfb45] lg:text-[#0c0c0c]">
                  Payout Estimator
                </span>
              </div>

              <h2 className="mb-4 text-[34px] font-bold leading-[1.05] tracking-[-0.03em] text-white md:text-[48px] lg:text-[#0c0c0c]">
                Calculate your
                <br />
                potential <span className="text-[#cbfb45] lg:text-[#0c0c0c]/50">payouts</span>
              </h2>
              <p className="mb-2 max-w-sm text-[15px] leading-relaxed text-white/55 md:text-[17px] lg:mb-6 lg:text-[#0c0c0c]/70">
                Trade with our capital and keep up to 90% of the profits. See exactly how much you could take home.
              </p>
              <Link
                href="/challenges"
                className="group hidden items-center gap-2 rounded-full bg-[#cbfb45] px-6 py-3 text-[14px] font-semibold text-[#0c0c0c] shadow-[0_0_20px_rgba(203,251,69,0.3)] transition-all hover:bg-[#b5e03b] hover:shadow-[0_0_30px_rgba(203,251,69,0.5)] lg:inline-flex"
              >
                Start Trading Now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            {/* Calculator */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="w-full"
            >
              <div className="relative w-full overflow-hidden rounded-[1.5rem] border border-white/[0.08] bg-white/[0.03] p-6 md:p-8 lg:bg-[#0c0c0c] lg:shadow-2xl">
                {/* Subtle Top Glow */}
                <div className="pointer-events-none absolute left-1/2 top-0 h-24 w-[60%] -translate-x-1/2 bg-[#cbfb45] opacity-[0.05] blur-[40px]" />

                <div className="relative z-10 flex flex-col">
                  <span className="mb-6 text-[10px] font-bold uppercase tracking-[0.1em] text-white/40">
                    Calculator
                  </span>

                  {/* Challenge Selector (Custom Dropdown) */}
                  <div className="mb-8" ref={dropdownRef}>
                    <label className="mb-3 block text-[13px] font-medium text-white/80">
                      Account Size
                    </label>
                    <div className="relative">
                      <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex w-full items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 text-[24px] font-bold text-white transition-all hover:border-white/[0.15] focus:outline-none"
                      >
                        <span>${accountSize.toLocaleString("en-US")}</span>
                        <ChevronDown className={`h-5 w-5 text-white/40 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                      </button>

                      <AnimatePresence>
                        {isDropdownOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="absolute left-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-white/[0.08] bg-[#121212] shadow-2xl"
                          >
                            {ACCOUNT_SIZES.map((size) => (
                              <button
                                key={size.value}
                                onClick={() => {
                                  setAccountSize(size.value);
                                  setIsDropdownOpen(false);
                                }}
                                className={`flex w-full items-center justify-between px-5 py-3 text-left text-[18px] font-semibold transition-colors ${
                                  accountSize === size.value
                                    ? "bg-[#cbfb45]/10 text-[#cbfb45]"
                                    : "text-white/70 hover:bg-white/[0.05] hover:text-white"
                                }`}
                              >
                                ${size.label}
                                {accountSize === size.value && (
                                  <div className="h-1.5 w-1.5 rounded-full bg-[#cbfb45]" />
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
                    <div className="mb-3 flex items-end justify-between">
                      <label className="block text-[13px] font-medium text-white/80">
                        Your monthly profit
                      </label>
                      <span className="text-[20px] font-bold text-[#cbfb45]">
                        {profitRate}%
                      </span>
                    </div>

                    {/* Custom Range Slider */}
                    <div className="relative mt-1 h-1.5 w-full rounded-full bg-white/10">
                      <div
                        className="pointer-events-none absolute left-0 top-0 h-full rounded-full bg-[#cbfb45]"
                        style={{ width: `${fillPercentage}%` }}
                      />
                      <input
                        type="range"
                        min={1}
                        max={100}
                        step={1}
                        value={profitRate}
                        onChange={handleSliderChange}
                        className="absolute inset-0 z-20 h-full w-full cursor-pointer opacity-0"
                      />
                      {/* Custom Thumb */}
                      <div
                        className="pointer-events-none absolute top-1/2 z-10 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full border-[3px] border-[#0c0c0c] bg-[#cbfb45] shadow-[0_0_15px_rgba(203,251,69,0.5)] transition-transform"
                        style={{ left: `calc(${fillPercentage}% - 10px)` }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-[11px] font-medium text-white/30">
                      <span>1%</span>
                      <span>100%</span>
                    </div>
                  </div>

                  {/* Estimate Result — the hero of the stage */}
                  <div className="mb-4 border-t border-white/[0.08] pt-6">
                    <label className="mb-1 block text-[13px] font-medium text-white/80">
                      Your estimated payout (90% split)
                    </label>
                    <div className="text-[44px] font-bold tracking-tight text-white md:text-[48px]">
                      ${estimatedProfit.toLocaleString("en-US")}
                    </div>
                  </div>

                  {/* Footer Note */}
                  <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-white/30">
                    <span className="mt-0.5 text-[#cbfb45]">*</span>
                    Based on a 90% profit split.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Mobile CTA — anchors the stage */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="lg:hidden"
            >
              <Link
                href="/challenges"
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#cbfb45] px-6 py-4 text-[15px] font-semibold text-[#0c0c0c] shadow-[0_0_20px_rgba(203,251,69,0.3)] transition-all hover:bg-[#b5e03b] hover:shadow-[0_0_30px_rgba(203,251,69,0.5)]"
              >
                Start Trading Now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
