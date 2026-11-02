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
import { Chip, Empty, Meter, PageTitle, Panel, PanelHead, Stat, btn, table } from "@/components/dashboard/glass";

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
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <div className="h-9 w-48 animate-pulse rounded-[12px] bg-black/[0.06]" />
          <div className="mt-3 h-5 w-80 max-w-full animate-pulse rounded-[10px] bg-black/[0.05]" />
        </div>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-40 animate-pulse rounded-[28px] bg-white/55 ring-1 ring-black/[0.05]"
            />
          ))}
        </div>
      </div>
    );
  }

  /* --- error fallback --- */
  if (error && !entry) {
    return (
      <div className="mx-auto max-w-5xl">
        <Panel>
          <Empty
            visual={
              <span className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-red-500/10 text-red-600 ring-1 ring-red-500/20">
                <Gift className="h-6 w-6" />
              </span>
            }
            title="Unable to load contest"
            action={
              <button
                onClick={() => window.location.reload()}
                className={cn(btn.ink, btn.sm)}
              >
                Try Again
              </button>
            }
          >
            {error}
          </Empty>
        </Panel>
      </div>
    );
  }

  /* ============================================================
     MAIN RENDER
     ============================================================ */
  return (
    <div className="mx-auto max-w-5xl">
      {/* ---- claimed banner ---- */}
      {entry?.claimed && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-[22px] bg-[var(--g-emerald)]/10 px-5 py-4 ring-1 ring-[var(--g-emerald)]/20 sm:px-6">
          <span className="text-2xl">🎉</span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold text-[var(--g-ink)]">
              You claimed your free 10K 3-Step account!
            </p>
            <p className="mt-0.5 text-[13px] text-[var(--g-muted-ink)]">
              Check your accounts page to view it.
            </p>
          </div>
          <a
            href="/dashboard"
            className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--g-emerald)] transition-colors hover:text-[var(--g-ink)]"
          >
            View Accounts <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      )}

      {/* ---- page header ---- */}
      <PageTitle lead="Contest" lede="Invite 10 friends and claim your free 10K account" />

      {/* ---- progress section ---- */}
      <Panel className="mb-6">
        <PanelHead title="Your Progress" />
        <div className="p-5 sm:p-6">
          {/* step circles removed */}

          {/* label */}
          <p className="mb-4 text-center text-[14px] font-medium text-[var(--g-muted-ink)]">
            <span className="g-num font-semibold text-[var(--g-ink)]">{count}</span> of {target} referrals completed
          </p>

          {/* progress bar */}
          <Meter value={pct} className="h-2.5" />
        </div>
      </Panel>

      {/* ---- stats grid ---- */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat label="Total Referrals" value={count} icon={Users} />
        <Stat label="Remaining" value={remaining} icon={Clock} />
        <Stat
          label="Status"
          value={
            <span
              className={cn(
                "text-[18px]",
                entry?.claimed
                  ? "text-[var(--g-emerald)]"
                  : canClaim
                    ? "text-[#4d7a0c]"
                    : "text-[var(--g-ink)]"
              )}
            >
              {entry?.claimed
                ? "Claimed ✅"
                : canClaim
                  ? "Ready to Claim!"
                  : "In Progress"}
            </span>
          }
          icon={Trophy}
        />
      </div>

      {/* ---- referral link ---- */}
      <Panel className="mb-6">
        <PanelHead title="Your Referral Link" sub="Share this link with friends to earn referrals" />
        <div className="p-5 sm:p-6">
          {/* link + copy */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row">
            <div className="flex h-12 min-w-0 flex-1 items-center overflow-hidden rounded-[16px] bg-white/70 px-4 ring-1 ring-black/[0.08]">
              <Link2 className="mr-2 h-4 w-4 shrink-0 text-black/40" />
              <span className="g-num truncate text-[14.5px] text-[var(--g-ink)]">
                {link || "Loading..."}
              </span>
            </div>
            <button
              onClick={() => handleCopy()}
              disabled={!link}
              className={cn(
                "shrink-0",
                copied
                  ? "g-btn bg-[var(--g-emerald)]/10 text-[var(--g-emerald)] ring-1 ring-[var(--g-emerald)]/25"
                  : btn.ink
              )}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" /> Copy Link
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
              className={cn(btn.light, btn.sm)}
            >
              <Share2 className="h-4 w-4 text-[#1da851]" />
              WhatsApp
            </a>
            <a
              href={shareLinks.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(btn.light, btn.sm)}
            >
              <Share2 className="h-4 w-4 text-[#0088cc]" />
              Telegram
            </a>
            <a
              href={shareLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(btn.light, btn.sm)}
            >
              <ExternalLink className="h-4 w-4" />
              Twitter / X
            </a>
            <button
              onClick={() => handleCopy()}
              className={cn(btn.light, btn.sm)}
            >
              <Copy className="h-4 w-4" />
              Copy Link
            </button>
          </div>
        </div>
      </Panel>

      {/* ---- referrals table ---- */}
      <Panel className="mb-6 overflow-hidden">
        <PanelHead title="Your Referrals" />

        {referrals.length === 0 ? (
          <Empty icon={Users} title="No referrals yet">
            Share your link to start getting referrals
          </Empty>
        ) : (
          <div className={table.scroll}>
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className={table.headRow}>
                  <th className={table.th}>Email</th>
                  <th className={table.th}>Signed Up</th>
                  <th className={table.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((ref) => (
                  <tr key={ref.id} className={table.row}>
                    <td className={cn(table.td, "g-num text-[var(--g-ink)]")}>
                      {maskEmail(ref.email)}
                    </td>
                    <td className={cn(table.td, "text-[var(--g-muted-ink)]")}>
                      {formatDate(ref.created_at)}
                    </td>
                    <td className={table.td}>
                      <Chip tone="emerald">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Verified
                      </Chip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* ---- claim section ---- */}
      {canClaim && !claimSuccess && (
        <div className="g-card-dark g-hair relative mb-6 overflow-hidden rounded-[28px]">
          {/* subtle confetti-like accent */}
          <div aria-hidden="true" className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[36rem] max-w-full -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(203,251,69,0.22),transparent)]" />
          <div className="relative p-8 text-center">
            <span className="mb-4 block text-4xl">🎉</span>
            <h2 className="mb-2 text-[20px] font-semibold tracking-[-0.02em] text-white">
              Congratulations! You&apos;ve completed all {target} referrals!
            </h2>
            <p className="mb-6 text-[14px] text-white/60">
              Click below to claim your free 10K 3-Step trading account
            </p>
            <button
              onClick={handleClaim}
              disabled={claiming}
              className={cn(btn.lime, claiming && "cursor-wait")}
            >
              {claiming ? (
                <>
                  <svg
                    className="h-5 w-5 animate-spin"
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
                  <Trophy className="h-5 w-5" />
                  Claim Your Free 10K Account
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ---- already claimed (came back to page) ---- */}
      {entry?.claimed && !claimSuccess && (
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-[22px] bg-[var(--g-emerald)]/10 p-5 ring-1 ring-[var(--g-emerald)]/20 sm:p-6">
          <CheckCircle className="h-6 w-6 shrink-0 text-[var(--g-emerald)]" />
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold text-[var(--g-ink)]">
              You&apos;ve already claimed your free account
            </p>
            <p className="mt-0.5 text-[13px] text-[var(--g-muted-ink)]">
              Head to your accounts page to start trading.
            </p>
          </div>
          <a
            href="/dashboard"
            className="flex shrink-0 items-center gap-1.5 text-[13px] font-semibold text-[var(--g-emerald)] transition-colors hover:text-[var(--g-ink)]"
          >
            View Accounts <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      )}

      {/* ---- just claimed success ---- */}
      {claimSuccess && (
        <Panel className="mb-6 p-8 text-center">
          <span className="mb-3 block text-4xl">🎉</span>
          <h2 className="mb-2 text-[20px] font-semibold tracking-[-0.02em] text-[var(--g-ink)]">
            Your free 10K account has been claimed!
          </h2>
          <p className="mb-5 text-[14px] text-[var(--g-muted-ink)]">
            Check your accounts page to view and start trading on your new
            account.
          </p>
          <a
            href="/dashboard"
            className={btn.ink}
          >
            Go to Accounts <ArrowRight className="h-4 w-4" />
          </a>
        </Panel>
      )}

      {/* ---- inline error toast ---- */}
      {error && entry && (
        <div className="mb-6 rounded-[18px] bg-red-500/10 px-5 py-4 ring-1 ring-red-500/20">
          <p className="text-[13px] text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
