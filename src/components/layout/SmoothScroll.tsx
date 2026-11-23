"use client";

import { useEffect } from "react";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (
      isMobileUserAgent ||
      window.innerWidth < 1024 ||
      window.matchMedia("(hover: none) and (pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) return;

    let active = true;
    let destroy: (() => void) | undefined;

    // Keep the optional desktop effect out of the initial page bundle.
    void import("lenis").then(({ default: Lenis }) => {
      if (!active) return;
      const lenis = new Lenis({
        autoRaf: true,
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
      });
      destroy = () => lenis.destroy();
    }).catch(() => {
      // Native scrolling remains available if the chunk cannot be loaded.
    });

    return () => {
      active = false;
      destroy?.();
    };
  }, []);

  return <>{children}</>;
}
