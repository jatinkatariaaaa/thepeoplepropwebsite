"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, LifeBuoy, Plus, Search } from "lucide-react";
import Link from "@/components/IntentLink";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { btn } from "./glass";

const searchTargets = [
  { label: "Accounts", href: "/dashboard", keywords: "home overview dashboard accounts" },
  { label: "Journal", href: "/dashboard/journal", keywords: "journal trades notes review setups mistakes" },
  { label: "Tools", href: "/dashboard/tools", keywords: "tools calculator position size risk lot pip loss limit" },
  { label: "Payouts", href: "/dashboard/payouts", keywords: "payouts withdraw money stipend rewards" },
  { label: "Support", href: "/dashboard/support", keywords: "support ticket help contact" },
  { label: "Transactions", href: "/dashboard/transactions", keywords: "transactions history payments orders" },
  { label: "Certificates", href: "/dashboard/certificates", keywords: "certificates certificate award funded payout verify" },
  { label: "Affiliate", href: "/dashboard/affiliate", keywords: "affiliate referral commission" },
  { label: "Calendar", href: "/dashboard/calendar", keywords: "calendar economic events news" },
  { label: "Leaderboard", href: "/dashboard/leaderboard", keywords: "leaderboard ranking top traders" },
  { label: "Competitions", href: "/dashboard/competitions", keywords: "competitions tournament" },
  { label: "Contest", href: "/dashboard/contest", keywords: "contest giveaway prize" },
  { label: "Settings", href: "/dashboard/settings", keywords: "settings profile account kyc password identity" },
  { label: "New account", href: "/dashboard/new-challenge", keywords: "new challenge buy start evaluation account" },
];

type Note = { id: string; title: string; body: string | null; link: string | null; read_at: string | null; created_at: string };

const ago = (iso: string) => {
  const m = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (m < 60) return `${m}m ago`;
  if (m < 1440) return `${Math.round(m / 60)}h ago`;
  return `${Math.round(m / 1440)}d ago`;
};

