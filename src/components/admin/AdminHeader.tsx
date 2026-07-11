"use client";

import { useEffect, useState } from "react";
import { Bell, Search, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export function AdminHeader() {
  const [displayName, setDisplayName] = useState("");
  const [initials, setInitials] = useState("");

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
          "Admin";
        setDisplayName(firstName);
        setInitials(firstName.charAt(0).toUpperCase());
      } catch {
        setDisplayName("Admin");
        setInitials("A");
      }
    }
    loadUser();
  }, []);

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
            Welcome back to the admin panel
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="hidden md:flex flex-1 max-w-xs items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-sm">
        <Search className="h-4 w-4 shrink-0 text-[var(--ink-400)]" />
        <input
          type="search"
          placeholder="Search anything..."
          className="w-full bg-transparent text-[13px] font-medium text-[var(--ink-950)] placeholder:text-[var(--ink-400)] outline-none"
        />
      </div>

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2">
        <button
          aria-label="Messages"
          className="hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm text-[var(--ink-500)] transition-colors hover:text-[var(--ink-950)]"
        >
          <MessageCircle className="h-[18px] w-[18px]" />
        </button>
        <button
          aria-label="Notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm text-[var(--ink-500)] transition-colors hover:text-[var(--ink-950)]"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-red-500" />
        </button>
      </div>
    </header>
  );
}
