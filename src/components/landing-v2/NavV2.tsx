"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Rules", href: "/rules" },
  { label: "About", href: "/about" },
  { label: "Affiliate", href: "/affiliates" },
  { label: "FAQ", href: "/faqs" },
  { label: "Contact", href: "/contact" },
];

/* ─────────────────────────────────────────────────────────────
   NavV2 — floating pill header: logo pill on the left, nav pill
   on the right with links, Log In and a blue CTA.
   ───────────────────────────────────────────────────────────── */
export function NavV2() {
  const [open, setOpen] = useState(false);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-5 md:pt-4">
      <div className="flex items-start justify-between gap-3">
        {/* Logo pill */}
        <Link
          href="/v2"
          className="pointer-events-auto flex h-[54px] items-center rounded-2xl bg-white px-5 shadow-lg shadow-[#0e1b33]/10"
        >
          <span className="text-[19px] font-extrabold tracking-tight text-[#0e1b33]">
            ThePeople
            <span className="text-[#2e6bff]">/Prop</span>
          </span>
        </Link>

        {/* Nav pill */}
        <div className="pointer-events-auto flex items-center gap-2 rounded-2xl bg-white p-2 shadow-lg shadow-[#0e1b33]/10">
          <nav className="hidden items-center lg:flex" aria-label="Primary">
            {LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="rounded-xl px-4 py-2.5 text-[14.5px] font-semibold text-[#344054] transition-colors hover:text-[#2e6bff]"
              >
                {l.label}
              </Link>
            ))}
            <span className="mx-2 h-6 w-px bg-[#0e1b33]/10" aria-hidden />
          </nav>

          <Link
            href="/login"
            className="hidden h-[38px] items-center rounded-xl border border-[#0e1b33]/12 px-5 text-[14.5px] font-bold text-[#0e1b33] transition-colors hover:border-[#0e1b33]/25 md:flex"
          >
            Log In
          </Link>
          <Link
            href="/dashboard/new-challenge"
            className="flex h-[38px] items-center rounded-xl bg-[#2e6bff] px-5 text-[14.5px] font-bold text-white shadow-md shadow-[#2e6bff]/30 transition-colors hover:bg-[#1f56e0]"
          >
            Start My Challenge
          </Link>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            className="flex h-[38px] w-[38px] items-center justify-center rounded-xl border border-[#0e1b33]/12 text-[#0e1b33] lg:hidden"
          >
            {open ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div
        className={cn(
          "pointer-events-auto mt-2 origin-top rounded-2xl bg-white p-3 shadow-xl shadow-[#0e1b33]/15 transition-all duration-200 lg:hidden",
          open ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
        )}
      >
        <nav className="flex flex-col" aria-label="Mobile">
          {LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-3 text-[15px] font-semibold text-[#344054] hover:bg-[#f2f6ff] hover:text-[#2e6bff]"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="rounded-xl px-4 py-3 text-[15px] font-semibold text-[#344054] hover:bg-[#f2f6ff] hover:text-[#2e6bff] md:hidden"
          >
            Log In
          </Link>
        </nav>
      </div>
    </header>
  );
}
