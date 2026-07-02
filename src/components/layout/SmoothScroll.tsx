"use client";

/**
 * EMERGENCY STABILIZATION — Lenis smooth scrolling is fully disabled.
 *
 * When this tree was first deployed to production, scrolling locked in
 * desktop browsers. On desktop, wheel input was routed through Lenis
 * (non-passive wheel listener + preventDefault, re-applied through a
 * GSAP-ticker-driven raf loop). Any failure in that pipeline consumes
 * wheel events without moving the page — a total scroll lock. Native
 * scrolling can never lock, so until the Lenis integration is
 * re-validated in a preview environment, this component intentionally
 * renders children without initializing Lenis or touching the GSAP
 * ticker.
 *
 * GSAP ScrollTrigger (pinned steps, word reveals) and all Framer Motion
 * animations work against native scrolling and are unaffected.
 *
 * To re-introduce smooth scrolling later: restore the Lenis init behind
 * the touch-capability guard from commit 6c62c7dd, and verify wheel
 * scrolling in a preview deployment BEFORE promoting to production.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
