"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Trophy,
  Gift,
  BarChart3,
  Settings,
  LogOut,
  ArrowLeft,
  Menu,
} from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { cn } from "@/lib/utils";
import { UserProfile, supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const items = [
  { icon: LayoutDashboard, label: "Overview", active: true },
  { icon: Trophy, label: "Leaderboard" },
  { icon: Gift, label: "Rewards" },
  { icon: BarChart3, label: "Analytics" },
  { icon: Settings, label: "Settings" },
];

export function DashboardSidebar({
  active,
  onChange,
  profile,
}: {
  active: string;
  onChange: (v: string) => void;
  profile: UserProfile | null;
}) {
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-[var(--border)] bg-white fixed left-0 top-0 h-screen z-40">
      <div className="px-6 h-[72px] flex items-center justify-between border-b border-[var(--border)]">
        <Logo />
      </div>
      <Link
        href="/"
        className="flex items-center gap-2 mx-3 mt-3 px-3 py-2 rounded-none text-[12px] text-[var(--ink-500)] hover:text-[var(--ink-950)] hover:bg-[var(--paper-2)]"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to site
      </Link>

      <nav className="flex-1 px-3 py-6 space-y-1">
        {items.map((it) => (
          <button
            key={it.label}
            onClick={() => onChange(it.label)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-none text-[13.5px] transition-all cursor-pointer",
              active === it.label
                ? "bg-[var(--accent-50)] text-[var(--carbon-blue)] border border-[rgba(14,124,92,0.18)] font-medium"
                : "text-[var(--ink-500)] hover:text-[var(--ink-950)] hover:bg-[var(--paper-2)] border border-transparent",
            )}
          >
            <it.icon className="w-4 h-4" strokeWidth={2} />
            {it.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-[var(--border)]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-full bg-[var(--carbon-blue)] text-white grid place-items-center text-[12px] font-medium tracking-wide">
            {profile?.display_name ? profile.display_name.substring(0, 2).toUpperCase() : "US"}
          </div>
          <div className="min-w-0">
            <div className="text-[13.5px] text-[var(--ink-950)] truncate font-medium">
              {profile?.display_name || "User"}
            </div>
            <div className="text-[11px] text-[var(--ink-400)] truncate tracking-eyebrow">
              Rank #{profile?.global_rank || "999"}
            </div>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-none text-[13.5px] text-[var(--ink-500)] hover:text-[var(--ink-950)] hover:bg-[var(--paper-2)] transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" strokeWidth={2} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

export function MobileTopBar({
  active,
  onChange,
}: {
  active: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="lg:hidden sticky top-0 z-30 bg-paper/90 backdrop-blur-xl border-b border-[var(--border)]">
      <div className="flex items-center justify-between h-14 px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[12px] text-[var(--ink-500)] hover:text-[var(--ink-950)]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </Link>
        <Logo showWord={false} />
        <button
          aria-label="Menu"
          className="grid place-items-center w-9 h-9 rounded-full border border-[var(--border-strong)] bg-white text-[var(--ink-950)]"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-center gap-1 px-4 pb-3 overflow-x-auto">
        {items.map((it) => (
          <button
            key={it.label}
            onClick={() => onChange(it.label)}
            className={cn(
              "shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-full text-[12px] whitespace-nowrap transition-all border",
              active === it.label
                ? "bg-[var(--accent-50)] text-[var(--carbon-blue)] border-[rgba(14,124,92,0.22)] font-medium"
                : "border-[var(--border)] text-[var(--ink-500)] hover:text-[var(--ink-950)] bg-white",
            )}
          >
            <it.icon className="w-3.5 h-3.5" strokeWidth={2} />
            {it.label}
          </button>
        ))}
      </div>
    </div>
  );
}