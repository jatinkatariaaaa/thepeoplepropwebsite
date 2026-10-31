"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  ChevronDown,
  Grid3x3,
  Mail,
  Menu,
  Newspaper,
  Star,
  Trophy,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TppMark } from "./logo";
import { EASE } from "./motion";
import { ACCESS_UPFRONT } from "./data";
import { APP, href, type PageKey } from "./routes";

type Item = { key: PageKey; label: string; note: string; icon: LucideIcon };
type Entry = { label: string; key: PageKey } | { label: string; items: Item[] };

const COMMUNITY: Item[] = [
  { key: "leaderboard", label: "Leaderboard", note: "Who is leading right now", icon: BarChart3 },
  { key: "heatmap", label: "Heatmap", note: "Live market heatmap", icon: Grid3x3 },
  { key: "contest", label: "Contest", note: "Trading competitions", icon: Trophy },
  { key: "reviews", label: "Reviews", note: "What traders say about us", icon: Star },
  { key: "blog", label: "Blog", note: "Guides and market notes", icon: Newspaper },
];

const COMPANY: Item[] = [
  { key: "about", label: "About us", note: "Built by traders, for traders", icon: Users },
  { key: "careers", label: "Careers", note: "Join the team", icon: Briefcase },
  { key: "contact", label: "Contact", note: "Talk to our support team", icon: Mail },
];

const NAV: Entry[] = [
  { label: "Challenges", key: "challenges" },
  { label: "Rules", key: "rules" },
  { label: "Community", items: COMMUNITY },
  { label: "Company", items: COMPANY },
  { label: "FAQ", key: "faqs" },
];

function isActive(pathname: string, key: PageKey) {
  const h = href(key);
  return h !== href("home") && (pathname === h || pathname.startsWith(`${h}/`));
}

