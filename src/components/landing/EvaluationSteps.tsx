"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import {
  ArrowRight,
  Target,
  ShieldCheck,
  Clock,
  KeyRound,
  Banknote,
  CalendarCheck,
  Percent,
  RotateCcw,
  Zap,
  DollarSign,
  CheckCircle2,
} from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export function EvaluationSteps() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const trigger = triggerRef.current;
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
    const totalCards = cards.length;

    if (!trigger || totalCards === 0) return;

    // Set initial positions: first card visible, rest below
    gsap.set(cards[0], { yPercent: 0, scale: 1, rotation: 0, opacity: 1 });
    for (let i = 1; i < totalCards; i++) {
      gsap.set(cards[i], { yPercent: 120, scale: 1, rotation: 0, opacity: 1 });
    }

    // Build the scroll-driven timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: trigger,
        start: "top top",
        end: () => `+=${window.innerHeight * (totalCards - 1)}`,
        pin: true,
        scrub: 1,
        pinSpacing: true,
        invalidateOnRefresh: true,
      },
    });

    for (let i = 0; i < totalCards - 1; i++) {
      // Current card shrinks and rotates slightly
      tl.to(
        cards[i],
        {
          scale: 0.9,
          rotation: -2,
          yPercent: -5,
          opacity: 0.6,
          duration: 1,
          ease: "none",
          force3D: true,
        },
        i,
      );

      // Next card slides up into view
      tl.to(
        cards[i + 1],
        {
          yPercent: 0,
          duration: 1,
          ease: "none",
          force3D: true,
        },
        i,
      );
    }

    const ro = new ResizeObserver(() => ScrollTrigger.refresh());
    if (sectionRef.current) ro.observe(sectionRef.current);

    return () => {
      ro.disconnect();
      tl.kill();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <section ref={sectionRef} id="how" className="relative overflow-hidden z-10 pt-12 md:pt-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8 mb-8 md:mb-16">
        {/* Header */}
        <div className="flex items-end justify-between gap-8 flex-wrap">
          <SectionHeading
            eyebrow="How It Works"
            title={
              <>
                Three steps from
                <br />
                signup to <span className="word-serif">funded</span>.
              </>
            }
            description="No second phases. No 60-day clocks. No hidden gotchas. Just trade — and get paid."
          />
          <Button
            href="./rules.html"
            variant="outline"
            className="hidden md:inline-flex"
          >
            Read the full rules
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Pinned Scroll Container */}
      <div ref={triggerRef} className="relative flex items-center justify-center w-full" style={{ height: "100vh" }}>
        
        {/* Absolute Wrapper for the 3 Cards */}
        <div className="relative w-full max-w-lg md:max-w-xl lg:max-w-2xl px-5 h-full max-h-[650px] md:max-h-[500px]">
          
          {/* ─── STEP 01 ─── */}
          <div 
            ref={(el) => { cardRefs.current[0] = el; }}
            className="absolute top-0 left-0 w-full h-full will-change-transform px-5"
          >
            <div className="evalsteps-card h-full bg-white/90 backdrop-blur-2xl shadow-2xl rounded-[32px] border border-slate-200">
              <div className="evalsteps-step-badge">Step 01</div>
              <h3 className="evalsteps-card-title">Pass the evaluation</h3>
              <p className="evalsteps-card-desc">
                Complete the evaluation phase by meeting our simple and transparent objectives.
              </p>

              <div className="evalsteps-bullets">
                <div className="evalsteps-bullet">
                  <span className="evalsteps-bullet-icon evalsteps-icon-blue">
                    <Target size={16} strokeWidth={2} />
                  </span>
                  <div>
                    <div className="evalsteps-bullet-title">Hit a 10% profit target</div>
                    <div className="evalsteps-bullet-sub">Reach and maintain a 10% profit target.</div>
                  </div>
                </div>

                <div className="evalsteps-bullet">
                  <span className="evalsteps-bullet-icon evalsteps-icon-violet">
                    <ShieldCheck size={16} strokeWidth={2} />
                  </span>
                  <div>
                    <div className="evalsteps-bullet-title">Respect 4% daily / 8% max drawdown</div>
                    <div className="evalsteps-bullet-sub">Stay within 4% daily and 8% overall drawdown limits.</div>
                  </div>
                </div>

                <div className="evalsteps-bullet">
                  <span className="evalsteps-bullet-icon evalsteps-icon-amber">
                    <Clock size={16} strokeWidth={2} />
                  </span>
                  <div>
                    <div className="evalsteps-bullet-title">Minimum 3 trading days, no time limit</div>
                    <div className="evalsteps-bullet-sub">Trade for at least 3 days. There&apos;s no time limit.</div>
                  </div>
                </div>
              </div>

              <div className="evalsteps-card-footer mt-auto">
                <Zap size={14} className="evalsteps-footer-icon" />
                <div>
                  <div className="evalsteps-footer-bold">No rush. No pressure.</div>
                  <div className="evalsteps-footer-sub">Trade your way. Pass the evaluation on your terms.</div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── STEP 02 ─── */}
          <div 
            ref={(el) => { cardRefs.current[1] = el; }}
            className="absolute top-0 left-0 w-full h-full will-change-transform px-5"
          >
            <div className="evalsteps-card h-full bg-white/90 backdrop-blur-2xl shadow-2xl rounded-[32px] border border-slate-200">
              <div className="evalsteps-step-badge">Step 02</div>
              <h3 className="evalsteps-card-title">Unlock funded account</h3>
              <p className="evalsteps-card-desc mb-6">
                Receive your live credentials quickly and start trading real capital.
              </p>

              <div className="evalsteps-stats-grid">
                <div className="evalsteps-stat">
                  <span className="evalsteps-stat-icon">
                    <KeyRound size={18} strokeWidth={1.8} />
                  </span>
                  <div className="evalsteps-stat-label">Account credentials</div>
                  <div className="evalsteps-stat-value">In under 24 hours</div>
                </div>

                <div className="evalsteps-stat">
                  <span className="evalsteps-stat-icon">
                    <DollarSign size={18} strokeWidth={1.8} />
                  </span>
                  <div className="evalsteps-stat-label">Up to $200,000</div>
                  <div className="evalsteps-stat-value">In scaled capital</div>
                </div>

                <div className="evalsteps-stat">
                  <span className="evalsteps-stat-icon">
                    <ShieldCheck size={18} strokeWidth={1.8} />
                  </span>
                  <div className="evalsteps-stat-label">Same rules</div>
                  <div className="evalsteps-stat-value">No daily target pressure</div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── STEP 03 ─── */}
          <div 
            ref={(el) => { cardRefs.current[2] = el; }}
            className="absolute top-0 left-0 w-full h-full will-change-transform px-5"
          >
            <div className="evalsteps-card h-full bg-white/90 backdrop-blur-2xl shadow-2xl rounded-[32px] border border-slate-200">
              <div className="evalsteps-step-badge">Step 03</div>
              <h3 className="evalsteps-card-title">Trade &amp; get paid</h3>
              <p className="evalsteps-card-desc">
                Trade consistently and receive your payouts fast, secure, and hassle-free.
              </p>

              <div className="evalsteps-bullets">
                <div className="evalsteps-bullet">
                  <span className="evalsteps-bullet-icon evalsteps-icon-blue">
                    <CalendarCheck size={16} strokeWidth={2} />
                  </span>
                  <div>
                    <div className="evalsteps-bullet-title">First payout 14 days</div>
                    <div className="evalsteps-bullet-sub">Receive your first payout 14 days after your first trade.</div>
                  </div>
                </div>

                <div className="evalsteps-bullet">
                  <span className="evalsteps-bullet-icon evalsteps-icon-violet">
                    <Percent size={16} strokeWidth={2} />
                  </span>
                  <div>
                    <div className="evalsteps-bullet-title">Up to 90% profit split</div>
                    <div className="evalsteps-bullet-sub">Keep up to 90% of the profits. Paid out bi-weekly.</div>
                  </div>
                </div>

                <div className="evalsteps-bullet">
                  <span className="evalsteps-bullet-icon evalsteps-icon-amber">
                    <RotateCcw size={16} strokeWidth={2} />
                  </span>
                  <div>
                    <div className="evalsteps-bullet-title">100% refund on payout #1</div>
                    <div className="evalsteps-bullet-sub">We refund 100% of your challenge fee with your first payout.</div>
                  </div>
                </div>
              </div>

              <div className="evalsteps-card-footer mt-auto">
                <CheckCircle2 size={14} className="evalsteps-footer-icon" />
                <div>
                  <div className="evalsteps-footer-bold">Trade. Get paid. Repeat.</div>
                  <div className="evalsteps-footer-sub">Simple process. Fast payouts. Total transparency.</div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}