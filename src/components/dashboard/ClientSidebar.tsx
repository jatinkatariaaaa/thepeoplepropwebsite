"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Gift
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { NavbarLogo } from "@/components/ui/resizable-navbar";
import { Logo } from "@/components/layout/Logo";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const navItems = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: Gift, label: "Contest 🔥", href: "/dashboard/contest" },
  { icon: History, label: "Transaction History", href: "/dashboard/transactions" },
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
      <div className="lg:hidden fixed top-0 left-0 w-full h-16 bg-white/80 backdrop-blur-md z-40 border-b border-[var(--border)] flex items-center justify-between px-4">
        <NavbarLogo />
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-[var(--ink-700)] hover:text-[var(--ink-950)]"
          aria-label={isOpen ? "Close menu" : "Open menu"}
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content — dark floating panel */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-[260px] transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col p-3",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="relative flex flex-col flex-1 min-h-0 rounded-[24px] overflow-hidden bg-gradient-to-b from-[var(--teal-950)] via-[var(--teal-900)] to-[var(--teal-950)] border border-white/[0.06] shadow-2xl">

          {/* Subtle top glow */}
          <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-64 rounded-full bg-[var(--lime)]/10 blur-3xl" />
          {/* Subtle bottom glow */}
          <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 h-48 w-64 rounded-full bg-[var(--lime)]/[0.07] blur-3xl" />

          {/* Logo Section */}
          <div className="relative pt-7 pb-5 px-5 flex flex-col items-start gap-4">
            <Logo invert />
            <Link
              href="/"
              className="flex items-center gap-1.5 text-[11px] font-bold text-white/60 hover:text-[var(--lime)] transition-colors uppercase tracking-wider bg-white/[0.06] px-3 py-1.5 rounded-full border border-white/10"
            >
              Go to site <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* New Challenge Button */}
          <div className="relative px-4 pb-2">
            <Link href="/dashboard/new-challenge" onClick={() => setIsOpen(false)}>
              <div className="w-full h-11 rounded-xl bg-[var(--lime)] text-[var(--ink-950)] flex items-center justify-center gap-2 px-4 hover:bg-[var(--lime-600)] transition-all shadow-[0_8px_24px_-8px_rgba(203,251,69,0.5)] cursor-pointer group">
                <Plus className="w-4.5 h-4.5 group-hover:rotate-90 transition-transform duration-300" />
                <span className="text-[13px] font-bold">New Challenge</span>
              </div>
            </Link>
          </div>

          {/* Menu label */}
          <div className="relative px-7 pt-4 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">Menu</span>
          </div>

          {/* Navigation */}
          <nav className="relative flex-1 px-4 pb-2 space-y-0.5 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group outline-none",
                    !isActive && "hover:bg-white/[0.06]"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--teal-700)] to-[var(--teal-800)] border border-[var(--lime)]/25 shadow-[0_0_20px_-4px_rgba(203,251,69,0.35)]"
                      initial={false}
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}

                  <Icon className={cn(
                    "w-[18px] h-[18px] relative z-10 transition-colors",
                    isActive ? "text-[var(--lime)]" : "text-white/50 group-hover:text-white"
                  )} />
                  <span className={cn(
                    "text-[13.5px] font-medium relative z-10 transition-colors",
                    isActive ? "text-white font-semibold" : "text-white/70 group-hover:text-white"
                  )}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* Footer / Logout */}
          <div className="relative p-4 border-t border-white/[0.08]">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl transition-all text-white/60 hover:text-red-400 hover:bg-red-500/10 font-medium text-[13.5px]"
            >
              <LogOut className="w-[18px] h-[18px]" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
