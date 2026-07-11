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
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
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
      {/* Mobile Toggle */}
      <div className="lg:hidden fixed top-0 left-0 w-full h-16 bg-[#0c0c0c] z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#cbfb45]">
            <Sparkles className="h-4 w-4 text-[#0c0c0c]" />
          </div>
          <span className="text-[15px] font-bold text-white tracking-tight">
            Admin
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

      {/* Sidebar Content — dark floating panel */}
      <aside
        className={cn(
          "fixed z-50 flex flex-col bg-[#0c0c0c] transform transition-transform duration-300 ease-in-out",
          "inset-y-0 left-0 w-[260px] lg:inset-y-3 lg:left-3 lg:w-[248px] lg:rounded-[28px] lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo Section */}
        <div className="px-5 pt-7 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#cbfb45]">
              <Sparkles className="h-5 w-5 text-[#0c0c0c]" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[15px] font-bold text-white tracking-tight leading-tight">
                The People Prop
              </p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">
                Admin Panel
              </p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="mt-4 flex w-fit items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white/60 transition-colors hover:bg-[#cbfb45] hover:text-[#0c0c0c] hover:border-transparent"
          >
            User Dashboard <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 pb-5 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent]">
          {visibleSections.map((section, sIdx) => (
            <div key={section.title}>
              {/* Section header */}
              <p
                className={cn(
                  "text-[10px] font-bold uppercase tracking-[0.14em] text-white/30 px-3 mb-1.5",
                  sIdx === 0 ? "mt-1" : "mt-5"
                )}
              >
                {section.title}
              </p>

              {/* Section items */}
              <div className="space-y-0.5">
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
                      className="relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all group outline-none"
                    >
                      {isActive && (
                        <motion.div
                          layoutId="admin-sidebar-active"
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
