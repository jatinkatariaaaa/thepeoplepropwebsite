"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Disable Lenis on ANY touch-capable device, not only devices whose
    // PRIMARY input is touch. The previous guard,
    //   (hover: none) and (pointer: coarse)
    // only describes the primary pointer. Hybrid-input Android devices
    // (S-Pen hover, Samsung DeX, paired mouse/keyboard, some OEM
    // browsers/WebViews) report `hover: hover` or `pointer: fine`, so the
    // guard failed there: Lenis initialized on a touch device, its
    // document-level non-passive wheel/touch listeners plus the GSAP-ticker
    // driven raf loop kept re-writing the scroll position, and native touch
    // scrolling appeared completely locked (wheel and window.scrollTo still
    // worked). Native scrolling must always win on touch hardware; Lenis is
    // a wheel-only enhancement for pure mouse environments.
    const isTouchCapable =
      window.matchMedia("(any-hover: none), (any-pointer: coarse)").matches ||
      navigator.maxTouchPoints > 0 ||
      "ontouchstart" in window;

    if (isTouchCapable) {
      return;
    }

    // Initialize Lenis
    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    // Synchronize Lenis with GSAP ScrollTrigger updates
    lenis.on("scroll", () => {
      ScrollTrigger.update();
    });

    // Synchronize updates with GSAP's central rendering loop (ticker)
    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };
    
    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
