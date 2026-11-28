"use client";

import { useEffect, useRef, useState } from "react";
import Link from "@/components/IntentLink";
import { useRouter } from "next/navigation";
import { Bell, MessageCircle, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";

const targets = [
  { label: "Overview", href: "/admin", keywords: "overview dashboard home revenue" },
  { label: "Users", href: "/admin/users", keywords: "users traders profiles suspend" },
  { label: "Purchases", href: "/admin/purchases", keywords: "purchases orders sales refunds" },
  { label: "Payouts", href: "/admin/payouts", keywords: "payouts withdrawals approve reject" },
  { label: "Stipends & Rewards", href: "/admin/rewards", keywords: "stipend rewards perks settings on demand" },
  { label: "Affiliates", href: "/admin/affiliates", keywords: "affiliates referrals commission" },
  { label: "KYC", href: "/admin/kyc", keywords: "kyc identity verification documents" },
  { label: "Payments", href: "/admin/payments", keywords: "payments transactions gateway" },
  { label: "Risk Dashboard", href: "/admin/trading/dashboard", keywords: "risk drawdown exposure" },
  { label: "Trading Accounts", href: "/admin/trading/accounts", keywords: "trading accounts create assign breach" },
  { label: "Resets & Activations", href: "/admin/resets", keywords: "reset free retry access activation" },
  { label: "Rule Engine", href: "/admin/trading/rules", keywords: "rules targets drawdown" },
  { label: "Platforms & API", href: "/admin/trading/platforms", keywords: "platform terminal api key" },
  { label: "Challenges", href: "/admin/challenges", keywords: "challenges programs fees prices" },
  { label: "Coupons", href: "/admin/coupons", keywords: "coupons promo discount" },
  { label: "Contest Referrals", href: "/admin/contest", keywords: "contest referrals" },
  { label: "Support Tickets", href: "/admin/tickets", keywords: "support tickets messages" },
  { label: "Assistant Log", href: "/admin/assistant", keywords: "assistant ai chat questions" },
  { label: "FAQs", href: "/admin/faqs", keywords: "faq questions answers" },
  { label: "CMS", href: "/admin/cms", keywords: "cms content pages" },
  { label: "Stats", href: "/admin/stats", keywords: "stats landing numbers" },
  { label: "Fraud Detection", href: "/admin/fraud", keywords: "fraud flags duplicate" },
  { label: "Notifications", href: "/admin/notifications", keywords: "notifications alerts" },
  { label: "Roles & Permissions", href: "/admin/roles", keywords: "roles admins permissions" },
  { label: "Reports", href: "/admin/reports", keywords: "reports export csv" },
  { label: "API Logs", href: "/admin/api-logs", keywords: "api logs" },
  { label: "Settings", href: "/admin/settings", keywords: "settings branding seo security" },
  { label: "Audit Logs", href: "/admin/audit", keywords: "audit log history" },
];

export function AdminHeader() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [counts, setCounts] = useState({ alerts: 0, tickets: 0 });
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const [{ data: profile }, alerts, tickets] = await Promise.all([
        supabase.from("profiles").select("display_name, first_name").eq("id", session.user.id).maybeSingle(),
        supabase.from("admin_notifications").select("id", { count: "exact", head: true }).eq("is_read", false),
        supabase.from("support_tickets").select("id", { count: "exact", head: true }).eq("last_sender", "user").in("status", ["open", "in_progress"]),
      ]);
      setDisplayName(profile?.first_name || profile?.display_name?.split(" ")[0] || session.user.email?.split("@")[0] || "Admin");
      setCounts({ alerts: alerts.count ?? 0, tickets: tickets.count ?? 0 });
    })();
    const onClick = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const q = query.trim().toLowerCase();
  const results = q ? targets.filter((t) => t.label.toLowerCase().includes(q) || t.keywords.includes(q)).slice(0, 7) : [];
  const go = (href: string) => {
    setQuery("");
    setOpen(false);
    router.push(href);
  };

  const iconButton = "relative grid h-10 w-10 place-items-center rounded-full bg-white/70 text-[var(--ink-500)] ring-1 ring-black/[0.08] backdrop-blur-md transition-colors hover:bg-white hover:text-[var(--ink-950)]";
  const badge = "g-num absolute -top-1 -right-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-[#0e1110] px-1 text-[10px] font-bold text-[#cbfb45]";

  return (
    <header className="mt-16 flex w-full items-center justify-between gap-3 px-4 pt-5 sm:px-6 lg:mt-0 lg:px-8 lg:pt-7">
      <div className="flex min-w-0 items-center gap-3">
        <div className="hidden h-11 w-11 shrink-0 place-items-center rounded-full bg-[#0e1110] text-[15px] font-semibold text-white sm:grid">{(displayName || "A").charAt(0).toUpperCase()}</div>
        <div className="min-w-0">
          <p className="truncate text-[20px] font-semibold tracking-[-0.03em] text-[var(--ink-950)]">Hi, {displayName || "…"}</p>
          <p className="text-[12.5px] text-[var(--ink-500)]">The People Prop admin</p>
        </div>
      </div>

      <div ref={box} className="relative hidden max-w-xs flex-1 md:block">
        <div className="flex h-11 items-center gap-2.5 rounded-full bg-white/70 px-4 ring-1 ring-black/[0.08] backdrop-blur-md focus-within:ring-2 focus-within:ring-[#1d6656]/60">
          <Search className="h-4 w-4 shrink-0 text-[var(--ink-400)]" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => e.key === "Enter" && results[0] && go(results[0].href)}
            placeholder="Jump to a section"
            aria-label="Jump to a section"
            className="w-full bg-transparent text-[13.5px] text-[var(--ink-950)] outline-none placeholder:text-[var(--ink-400)]"
          />
        </div>
        {open && q ? (
          <div className="absolute top-full right-0 left-0 z-40 mt-2 rounded-[20px] bg-white p-1.5 shadow-[0_30px_60px_-30px_rgba(16,40,34,0.4)] ring-1 ring-black/[0.07]">
            {results.length ? (
              results.map((r) => (
                <button key={r.href} type="button" onClick={() => go(r.href)} className="block w-full cursor-pointer rounded-[14px] px-3 py-2.5 text-left text-[13.5px] font-medium text-[var(--ink-950)] hover:bg-[#cbfb45]">
                  {r.label}
                </button>
              ))
            ) : (
              <p className="px-3 py-2.5 text-[13px] text-[var(--ink-500)]">No section matches</p>
            )}
          </div>
        ) : null}
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <Link href="/admin/tickets" aria-label={`Support tickets, ${counts.tickets} waiting for a reply`} className={iconButton}>
          <MessageCircle className="h-[18px] w-[18px]" />
          {counts.tickets > 0 ? <span className={badge}>{counts.tickets}</span> : null}
        </Link>
        <Link href="/admin/notifications" aria-label={`Notifications, ${counts.alerts} unread`} className={iconButton}>
          <Bell className="h-[18px] w-[18px]" />
          {counts.alerts > 0 ? <span className={badge}>{counts.alerts}</span> : null}
        </Link>
      </div>
    </header>
  );
}
