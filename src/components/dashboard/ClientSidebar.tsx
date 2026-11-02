"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  Trophy,
  Settings,
  LogOut,
  History,
  Menu,
  X,
  ArrowUpRight,
  ListOrdered,
  CalendarDays,
  Plus,
  Users,
  DollarSign,
  Gift,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { LogoTile, btn } from "./glass";

const navItems = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: Gift, label: "Contest", href: "/dashboard/contest", badge: "HOT" },
  { icon: History, label: "Transactions", href: "/dashboard/transactions" },
  { icon: Trophy, label: "Competitions", href: "/dashboard/competitions" },
  { icon: ListOrdered, label: "Leaderboard", href: "/dashboard/leaderboard" },
  { icon: CalendarDays, label: "Calendar", href: "/dashboard/calendar" },
  { icon: Users, label: "Affiliate", href: "/dashboard/affiliate" },
  { icon: DollarSign, label: "Payouts", href: "/dashboard/payouts" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function ClientSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <>
      {/* Mobile Toggle */}
      <div className="fixed inset-x-0 top-0 z-40 px-3 pt-2 lg:hidden">
        <div className="g-glass-light g-hair g-hair-ink flex h-14 items-center justify-between rounded-full pr-2 pl-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <LogoTile className="rounded-full" />
            <span className="truncate text-[14px] font-semibold tracking-[-0.02em] text-[var(--g-ink)]">
              The People Prop
            </span>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full bg-black/[0.05] text-[var(--g-ink)] ring-1 ring-black/[0.08] transition-colors hover:bg-black/[0.08]"
          >
            {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#0e1110]/25 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar — floating glass panel */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[272px] p-3 transition-transform duration-500 [transition-timing-function:var(--g-out)] lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="g-glass-light g-hair g-hair-ink flex h-full flex-col overflow-hidden rounded-[28px]">
          {/* Logo Section */}
          <div className="px-5 pt-6 pb-4">
            <div className="flex items-center gap-3">
              <LogoTile />
              <div className="min-w-0">
                <p className="truncate text-[14px] leading-tight font-semibold tracking-[-0.02em] text-[var(--g-ink)]">
                  The People Prop
                </p>
                <p className="mt-0.5 text-[11px] font-medium tracking-[0.12em] text-[var(--g-muted-ink)] uppercase">
                  Dashboard
                </p>
              </div>
            </div>

            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="mt-5 inline-flex h-8 items-center gap-1.5 rounded-full bg-black/[0.04] px-3.5 text-[12px] font-medium text-[var(--g-muted-ink)] ring-1 ring-black/[0.07] transition-colors hover:bg-[var(--g-ink)] hover:text-white hover:ring-transparent"
            >
              Go to site <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* New Challenge Button */}
          <div className="px-4 pb-2">
            <Link
              href="/dashboard/new-challenge"
              onClick={() => setIsOpen(false)}
              className={cn(btn.lime, "group h-11! w-full text-[14px]!")}
            >
              <Plus className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" strokeWidth={2.4} />
              New Challenge
            </Link>
          </div>

          {/* Menu label */}
          <p className="px-6 pt-4 pb-2 text-[11px] font-medium tracking-[0.14em] text-black/35 uppercase">
            Menu
          </p>

          {/* Navigation */}
          <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-3 [scrollbar-width:thin]">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group relative isolate flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-[14px] font-medium transition-colors",
                    isActive
                      ? "text-white"
                      : "text-[var(--g-muted-ink)] hover:bg-black/[0.04] hover:text-[var(--g-ink)]"
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="client-sidebar-active"
                      className="absolute inset-0 -z-10 rounded-[14px] bg-[var(--g-ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_10px_22px_-12px_rgba(14,17,16,0.7)]"
                      transition={{ type: "spring", stiffness: 400, damping: 34 }}
                    />
                  )}

                  <Icon
                    className={cn(
                      "h-[17px] w-[17px] shrink-0 transition-colors",
                      isActive ? "text-[var(--g-lime)]" : "text-black/40 group-hover:text-[var(--g-ink)]"
                    )}
                    strokeWidth={1.9}
                  />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto rounded-full bg-[var(--g-lime)] px-2 py-0.5 text-[10px] font-bold tracking-wider text-[var(--g-ink)]">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer / Logout */}
          <div className="border-t border-black/[0.06] p-3">
            <button
              type="button"
              onClick={handleSignOut}
              className="flex w-full cursor-pointer items-center gap-3 rounded-[14px] px-3 py-2.5 text-[14px] font-medium text-[var(--g-muted-ink)] transition-colors hover:bg-red-500/10 hover:text-red-600"
            >
              <LogOut className="h-[17px] w-[17px]" strokeWidth={1.9} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
