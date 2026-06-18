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
  const target = entry?.target ?? 5;
  const remaining = Math.max(0, target - count);
  const pct = Math.min(100, Math.round((count / target) * 100));
  const canClaim = count >= target && !entry?.claimed;

  /* --- loading skeleton --- */
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
        <div className="mb-8">
          <div className="h-8 w-48 bg-[var(--border)] rounded-lg animate-pulse" />
          <div className="h-5 w-80 bg-[var(--border)] rounded-lg animate-pulse mt-3" />
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-[var(--border)] shadow-sm h-40 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  /* --- error fallback --- */
  if (error && !entry) {
    return (
      <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
        <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8 text-center">
          <Gift className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-[18px] font-bold text-[var(--ink-950)] mb-2">
            Unable to load contest
          </h2>
          <p className="text-[14px] text-[var(--ink-500)]">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 bg-[var(--accent)] hover:bg-[var(--accent-700)] text-white rounded-xl px-5 py-2.5 font-medium text-[14px] transition-colors"
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
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* ---- claimed banner ---- */}
      {entry?.claimed && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl px-6 py-4 flex items-center gap-3">
          <span className="text-2xl">🎉</span>
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-emerald-800">
              You claimed your free 10K 3-Step account!
            </p>
            <p className="text-[13px] text-emerald-600 mt-0.5">
              Check your accounts page to view it.
            </p>
          </div>
          <a
            href="/dashboard"
            className="flex items-center gap-1.5 text-[13px] font-medium text-emerald-700 hover:text-emerald-900 transition-colors"
          >
            View Accounts <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      )}

      {/* ---- page header ---- */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
            <Gift className="w-5 h-5 text-[var(--accent)]" />
          </div>
          <h1 className="text-2xl font-display font-bold text-[var(--ink-950)]">
            Contest
          </h1>
        </div>
        <p className="text-[14px] text-[var(--ink-500)]">
          Invite 5 friends and claim your free 10K account
        </p>
      </div>

      {/* ---- progress section ---- */}
      <div className="bg-white rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-[var(--border)]">
          <h2 className="text-[16px] font-bold text-[var(--ink-950)]">
            Your Progress
          </h2>
        </div>
        <div className="p-6">
          {/* step circles */}
          <div className="flex items-center justify-center gap-0 mb-6">
            {Array.from({ length: target }).map((_, i) => {
              const done = i < count;
              return (
                <div key={i} className="flex items-center">
                  {/* circle */}
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 shrink-0",
                      done
                        ? "bg-[var(--accent)] shadow-md shadow-[var(--accent)]/25"
                        : "border-2 border-dashed border-[var(--border)] bg-[var(--paper-2)]"
                    )}
                  >
                    {done ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <span className="text-[14px] font-semibold text-[var(--ink-300)]">
                        {i + 1}
                      </span>
                    )}
                  </div>
                  {/* connector line */}
                  {i < target - 1 && (
                    <div
                      className={cn(
                        "w-10 sm:w-16 h-0.5 transition-all duration-500",
                        i < count - 1
                          ? "bg-[var(--accent)]"
                          : "bg-[var(--border)]"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* label */}
          <p className="text-center text-[14px] font-medium text-[var(--ink-600)] mb-4">
            {count} of {target} referrals completed
          </p>

          {/* progress bar */}
          <div className="h-2 rounded-full bg-[var(--border)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ---- stats grid ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {/* total referrals */}
        <div className="bg-white rounded-2xl p-6 border border-[var(--border)] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-[var(--ink-500)]">
                Total Referrals
              </p>
              <p className="text-[32px] font-bold text-[var(--ink-950)] leading-tight mt-0.5">
                {count}
              </p>
            </div>
          </div>
        </div>

        {/* remaining */}
        <div className="bg-white rounded-2xl p-6 border border-[var(--border)] shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-[13px] font-medium text-[var(--ink-500)]">
                Remaining
              </p>
              <p className="text-[32px] font-bold text-[var(--ink-950)] leading-tight mt-0.5">
                {remaining}
              </p>
            </div>
          </div>
        </div>

        {/* status */}
        <div className="bg-white rounded-2xl p-6 border border-[var(--border)] shadow-sm">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                entry?.claimed
                  ? "bg-emerald-50"
                  : canClaim
                    ? "bg-[var(--accent)]/10"
                    : "bg-purple-50"
              )}
            >
              <Trophy
                className={cn(
                  "w-6 h-6",
                  entry?.claimed
                    ? "text-emerald-600"
                    : canClaim
                      ? "text-[var(--accent)]"
                      : "text-purple-600"
                )}
              />
            </div>
            <div>
              <p className="text-[13px] font-medium text-[var(--ink-500)]">
                Status
              </p>
              <p
                className={cn(
                  "text-[16px] font-bold leading-tight mt-0.5",
                  entry?.claimed
                    ? "text-emerald-600"
                    : canClaim
                      ? "text-[var(--accent)]"
                      : "text-[var(--ink-950)]"
                )}
              >
                {entry?.claimed
                  ? "Claimed ✅"
                  : canClaim
                    ? "Ready to Claim!"
                    : "In Progress"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ---- referral link ---- */}
      <div className="bg-white rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-[var(--border)]">
          <h2 className="text-[16px] font-bold text-[var(--ink-950)]">
            Your Referral Link
          </h2>
          <p className="text-[13px] text-[var(--ink-500)] mt-1">
            Share this link with friends to earn referrals
          </p>
        </div>
        <div className="p-6 bg-[var(--paper-2)]">
          {/* link + copy */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="flex-1 bg-white border border-[var(--border)] rounded-xl h-12 flex items-center px-4 overflow-hidden">
              <Link2 className="w-4 h-4 text-[var(--ink-400)] shrink-0 mr-2" />
              <span className="text-[14px] font-mono text-[var(--ink-600)] truncate">
                {link || "Loading..."}
              </span>
            </div>
            <button
              onClick={() => handleCopy()}
              disabled={!link}
              className={cn(
                "h-12 px-6 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 transition-all shrink-0",
                copied
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                  : "bg-[var(--ink-950)] hover:bg-[var(--ink-800)] text-white shadow-md active:scale-[0.98]",
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
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium bg-[#25D366] hover:bg-[#20bd5a] text-white transition-colors"
            >
              <Share2 className="w-4 h-4" />
              WhatsApp
            </a>
            <a
              href={shareLinks.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium bg-[#0088CC] hover:bg-[#007ab8] text-white transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Telegram
            </a>
            <a
              href={shareLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium bg-[var(--ink-900)] hover:bg-[var(--ink-800)] text-white transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Twitter / X
            </a>
            <button
              onClick={() => handleCopy()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium bg-white border border-[var(--border)] hover:bg-[var(--paper-2)] text-[var(--ink-700)] transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copy Link
            </button>
          </div>
        </div>
      </div>

      {/* ---- referrals table ---- */}
      <div className="bg-white rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden mb-6">
        <div className="p-6 border-b border-[var(--border)]">
          <h2 className="text-[16px] font-bold text-[var(--ink-950)]">
            Your Referrals
          </h2>
        </div>

        {referrals.length === 0 ? (
          <div className="p-6">
            <div className="text-center py-10">
              <Users className="w-10 h-10 text-[var(--ink-300)] mx-auto mb-3" />
              <p className="text-[14px] font-medium text-[var(--ink-950)]">
                No referrals yet
              </p>
              <p className="text-[13px] text-[var(--ink-500)] mt-1">
                Share your link to start getting referrals
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left px-6 py-3 text-[var(--ink-500)] font-medium uppercase tracking-wider text-[11px]">
                    Email
                  </th>
                  <th className="text-left px-6 py-3 text-[var(--ink-500)] font-medium uppercase tracking-wider text-[11px]">
                    Signed Up
                  </th>
                  <th className="text-left px-6 py-3 text-[var(--ink-500)] font-medium uppercase tracking-wider text-[11px]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((ref) => (
                  <tr
                    key={ref.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--paper-2)] transition-colors"
                  >
                    <td className="px-6 py-4 text-[var(--ink-700)] font-mono">
                      {maskEmail(ref.email)}
                    </td>
                    <td className="px-6 py-4 text-[var(--ink-600)]">
                      {formatDate(ref.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-[12px] font-medium">
                        <CheckCircle className="w-3.5 h-3.5" />
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
        <div className="bg-white rounded-2xl border-2 border-[var(--accent)] shadow-sm overflow-hidden mb-6 relative">
          {/* subtle confetti-like accent */}
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 via-transparent to-[var(--accent)]/5 pointer-events-none" />
          <div className="p-8 text-center relative">
            <span className="text-4xl mb-4 block">🎉</span>
            <h2 className="text-[20px] font-bold text-[var(--ink-950)] mb-2">
              Congratulations! You&apos;ve completed all {target} referrals!
            </h2>
            <p className="text-[14px] text-[var(--ink-500)] mb-6">
              Click below to claim your free 10K 3-Step trading account
            </p>
            <button
              onClick={handleClaim}
              disabled={claiming}
              className={cn(
                "inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-[16px] transition-all shadow-lg",
                claiming
                  ? "bg-[var(--accent)]/60 text-white cursor-wait"
                  : "bg-[var(--accent)] hover:bg-[var(--accent-700)] text-white hover:shadow-xl active:scale-[0.98]"
              )}
            >
              {claiming ? (
                <>
                  <svg
                    className="animate-spin w-5 h-5"
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
                  <Trophy className="w-5 h-5" />
                  Claim Your Free 10K Account
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ---- already claimed (came back to page) ---- */}
      {entry?.claimed && !claimSuccess && (
        <div className="bg-emerald-50 rounded-2xl border border-emerald-200 shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <p className="text-[14px] font-semibold text-emerald-800">
                You&apos;ve already claimed your free account
              </p>
              <p className="text-[13px] text-emerald-600 mt-0.5">
                Head to your accounts page to start trading.
              </p>
            </div>
            <a
              href="/dashboard"
              className="ml-auto flex items-center gap-1.5 text-[13px] font-medium text-emerald-700 hover:text-emerald-900 transition-colors shrink-0"
            >
              View Accounts <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}

      {/* ---- just claimed success ---- */}
      {claimSuccess && (
        <div className="bg-emerald-50 rounded-2xl border border-emerald-200 shadow-sm p-8 mb-6 text-center">
          <span className="text-4xl mb-3 block">🎉</span>
          <h2 className="text-[20px] font-bold text-emerald-800 mb-2">
            Your free 10K account has been claimed!
          </h2>
          <p className="text-[14px] text-emerald-600 mb-5">
            Check your accounts page to view and start trading on your new
            account.
          </p>
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 py-3 font-medium text-[14px] transition-colors"
          >
            Go to Accounts <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      )}

      {/* ---- inline error toast ---- */}
      {error && entry && (
        <div className="bg-red-50 border border-red-200 rounded-2xl px-6 py-4 mb-6">
          <p className="text-[13px] text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
