"use client";

import { useEffect, useState } from "react";
import { Bell, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";

export function DashboardHeader() {
  const [displayName, setDisplayName] = useState("");
  const [initials, setInitials] = useState("");

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
    <header className="sticky top-16 lg:top-0 z-30 mt-16 lg:mt-0 flex min-h-[84px] w-full items-center justify-between gap-3 bg-[var(--paper-2)]/85 backdrop-blur-xl px-4 py-3 border-b border-[var(--border)] sm:px-6 lg:h-24 lg:px-10 lg:py-0">
      <div className="min-w-0 flex items-center gap-3 sm:gap-4">
        {/* The user avatar and greeting */}
        <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-[var(--paper)] border border-[var(--border)] shadow-sm font-display font-bold text-[var(--ink-950)] text-lg">
          {initials || "?"}
        </div>
        <div className="min-w-0">
          <h1 className="truncate text-lg sm:text-xl lg:text-2xl font-display font-bold text-[var(--ink-950)] tracking-tight">
            Hey, {displayName || "..."}
          </h1>
          <p className="text-[12px] sm:text-[13px] text-[var(--ink-500)] font-medium">
            Welcome back to your dashboard
          </p>
        </div>
      </div>

      <div className="shrink-0 flex items-center gap-2 sm:gap-3">
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[var(--paper)] border border-[var(--border)] shadow-sm text-[var(--ink-500)] hover:text-[var(--ink-950)] transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2.5 flex h-2 w-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-[var(--accent)] opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]"></span>
          </span>
        </button>
        
        <Link href="/dashboard/new-challenge">
          <Button className="flex items-center justify-center gap-2 h-10 w-10 sm:w-auto sm:px-5 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-700)] text-white shadow-md text-[14px] font-medium">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Challenge</span>
          </Button>
        </Link>
      </div>
    </header>
  );
}
