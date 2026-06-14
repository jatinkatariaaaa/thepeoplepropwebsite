"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { ArrowUpRight } from "lucide-react";

const columns: {
  title: string;
  links: { label: string; href: string; external?: boolean }[];
}[] = [
  {
    title: "Product",
    links: [
      { label: "Challenges", href: "/challenges" },
      { label: "Rules", href: "/rules" },
      { label: "Referral program", href: "/referral" },
      { label: "Sign in", href: "/login" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About TPP", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Press", href: "/press" },
      { label: "Affiliate", href: "/referral" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help center", href: "/help" },
      { label: "Trading hours", href: "/rules" },
      { label: "Status", href: "/status" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
      { label: "Cookie policy", href: "/cookie" },
      { label: "Risk disclosure", href: "/risk-disclosure" },
      { label: "AML policy", href: "/aml-policy" },
    ],
  },
];

const payments = [
  "Visa",
  "Mastercard",
  "AmEx",
  "USDT",
  "BTC",
  "ETH",
  "Wise",
  "Bank Wire",
];

export function Footer() {
  return (
    <footer className="relative">
      {/* ── Big dual-CTA panel ── */}
      <div className="mx-auto max-w-7xl px-5 md:px-8 pb-12 md:pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Giveaway card */}
          <div className="rounded-2xl bg-[var(--ink-950)] text-white p-7 md:p-9 relative overflow-hidden">
            <p className="text-[11px] tracking-eyebrow text-[var(--accent-400)] mb-3">
              Monthly Giveaway
            </p>
            <h3 className="font-medium text-[26px] md:text-[30px] leading-[1.1] tracking-tight max-w-md">
              Win a $25,000 funded account.{" "}
              <span className="word-serif text-white/85">Every month.</span>
            </h3>
            <form
              className="mt-6 flex flex-col sm:flex-row gap-2 max-w-md"
              action="#"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                required
                placeholder="you@trading.com"
                className="flex-1 h-11 rounded-full bg-white/10 border border-white/15 px-4 text-[14px] text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--accent-400)]"
              />
              <button
                type="submit"
                className="h-11 px-5 rounded-full bg-[var(--accent)] text-white text-[14px] font-medium hover:bg-[var(--accent-700)] transition-colors"
              >
                Enter draw
              </button>
            </form>
            <p className="mt-3 text-[11.5px] text-white/45">
              One entry per email · drawn the 1st of every month
            </p>
          </div>

          {/* Discord card */}
          <div className="rounded-2xl bg-[var(--accent-50)] border border-[var(--accent-200)] p-7 md:p-9 relative overflow-hidden">
            <p className="text-[11px] tracking-eyebrow text-[var(--ink-700)] mb-3">
              Live Community
            </p>
            <h3 className="font-medium text-[26px] md:text-[30px] leading-[1.1] tracking-tight text-[var(--ink-950)] max-w-md">
              Join 14,000+ funded traders on{" "}
              <span className="word-serif">Discord.</span>
            </h3>
            <p className="mt-3 text-[14px] text-[var(--ink-700)] max-w-md leading-relaxed">
              Daily trade reviews, live payout drops, weekly setups from
              top-tier traders. Voice channels open 24/5.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-flex items-center gap-2 h-11 px-5 rounded-full bg-[var(--ink-950)] text-white text-[14px] font-medium hover:bg-[var(--ink-900)] transition-colors"
            >
              Join Discord
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main dark footer panel ── */}
      <div className="bg-[var(--ink-950)] text-white">
        <div className="mx-auto max-w-7xl px-5 md:px-8 pt-16 md:pt-20 pb-10">
          {/* Big tagline */}
          <div className="border-b border-white/10 pb-12 md:pb-16">
            <p className="text-[11px] tracking-eyebrow text-white/45 mb-5">
              The People Prop · Est. 2026
            </p>
            <h2 className="font-medium text-[clamp(2rem,5.5vw,4.5rem)] leading-[0.98] tracking-[-0.03em] max-w-4xl">
              Make money trading
              <br />
              our <span className="word-serif text-white">capital</span>.
            </h2>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 md:gap-10 py-12 md:py-14">
            <div className="col-span-2 md:col-span-1">
              <Logo invert />
              <p className="mt-4 text-[13px] text-white/55 leading-relaxed max-w-xs">
                A proprietary trading firm built by traders, for traders.
                Regulated execution. Fair rules. Real payouts.
              </p>
            </div>

            {columns.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <p className="text-[11px] tracking-eyebrow text-white/45 mb-4">
                  {col.title}
                </p>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="text-[14px] text-white/80 hover:text-white transition-colors"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          {/* Payments + legal */}
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row gap-6 md:items-center md:justify-between">
            <ul className="flex flex-wrap items-center gap-2">
              {payments.map((p) => (
                <li
                  key={p}
                  className="px-2.5 py-1 rounded-md border border-white/12 bg-white/[0.04] text-[10.5px] tracking-[0.06em] uppercase text-white/65"
                >
                  {p}
                </li>
              ))}
            </ul>
            <p className="text-[11.5px] text-white/45">
              © 2026 The People Prop. All rights reserved.
            </p>
          </div>

          <div className="mt-8 border-t border-white/10 pt-6 text-[11px] text-white/40 space-y-4.5 max-w-5xl leading-relaxed">
            <p>
              <strong>Risk Disclosure & Terms:</strong> Trading leveraged financial instruments, including Forex, Cryptocurrencies, and CFDs, carries a high level of risk and may not be suitable for all investors. The high degree of leverage can work against you as well as for you. Before deciding to trade, you should carefully consider your investment objectives, level of experience, and risk appetite.
            </p>
            <p>
              <strong>Evaluation Platform Notice:</strong> The People Prop provides simulated trading accounts and educational challenges designed to evaluate a trader&apos;s skills. All accounts provided to users during the evaluation phase and funded stages are completely simulated capital in a demo environment. No live trading accounts are issued, and no real funds are risked. The physical execution is mapped via liquidity pools for evaluation metrics only.
            </p>
            <p>
              <strong>Regional Restrictions:</strong> The services of The People Prop are not intended for residents of certain jurisdictions where such distribution or use would be contrary to local law or regulation. Users are solely responsible for ensuring compliance with their local legal frameworks before purchasing any challenge.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}