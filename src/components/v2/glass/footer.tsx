"use client";

import Link from "next/link";
import { ArrowUp, Mail } from "lucide-react";
import { Container } from "./ui";
import { TppMark, TppOutline } from "./logo";
import { Reveal } from "./motion";
import { APP, href } from "./routes";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Platform",
    links: [
      { label: "Dashboard", href: APP.dashboard },
      { label: "Challenges", href: href("challenges") },
      { label: "Heatmap", href: href("heatmap") },
      { label: "Leaderboard", href: href("leaderboard") },
      { label: "System status", href: href("status") },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Trading rules", href: href("rules") },
      { label: "FAQ", href: href("faqs") },
      { label: "Blog", href: href("blog") },
      { label: "Contest", href: href("contest") },
      { label: "Help centre", href: href("help") },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: href("about") },
      { label: "Contact", href: href("contact") },
      { label: "Careers", href: href("careers") },
      { label: "Reviews", href: href("reviews") },
      { label: "Press", href: href("press") },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: href("terms") },
      { label: "Privacy policy", href: href("privacy") },
      { label: "Cookie policy", href: href("cookie") },
      { label: "AML policy", href: href("aml-policy") },
      { label: "Risk disclosure", href: href("risk-disclosure") },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative isolate overflow-clip bg-[#0b1110] pt-10 pb-10">
      <Container>
        <div className="g-glass g-hair grid gap-12 rounded-[36px] p-7 sm:p-10 lg:grid-cols-[1fr_1.6fr] lg:p-12">
          <div>
            <Link href={href("home")} aria-label="The People Prop — home" className="inline-flex text-white">
              <TppMark className="h-7" />
            </Link>
            <p className="mt-5 max-w-sm text-[14.5px] leading-relaxed text-white/55">
              Evaluating traders worldwide. Built by traders, for traders. No hidden rules, just real capital scaling.
            </p>
            <a href="mailto:support@thepeopleprop.com" className="group mt-7 inline-flex items-center gap-3 text-[14.5px] font-medium text-white/85 hover:text-white">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.07] ring-1 ring-white/10 transition-colors group-hover:bg-[var(--g-lime)] group-hover:text-[var(--g-ink)]">
                <Mail className="h-4 w-4" />
              </span>
              support@thepeopleprop.com
            </a>
          </div>
          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <h2 className="text-[13px] font-semibold text-white">{col.title}</h2>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="text-[14px] text-white/50 transition-colors hover:text-white">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </Container>

      <Reveal className="pointer-events-none mx-auto mt-12 max-w-[1312px] px-5 sm:px-8 lg:px-10" y={40}>
        <TppOutline className="w-full text-white/[0.16]" />
      </Reveal>

      <Container>
        <div className="mt-10 border-t border-white/[0.07] pt-8">
          <p className="text-[12px] leading-relaxed text-white/40">
            <strong className="font-semibold text-white/60">Risk warning:</strong> The People Prop provides simulated trading environments. All accounts provided to clients are simulated accounts. Trading
            in financial markets involves a high degree of risk and may not be suitable for all investors. The simulated capital provided is not real money and cannot be lost by the trader. Past
            performance is not indicative of future results. Please ensure you fully understand the risks involved and seek independent advice if necessary. The People Prop is not a broker and does
            not accept deposits.
          </p>
          <div className="mt-6 flex flex-col items-start justify-between gap-4 text-[12.5px] text-white/40 sm:flex-row sm:items-center">
            <span>© {new Date().getFullYear()} The People Prop. All rights reserved.</span>
            <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="inline-flex items-center gap-2 font-medium text-white/60 transition-colors hover:text-white">
              <ArrowUp className="h-3.5 w-3.5" /> Back to top
            </button>
          </div>
        </div>
      </Container>
    </footer>
  );
}
