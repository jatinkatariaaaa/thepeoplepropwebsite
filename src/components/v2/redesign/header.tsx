"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Challenges", href: "#pricing" },
  { label: "Why TPP", href: "#edge" },
  { label: "Payouts", href: "#proof" },
  { label: "Platforms", href: "#platforms" },
  { label: "FAQ", href: "#faq" },
];

export function Header() {
  const [lifted, setLifted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setLifted(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <div
        className={cn(
          "w-full max-w-6xl rounded-full px-4 py-2.5 transition-all duration-500",
          lifted
            ? "v2-glass v2-litedge shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)]"
            : "border border-transparent",
        )}
      >
        <div className="flex items-center justify-between gap-6">
          <a href="/v2" className="flex shrink-0 items-center gap-2.5">
            <Image
              src="/images/logo.webp"
              alt="The People Prop"
              width={28}
              height={28}
              className="h-7 w-7 rounded-full"
            />
            <span className="font-heading text-[15px] font-medium tracking-tight">
              The People Prop
            </span>
          </a>

          <nav
            aria-label="Main"
            className="hidden items-center gap-1 lg:flex"
          >
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-full px-3.5 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href="#pricing"
              className="hidden text-[13px] text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              Sign in
            </a>
            <a
              href="#pricing"
              className="rounded-full bg-foreground px-4 py-2 text-[13px] font-medium text-background shadow-[0_8px_30px_-10px_color-mix(in_oklab,var(--primary)_80%,transparent)] transition-transform hover:-translate-y-0.5"
            >
              Get funded
            </a>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              className="ml-1 grid h-9 w-9 place-items-center rounded-full border border-border text-foreground/80 lg:hidden"
            >
              {open ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {open ? (
          <nav
            aria-label="Mobile"
            className="mt-3 flex flex-col gap-1 border-t border-border pt-3 pb-1 lg:hidden"
          >
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-white/[0.05] hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>
        ) : null}
      </div>
    </header>
  );
}
