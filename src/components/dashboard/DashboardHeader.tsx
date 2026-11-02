"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { btn } from "./glass";

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
        <div ref={bellRef} className="relative">
          <button
            aria-label="Notifications"
            onClick={() => setBellOpen(!bellOpen)}
            className="relative grid h-10 w-10 cursor-pointer place-items-center rounded-full bg-white/65 text-[var(--g-muted-ink)] ring-1 ring-black/[0.08] backdrop-blur-md transition-colors hover:bg-white hover:text-[var(--g-ink)]"
          >
            <Bell className="h-[18px] w-[18px]" />
            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-[var(--g-lime)] ring-2 ring-[var(--g-ink)]" />
          </button>
          {bellOpen && (
            <div className="absolute top-full right-0 z-40 mt-2 w-72 max-w-[calc(100vw-2rem)]">
              <div className="g-glass-light g-hair g-hair-ink overflow-hidden rounded-[20px]">
                <div className="flex items-center justify-between border-b border-black/[0.06] px-4 py-3">
                  <p className="text-[13.5px] font-semibold text-[var(--g-ink)]">
                    Notifications
                  </p>
                  <span className="rounded-full bg-[var(--g-lime)] px-2 py-0.5 text-[10px] font-bold tracking-wider text-[var(--g-ink)] uppercase">
                    New
                  </span>
                </div>
                <div className="p-1.5">
                  <Link
                    href="/dashboard/contest"
                    onClick={() => setBellOpen(false)}
                    className="block rounded-[14px] px-3 py-2.5 transition-colors hover:bg-black/[0.04]"
                  >
                    <p className="text-[13.5px] font-semibold text-[var(--g-ink)]">
                      Contest is live
                    </p>
                    <p className="mt-0.5 text-[12.5px] text-[var(--g-muted-ink)]">
                      Join the giveaway contest and win prizes
                    </p>
                  </Link>
                  <Link
                    href="/dashboard/new-challenge"
                    onClick={() => setBellOpen(false)}
                    className="block rounded-[14px] px-3 py-2.5 transition-colors hover:bg-black/[0.04]"
                  >
                    <p className="text-[13.5px] font-semibold text-[var(--g-ink)]">
                      Start a new challenge
                    </p>
                    <p className="mt-0.5 text-[12.5px] text-[var(--g-muted-ink)]">
                      Get funded up to $200,000 today
                    </p>
                  </Link>
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
          <span className="hidden sm:inline">New Challenge</span>
        </Link>
      </div>
    </header>
  );
}
