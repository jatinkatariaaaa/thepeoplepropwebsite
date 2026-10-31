"use client";

import { useCountdown } from "@/hooks/useCountdown";
import { cn } from "@/lib/utils";

interface Props {
  target?: string | Date;
  className?: string;
  variant?: "banner" | "block";
}

const labels = ["Days", "Hours", "Minutes", "Seconds"] as const;

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

export function CountdownTimer({
  target = "2026-08-01T00:00:00Z",
  className,
  variant = "banner",
}: Props) {
  const { days, hours, minutes, seconds } = useCountdown(target);
  const values = [days, hours, minutes, seconds];

  if (variant === "block") {
    return (
      <div className={cn("grid grid-cols-4 gap-3 md:gap-4", className)}>
        {values.map((v, i) => (
          <div
            key={labels[i]}
            className="rounded-xl border border-white/10 bg-white/[0.025] backdrop-blur-xl px-3 py-5 md:py-6 text-center"
          >
            <div className="font-display text-3xl md:text-5xl tabular-nums text-white">
              {pad(v)}
            </div>
            <div className="mt-2 text-[10px] md:text-xs uppercase tracking-[0.2em] text-white/50">
              {labels[i]}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 md:gap-6 tabular-nums",
        className,
      )}
    >
      {values.map((v, i) => (
        <div key={labels[i]} className="flex items-baseline gap-1.5">
          <span className="font-display text-2xl md:text-3xl text-white font-medium">
            {pad(v)}
          </span>
          <span className="text-[10px] md:text-xs uppercase tracking-[0.18em] text-white/45">
            {labels[i].slice(0, variant === "banner" ? 1 : 7)}
          </span>
          {i < 3 && <span className="ml-1 md:ml-3 text-white/20">·</span>}
        </div>
      ))}
    </div>
  );
}
