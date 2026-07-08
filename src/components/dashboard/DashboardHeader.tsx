"use client";

import { useEffect, useState } from "react";
import { Bell, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

const TITLE_MAP: Array<{ prefix: string; title: string }> = [
  // Trader
  { prefix: "/dashboard/account", title: "Account" },
  { prefix: "/dashboard/new-challenge", title: "New Challenge" },
  { prefix: "/dashboard/transactions", title: "Transactions" },
  { prefix: "/dashboard/payouts", title: "Payouts" },
  { prefix: "/dashboard/competitions", title: "Competitions" },
  { prefix: "/dashboard/leaderboard", title: "Leaderboard" },
  { prefix: "/dashboard/calendar", title: "Economic Calendar" },
  { prefix: "/dashboard/affiliate", title: "Affiliate" },
  { prefix: "/dashboard/contest", title: "Contest" },
  { prefix: "/dashboard/settings", title: "Settings" },
  { prefix: "/dashboard/certificates", title: "Certificates" },
  { prefix: "/dashboard", title: "Overview" },
  // Admin
  { prefix: "/admin/users", title: "Users" },
  { prefix: "/admin/purchases", title: "Purchases" },
  { prefix: "/admin/payouts", title: "Payouts" },
  { prefix: "/admin/affiliates", title: "Affiliates" },
  { prefix: "/admin/kyc", title: "KYC" },
  { prefix: "/admin/payments", title: "Payments" },
  { prefix: "/admin/trading/dashboard", title: "Risk Dashboard" },
  { prefix: "/admin/trading/accounts", title: "Trading Accounts" },
  { prefix: "/admin/trading/rules", title: "Rule Engine" },
  { prefix: "/admin/trading/platforms", title: "Platforms & API" },
  { prefix: "/admin/challenges", title: "Challenges" },
  { prefix: "/admin/coupons", title: "Coupons" },
  { prefix: "/admin/tickets", title: "Support Tickets" },
  { prefix: "/admin/cms", title: "CMS" },
  { prefix: "/admin/faqs", title: "FAQs" },
  { prefix: "/admin/stats", title: "Stats" },
  { prefix: "/admin/fraud", title: "Fraud Detection" },
  { prefix: "/admin/notifications", title: "Notifications" },
  { prefix: "/admin/email", title: "Email" },
  { prefix: "/admin/roles", title: "Roles & Permissions" },
  { prefix: "/admin/reports", title: "Reports" },
  { prefix: "/admin/api-logs", title: "API Logs" },
  { prefix: "/admin/settings", title: "Settings" },
  { prefix: "/admin/audit", title: "Audit Logs" },
  { prefix: "/admin/orders", title: "Orders" },
  { prefix: "/admin", title: "Admin Overview" },
];

function pageTitle(pathname: string): string {
  const match = TITLE_MAP.find((t) => pathname.startsWith(t.prefix));
  return match?.title ?? "Dashboard";
}

export function DashboardHeader() {
  const pathname = usePathname();
  const [displayName, setDisplayName] = useState("");
  const [initials, setInitials] = useState("");
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        // Try profile display_name first, then email
        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, first_name, last_name")
          .eq("id", session.user.id)
          .single();

        const firstName = profile?.first_name || profile?.display_name?.split(" ")[0] || session.user.email?.split("@")[0] || "Trader";
        setDisplayName(firstName);
        setInitials(firstName.charAt(0).toUpperCase());
      } catch {
        setDisplayName("Trader");
        setInitials("T");
      }
    }
    loadUser();
  }, []);

  return (
    <header className="sticky top-14 lg:top-0 z-30 flex h-14 w-full items-center justify-between gap-3 border-b border-[var(--dash-hairline)] bg-white/85 px-4 backdrop-blur-md sm:px-6 lg:h-16 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <h1 className="truncate text-[15px] font-semibold tracking-tight text-ink sm:text-base">
          {pageTitle(pathname)}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--dash-hairline)] bg-white text-ink-500 transition-colors hover:border-[var(--dash-hairline-strong)] hover:text-ink"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span
            className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-lime-600"
            aria-hidden="true"
          />
        </button>

        {!isAdmin && (
          <Link
            href="/dashboard/new-challenge"
            className="hidden h-9 items-center gap-1.5 rounded-lg bg-ink px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-[var(--accent-700)] sm:inline-flex"
          >
            <Plus className="h-4 w-4" />
            New Challenge
          </Link>
        )}

        <div
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--dash-hairline)] bg-ink-50 text-[13px] font-semibold text-ink"
          title={displayName || undefined}
        >
          {initials || "?"}
        </div>
      </div>
    </header>
  );
}
