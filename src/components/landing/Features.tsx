"use client";

import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import { SectionHeading } from "@/components/ui/SectionHeading";

/* ────────────────────────────────────────────────────────
   Features Section — Trader's Journey Case Study
   Glassmorphism timeline panel with horizontal steps
   ──────────────────────────────────────────────────────── */

const steps = [
  {
    date: "Aug 12",
    label: ["Evaluation", "Purchased"],
    value: (
      <span className="tjourney-price">
        <span className="tjourney-currency">$</span>309
      </span>
    ),
    caption: "$50K 1-Step Evaluation",
  },
  {
    date: "Aug 18",
    label: ["Target hit", "6 trading days"],
    value: <span className="tjourney-price">+10%</span>,
    caption: (
      <>
        Status: <span className="tjourney-clear">✓ Passed</span>
      </>
    ),
  },
  {
    date: "Aug 19",
    label: ["Account funded", "Next-day activation"],
    value: (
      <span className="tjourney-funded">
        <span className="tjourney-check">✓</span> Funded
      </span>
    ),
    caption: "$50K live account issued",
  },
  {
    date: "Sep 3",
    label: ["First payout in", "14 days after funded"],
    value: (
      <span className="tjourney-price tjourney-green">
        <span className="tjourney-currency tjourney-currency-green">$</span>
        3,280<span className="tjourney-cents">.50</span>
      </span>
    ),
    caption: "Via USDT in 11 hrs",
  },
];

export function Features() {
  return (
    <section
      id="features"
      className="relative py-8 md:py-12 overflow-hidden"
    >
      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <AnimatedSection>
          {/* Glass panel */}
          <div className="tjourney-panel">
            {/* Header */}
            <div className="tjourney-header">
              <div>
                <SectionHeading
                  eyebrow="Built For Real Traders"
                  title={
                    <>
                      Trader&apos;s{" "}
                      <span className="word-serif">Journey</span>
                    </>
                  }
                  size="lg"
                  className="mb-4 md:mb-6"
                />
                <p className="tjourney-subtitle">
                  Case study <span className="tjourney-dot">•</span> 12 Aug
                  <span className="tjourney-arrow">→</span> 3 Sep
                  <span className="tjourney-dot">•</span> $50K 1-Step
                </p>
              </div>

              {/* Review card */}
              <AnimatedItem variant="slideRight">
                <div className="tjourney-review-card">
                  <div className="tjourney-stars">★★★★★</div>
                  <p className="tjourney-review-text">
                    Scaling plan got me from 25K to 75K in 8 months. The whole experience feels premium.
                    <br />
                    <b>Daniel P.</b>
                  </p>
                </div>
              </AnimatedItem>
            </div>

            {/* Timeline grid */}
            <AnimatedSection stagger className="tjourney-content">
              {steps.map((step, i) => (
                <AnimatedItem key={i}>
                  <div className="tjourney-step">
                    <div className="tjourney-date">{step.date}</div>
                    <div className="tjourney-label">
                      {step.label[0]}
                      <br />
                      {step.label[1]}
                    </div>
                    <div>{step.value}</div>
                    <div className="tjourney-caption">{step.caption}</div>
                  </div>
                </AnimatedItem>
              ))}

              {/* Reward card */}
              <AnimatedItem variant="scale">
                <div className="tjourney-reward-card">
                  <div className="tjourney-reward-total">7 Total Payouts</div>
                  <div className="tjourney-reward-percent">3,890%</div>
                  <div className="tjourney-reward-growth">
                    <span className="tjourney-growth-from">$309</span>
                    <span className="tjourney-growth-arrow">→</span>
                    <span className="tjourney-growth-to">$12,018</span>
                  </div>
                  <div className="tjourney-reward-divider" />
                  <a
                    href="./challenges.html"
                    className="tjourney-buy-btn"
                  >
                    Start Your Challenge
                  </a>
                </div>
              </AnimatedItem>
            </AnimatedSection>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}