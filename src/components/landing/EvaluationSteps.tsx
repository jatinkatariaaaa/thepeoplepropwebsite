"use client";

import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
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

/* ────────────────────────────────────────────────────────
   Evaluation Steps — "Three steps from signup to funded"
   Glassmorphism panel with 3 horizontal step cards
   ──────────────────────────────────────────────────────── */

export function EvaluationSteps() {
  return (
    <section
      id="how"
      className="relative py-24 md:py-32 overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        {/* Header */}
        <div className="flex items-end justify-between gap-8 flex-wrap mb-14">
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

        {/* Glass panel */}
        <AnimatedSection>
          <div className="evalsteps-panel">
            <AnimatedSection stagger className="evalsteps-grid">
              {/* ─── STEP 01 ─── */}
              <AnimatedItem>
                <div className="evalsteps-card">
                  <div className="evalsteps-step-badge">Step 01</div>
                  <h3 className="evalsteps-card-title">
                    Pass the evaluation
                  </h3>
                  <p className="evalsteps-card-desc">
                    Complete the evaluation phase by meeting our simple and
                    transparent objectives.
                  </p>

                  <div className="evalsteps-bullets">
                    <div className="evalsteps-bullet">
                      <span className="evalsteps-bullet-icon evalsteps-icon-blue">
                        <Target size={16} strokeWidth={2} />
                      </span>
                      <div>
                        <div className="evalsteps-bullet-title">
                          Hit a 10% profit target
                        </div>
                        <div className="evalsteps-bullet-sub">
                          Reach and maintain a 10% profit target.
                        </div>
                      </div>
                    </div>

                    <div className="evalsteps-bullet">
                      <span className="evalsteps-bullet-icon evalsteps-icon-violet">
                        <ShieldCheck size={16} strokeWidth={2} />
                      </span>
                      <div>
                        <div className="evalsteps-bullet-title">
                          Respect 4% daily / 8% max drawdown
                        </div>
                        <div className="evalsteps-bullet-sub">
                          Stay within 4% daily and 8% overall drawdown limits.
                        </div>
                      </div>
                    </div>

                    <div className="evalsteps-bullet">
                      <span className="evalsteps-bullet-icon evalsteps-icon-amber">
                        <Clock size={16} strokeWidth={2} />
                      </span>
                      <div>
                        <div className="evalsteps-bullet-title">
                          Minimum 3 trading days, no time limit
                        </div>
                        <div className="evalsteps-bullet-sub">
                          Trade for at least 3 days. There&apos;s no time limit.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="evalsteps-card-footer">
                    <Zap size={14} className="evalsteps-footer-icon" />
                    <div>
                      <div className="evalsteps-footer-bold">
                        No rush. No pressure.
                      </div>
                      <div className="evalsteps-footer-sub">
                        Trade your way. Pass the evaluation on your terms.
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedItem>

              {/* ─── STEP 02 ─── */}
              <AnimatedItem>
                <div className="evalsteps-card">
                  <div className="evalsteps-step-badge">
                    Step 02
                  </div>
                  <h3 className="evalsteps-card-title">
                    Unlock funded account
                  </h3>

                  <div className="evalsteps-stats-grid">
                    <div className="evalsteps-stat">
                      <span className="evalsteps-stat-icon">
                        <KeyRound size={18} strokeWidth={1.8} />
                      </span>
                      <div className="evalsteps-stat-label">
                        Account credentials
                      </div>
                      <div className="evalsteps-stat-value">
                        In under 24 hours
                      </div>
                    </div>

                    <div className="evalsteps-stat">
                      <span className="evalsteps-stat-icon">
                        <DollarSign size={18} strokeWidth={1.8} />
                      </span>
                      <div className="evalsteps-stat-label">
                        Up to $200,000
                      </div>
                      <div className="evalsteps-stat-value">
                        In scaled capital
                      </div>
                    </div>

                    <div className="evalsteps-stat">
                      <span className="evalsteps-stat-icon">
                        <ShieldCheck size={18} strokeWidth={1.8} />
                      </span>
                      <div className="evalsteps-stat-label">Same rules</div>
                      <div className="evalsteps-stat-value">
                        No daily target pressure
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedItem>

              {/* ─── STEP 03 ─── */}
              <AnimatedItem>
                <div className="evalsteps-card">
                  <div className="evalsteps-step-badge">
                    Step 03
                  </div>
                  <h3 className="evalsteps-card-title">
                    Trade &amp; get paid
                  </h3>
                  <p className="evalsteps-card-desc">
                    Trade consistently and receive your payouts fast, secure, and
                    hassle-free.
                  </p>

                  <div className="evalsteps-bullets">
                    <div className="evalsteps-bullet">
                      <span className="evalsteps-bullet-icon evalsteps-icon-blue">
                        <CalendarCheck size={16} strokeWidth={2} />
                      </span>
                      <div>
                        <div className="evalsteps-bullet-title">
                          First payout 14 days
                        </div>
                        <div className="evalsteps-bullet-sub">
                          Receive your first payout 14 days after your first
                          trade.
                        </div>
                      </div>
                    </div>

                    <div className="evalsteps-bullet">
                      <span className="evalsteps-bullet-icon evalsteps-icon-violet">
                        <Percent size={16} strokeWidth={2} />
                      </span>
                      <div>
                        <div className="evalsteps-bullet-title">
                          Up to 90% profit split
                        </div>
                        <div className="evalsteps-bullet-sub">
                          Keep up to 90% of the profits. Paid out bi-weekly.
                        </div>
                      </div>
                    </div>

                    <div className="evalsteps-bullet">
                      <span className="evalsteps-bullet-icon evalsteps-icon-amber">
                        <RotateCcw size={16} strokeWidth={2} />
                      </span>
                      <div>
                        <div className="evalsteps-bullet-title">
                          100% refund on payout #1
                        </div>
                        <div className="evalsteps-bullet-sub">
                          We refund 100% of your challenge fee with your first
                          payout.
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="evalsteps-card-footer">
                    <CheckCircle2
                      size={14}
                      className="evalsteps-footer-icon"
                    />
                    <div>
                      <div className="evalsteps-footer-bold">
                        Trade. Get paid. Repeat.
                      </div>
                      <div className="evalsteps-footer-sub">
                        Simple process. Fast payouts. Total transparency.
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedItem>
            </AnimatedSection>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}