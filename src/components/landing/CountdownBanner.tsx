"use client";

import { useCountdown } from "@/hooks/useCountdown";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function CountdownBanner() {
  const { days, hours, minutes, seconds } = useCountdown("2026-08-01T00:00:00Z");
  const items = [
    { v: days, l: "Days" },
    { v: hours, l: "Hours" },
    { v: minutes, l: "Min" },
    { v: seconds, l: "Sec" },
  ];

  return (
    <section className="relative -mt-2 mb-4 md:mb-0">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div
          className="relative rounded-2xl border border-[var(--border)] bg-white overflow-hidden"
          style={{ boxShadow: "var(--shadow-md)" }}
        >
          {/* ❌ Yahan se Left/Right wali patti (stripe) ka code hata diya gaya hai ❌ */}
          
          <div className="relative px-5 md:px-8 py-5 md:py-6 flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-3">
              <span className="grid place-items-center w-10 h-10 rounded-full bg-[var(--accent)] text-white shrink-0">
                <Calendar className="w-4 h-4" strokeWidth={2.2} />
              </span>
              <div>
                <p className="text-[11px] tracking-eyebrow text-[var(--ink-500)] mb-0.5">
                  Guaranteed free evaluation
                </p>
                <p className="text-[15px] font-medium text-[var(--ink-950)]">
                  Prizes on 1 August 2026
                </p>
              </div>
            </div>

            <ul className="flex items-center gap-3 md:gap-5 tabular-nums">
              {items.map((it) => (
                <li
                  key={it.l}
                  className="flex flex-col items-center min-w-[44px]"
                >
                  <span className="font-medium text-[22px] md:text-[26px] leading-none text-[var(--ink-950)]">
                    {pad(it.v)}
                  </span>
                  <span className="mt-1 text-[10px] tracking-eyebrow text-[var(--ink-400)]">
                    {it.l}
                  </span>
                </li>
              ))}
            </ul>

            <Button
              href="/challenges"
              variant="primary"
              size="md"
              className="hidden md:inline-flex"
            >
              Reserve My Spot
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}