"use client";

import { useState } from "react";
import Link from "next/link";
import { Trophy, Calendar, Eye, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type DashboardAccount = {
  id: string;
  label?: string | null;
  created_at?: string | null;
  status?: string | null;
  starting_balance?: number | string | null;
  equity?: number | string | null;
  phase?: string | null;
  terminal_account_id?: string | null;
  tpp_platforms?: { name?: string | null } | null;
  [key: string]: unknown;
};

type Filter = "all" | "ongoing" | "passed";

const filters: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "ongoing", label: "Ongoing" },
  { key: "passed", label: "Passed" },
];

export function ActiveAccounts({
  accounts = [],
  loading = false,
}: {
  accounts?: DashboardAccount[];
  loading?: boolean;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const formatMoney = (value: unknown) => {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return "$0.00";
    return `$${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatPhase = (value: string | null | undefined) => {
    return (value || "phase_1").replace(/_/g, " ");
  };

  const filteredAccounts = accounts.filter((account) => {
    const status = account.status || "active";
    if (filter === "ongoing") return status === "active";
    if (filter === "passed") return status === "passed" || status === "funded";
    return true;
  });

  if (loading) {
    return (
      <div className="rounded-[28px] bg-white p-5 sm:p-7 shadow-sm">
        <h2 className="mb-5 text-lg font-bold tracking-tight text-[var(--ink-950)]">
          Active Accounts
        </h2>
        <div className="flex justify-center rounded-2xl bg-[#f4f4f2] p-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--ink-200)] border-t-[var(--ink-950)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[28px] bg-white p-5 sm:p-7 shadow-sm">
      {/* Header + functional filter tabs */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold tracking-tight text-[var(--ink-950)]">
          Active Accounts
        </h2>
        <div className="flex items-center gap-1 text-[12px] font-semibold">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full px-4 py-1.5 transition-colors",
                filter === f.key
                  ? "bg-[#0c0c0c] text-white"
                  : "text-[var(--ink-400)] hover:text-[var(--ink-950)]"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {accounts.length === 0 ? (
        <div className="rounded-2xl bg-[#f4f4f2] p-8 sm:p-12 text-center">
          <p className="text-[14px] font-medium text-[var(--ink-500)]">
            You don&apos;t have any active accounts yet.
          </p>
          <Link
            href="/dashboard/new-challenge"
            className="mt-5 inline-flex h-11 items-center justify-center rounded-full bg-[#0c0c0c] px-6 text-[13px] font-bold text-white transition-colors hover:bg-[#262626]"
          >
            Start a New Challenge
          </Link>
        </div>
      ) : filteredAccounts.length === 0 ? (
        <div className="rounded-2xl bg-[#f4f4f2] p-8 sm:p-12 text-center">
          <p className="text-[14px] font-medium text-[var(--ink-500)]">
            No {filter === "ongoing" ? "ongoing" : "passed"} accounts found.
          </p>
          <button
            onClick={() => setFilter("all")}
            className="mt-4 text-[13px] font-bold text-[var(--ink-950)] underline underline-offset-4 hover:no-underline"
          >
            Show all accounts
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {filteredAccounts.map((account) => {
            let startedDate = "Unknown";
            if (account.created_at) {
              startedDate = new Date(account.created_at).toLocaleDateString(
                "en-US",
                { month: "short", day: "numeric", year: "numeric" }
              );
            }
            const status = account.status || "active";

            return (
              <div
                key={account.id}
                className="rounded-2xl bg-[#f4f4f2] overflow-hidden transition-colors hover:bg-[var(--ink-100)]/70"
              >
                {/* Header */}
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-1.5 flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                        <Trophy className="h-4 w-4 text-[var(--ink-950)]" />
                      </div>
                      <h3 className="min-w-0 truncate text-[15px] font-bold text-[var(--ink-950)]">
                        {account.label || "Trading Account"}
                      </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] font-medium text-[var(--ink-500)]">
                      <span>ID: {account.id.substring(0, 8)}...</span>
                      <span className="h-1 w-1 rounded-full bg-[var(--ink-300)]" />
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {startedDate}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 self-start sm:justify-end">
                    <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--ink-700)] shadow-sm">
                      {account.tpp_platforms?.name || "TPP"}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
                        status === "active"
                          ? "bg-emerald-50 text-emerald-700"
                          : status === "breached"
                            ? "bg-red-50 text-red-700"
                            : status === "passed"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-amber-50 text-amber-700"
                      )}
                    >
                      {status === "active" && (
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                      )}
                      {status}
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 gap-2.5 px-4 sm:px-5 pb-4 min-[520px]:grid-cols-3">
                  <div className="rounded-xl bg-white p-3 shadow-sm">
                    <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--ink-400)]">
                      Starting Balance
                    </p>
                    <p className="text-[16px] font-bold tracking-tight text-[var(--ink-950)] break-words">
                      {formatMoney(account.starting_balance)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white p-3 shadow-sm">
                    <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--ink-400)]">
                      Current Equity
                    </p>
                    <p className="text-[16px] font-bold tracking-tight text-[var(--ink-950)] break-words">
                      {formatMoney(account.equity)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white p-3 shadow-sm">
                    <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--ink-400)]">
                      Phase
                    </p>
                    <p className="text-[16px] font-bold capitalize tracking-tight text-[var(--ink-950)] break-words">
                      {formatPhase(account.phase)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2.5 px-4 sm:px-5 pb-4 sm:pb-5 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-end">
                  <Link
                    className="w-full min-[420px]:w-auto"
                    href={`https://trade.thepeopleprop.live/?accountId=${account.terminal_account_id || account.id}`}
                    target="_blank"
                  >
                    <span className="flex h-10 w-full items-center justify-center rounded-full bg-white px-5 text-[13px] font-bold text-[var(--ink-950)] shadow-sm transition-colors hover:bg-[var(--ink-100)]">
                      Open Terminal
                    </span>
                  </Link>
                  <Link
                    className="w-full min-[420px]:w-auto"
                    href={`/dashboard/account/${account.id}`}
                  >
                    <span className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-[#0c0c0c] px-5 text-[13px] font-bold text-white transition-colors hover:bg-[#262626]">
                      <Eye className="h-4 w-4" />
                      View Metrics
                    </span>
                  </Link>
                </div>
              </div>
            );
          })}

          {/* New account CTA card */}
          <Link
            href="/dashboard/new-challenge"
            className="group flex min-h-[240px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--ink-200)] p-6 text-center transition-colors hover:border-[#0c0c0c] hover:bg-[#cbfb45]/20 sm:p-10"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#f4f4f2] transition-colors group-hover:bg-[#cbfb45]">
              <Trophy className="h-6 w-6 text-[var(--ink-400)] transition-colors group-hover:text-[#0c0c0c]" />
            </div>
            <h3 className="mb-1.5 text-[15px] font-bold text-[var(--ink-950)]">
              Ready for a new challenge?
            </h3>
            <p className="max-w-sm text-[13px] text-[var(--ink-500)]">
              Prove your skills and get funded up to $200,000. Start your
              evaluation today.
            </p>
            <span className="mt-5 flex items-center text-[13px] font-bold text-[var(--ink-950)]">
              Browse Programs
              <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
