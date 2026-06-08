"use client";

import { Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 flex h-20 w-full items-center justify-between bg-[var(--paper-2)]/80 backdrop-blur-xl px-6 border-b border-[var(--border)] lg:h-24 lg:px-10">
      <div className="flex items-center gap-4">
        {/* The user avatar and greeting */}
        <div className="hidden sm:flex h-12 w-12 items-center justify-center rounded-full bg-[var(--paper)] border border-[var(--border)] shadow-sm font-display font-bold text-[var(--ink-950)] text-lg">
          J
        </div>
        <div>
          <h1 className="text-xl lg:text-2xl font-display font-bold text-[var(--ink-950)] tracking-tight">
            Hey, Jatin
          </h1>
          <p className="text-[13px] text-[var(--ink-500)] font-medium">
            Welcome back to your dashboard
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[var(--paper)] border border-[var(--border)] shadow-sm text-[var(--ink-500)] hover:text-[var(--ink-950)] transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2.5 flex h-2 w-2">
            <span className="absolute inset-0 animate-ping rounded-full bg-[var(--accent)] opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent)]"></span>
          </span>
        </button>
        
        <Button className="hidden sm:flex items-center gap-2 h-10 px-5 rounded-full bg-[var(--accent)] hover:bg-[var(--accent-700)] text-white shadow-md text-[14px] font-medium">
          <Plus className="w-4 h-4" />
          New Challenge
        </Button>
      </div>
    </header>
  );
}
