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
      <div className="lg:hidden fixed top-0 left-0 w-full h-16 bg-[#0c0c0c] z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <img
            src="/images/logo.webp"
            alt="The People Prop Logo"
            width={32}
            height={32}
            className="h-8 w-8 shrink-0 rounded-lg object-contain"
          />
          <span className="text-[15px] font-bold text-white tracking-tight">
            The People Prop
          </span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          className="p-2 text-white/70 hover:text-white"
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

      {/* Sidebar — dark floating panel */}
      <aside
        className={cn(
          "fixed z-50 flex flex-col bg-[#0c0c0c] transform transition-transform duration-300 ease-in-out",
          "inset-y-0 left-0 w-[260px] lg:inset-y-3 lg:left-3 lg:w-[248px] lg:rounded-[28px] lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo Section */}
        <div className="px-5 pt-7 pb-4">
          <div className="flex items-center gap-3">
            <img
              src="/images/logo.webp"
              alt="The People Prop Logo"
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-xl object-contain"
            />
            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold text-white tracking-tight leading-tight">
                The People Prop
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                Dashboard
              </p>
            </div>
          </div>

          <Link
            href="/"
            onClick={() => setIsOpen(false)}
            className="mt-4 flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white/60 transition-colors hover:bg-[#cbfb45] hover:text-[#0c0c0c] hover:border-transparent"
          >
            Go to site <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* New Challenge Button */}
        <div className="px-4 pb-2">
          <Link
            href="/dashboard/new-challenge"
            onClick={() => setIsOpen(false)}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#cbfb45] px-4 text-[#0c0c0c] transition-colors hover:bg-[#d9fc70] group"
          >
            <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
            <span className="text-[13px] font-bold">New Challenge</span>
          </Link>
        </div>

        {/* Menu label */}
        <p className="px-7 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white/30">
          Menu
        </p>

        {/* Navigation */}
        <nav className="flex-1 px-3 pb-2 space-y-0.5 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent]">
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
                className="relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all group outline-none"
              >
                {isActive && (
                  <motion.div
                    layoutId="client-sidebar-active"
                    className="absolute inset-0 bg-[#cbfb45] rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}

                <Icon
                  className={cn(
                    "w-[17px] h-[17px] relative z-10 transition-colors",
                    isActive
                      ? "text-[#0c0c0c]"
                      : "text-white/40 group-hover:text-white"
                  )}
                />
                <span
                  className={cn(
                    "text-[13.5px] font-semibold relative z-10 transition-colors",
                    isActive
                      ? "text-[#0c0c0c]"
                      : "text-white/60 group-hover:text-white"
                  )}
                >
                  {item.label}
                </span>
                {item.badge && (
                  <span
                    className={cn(
                      "relative z-10 ml-auto rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                      isActive
                        ? "bg-[#0c0c0c] text-[#cbfb45]"
                        : "bg-[#cbfb45] text-[#0c0c0c]"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-white/[0.08]">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl transition-all text-white/60 hover:text-red-400 hover:bg-red-500/10 font-semibold text-[13.5px]"
          >
            <LogOut className="w-[17px] h-[17px]" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
