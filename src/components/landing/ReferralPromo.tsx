"use client";

import { Button } from "@/components/ui/Button";
import { Gift, Users, TrendingUp, ArrowUpRight } from "lucide-react";

export function ReferralPromo() {
  return (
    <section className="relative py-12 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.85fr] gap-6 lg:gap-8 items-stretch">
          {/* Left — pitch */}
          <div className="rounded-2xl bg-[var(--ink-950)] text-white p-8 md:p-12 relative overflow-hidden">

            <div className="flex items-center gap-2 chip !bg-white/10 !border-white/15 !text-white/85 mb-6">
              <Gift className="w-3.5 h-3.5 text-[var(--accent-400)]" strokeWidth={2.2} />
              Founders&apos; Referral
            </div>

            <h2 className="font-medium text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.02] tracking-[-0.025em] max-w-2xl">
              Refer traders.{" "}
              <span className="word-serif">Earn forever</span>.
            </h2>
            <p className="mt-5 max-w-lg text-[15px] text-white/65 leading-relaxed">
              Earn a 15% lifetime commission on every challenge bought through
              your link. Top 10 referrers at launch get a guaranteed $25,000
              funded account — no evaluation required.
            </p>

            <div className="mt-9 grid grid-cols-3 gap-4 max-w-md">
              {[
                { v: "15%", l: "Lifetime" },
                { v: "$25K", l: "Top 10 bonus" },
                { v: "24h", l: "Payouts" },
              ].map((s) => (
                <div key={s.l}>
                  <p className="font-medium text-[24px] tabular-nums tracking-tight text-white">
                    {s.v}
                  </p>
                  <p className="text-[11px] tracking-eyebrow text-white/45 mt-1">
                    {s.l}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-9 flex flex-wrap gap-3">
              <Button
                href="/referral"
                className="bg-[var(--accent)] !text-white hover:!bg-[var(--accent-700)]"
                size="lg"
                style={{ boxShadow: "0 16px 40px -12px rgba(37,99,235,0.25)" }}
              >
                Open Referral Dashboard
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Right — sample stats card */}
          <div className="surface-elevated p-7 md:p-8 flex flex-col">
            <p className="text-[11px] tracking-eyebrow text-[var(--ink-400)] mb-2">
              Sample Referral Stats
            </p>
            <h3 className="font-medium text-[22px] tracking-tight text-[var(--ink-950)] mb-6">
              What top referrers earn
            </h3>

            <ul className="flex-1 divide-y divide-[var(--border)]">
              {[
                {
                  icon: Users,
                  label: "Referred traders",
                  value: "47",
                  sub: "this month",
                },
                {
                  icon: TrendingUp,
                  label: "Conversion rate",
                  value: "31.8%",
                  sub: "vs 18% average",
                },
                {
                  icon: Gift,
                  label: "Commissions earned",
                  value: "$2,184",
                  sub: "lifetime · paid",
                  accent: true,
                },
              ].map((row) => (
                <li key={row.label} className="py-4 flex items-center gap-4">
                  <span className="grid place-items-center w-10 h-10 rounded-xl bg-[var(--paper-2)] text-[var(--ink-600)]">
                    <row.icon className="w-4 h-4" strokeWidth={2.2} />
                  </span>
                  <div className="flex-1">
                    <p className="text-[13px] text-[var(--ink-500)]">
                      {row.label}
                    </p>
                    <p className="text-[11px] tracking-eyebrow text-[var(--ink-400)]">
                      {row.sub}
                    </p>
                  </div>
                  <p
                    className={`font-medium text-[18px] tabular-nums ${
                      row.accent
                        ? "text-[var(--success-700)]"
                        : "text-[var(--ink-950)]"
                    }`}
                  >
                    {row.value}
                  </p>
                </li>
              ))}
            </ul>

            <div className="mt-5 pt-5 border-t border-[var(--border)] flex items-center gap-3 text-[12px] text-[var(--ink-500)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] pulse-dot" />
              Live ranking · Updated every 6 hours
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}