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
  ShieldAlert,
  Bell,
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
    title: "SECURITY",
    items: [
      { icon: ShieldAlert, label: "Fraud Detection", href: "/admin/fraud" },
      { icon: Bell, label: "Notifications", href: "/admin/notifications" },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { icon: Mail, label: "Email", href: "/admin/email" },
      { icon: Shield, label: "Roles & Permissions", href: "/admin/roles" },
      { icon: TrendingUp, label: "Reports", href: "/admin/reports" },
      { icon: Activity, label: "API Logs", href: "/admin/api-logs" },
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
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 z-40 flex h-14 w-full items-center justify-between border-b border-[var(--dash-hairline)] bg-white/90 px-4 backdrop-blur-md">
        <NavbarLogo />
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
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
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-ink-50 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-600">
              <span className="status-dot bg-lime-600" aria-hidden="true" />
              Admin
            </span>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-400 transition-colors hover:text-ink"
            >
              User view <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3" aria-label="Admin navigation">
          {visibleSections.map((section, sIdx) => (
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
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      aria-current={isActive ? "page" : undefined}
                      className="group relative flex h-9 items-center gap-2.5 rounded-lg px-3 outline-none transition-colors"
                    >
                      {isActive && (
                        <motion.span
                          layoutId="admin-sidebar-active"
                          className="absolute inset-0 rounded-lg bg-ink-50"
                          initial={false}
                          transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        />
                      )}
                      {isActive && (
                        <span
                          className="absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-lime-600"
                          aria-hidden="true"
                        />
                      )}

                      <Icon
                        className={cn(
                          "relative z-10 h-4 w-4 transition-colors",
                          isActive
                            ? "text-ink"
                            : "text-ink-400 group-hover:text-ink-700"
                        )}
                      />
                      <span
                        className={cn(
                          "relative z-10 text-[13px] font-medium transition-colors",
                          isActive
                            ? "text-ink"
                            : "text-ink-600 group-hover:text-ink"
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
