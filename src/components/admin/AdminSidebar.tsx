"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Users, 
  Target, 
  CreditCard,
  Network,
  LogOut,
  Menu,
  X,
  DollarSign,
  ArrowUpRight,
  Settings,
  Ticket,
  Boxes
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { NavbarLogo } from "@/components/ui/resizable-navbar";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/admin" },
  { icon: Target, label: "Challenges", href: "/admin/challenges" },
  { icon: Ticket, label: "Coupons", href: "/admin/coupons" },
  { icon: Boxes, label: "Platforms", href: "/admin/platforms" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: Target, label: "Accounts", href: "/admin/accounts" },
  { icon: CreditCard, label: "Purchases", href: "/admin/purchases" },
  { icon: Network, label: "Affiliates", href: "/admin/affiliates" },
  { icon: DollarSign, label: "Payouts", href: "/admin/payouts" },
];

export function AdminSidebar() {
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
          <Link href="/dashboard" className="mt-4 flex items-center gap-1.5 text-[12px] font-bold text-[var(--ink-500)] hover:text-[var(--accent)] transition-colors uppercase tracking-wider bg-[var(--paper-2)] px-3 py-1.5 rounded-full border border-[var(--border)]">
            User Dashboard <ArrowUpRight className="w-3.5 h-3.5" />
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
                    layoutId="admin-sidebar-active"
                    className="absolute inset-0 bg-[var(--ink-950)] rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
                
                <Icon className={cn(
                  "w-[18px] h-[18px] relative z-10 transition-colors",
                  isActive ? "text-white" : "text-[var(--ink-500)] group-hover:text-[var(--ink-950)]"
                )} />
                <span className={cn(
                  "text-[14px] font-semibold relative z-10 transition-colors",
                  isActive ? "text-white" : "text-[var(--ink-600)] group-hover:text-[var(--ink-950)]"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