function MenuPanel({ items, onPick }: { items: Item[]; onPick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.98 }}
      transition={{ duration: 0.28, ease: EASE }}
      className="absolute top-full left-1/2 z-50 w-[440px] -translate-x-1/2 pt-3"
    >
      <div className="g-glass-ink g-hair grid grid-cols-2 gap-1 rounded-[24px] p-2">
        {items.map(({ key, label, note, icon: Icon }) => (
          <Link key={key} href={href(key)} onClick={onPick} className="group flex items-start gap-3 rounded-[18px] p-3 transition-colors duration-300 hover:bg-white/[0.06]">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[12px] bg-white/[0.06] text-[var(--g-lime)] ring-1 ring-white/10 transition-colors group-hover:bg-[var(--g-lime)] group-hover:text-[var(--g-ink)]">
              <Icon className="h-[18px] w-[18px]" strokeWidth={1.9} />
            </span>
            <span className="min-w-0">
              <span className="block text-[14px] font-semibold text-white">{label}</span>
              <span className="mt-0.5 block text-[12.5px] leading-snug text-white/50">{note}</span>
            </span>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

export function Header() {
  const pathname = usePathname() ?? href("home");
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 36);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      setMenu(null);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const enter = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMenu(label);
  };
  const leave = () => {
    closeTimer.current = setTimeout(() => setMenu(null), 140);
  };
  const closeAll = () => {
    setMenu(null);
    setOpen(false);
  };

  return (
    <>
      {/* announcement */}
      <div className="relative z-50 bg-[#0a2a23] text-[13px] text-white/80">
        <div className="mx-auto flex h-10 max-w-[1312px] items-center justify-center gap-3 px-5">
          <span className="hidden h-1.5 w-1.5 rounded-full bg-[var(--g-lime)] sm:block" />
          <span className="truncate">
            <span className="font-semibold text-white">Pass first, pay later.</span> Start an Access account for ${ACCESS_UPFRONT}.
          </span>
          <Link href={href("challenges")} className="group hidden items-center gap-1 font-semibold text-[var(--g-lime)] sm:inline-flex">
            See challenges
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>

      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE }}
        className={cn("sticky top-0 z-50 px-3 sm:px-5", scrolled ? "pt-3" : "pt-4")}
        style={{ marginBottom: "-76px" }}
      >
        <div
          className={cn(
            "g-hair mx-auto flex max-w-[1312px] items-center justify-between rounded-full py-2 pr-2 pl-5 transition-all duration-700 [transition-timing-function:var(--g-out)]",
            scrolled || open || menu ? "g-glass-ink" : "bg-white/[0.04] backdrop-blur-md",
          )}
        >
          <Link href={href("home")} aria-label="The People Prop — home" className="flex items-center gap-3 text-white">
            <TppMark className="h-[21px]" />
            <span className="hidden text-[13.5px] font-medium tracking-[-0.01em] text-white/70 xl:inline">The People Prop</span>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-0.5 lg:flex">
            {NAV.map((n) => {
              if ("key" in n) {
                const on = isActive(pathname, n.key);
                return (
                  <Link
                    key={n.label}
                    href={href(n.key)}
                    aria-current={on ? "page" : undefined}
                    className={cn("relative isolate rounded-full px-4 py-2 text-[14px] font-medium transition-colors duration-300", on ? "text-white" : "text-white/60 hover:text-white")}
                  >
                    {on ? <motion.span layoutId="g-nav" className="absolute inset-0 -z-10 rounded-full bg-white/[0.09]" transition={{ type: "spring", stiffness: 400, damping: 34 }} /> : null}
                    {n.label}
                  </Link>
                );
              }
              const on = n.items.some((i) => isActive(pathname, i.key));
              const shown = menu === n.label;
              return (
                <div key={n.label} className="relative" onPointerEnter={() => enter(n.label)} onPointerLeave={leave}>
                  <button
                    type="button"
                    aria-expanded={shown}
                    aria-haspopup="true"
                    onClick={() => setMenu(shown ? null : n.label)}
                    className={cn(
                      "relative isolate inline-flex items-center gap-1 rounded-full px-4 py-2 text-[14px] font-medium transition-colors duration-300",
                      on || shown ? "text-white" : "text-white/60 hover:text-white",
                    )}
                  >
                    {on ? <motion.span layoutId="g-nav" className="absolute inset-0 -z-10 rounded-full bg-white/[0.09]" transition={{ type: "spring", stiffness: 400, damping: 34 }} /> : null}
                    {n.label}
                    <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-300", shown && "rotate-180")} />
                  </button>
                  <AnimatePresence>{shown ? <MenuPanel items={n.items} onPick={closeAll} /> : null}</AnimatePresence>
                </div>
              );
            })}
          </nav>

          <div className="flex items-center gap-1.5">
            <Link href={APP.login} className="g-btn g-btn-glass hidden h-10 px-5 text-[14px] sm:inline-flex">
              Log in
            </Link>
            <Link href={APP.newChallenge} className="g-btn g-btn-lime hidden h-10 px-5 text-[14px] sm:inline-flex">
              Get funded
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="g-mobile-nav"
              className="grid h-10 w-10 place-items-center rounded-full bg-white/[0.07] text-white ring-1 ring-white/15 lg:hidden"
            >
              {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="g-mobile-nav"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="g-noscroll fixed inset-0 z-40 overflow-y-auto bg-[#0e1110]/95 px-6 pt-28 pb-10 backdrop-blur-2xl lg:hidden"
          >
            <nav aria-label="Mobile" className="flex flex-col">
              {[
                { key: "challenges" as const, label: "Challenges" },
                { key: "rules" as const, label: "Trading rules" },
                { key: "faqs" as const, label: "FAQ" },
              ].map((n, i) => (
                <motion.div key={n.key} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.04 + i * 0.05, ease: EASE }}>
                  <Link href={href(n.key)} onClick={closeAll} className="flex items-center justify-between border-b border-white/10 py-4 text-[26px] font-semibold tracking-[-0.03em] text-white">
                    {n.label}
                    <ArrowRight className="h-5 w-5 text-[var(--g-lime)]" />
                  </Link>
                </motion.div>
              ))}
            </nav>
            {[
              { title: "Community", items: COMMUNITY },
              { title: "Company", items: COMPANY },
            ].map((group, gi) => (
              <motion.div
                key={group.title}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + gi * 0.06, ease: EASE }}
                className="mt-8"
              >
                <p className="text-[12.5px] font-medium tracking-wide text-white/40 uppercase">{group.title}</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {group.items.map(({ key, label, icon: Icon }) => (
                    <Link key={key} href={href(key)} onClick={closeAll} className="flex items-center gap-3 rounded-[16px] bg-white/[0.05] p-3 text-[15px] font-medium text-white ring-1 ring-white/10">
                      <Icon className="h-4 w-4 text-[var(--g-lime)]" strokeWidth={1.9} />
                      {label}
                    </Link>
                  ))}
                </div>
              </motion.div>
            ))}
            <div className="mt-10 grid grid-cols-2 gap-3">
              <Link href={APP.login} onClick={closeAll} className="g-btn g-btn-glass">
                Log in
              </Link>
              <Link href={APP.newChallenge} onClick={closeAll} className="g-btn g-btn-lime">
                Get funded
              </Link>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
