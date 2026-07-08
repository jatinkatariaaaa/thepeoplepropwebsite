"use client";

import { useState } from "react";
import { Copy, Check, Share2 } from "lucide-react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { cn } from "@/lib/utils";
import { UserProfile } from "@/lib/supabase";

export function ReferralLinkBox({ profile }: { profile: UserProfile | null }) {
  const { copied, copy } = useCopyToClipboard();
  const [toast, setToast] = useState(false);

  const code = profile?.referral_code || "GENERATING...";
  const link = profile ? `https://thepeopleprop.com/r/${code.toLowerCase()}` : "Loading...";

  async function handleCopy(text: string) {
    if (!profile) return;
    const ok = await copy(text);
    if (ok) {
      setToast(true);
      setTimeout(() => setToast(false), 1800);
    }
  }

  return (
    <div className="relative rounded-none border border-[var(--border)] bg-gradient-to-br from-white via-[var(--paper)] to-[var(--accent-50)] p-6 md:p-7 overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute -top-16 -right-12 w-72 h-72 rounded-full bg-[rgba(14,124,92,0.12)] blur-3xl pointer-events-none"
      />
      <div className="relative">
        <div className="flex items-center justify-between mb-5">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-[var(--ink-500)] mb-1">
              Your referral link
            </div>
            <div className="font-display text-xl text-[var(--ink-950)]">
              Share. Earn <span className="word-serif">15%</span>.
            </div>
          </div>
          <div className="grid place-items-center w-10 h-10 rounded-none bg-[var(--accent-50)] text-[var(--carbon-blue)]">
            <Share2 className="w-5 h-5" strokeWidth={2.2} />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-2.5">
          <div className="flex-1 flex items-center gap-3 rounded-full bg-white border border-[var(--border)] pl-5 pr-2 py-2">
            <span className="text-sm text-[var(--ink-800)] tabular-nums truncate flex-1">
              {link}
            </span>
            <button
              type="button"
              onClick={() => handleCopy(link)}
              disabled={!profile}
              aria-label="Copy referral link"
              className={cn(
                "shrink-0 inline-flex items-center gap-1.5 h-9 px-4 rounded-full text-xs font-medium transition-all cursor-pointer disabled:opacity-50",
                copied
                  ? "bg-[var(--accent-50)] text-[var(--carbon-blue)] border border-[var(--accent-200)]"
                  : "bg-[var(--carbon-blue)] text-white hover:bg-[var(--carbon-blue-hover)]",
              )}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" strokeWidth={2.2} /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" strokeWidth={2.2} /> Copy
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
          <span className="text-[var(--ink-500)]">Or use code</span>
          <button
            type="button"
            disabled={!profile}
            onClick={() => handleCopy(code)}
            className="font-mono tracking-wider text-[var(--carbon-blue)] hover:text-[var(--accent-800)] transition-colors border border-[var(--accent-200)] bg-[var(--accent-50)] rounded-none px-2 py-1 cursor-pointer disabled:opacity-50"
          >
            {code}
          </button>
        </div>
      </div>

      {/* Toast */}
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300",
          toast ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none",
        )}
      >
        <div className="rounded-full bg-[var(--ink-950)] border border-[var(--ink-800)] px-5 py-2.5 text-sm text-white flex items-center gap-2 shadow-lg">
          <Check className="w-4 h-4 text-[#D8F26B]" strokeWidth={2.2} />
          Copied to clipboard
        </div>
      </div>
    </div>
  );
}