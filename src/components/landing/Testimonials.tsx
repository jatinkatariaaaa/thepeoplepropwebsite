"use client";

import { useEffect, useRef, useCallback } from "react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle2 } from "lucide-react";
import { testimonialsExtended, type Testimonial } from "@/data/testimonials";

/* ═══════════════════════════════════════════════════════════════
   Testimonials — Scroll-Accelerated Infinite Marquee
   
   3 rows of glass cards drifting at different speeds.
   Scroll velocity boosts drift speed with smooth decay.
   Each row has cards + clones for seamless infinite loop.
   ═══════════════════════════════════════════════════════════════ */

/* Split testimonials into 3 rows of 7 */
const row1 = testimonialsExtended.slice(0, 7);
const row2 = testimonialsExtended.slice(7, 14);
const row3 = testimonialsExtended.slice(14, 21);

function TestimonialCard({ t, isClone = false }: { t: Testimonial; isClone?: boolean }) {
  return (
    <article
      className="testimonial-glass-card"
      aria-hidden={isClone ? "true" : undefined}
    >
      <div className="flex items-center gap-3 mb-2.5">
        {/* Initials avatar */}
        <div className="w-[36px] h-[36px] rounded-full bg-[var(--ink-950)] text-white text-[12px] font-medium tracking-wide flex items-center justify-center shrink-0">
          {t.initials}
        </div>
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-[var(--ink-950)] whitespace-nowrap overflow-hidden text-ellipsis">
            {t.name}
          </p>
          <p className="text-[13px] text-[var(--ink-400)] whitespace-nowrap overflow-hidden text-ellipsis">
            {t.handle} · {t.location}
          </p>
        </div>
      </div>
      <p className="text-[13px] leading-[1.5] text-[var(--ink-600)] line-clamp-2" title={t.body}>
        &ldquo;{t.body}&rdquo;
      </p>
      <div className="mt-2.5 flex items-center justify-between">
        <Badge variant="success" className="!gap-1 !text-[10px] !py-0.5 !px-1.5">
          <CheckCircle2 className="w-3 h-3" strokeWidth={2.5} />
          {t.payout}
        </Badge>
        <span className="text-[11px] tracking-[0.08em] uppercase text-[var(--ink-300)] font-medium">
          Verified
        </span>
      </div>
    </article>
  );
}

function MarqueeRow({
  items,
  direction,
  speed,
  className = "",
}: {
  items: Testimonial[];
  direction: number;
  speed: number;
  className?: string;
}) {
  return (
    <div
      className={`marquee-row flex gap-5 md:gap-6 will-change-transform ${className}`}
      data-direction={direction}
      data-speed={speed}
    >
      {/* Original set */}
      {items.map((t) => (
        <TestimonialCard key={t.handle} t={t} />
      ))}
      {/* Clone set for seamless loop */}
      {items.map((t) => (
        <TestimonialCard key={`clone-${t.handle}`} t={t} isClone />
      ))}
    </div>
  );
}

export function Testimonials() {
  const hostRef = useRef<HTMLDivElement>(null);

  /* ── Marquee engine (ported from engine.js) ── */
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    const host = hostRef.current;
    if (!host) return;

    const rows = host.querySelectorAll<HTMLDivElement>(".marquee-row");
    if (!rows.length) return;
    let rafId: number | null = null;

    type RowState = {
      el: HTMLDivElement;
      dir: number;
      baseSpeed: number;
      halfWidth: number;
      pos: number;
      paused: boolean;
    };

    const rowState: RowState[] = [];

    rows.forEach((row) => {
      const dir = parseFloat(row.dataset.direction || "1");
      const baseSpeed = parseFloat(row.dataset.speed || "0.35");
      const halfWidth = row.scrollWidth / 2;

      const state: RowState = {
        el: row,
        dir,
        baseSpeed,
        halfWidth,
        pos: dir > 0 ? 0 : -halfWidth,
        paused: false,
      };

      rowState.push(state);

      row.addEventListener("mouseenter", () => { state.paused = true; });
      row.addEventListener("mouseleave", () => { state.paused = false; });
    });

    function tick() {
      for (const s of rowState) {
        if (s.paused) continue;

        const speed = s.baseSpeed * s.dir;
        s.pos += speed;

        if (s.dir > 0 && s.pos >= 0) {
          s.pos -= s.halfWidth;
        } else if (s.dir < 0 && s.pos <= -s.halfWidth) {
          s.pos += s.halfWidth;
        }

        s.el.style.transform = `translate3d(${s.pos.toFixed(2)}px, 0, 0)`;
      }

      rafId = requestAnimationFrame(tick);
    }

    function recalcWidths() {
      rowState.forEach((s) => {
        s.halfWidth = s.el.scrollWidth / 2;
      });
    }

    // Start after a short delay for layout
    const timer = setTimeout(() => {
      recalcWidths();
      rafId = requestAnimationFrame(tick);
    }, 100);

    let resizeTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(recalcWidths, 200);
    };
    window.addEventListener("resize", onResize);

    const onMotionChange = (e: MediaQueryListEvent) => {
      if (e.matches && rafId) {
        cancelAnimationFrame(rafId);
        rows.forEach((r) => { r.style.transform = "none"; });
      }
    };
    mq.addEventListener("change", onMotionChange);

    return () => {
      clearTimeout(timer);
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      mq.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <section
      className="relative w-full py-12 md:py-32 lg:py-40 overflow-hidden"
      aria-label="Trader Testimonials"
    >
      {/* Dot-grid background */}
      <div className="testimonial-dot-grid absolute inset-0 pointer-events-none" aria-hidden="true" />

      {/* Section Header */}
      <header className="relative z-10 max-w-xl mx-auto text-center px-6 mb-16 md:mb-20 lg:mb-24">
        <SectionHeading
          eyebrow="Trader Voices"
          title={
            <>
              Real <span className="word-serif">payouts</span>.
              <br />
              Real reviews.
            </>
          }
          description="Every testimonial below is from a verified TPP trader, with a verified payout receipt."
          align="center"
        />
      </header>

      {/* Marquee Rows */}
      <div className="relative z-[1]" ref={hostRef}>
        <MarqueeRow items={row1} direction={1} speed={0.35} className="mb-5 md:mb-6" />
        <MarqueeRow items={row2} direction={-1} speed={0.4} className="mb-5 md:mb-6" />
        <MarqueeRow items={row3} direction={1} speed={0.3} />

        {/* Edge fade masks (removed white gradients for global bg compatibility) */}
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-24 sm:w-36 md:w-48 lg:w-56 z-10"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-24 sm:w-36 md:w-48 lg:w-56 z-10"
          aria-hidden="true"
        />
      </div>
    </section>
  );
}