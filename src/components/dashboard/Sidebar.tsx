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
  Wallet,
  Menu,
  X
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", href: "/dashboard" },
  { icon: Briefcase, label: "Accounts", href: "/dashboard/accounts" },
  { icon: Wallet, label: "Billing", href: "/dashboard/billing" },
  { icon: Trophy, label: "Competitions", href: "/dashboard/competitions" },
  { icon: Award, label: "Certificates", href: "/dashboard/certificates" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-0 left-0 w-full h-16 bg-white/80 backdrop-blur-md z-40 border-b border-[var(--border)] flex items-center justify-between px-4">
        <Link href="/" className="font-display font-bold text-lg tracking-tight text-[var(--ink-950)]">
          The People Prop
        </Link>
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
        <div className="h-20 flex items-center px-6 border-b border-[var(--border)]">
          <Link href="/" className="font-display font-bold text-xl tracking-tight text-[var(--ink-950)]">
            The People Prop
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
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