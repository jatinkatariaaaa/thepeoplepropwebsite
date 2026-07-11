"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Trophy,
  Users,
  Gift,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Clock,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ContestEntry {
  id: string;
  user_id: string;
  referral_code: string;
  referral_count: number;
  target: number;
  claimed: boolean;
  claimed_at: string | null;
  created_at: string;
  profile: { id: string; email: string; display_name: string | null } | null;
  referralsList: {
    id: string;
    referred_email: string;
    signed_up_at: string;
  }[];
}

export function ContestReferralsClient({ entries }: { entries: ContestEntry[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "eligible" | "claimed" | "active">("all");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [allocating, setAllocating] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Stats
  const totalParticipants = entries.length;
  const totalReferrals = entries.reduce((sum, e) => sum + e.referral_count, 0);
  const eligibleCount = entries.filter((e) => e.referral_count >= e.target && !e.claimed).length;
  const claimedCount = entries.filter((e) => e.claimed).length;

  // Filter + search
  const filtered = entries.filter((entry) => {
    const matchesSearch =
      !search ||
      (entry.profile?.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (entry.profile?.display_name || "").toLowerCase().includes(search.toLowerCase()) ||
      entry.referral_code.toLowerCase().includes(search.toLowerCase());

    if (filter === "eligible") return matchesSearch && entry.referral_count >= entry.target && !entry.claimed;
    if (filter === "claimed") return matchesSearch && entry.claimed;
    if (filter === "active") return matchesSearch && entry.referral_count < entry.target && !entry.claimed;
    return matchesSearch;
  });

  const handleAllocate = async (entryId: string) => {
    if (!confirm("Are you sure you want to mark this entry as claimed/account allocated?")) return;
    setAllocating(entryId);
    try {
      const res = await fetch("/api/admin/contest/allocate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to allocate");
      } else {
        router.refresh();
      }
    } catch {
      alert("Network error");
    } finally {
      setAllocating(null);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const progressPercent = (count: number, target: number) =>
    Math.min(100, Math.round((count / target) * 100));

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[var(--border)] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Users className="w-4.5 h-4.5 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-[var(--ink-500)] uppercase tracking-wider">Participants</span>
          </div>
          <div className="text-2xl font-display font-bold text-[var(--ink-950)]">{totalParticipants}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[var(--border)] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
              <Trophy className="w-4.5 h-4.5 text-purple-600" />
            </div>
            <span className="text-xs font-medium text-[var(--ink-500)] uppercase tracking-wider">Total Referrals</span>
          </div>
          <div className="text-2xl font-display font-bold text-[var(--ink-950)]">{totalReferrals}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[var(--border)] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Gift className="w-4.5 h-4.5 text-emerald-600" />
            </div>
            <span className="text-xs font-medium text-[var(--ink-500)] uppercase tracking-wider">Eligible (≥ Target)</span>
          </div>
          <div className="text-2xl font-display font-bold text-emerald-600">{eligibleCount}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-[var(--border)] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
              <CheckCircle className="w-4.5 h-4.5 text-amber-600" />
            </div>
            <span className="text-xs font-medium text-[var(--ink-500)] uppercase tracking-wider">Claimed</span>
          </div>
          <div className="text-2xl font-display font-bold text-amber-600">{claimedCount}</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl p-5 border border-[var(--border)] shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-400)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by email, name, or referral code..."
              className="w-full h-10 pl-10 pr-4 bg-[var(--paper-2)] border border-[var(--border)] rounded-xl text-sm text-[var(--ink-950)] placeholder:text-[var(--ink-400)] outline-none focus:border-[var(--ink-400)] transition-colors"
            />
          </div>
          <div className="flex gap-2">
            {(["all", "eligible", "active", "claimed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
                  filter === f
                    ? "bg-[var(--ink-950)] text-white shadow-sm"
                    : "bg-[var(--paper-2)] text-[var(--ink-600)] hover:bg-[var(--paper)] border border-[var(--border)]"
                )}
              >
                {f === "eligible" ? `Eligible (${eligibleCount})` : f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-[var(--ink-500)] uppercase bg-[var(--paper-2)] border-b border-[var(--border)]">
              <tr>
                <th className="px-5 py-3.5 font-semibold">User</th>
                <th className="px-5 py-3.5 font-semibold">Referral Code</th>
                <th className="px-5 py-3.5 font-semibold">Progress</th>
                <th className="px-5 py-3.5 font-semibold text-center">Referrals</th>
                <th className="px-5 py-3.5 font-semibold text-center">Target</th>
                <th className="px-5 py-3.5 font-semibold">Status</th>
                <th className="px-5 py-3.5 font-semibold">Joined</th>
                <th className="px-5 py-3.5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-[var(--ink-400)]">
                    No contest entries found.
                  </td>
                </tr>
              )}
              {filtered.map((entry) => {
                const isEligible = entry.referral_count >= entry.target && !entry.claimed;
                const progress = progressPercent(entry.referral_count, entry.target);
                const isExpanded = expandedRow === entry.id;

                return (
                  <tr key={entry.id} className="group">
                    <td colSpan={8} className="p-0">
                      {/* Main row */}
                      <div
                        className={cn(
                          "grid grid-cols-[1fr_auto_1fr_auto_auto_auto_auto_auto] items-center cursor-pointer hover:bg-[var(--paper)] transition-colors",
                          isEligible && "bg-emerald-50/40"
                        )}
                        onClick={() => setExpandedRow(isExpanded ? null : entry.id)}
                      >
                        {/* User */}
                        <div className="px-5 py-4">
                          <div className="font-medium text-[var(--ink-950)] truncate max-w-[200px]">
                            {entry.profile?.display_name || entry.profile?.email?.split("@")[0] || "Unknown"}
                          </div>
                          <div className="text-xs text-[var(--ink-500)] truncate max-w-[200px]">
                            {entry.profile?.email || entry.user_id.substring(0, 8)}
                          </div>
                        </div>

                        {/* Referral Code */}
                        <div className="px-5 py-4">
                          <button
                            onClick={(e) => { e.stopPropagation(); copyCode(entry.referral_code); }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[var(--paper-2)] border border-[var(--border)] rounded-lg text-xs font-mono font-bold text-[var(--ink-700)] hover:border-[var(--ink-400)] transition-colors cursor-pointer"
                          >
                            {entry.referral_code}
                            {copiedCode === entry.referral_code ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3 text-[var(--ink-400)]" />
                            )}
                          </button>
                        </div>

                        {/* Progress bar */}
                        <div className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 h-2 bg-[var(--paper-2)] rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all duration-500",
                                  progress >= 100
                                    ? "bg-emerald-500"
                                    : progress >= 50
                                    ? "bg-amber-500"
                                    : "bg-blue-500"
                                )}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold text-[var(--ink-600)] tabular-nums w-9 text-right">
                              {progress}%
                            </span>
                          </div>
                        </div>

                        {/* Count */}
                        <div className="px-5 py-4 text-center">
                          <span className="text-lg font-display font-bold text-[var(--ink-950)] tabular-nums">
                            {entry.referral_count}
                          </span>
                        </div>

                        {/* Target */}
                        <div className="px-5 py-4 text-center">
                          <span className="text-sm text-[var(--ink-500)] tabular-nums">
                            {entry.target}
                          </span>
                        </div>

                        {/* Status */}
                        <div className="px-5 py-4">
                          {entry.claimed ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                              <CheckCircle className="w-3 h-3" /> Claimed
                            </span>
                          ) : isEligible ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 animate-pulse">
                              <Gift className="w-3 h-3" /> Eligible
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--ink-100)] text-[var(--ink-600)]">
                              <Clock className="w-3 h-3" /> In Progress
                            </span>
                          )}
                        </div>

                        {/* Joined */}
                        <div className="px-5 py-4 text-xs text-[var(--ink-500)] whitespace-nowrap">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </div>

                        {/* Action */}
                        <div className="px-5 py-4 text-right flex items-center justify-end gap-2">
                          {isEligible && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleAllocate(entry.id); }}
                              disabled={allocating === entry.id}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-[0.97] disabled:opacity-50 cursor-pointer whitespace-nowrap"
                            >
                              {allocating === entry.id ? "Allocating..." : "Allocate Account"}
                            </button>
                          )}
                          {entry.claimed && entry.claimed_at && (
                            <span className="text-xs text-[var(--ink-400)]">
                              {new Date(entry.claimed_at).toLocaleDateString()}
                            </span>
                          )}
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-[var(--ink-400)]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[var(--ink-400)]" />
                          )}
                        </div>
                      </div>

                      {/* Expanded referrals */}
                      {isExpanded && (
                        <div className="px-5 pb-4 bg-[var(--paper)] border-t border-[var(--border)]">
                          <div className="mt-3 mb-2 text-xs font-bold text-[var(--ink-600)] uppercase tracking-wider">
                            Referred Users ({entry.referralsList.length})
                          </div>
                          {entry.referralsList.length === 0 ? (
                            <p className="text-xs text-[var(--ink-400)] py-2">No referrals yet.</p>
                          ) : (
                            <div className="space-y-1.5">
                              {entry.referralsList.map((ref, idx) => (
                                <div
                                  key={ref.id}
                                  className="flex items-center justify-between py-2 px-3 bg-white rounded-lg border border-[var(--border)]"
                                >
                                  <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-[var(--ink-100)] flex items-center justify-center text-xs font-bold text-[var(--ink-600)]">
                                      {idx + 1}
                                    </span>
                                    <span className="text-sm text-[var(--ink-950)] font-medium">
                                      {ref.referred_email}
                                    </span>
                                  </div>
                                  <span className="text-xs text-[var(--ink-400)]">
                                    {new Date(ref.signed_up_at).toLocaleDateString()} {new Date(ref.signed_up_at).toLocaleTimeString()}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
