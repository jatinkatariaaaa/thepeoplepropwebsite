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
  Menu,
  X,
  DollarSign,
  ArrowUpRight,
  Settings,
  Ticket,
  Boxes,
  Wallet,
  MessageSquare,
  FileText,
  HelpCircle,
  BarChart3,
  Mail,
  Shield,
  TrendingUp,
  ScrollText,
  Activity,
  Scale,
  ShieldCheck,
  Landmark,
  type LucideIcon,
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { NavbarLogo } from "@/components/ui/resizable-navbar";
import type { AdminRole } from "@/lib/admin-context";

/* ------------------------------------------------------------------ */
/*  Nav item + section types                                          */
/* ------------------------------------------------------------------ */

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

/* ------------------------------------------------------------------ */
/*  Full nav tree                                                     */
/* ------------------------------------------------------------------ */

const sections: NavSection[] = [
  {
    title: "MAIN",
    items: [
      { icon: LayoutDashboard, label: "Overview", href: "/admin" },
      { icon: Users, label: "Users", href: "/admin/users" },
      { icon: CreditCard, label: "Purchases", href: "/admin/purchases" },
      { icon: DollarSign, label: "Payouts", href: "/admin/payouts" },
      { icon: Network, label: "Affiliates", href: "/admin/affiliates" },
    ],
  },
  {
    title: "COMPLIANCE",
    items: [
      { icon: ShieldCheck, label: "KYC", href: "/admin/kyc" },
      { icon: Landmark, label: "Payments", href: "/admin/payments" },
    ],
  },
  {
    title: "TRADING OPS",
    items: [
      { icon: Activity, label: "Risk Dashboard", href: "/admin/trading/dashboard" },
      { icon: Wallet, label: "Trading Accounts", href: "/admin/trading/accounts" },
      { icon: Scale, label: "Rule Engine", href: "/admin/trading/rules" },
      { icon: Boxes, label: "Platforms & API", href: "/admin/trading/platforms" },
    ],
  },
  {
    title: "PRODUCTS",
    items: [
      { icon: Target, label: "Challenges", href: "/admin/challenges" },
      { icon: Ticket, label: "Coupons", href: "/admin/coupons" },
    ],
  },
  {
    title: "CONTENT",
    items: [
      { icon: MessageSquare, label: "Support Tickets", href: "/admin/tickets" },
      { icon: FileText, label: "CMS", href: "/admin/cms" },
      { icon: HelpCircle, label: "FAQs", href: "/admin/faqs" },
      { icon: BarChart3, label: "Stats", href: "/admin/stats" },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { icon: Mail, label: "Email", href: "/admin/email" },
      { icon: Shield, label: "Roles & Permissions", href: "/admin/roles" },
      { icon: TrendingUp, label: "Reports", href: "/admin/reports" },
      { icon: Settings, label: "Settings", href: "/admin/settings" },
      { icon: ScrollText, label: "Audit Logs", href: "/admin/audit" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Role-based visibility                                             */
/* ------------------------------------------------------------------ */

function filterSections(
  allSections: NavSection[],
  role: AdminRole
): NavSection[] {
  if (role === "super_admin") return allSections;

  // Build a set of allowed hrefs per role
  const allowed = new Set<string>();

  switch (role) {
    case "finance":
      // Entire MAIN section
      allSections
        .find((s) => s.title === "MAIN")
        ?.items.forEach((i) => allowed.add(i.href));
      // + Reports
      allowed.add("/admin/reports");
      break;

    case "support":
      // Users + Support Tickets + Trading Accounts
      allowed.add("/admin");
      allowed.add("/admin/users");
      allowed.add("/admin/tickets");
      allowed.add("/admin/trading/accounts");
      break;

    case "marketing":
      // Entire CONTENT section
      allSections
        .find((s) => s.title === "CONTENT")
        ?.items.forEach((i) => allowed.add(i.href));
      // + Coupons + Challenges + Stats
      allowed.add("/admin");
      allowed.add("/admin/coupons");
      allowed.add("/admin/challenges");
      allowed.add("/admin/stats");
      break;
  }

  return allSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => allowed.has(item.href)),
    }))
    .filter((section) => section.items.length > 0);
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

interface AdminSidebarProps {
  role?: AdminRole;
}

export function AdminSidebar({ role = "super_admin" }: AdminSidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const visibleSections = useMemo(
    () => filterSections(sections, role),
    [role]
  );

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
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[260px] bg-[var(--paper)] border-r border-[var(--border)] transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo Section */}
        <div className="pt-8 pb-4 flex flex-col items-start px-6 border-b border-[var(--border)]">
          <NavbarLogo />
          <Link
            href="/dashboard"
            className="mt-4 flex items-center gap-1.5 text-[12px] font-bold text-[var(--ink-500)] hover:text-[var(--accent)] transition-colors uppercase tracking-wider bg-[var(--paper-2)] px-3 py-1.5 rounded-full border border-[var(--border)]"
          >
            User Dashboard <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          {visibleSections.map((section, sIdx) => (
            <div key={section.title}>
              {/* Section header */}
              <p
                className={cn(
                  "text-[11px] font-semibold uppercase tracking-wider text-[var(--ink-400)] px-3 mb-2",
                  sIdx === 0 ? "mt-2" : "mt-6"
                )}
              >
                {section.title}
              </p>

              {/* Section items */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);

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

                      <Icon
                        className={cn(
                          "w-[18px] h-[18px] relative z-10 transition-colors",
                          isActive
                            ? "text-white"
                            : "text-[var(--ink-500)] group-hover:text-[var(--ink-950)]"
                        )}
                      />
                      <span
                        className={cn(
                          "text-[14px] font-semibold relative z-10 transition-colors",
                          isActive
                            ? "text-white"
                            : "text-[var(--ink-600)] group-hover:text-[var(--ink-950)]"
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
      </aside>
    </>
  );
}
