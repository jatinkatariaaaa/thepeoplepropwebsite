"use client";

import { useState, useEffect } from "react";
import {
  Gift,
  Users,
  Link2,
  Copy,
  Check,
  Share2,
  Trophy,
  ArrowRight,
  CheckCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

/* ---------- types ---------- */
interface ContestEntry {
  id: string;
  referral_code: string;
  referral_count: number;
  target: number;
  claimed: boolean;
}

interface Referral {
  id: string;
  email: string;
  created_at: string;
}

/* ---------- helpers ---------- */
function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!domain) return "***@***";
  const first = local.charAt(0);
  const last = local.length > 1 ? local.charAt(local.length - 1) : "";
  return `${first}***${last}@${domain}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ============================================================ */
export function ContestDashboard() {
  const [loading, setLoading] = useState(true);
  const [entry, setEntry] = useState<ContestEntry | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [link, setLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [error, setError] = useState("");

  /* --- bootstrap: join (idempotent) then hydrate referrals --- */
  useEffect(() => {
    async function init() {
      try {
        // 1. Join or get existing entry via API
        const joinRes = await fetch("/api/contest/join", { method: "POST" });
        const joinData = await joinRes.json();

        if (!joinData.success) {
          setError(joinData.message || "Failed to load contest data");
          setLoading(false);
          return;
        }

        setEntry(joinData.entry);
        setLink(joinData.link);

        // 2. Fetch referral rows from supabase (contest_referrals table)
        const { data: refs } = await supabase
          .from("contest_referrals")
          .select("id, email, created_at")
          .eq("contest_entry_id", joinData.entry.id)
          .order("created_at", { ascending: false });

        if (refs) setReferrals(refs);
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  /* --- copy handler --- */
  const handleCopy = (text?: string) => {
    const toCopy = text || link;
    if (!toCopy) return;
    navigator.clipboard.writeText(toCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* --- claim handler --- */
  const handleClaim = async () => {
    if (!entry || claiming) return;
    setClaiming(true);
    try {
      const res = await fetch("/api/contest/claim", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setEntry({ ...entry, claimed: true });
        setClaimSuccess(true);
      } else {
        setError(data.message || "Failed to claim reward");
      }
    } catch {
      setError("Failed to claim reward. Please try again.");
    } finally {
      setClaiming(false);
    }
  };

  /* --- share helpers --- */
  const shareMessage = `Join The People Prop and start your trading journey! Sign up with my link: ${link}`;
  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodeURIComponent(shareMessage)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent("Join The People Prop and start your trading journey!")}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`,
  };

  /* --- derived state --- */
  const count = entry?.referral_count ?? 0;
  const target = 10;
  const remaining = Math.max(0, target - count);
  const pct = Math.min(100, Math.round((count / target) * 100));
  const canClaim = count >= target && !entry?.claimed;

  /* --- loading skeleton --- */
  if (loading) {
    return (
      <div className="mx-auto max-w-5xl animate-in fade-in duration-500">
        <div className="mb-6">
          <div className="dash-skeleton h-7 w-48" />
          <div className="dash-skeleton mt-3 h-4 w-80" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="dash-skeleton h-40 rounded-none" />
          ))}
        </div>
      </div>
    );
  }

  /* --- error fallback --- */
  if (error && !entry) {
    return (
      <div className="mx-auto max-w-5xl animate-in fade-in duration-500">
        <div className="dash-card p-8 text-center">
          <Gift className="mx-auto mb-4 h-8 w-8 text-rose-400" />
          <h2 className="mb-1.5 text-base font-semibold tracking-tight text-ink">
            Unable to load contest
          </h2>
          <p className="text-sm text-ink-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 inline-flex h-10 items-center rounded-none bg-[var(--carbon-blue)] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--carbon-blue-hover)]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* ============================================================
     MAIN RENDER
     ============================================================ */
  return (
    <div className="mx-auto max-w-5xl animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
      {/* ---- claimed banner ---- */}
      {entry?.claimed && (
        <div className="mb-6 flex items-center gap-3 rounded-none border bg-success-50 px-5 py-4">
          <span className="text-2xl">🎉</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-success-700">
              You claimed your free 10K 3-Step account!
            </p>
            <p className="mt-0.5 text-[13px] text-success-700/80">
              Check your accounts page to view it.
            </p>
          </div>
          <a
            href="/dashboard"
            className="flex items-center gap-1.5 text-[13px] font-medium text-success-700 transition-colors hover:text-ink"
          >
            View Accounts <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      )}

      {/* ---- page header ---- */}
      <div className="mb-6">
        <p className="dash-overline mb-1.5">Rewards</p>
        <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
          Contest
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Invite 10 friends and claim your free 10K account.
        </p>
      </div>

      {/* ---- progress section ---- */}
      <div className="dash-card mb-6 overflow-hidden">
        <div className="border-b border-[var(--dash-hairline)] px-4 py-3.5 sm:px-5">
          <h2 className="text-[15px] font-semibold tracking-tight text-ink">
            Your Progress
          </h2>
        </div>
        <div className="p-4 sm:p-5">
          {/* step circles removed */}

          {/* label */}
          <div className="mb-3 flex items-baseline justify-between">
            <span className="dash-num text-sm font-semibold text-ink">{count} <span className="font-normal text-ink-400">/ {target}</span></span>
            <span className="dash-num text-xs text-ink-500">{pct}% complete</span>
          </div>

          {/* progress bar */}
          <div className="dash-track">
            <div className="bg-ink-950" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {/* ---- stats grid ---- */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* total referrals */}
        <div className="dash-card dash-card-hover p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="dash-overline">Total Referrals</p>
            <Users className="h-4 w-4 text-ink-300" aria-hidden="true" />
          </div>
          <p className="dash-figure text-2xl">{count}</p>
        </div>

        {/* remaining */}
        <div className="dash-card dash-card-hover p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="dash-overline">Remaining</p>
            <Clock className="h-4 w-4 text-ink-300" aria-hidden="true" />
          </div>
          <p className="dash-figure text-2xl">{remaining}</p>
        </div>

        {/* status */}
        <div className="dash-card dash-card-hover p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="dash-overline">Status</p>
            <Trophy className="h-4 w-4 text-ink-300" aria-hidden="true" />
          </div>
          <p
            className={cn(
              "text-base font-semibold tracking-tight",
              entry?.claimed || canClaim
                ? "text-[var(--dash-positive)]"
                : "text-ink"
            )}
          >
            {entry?.claimed
              ? "Claimed"
              : canClaim
                ? "Ready to Claim"
                : "In Progress"}
          </p>
        </div>
      </div>

      {/* ---- referral link ---- */}
      <div className="dash-card mb-6 overflow-hidden">
        <div className="border-b border-[var(--dash-hairline)] px-4 py-3.5 sm:px-5">
          <h2 className="text-[15px] font-semibold tracking-tight text-ink">
            Your Referral Link
          </h2>
          <p className="mt-1 text-[13px] text-ink-500">
            Share this link with friends to earn referrals
          </p>
        </div>
        <div className="bg-[var(--dash-canvas)] p-4 sm:p-5">
          {/* link + copy */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <div className="flex h-11 flex-1 items-center overflow-hidden rounded-none border border-[var(--dash-hairline)] bg-white px-3.5">
              <Link2 className="mr-2 h-4 w-4 shrink-0 text-ink-400" />
              <span className="dash-num truncate text-[13px] text-ink-600">
                {link || "Loading..."}
              </span>
            </div>
            <button
              onClick={() => handleCopy()}
              disabled={!link}
              className={cn(
                "flex h-11 shrink-0 items-center justify-center gap-2 rounded-none px-5 text-[13px] font-semibold transition-all",
                copied
                  ? "border bg-[#a7f0ba] text-[#0e6027]"
                  : "bg-[var(--carbon-blue)] text-white hover:bg-[var(--carbon-blue-hover)] active:scale-[0.98]",
                !link && "opacity-50 cursor-not-allowed"
              )}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copy Link
                </>
              )}
            </button>
          </div>

          {/* share buttons */}
          <div className="flex flex-wrap gap-2">
            <a
              href={shareLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-none border border-[var(--dash-hairline)] bg-white px-3.5 text-[13px] font-medium text-ink-700 transition-colors hover:border-[var(--dash-hairline-strong)] hover:text-ink"
            >
              <Share2 className="w-4 h-4" />
              WhatsApp
            </a>
            <a
              href={shareLinks.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-none border border-[var(--dash-hairline)] bg-white px-3.5 text-[13px] font-medium text-ink-700 transition-colors hover:border-[var(--dash-hairline-strong)] hover:text-ink"
            >
              <Share2 className="w-4 h-4" />
              Telegram
            </a>
            <a
              href={shareLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-none border border-[var(--dash-hairline)] bg-white px-3.5 text-[13px] font-medium text-ink-700 transition-colors hover:border-[var(--dash-hairline-strong)] hover:text-ink"
            >
              <ExternalLink className="w-4 h-4" />
              Twitter / X
            </a>
            <button
              onClick={() => handleCopy()}
              className="inline-flex h-9 items-center gap-2 rounded-none border border-[var(--dash-hairline)] bg-white px-3.5 text-[13px] font-medium text-ink-700 transition-colors hover:border-[var(--dash-hairline-strong)] hover:text-ink"
            >
              <Copy className="w-4 h-4" />
              Copy Link
            </button>
          </div>
        </div>
      </div>

      {/* ---- referrals table ---- */}
      <div className="dash-card mb-6 overflow-hidden">
        <div className="border-b border-[var(--dash-hairline)] px-4 py-3.5 sm:px-5">
          <h2 className="text-[15px] font-semibold tracking-tight text-ink">
            Your Referrals
          </h2>
        </div>

        {referrals.length === 0 ? (
          <div className="p-6">
            <div className="text-center py-10">
              <Users className="mx-auto mb-3 h-6 w-6 text-ink-300" />
              <p className="text-sm font-semibold text-ink">
                No referrals yet
              </p>
              <p className="mt-1 text-[13px] text-ink-500">
                Share your link to start getting referrals
              </p>
            </div>
          </div>
        ) : (
          <div className="dash-scroll-x">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Signed Up</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((ref) => (
                  <tr key={ref.id}>
                    <td className="dash-num text-ink-700">
                      {maskEmail(ref.email)}
                    </td>
                    <td className="text-ink-600">
                      {formatDate(ref.created_at)}
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1 rounded-full border bg-success-50 px-2 py-0.5 text-[11px] font-medium text-success-700">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ---- claim section ---- */}
      {canClaim && !claimSuccess && (
        <div className="dash-card relative mb-6 overflow-hidden border-ink-950">
          {/* subtle confetti-like accent */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-lime-500" aria-hidden="true" />
          <div className="relative p-8 text-center">
            <h2 className="mb-2 text-lg font-semibold tracking-tight text-ink">
              Congratulations! You&apos;ve completed all {target} referrals!
            </h2>
            <p className="mb-6 text-sm text-ink-500">
              Click below to claim your free 10K 3-Step trading account
            </p>
            <button
              onClick={handleClaim}
              disabled={claiming}
              className={cn(
                "inline-flex h-11 items-center gap-2 rounded-none px-6 text-sm font-semibold transition-all",
                claiming
                  ? "cursor-wait bg-ink/60 text-white"
                  : "bg-[var(--carbon-blue)] text-white hover:bg-[var(--carbon-blue-hover)] active:scale-[0.98]"
              )}
            >
              {claiming ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Claiming...
                </>
              ) : (
                <>
                  <Trophy className="h-4 w-4" />
                  Claim Your Free 10K Account
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ---- already claimed (came back to page) ---- */}
      {entry?.claimed && !claimSuccess && (
        <div className="mb-6 rounded-none border bg-success-50 p-5">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 shrink-0 text-success-700" />
            <div>
              <p className="text-sm font-semibold text-success-700">
                You&apos;ve already claimed your free account
              </p>
              <p className="mt-0.5 text-[13px] text-success-700/80">
                Head to your accounts page to start trading.
              </p>
            </div>
            <a
              href="/dashboard"
              className="ml-auto flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-success-700 transition-colors hover:text-ink"
            >
              View Accounts <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {/* ---- just claimed success ---- */}
      {claimSuccess && (
        <div className="mb-6 rounded-none border bg-success-50 p-8 text-center">
          <h2 className="mb-2 text-lg font-semibold tracking-tight text-success-700">
            Your free 10K account has been claimed!
          </h2>
          <p className="mb-5 text-sm text-success-700/80">
            Check your accounts page to view and start trading on your new
            account.
          </p>
          <a
            href="/dashboard"
            className="inline-flex h-10 items-center gap-2 rounded-none bg-[var(--carbon-blue)] px-5 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--carbon-blue-hover)]"
          >
            Go to Accounts <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      )}

      {/* ---- inline error toast ---- */}
      {error && entry && (
        <div className="mb-6 rounded-none border bg-rose-50 px-5 py-4">
          <p className="text-[13px] text-rose-700">{error}</p>
        </div>
      )}
    </div>
  );
}
