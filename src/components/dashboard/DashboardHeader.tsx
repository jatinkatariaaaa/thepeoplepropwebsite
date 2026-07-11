"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const searchTargets = [
  { label: "Home", href: "/dashboard", keywords: "home overview dashboard accounts" },
  { label: "Contest", href: "/dashboard/contest", keywords: "contest giveaway prize" },
  { label: "Transactions", href: "/dashboard/transactions", keywords: "transactions history payments orders" },
  { label: "Competitions", href: "/dashboard/competitions", keywords: "competitions tournament" },
  { label: "Leaderboard", href: "/dashboard/leaderboard", keywords: "leaderboard ranking top traders" },
  { label: "Calendar", href: "/dashboard/calendar", keywords: "calendar economic events news" },
  { label: "Affiliate", href: "/dashboard/affiliate", keywords: "affiliate referral commission" },
  { label: "Payouts", href: "/dashboard/payouts", keywords: "payouts withdraw money" },
  { label: "Settings", href: "/dashboard/settings", keywords: "settings profile account kyc password" },
  { label: "New Challenge", href: "/dashboard/new-challenge", keywords: "new challenge buy start evaluation" },
];

export function DashboardHeader() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [initials, setInitials] = useState("");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
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

  const goTo = (href: string) => {
    setQuery("");
    setSearchOpen(false);
    router.push(href);
  };

  return (
    <header className="mt-16 lg:mt-0 flex w-full items-center justify-between gap-3 px-4 pt-5 sm:px-6 lg:px-8 lg:pt-7">
      {/* Greeting */}
      <div className="flex min-w-0 items-center gap-3">
        <div className="hidden sm:flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0c0c0c] text-[15px] font-bold text-white">
          {initials || "?"}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-lg sm:text-xl font-bold tracking-tight text-[var(--ink-950)]">
            Hi, {displayName || "..."}
          </h1>
          <p className="text-[12px] font-medium text-[var(--ink-400)]">
            Welcome back to your dashboard
          </p>
        </div>
      </div>

      {/* Search */}
      <div ref={searchRef} className="relative hidden md:block flex-1 max-w-xs">
        <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-sm">
          <Search className="h-4 w-4 shrink-0 text-[var(--ink-400)]" />
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
            className="w-full bg-transparent text-[13px] font-medium text-[var(--ink-950)] placeholder:text-[var(--ink-400)] outline-none"
          />
        </div>
        {searchOpen && query.trim() && (
          <div className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl bg-white p-1.5 shadow-lg border border-[var(--border)]">
            {results.length > 0 ? (
              results.map((r) => (
                <button
                  key={r.href}
                  onClick={() => goTo(r.href)}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[13px] font-semibold text-[var(--ink-950)] transition-colors hover:bg-[#cbfb45]"
                >
                  <Search className="h-3.5 w-3.5 text-[var(--ink-400)]" />
                  {r.label}
                </button>
              ))
            ) : (
              <p className="px-3 py-2 text-[13px] font-medium text-[var(--ink-400)]">
                No results found
              </p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2">
        <div ref={bellRef} className="relative">
          <button
            aria-label="Notifications"
            onClick={() => setBellOpen(!bellOpen)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm text-[var(--ink-500)] transition-colors hover:text-[var(--ink-950)]"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-[#cbfb45] ring-2 ring-white" />
          </button>
          {bellOpen && (
            <div className="absolute right-0 top-full z-40 mt-2 w-72 overflow-hidden rounded-2xl bg-white shadow-lg border border-[var(--border)]">
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                <p className="text-[13px] font-bold text-[var(--ink-950)]">
                  Notifications
                </p>
                <span className="rounded-full bg-[#cbfb45] px-2 py-0.5 text-[10px] font-bold text-[#0c0c0c] uppercase tracking-wider">
                  New
                </span>
              </div>
              <div className="p-2">
                <Link
                  href="/dashboard/contest"
                  onClick={() => setBellOpen(false)}
                  className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-[var(--paper-2)]"
                >
                  <p className="text-[13px] font-semibold text-[var(--ink-950)]">
                    Contest is live
                  </p>
                  <p className="text-[12px] text-[var(--ink-400)]">
                    Join the giveaway contest and win prizes
                  </p>
                </Link>
                <Link
                  href="/dashboard/new-challenge"
                  onClick={() => setBellOpen(false)}
                  className="block rounded-xl px-3 py-2.5 transition-colors hover:bg-[var(--paper-2)]"
                >
                  <p className="text-[13px] font-semibold text-[var(--ink-950)]">
                    Start a new challenge
                  </p>
                  <p className="text-[12px] text-[var(--ink-400)]">
                    Get funded up to $200,000 today
                  </p>
                </Link>
              </div>
            </div>
          )}
        </div>

        <Link
          href="/dashboard/new-challenge"
          className="flex h-10 w-10 sm:w-auto items-center justify-center gap-2 rounded-full bg-[#0c0c0c] sm:px-5 text-white transition-colors hover:bg-[#262626] text-[13px] font-bold"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">New Challenge</span>
        </Link>
      </div>
    </header>
  );
}
