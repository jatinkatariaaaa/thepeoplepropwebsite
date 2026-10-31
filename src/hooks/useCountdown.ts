"use client";

import { useEffect, useMemo, useState } from "react";

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function compute(target: Date): Countdown {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds, expired: false };
}

const ZERO: Countdown = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  expired: false,
};

/**
 * Returns a live countdown to the given ISO target. Defaults to TPP launch.
 */
export function useCountdown(target: string | Date = "2026-07-01T00:00:00Z") {
  const targetDate = useMemo(
    () => (typeof target === "string" ? new Date(target) : target),
    [target],
  );
  // Initialize to a stable zero state to avoid hydration mismatches and
  // synchronous setState within an effect body. The effect schedules the
  // first compute via requestAnimationFrame.
  const [time, setTime] = useState<Countdown>(ZERO);

  useEffect(() => {
    let raf = 0;
    let id: ReturnType<typeof setInterval> | undefined;
    raf = requestAnimationFrame(() => {
      setTime(compute(targetDate));
      id = setInterval(() => setTime(compute(targetDate)), 1000);
    });
    return () => {
      cancelAnimationFrame(raf);
      if (id) clearInterval(id);
    };
  }, [targetDate]);

  return time;
}
