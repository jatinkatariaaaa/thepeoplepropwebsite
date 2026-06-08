"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Home, 
  Briefcase, 
  Trophy, 
  Settings, 
  LogOut, 
  Award,
  History,
  Menu,
  X,
  ArrowUpRight,
  ListOrdered,
  CalendarDays,
  Plus,
  Users
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { NavbarLogo } from "@/components/ui/resizable-navbar";

const navItems = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: History, label: "Transaction History", href: "/dashboard/transactions" },
  { icon: Trophy, label: "Competitions", href: "/dashboard/competitions" },
  { icon: Award, label: "Rewards", href: "/dashboard/rewards" },
  { icon: ListOrdered, label: "Leaderboard", href: "/dashboard/leaderboard" },
  { icon: CalendarDays, label: "Calendar", href: "/dashboard/calendar" },
  { icon: Users, label: "Affiliate", href: "/dashboard/affiliate" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function ClientSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-0 left-0 w-full h-16 bg-white/80 backdrop-blur-md z-40 border-b border-[var(--border)] flex items-center justify-between px-4">
        <NavbarLogo />
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-[var(--ink-700)] hover:text-[var(--ink-950)]"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-[260px] bg-[var(--paper)] border-r border-[var(--border)] transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo Section */}
        <div className="pt-8 pb-4 flex flex-col items-start px-6 border-b border-[var(--border)]">
          <NavbarLogo />
          <Link href="/" className="mt-4 flex items-center gap-1.5 text-[12px] font-bold text-[var(--ink-500)] hover:text-[var(--accent)] transition-colors uppercase tracking-wider bg-[var(--paper-2)] px-3 py-1.5 rounded-full border border-[var(--border)]">
            Go to site <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* New Challenge Button */}
        <div className="px-6 pt-6 pb-2">
          <Link href="/dashboard/new-challenge" onClick={() => setIsOpen(false)}>
            <div className="w-12 h-12 rounded-full bg-[var(--ink-950)] text-white flex items-center justify-center hover:bg-[var(--accent)] hover:scale-105 transition-all shadow-md cursor-pointer group">
              <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group outline-none"
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-[var(--accent-50)] rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                
                <Icon className={cn(
                  "w-5 h-5 relative z-10 transition-colors",
                  isActive ? "text-[var(--accent-700)]" : "text-[var(--ink-500)] group-hover:text-[var(--ink-900)]"
                )} />
                <span className={cn(
                  "text-[14px] font-medium relative z-10 transition-colors",
                  isActive ? "text-[var(--accent-700)]" : "text-[var(--ink-700)] group-hover:text-[var(--ink-950)]"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-[var(--border)]">
          <button className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl transition-all text-[var(--ink-500)] hover:text-red-600 hover:bg-red-50 font-medium text-[14px]">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}