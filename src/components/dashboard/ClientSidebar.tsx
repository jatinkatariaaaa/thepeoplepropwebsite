"use client";

import Link from "@/components/IntentLink";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Award,
  BookOpenText,
  Calculator,
  CalendarDays,
  DollarSign,
  Gift,
  History,
  Home,
  Handshake,
  LifeBuoy,
  ListOrdered,
  LogOut,
  Menu,
  Plus,
  Settings,
  Trophy,
  Users,
  X,
  type LucideIcon,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { LogoTile, btn } from "./glass";
import { ThemeToggle } from "./theme";

type NavItem = { icon: LucideIcon; label: string; href: string; badge?: string; partnerOnly?: boolean };

const navGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Trading",
    items: [
      { icon: Home, label: "Accounts", href: "/dashboard" },
      { icon: BookOpenText, label: "Journal", href: "/dashboard/journal", badge: "NEW" },
      { icon: Calculator, label: "Tools", href: "/dashboard/tools" },
      { icon: CalendarDays, label: "Calendar", href: "/dashboard/calendar" },
    ],
  },
  {
    title: "Rewards",
    items: [
      { icon: DollarSign, label: "Payouts", href: "/dashboard/payouts" },
      { icon: Award, label: "Certificates", href: "/dashboard/certificates" },
      { icon: Users, label: "Affiliate", href: "/dashboard/affiliate" },
      { icon: Handshake, label: "Partner desk", href: "/partner-desk", partnerOnly: true },
      { icon: History, label: "Transactions", href: "/dashboard/transactions" },
    ],
  },
  {
    title: "Community",
    items: [
      { icon: ListOrdered, label: "Leaderboard", href: "/dashboard/leaderboard" },
      { icon: Trophy, label: "Competitions", href: "/dashboard/competitions" },
      { icon: Gift, label: "Contest", href: "/dashboard/contest" },
    ],
  },
  {
    title: "Account",
    items: [
      { icon: LifeBuoy, label: "Support", href: "/dashboard/support" },
      { icon: Settings, label: "Settings", href: "/dashboard/settings" },
    ],
  },
];

export function ClientSidebar({ hasPartnerDesk = false, isAdmin = false }: { hasPartnerDesk?: boolean; isAdmin?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [supportUnread, setSupportUnread] = useState(0);

  // tickets with a reply the trader hasn't read yet; checked again on every page change
  useEffect(() => {
    let alive = true;
    void (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const { count } = await supabase
        .from("support_tickets")
        .select("id", { count: "exact", head: true })
        .eq("user_id", session.user.id)
        .eq("user_unread", true);
      if (alive) setSupportUnread(count ?? 0);
    })();
    return () => {
      alive = false;
    };
  }, [pathname]);

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
              New account
            </Link>
            {isAdmin ? (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="group mt-2 flex h-11 w-full items-center gap-3 rounded-[14px] bg-[var(--g-ink)] px-3.5 text-[14px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_10px_22px_-12px_rgba(14,17,16,0.7)] transition-colors hover:bg-[#232927]"
              >
                <ShieldCheck className="h-[17px] w-[17px] shrink-0 text-[var(--g-lime)]" strokeWidth={2} />
                Admin panel
                <ArrowUpRight className="ml-auto h-4 w-4 text-white/45 transition-colors group-hover:text-white" />
              </Link>
            ) : null}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 pb-3 [scrollbar-width:thin]">
            {navGroups.map((group) => (
              <div key={group.title}>
                <p className="px-3 pt-4 pb-1.5 text-[11px] font-medium tracking-[0.14em] text-black/35 uppercase">{group.title}</p>
                <div className="space-y-0.5">
                  {group.items.filter(item => !item.partnerOnly || hasPartnerDesk).map((item) => {
                    const Icon = item.icon;
                    const isActive = item.href === "/dashboard" ? pathname === "/dashboard" || pathname.startsWith("/dashboard/account") : pathname.startsWith(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "group relative isolate flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-[14px] font-medium transition-colors",
                          isActive ? "text-white" : "text-[var(--g-muted-ink)] hover:bg-black/[0.04] hover:text-[var(--g-ink)]",
                        )}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="client-sidebar-active"
                            className="absolute inset-0 -z-10 rounded-[14px] bg-[var(--g-ink)] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_10px_22px_-12px_rgba(14,17,16,0.7)]"
                            transition={{ type: "spring", stiffness: 400, damping: 34 }}
                          />
                        )}
                        <Icon className={cn("h-[17px] w-[17px] shrink-0 transition-colors", isActive ? "text-[var(--g-lime)]" : "text-black/40 group-hover:text-[var(--g-ink)]")} strokeWidth={1.9} />
                        <span>{item.label}</span>
                        {item.badge && <span className="ml-auto rounded-full bg-[var(--g-lime)] px-2 py-0.5 text-[10px] font-bold tracking-wider text-[#0e1110]">{item.badge}</span>}
                        {item.href === "/dashboard/support" && supportUnread > 0 ? (
                          <span aria-label={`${supportUnread} new ${supportUnread === 1 ? "reply" : "replies"}`} className="g-num ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-[var(--g-emerald)] px-1.5 text-[10.5px] font-bold text-white">
                            {supportUnread}
                          </span>
                        ) : null}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer / Logout */}
          <div className="border-t border-black/[0.06] p-3">
            <ThemeToggle className="mb-2" />
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
