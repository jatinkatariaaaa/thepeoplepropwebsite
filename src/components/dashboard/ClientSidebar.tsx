"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
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
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { NavbarLogo } from "@/components/ui/resizable-navbar";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const sections: NavSection[] = [
  {
    title: "Overview",
    items: [
      { icon: Home, label: "Home", href: "/dashboard" },
      { icon: CalendarDays, label: "Calendar", href: "/dashboard/calendar" },
    ],
  },
  {
    title: "Trading",
    items: [
      { icon: History, label: "Transactions", href: "/dashboard/transactions" },
      { icon: DollarSign, label: "Payouts", href: "/dashboard/payouts" },
      { icon: Trophy, label: "Competitions", href: "/dashboard/competitions" },
      { icon: ListOrdered, label: "Leaderboard", href: "/dashboard/leaderboard" },
    ],
  },
  {
    title: "Growth",
    items: [
      { icon: Gift, label: "Contest", href: "/dashboard/contest" },
      { icon: Users, label: "Affiliate", href: "/dashboard/affiliate" },
    ],
  },
  {
    title: "Account",
    items: [
      { icon: Settings, label: "Settings", href: "/dashboard/settings" },
    ],
  },
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
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 z-40 flex h-14 w-full items-center justify-between border-b border-[var(--dash-hairline)] bg-white/90 px-4 backdrop-blur-md">
        <NavbarLogo />
        <div className="flex items-center gap-1">
          <Link
            href="/dashboard/new-challenge"
            className="flex h-11 w-11 items-center justify-center rounded-none text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink"
            aria-label="New challenge"
          >
            <Plus className="h-5 w-5" />
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-11 w-11 items-center justify-center rounded-none text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink"
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[248px] transform flex-col border-r border-[var(--dash-hairline)] bg-white transition-transform duration-300 ease-out lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex flex-col items-start gap-3 border-b border-[var(--dash-hairline)] px-5 pb-4 pt-6">
          <NavbarLogo />
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-400 transition-colors hover:text-ink"
          >
            Go to site <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Primary action */}
        <div className="px-4 pb-1 pt-4">
          <Link
            href="/dashboard/new-challenge"
            onClick={() => setIsOpen(false)}
            className="carbon-btn-primary w-full justify-center"
          >
            <Plus className="h-4 w-4" />
            New Challenge
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Dashboard navigation">
          {sections.map((section, sIdx) => (
            <div key={section.title}>
              <p
                className={cn(
                  "dash-overline px-3 mb-1.5",
                  sIdx === 0 ? "mt-2" : "mt-5"
                )}
              >
                {section.title}
              </p>
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className="group relative flex h-10 items-center gap-2.5 px-4 outline-none transition-colors"
                    >
                      {isActive && (
                        <motion.span
                          layoutId="sidebar-active"
                          className="absolute inset-0 bg-[#e8e8e8]"
                          initial={false}
                          transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        />
                      )}
                      {isActive && (
                        <span
                          className="absolute inset-y-0 left-0 w-1 bg-[var(--carbon-blue)]"
                          aria-hidden="true"
                        />
                      )}
                      <Icon
                        className={cn(
                          "relative z-10 h-4 w-4 transition-colors",
                          isActive
                            ? "text-[#161616]"
                            : "text-[#525252] group-hover:text-[#161616]"
                        )}
                      />
                      <span
                        className={cn(
                          "relative z-10 text-sm transition-colors",
                          isActive
                            ? "font-semibold text-[#161616]"
                            : "text-[#525252] group-hover:text-[#161616]"
                        )}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-[var(--dash-hairline)] p-3">
          <button
            onClick={handleSignOut}
            className="flex h-10 w-full items-center gap-2.5 px-4 text-sm text-[#525252] transition-colors hover:bg-[#e8e8e8] hover:text-[#da1e28]"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