export function DashboardHeader() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [initials, setInitials] = useState("");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [notes, setNotes] = useState<Note[]>([]);
  const unread = notes.filter((n) => !n.read_at).length;
  const searchRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name, first_name, last_name")
          .eq("id", session.user.id)
          .single();

        const firstName =
          profile?.first_name ||
          profile?.display_name?.split(" ")[0] ||
          session.user.email?.split("@")[0] ||
          "Trader";
        setDisplayName(firstName);
        setInitials(firstName.charAt(0).toUpperCase());

        const { data: rows } = await supabase
          .from("user_notifications")
          .select("id, title, body, link, read_at, created_at")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(12);
        if (rows) setNotes(rows as Note[]);
      } catch {
        setDisplayName("Trader");
        setInitials("T");
      }
    }
    loadUser();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const results = query.trim()
    ? searchTargets.filter(
        (t) =>
          t.label.toLowerCase().includes(query.toLowerCase()) ||
          t.keywords.includes(query.toLowerCase())
      )
    : [];

  const openBell = async () => {
    const next = !bellOpen;
    setBellOpen(next);
    if (next && unread > 0) {
      const now = new Date().toISOString();
      const ids = notes.filter((n) => !n.read_at).map((n) => n.id);
      setNotes((prev) => prev.map((n) => (n.read_at ? n : { ...n, read_at: now })));
      await supabase.from("user_notifications").update({ read_at: now }).in("id", ids);
    }
  };

  const goTo = (href: string) => {
    setQuery("");
    setSearchOpen(false);
    router.push(href);
  };

  return (
    <header className="mt-16 flex w-full items-center justify-between gap-3 px-4 pt-5 sm:px-6 lg:mt-0 lg:px-8 lg:pt-7">
      {/* Greeting */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="g-card-dark g-hair hidden h-11 w-11 shrink-0 place-items-center rounded-full text-[15px] font-semibold text-white sm:grid">
          {initials || "?"}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-[20px] font-semibold tracking-[-0.03em] text-[var(--g-ink)] sm:text-[22px]">
            Hi, {displayName || "..."}
          </h1>
          <p className="text-[12.5px] text-[var(--g-muted-ink)]">
            Welcome back to your dashboard
          </p>
        </div>
      </div>

      {/* Search */}
      <div ref={searchRef} className="relative hidden max-w-xs flex-1 md:block">
        <div className="flex h-11 items-center gap-2.5 rounded-full bg-white/65 px-4 ring-1 ring-black/[0.08] backdrop-blur-md transition-shadow focus-within:ring-2 focus-within:ring-[var(--g-emerald)]/60">
          <Search className="h-4 w-4 shrink-0 text-black/40" />
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => setSearchOpen(true)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !(e.nativeEvent as unknown as { isComposing?: boolean }).isComposing &&
                e.keyCode !== 229 &&
                results.length > 0
              ) {
                goTo(results[0].href);
              }
            }}
            placeholder="Search anything..."
            className="w-full bg-transparent text-[13.5px] text-[var(--g-ink)] outline-none! placeholder:text-black/40"
          />
        </div>
        {searchOpen && query.trim() && (
          <div className="absolute top-full right-0 left-0 z-40 mt-2">
            <div className="g-glass-light g-hair g-hair-ink rounded-[20px] p-1.5">
              {results.length > 0 ? (
                results.map((r) => (
                  <button
                    key={r.href}
                    onClick={() => goTo(r.href)}
                    className="flex w-full cursor-pointer items-center gap-2.5 rounded-[14px] px-3 py-2.5 text-left text-[13.5px] font-medium text-[var(--g-ink)] transition-colors hover:bg-[var(--g-lime)]"
                  >
                    <Search className="h-3.5 w-3.5 text-black/40" />
                    {r.label}
                  </button>
                ))
              ) : (
                <p className="px-3 py-2.5 text-[13px] text-[var(--g-muted-ink)]">
                  No results found
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2">
        <Link
          href="/dashboard/support?new=1"
          aria-label="Support: raise a ticket"
          title="Raise a support ticket"
          className="grid h-10 w-10 place-items-center rounded-full bg-white/65 text-[var(--g-muted-ink)] ring-1 ring-black/[0.08] backdrop-blur-md transition-colors hover:bg-white hover:text-[var(--g-ink)]"
        >
          <LifeBuoy className="h-[18px] w-[18px]" />
        </Link>
        <div ref={bellRef} className="relative">
          <button
            aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
            onClick={() => void openBell()}
            className="relative grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-white/65 text-[var(--g-muted-ink)] ring-1 ring-black/[0.08] backdrop-blur-md transition-colors hover:bg-white hover:text-[var(--g-ink)]"
          >
            <Bell className="h-[18px] w-[18px]" />
            {unread > 0 ? <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-[var(--g-lime)] ring-2 ring-[#0e1110]" /> : null}
          </button>
          {bellOpen && (
            <div className="absolute top-full right-0 z-40 mt-2 w-80 max-w-[calc(100vw-2rem)]">
              <div className="g-glass-light g-hair g-hair-ink overflow-hidden rounded-[20px]">
                <div className="border-b border-black/[0.06] px-4 py-3">
                  <p className="text-[13.5px] font-semibold text-[var(--g-ink)]">Notifications</p>
                </div>
                <div className="max-h-[360px] overflow-y-auto p-1.5 [scrollbar-width:thin]">
                  {notes.length === 0 ? (
                    <p className="px-3 py-6 text-center text-[13px] text-[var(--g-muted-ink)]">Nothing yet. Account, payout and stipend updates appear here.</p>
                  ) : (
                    notes.map((n) => (
                      <Link key={n.id} href={n.link || "/dashboard"} onClick={() => setBellOpen(false)} className="block rounded-[14px] px-3 py-2.5 transition-colors hover:bg-black/[0.04]">
                        <p className="flex items-baseline justify-between gap-3 text-[13.5px] font-semibold text-[var(--g-ink)]">
                          <span className="min-w-0 truncate">{n.title}</span>
                          <span className="shrink-0 text-[11px] font-normal text-[var(--g-muted-ink)]">{ago(n.created_at)}</span>
                        </p>
                        {n.body ? <p className="mt-0.5 line-clamp-2 text-[12.5px] text-[var(--g-muted-ink)]">{n.body}</p> : null}
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <Link
          href="/dashboard/new-challenge"
          aria-label="New Challenge"
          className={cn(btn.lime, btn.sm, "w-10! px-0! sm:w-auto! sm:px-5!")}
        >
          <Plus className="h-4 w-4" strokeWidth={2.4} />
          <span className="hidden sm:inline">New account</span>
        </Link>
      </div>
    </header>
  );
}
