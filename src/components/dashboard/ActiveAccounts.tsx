"use client";

import { useState } from "react";
import Link from "next/link";
import { Trophy, Calendar, Eye, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Chip, Empty, Panel, PanelHead, Prop, Spinner, btn, segment } from "./glass";

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
      <Panel>
        <PanelHead title="Active Accounts" />
        <div className="flex justify-center p-12">
          <Spinner />
        </div>
      </Panel>
    );
  }

  return (
    <Panel>
      {/* Header + functional filter tabs */}
      <PanelHead title="Active Accounts">
        <div className={segment.wrap}>
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              aria-pressed={filter === f.key}
              onClick={() => setFilter(f.key)}
              className={segment.item(filter === f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </PanelHead>

      <div className="p-4 sm:p-6">
        {accounts.length === 0 ? (
          <Empty
            visual={<Prop src="/art/prop-bolt.webp" width={513} height={565} className="mb-5 h-auto w-24 drop-shadow-[0_24px_22px_rgba(16,40,34,0.22)]" />}
            title={<>You don&apos;t have any active accounts yet.</>}
            action={
              <Link href="/dashboard/new-challenge" className={btn.lime}>
                Start a New Challenge
              </Link>
            }
          />
        ) : filteredAccounts.length === 0 ? (
          <Empty
            title={`No ${filter === "ongoing" ? "ongoing" : "passed"} accounts found.`}
            action={
              <button
                type="button"
                onClick={() => setFilter("all")}
                className="cursor-pointer text-[13.5px] font-semibold text-[var(--g-emerald)] underline underline-offset-4 hover:no-underline"
              >
                Show all accounts
              </button>
            }
          />
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
                  className="flex flex-col overflow-hidden rounded-[22px] bg-white/55 ring-1 ring-black/[0.06] transition-colors hover:bg-white/80"
                >
                  {/* Header */}
                  <div className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-start sm:p-5">
                    <div className="min-w-0">
                      <div className="mb-1.5 flex items-center gap-2.5">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] bg-[var(--g-ink)] text-[var(--g-lime)] shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]">
                          <Trophy className="h-4 w-4" />
                        </div>
                        <h3 className="min-w-0 truncate text-[15px] font-semibold tracking-[-0.01em] text-[var(--g-ink)]">
                          {account.label || "Trading Account"}
                        </h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-[var(--g-muted-ink)]">
                        <span>ID: {account.id.substring(0, 8)}...</span>
                        <span className="h-1 w-1 rounded-full bg-black/20" />
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {startedDate}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 self-start sm:justify-end">
                      <Chip className="tracking-wide uppercase">
                        {account.tpp_platforms?.name || "TPP"}
                      </Chip>
                      <Chip
                        tone={
                          status === "active"
                            ? "emerald"
                            : status === "breached"
                              ? "red"
                              : status === "passed"
                                ? "lime"
                                : "amber"
                        }
                        className="tracking-wide uppercase"
                      >
                        {status === "active" && (
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--g-emerald)]" />
                        )}
                        {status}
                      </Chip>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-1 gap-2.5 px-4 pb-4 min-[520px]:grid-cols-3 sm:px-5">
                    <div className="rounded-[16px] bg-black/[0.03] p-3 ring-1 ring-black/[0.04]">
                      <p className="mb-0.5 text-[10.5px] font-medium tracking-[0.08em] text-black/45 uppercase">
                        Starting Balance
                      </p>
                      <p className="g-num text-[16px] font-semibold break-words text-[var(--g-ink)]">
                        {formatMoney(account.starting_balance)}
                      </p>
                    </div>
                    <div className="rounded-[16px] bg-black/[0.03] p-3 ring-1 ring-black/[0.04]">
                      <p className="mb-0.5 text-[10.5px] font-medium tracking-[0.08em] text-black/45 uppercase">
                        Current Equity
                      </p>
                      <p className="g-num text-[16px] font-semibold break-words text-[var(--g-ink)]">
                        {formatMoney(account.equity)}
                      </p>
                    </div>
                    <div className="rounded-[16px] bg-black/[0.03] p-3 ring-1 ring-black/[0.04]">
                      <p className="mb-0.5 text-[10.5px] font-medium tracking-[0.08em] text-black/45 uppercase">
                        Phase
                      </p>
                      <p className="text-[16px] font-semibold tracking-[-0.02em] break-words text-[var(--g-ink)] capitalize">
                        {formatPhase(account.phase)}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto flex flex-col gap-2.5 px-4 pb-4 min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-end sm:px-5 sm:pb-5">
                    <Link
                      className="w-full min-[420px]:w-auto"
                      href={`https://trade.thepeopleprop.live/?accountId=${account.terminal_account_id || account.id}`}
                      target="_blank"
                    >
                      <span className={cn(btn.light, btn.sm, "w-full")}>
                        Open Terminal
                      </span>
                    </Link>
                    <Link
                      className="w-full min-[420px]:w-auto"
                      href={`/dashboard/account/${account.id}`}
                    >
                      <span className={cn(btn.ink, btn.sm, "w-full")}>
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
              className="group flex min-h-[240px] cursor-pointer flex-col items-center justify-center rounded-[22px] border border-dashed border-black/15 p-6 text-center transition-colors hover:border-[var(--g-emerald)]/40 hover:bg-white/50 sm:p-10"
            >
              <Prop
                src="/art/prop-bolt.webp"
                width={513}
                height={565}
                className="mb-3 h-auto w-20 drop-shadow-[0_20px_18px_rgba(16,40,34,0.2)] transition-transform duration-500 [transition-timing-function:var(--g-out)] group-hover:-translate-y-1"
              />
              <h3 className="mb-1.5 text-[15px] font-semibold text-[var(--g-ink)]">
                Ready for a new challenge?
              </h3>
              <p className="max-w-sm text-[13px] leading-relaxed text-[var(--g-muted-ink)]">
                Prove your skills and get funded up to $200,000. Start your
                evaluation today.
              </p>
              <span className="mt-5 flex items-center text-[13px] font-semibold text-[var(--g-emerald)]">
                Browse Programs
                <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        )}
      </div>
    </Panel>
  );
}
