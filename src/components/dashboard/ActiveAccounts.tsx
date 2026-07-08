import Link from "next/link";
import { Trophy, Calendar, ChevronRight, LayoutGrid } from "lucide-react";
import {
  StatusPill,
  EmptyState,
  SkeletonBlock,
  type StatusTone,
} from "@/components/dashboard/ui/primitives";

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

function statusTone(status: string): StatusTone {
  if (status === "active" || status === "funded") return "success";
  if (status === "breached") return "danger";
  if (status === "passed") return "info";
  return "pending";
}

export function ActiveAccounts({ accounts = [], loading = false }: { accounts?: DashboardAccount[], loading?: boolean }) {
  const formatMoney = (value: unknown) => {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return "$0.00";
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPhase = (value: string | null | undefined) => {
    return (value || "phase_1").replace(/_/g, " ");
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-ink">Accounts</h2>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="dash-card space-y-3 p-5">
            <SkeletonBlock className="h-5 w-40" />
            <SkeletonBlock className="h-4 w-56" />
            <SkeletonBlock className="h-20 w-full" />
          </div>
          <div className="dash-card space-y-3 p-5">
            <SkeletonBlock className="h-5 w-40" />
            <SkeletonBlock className="h-4 w-56" />
            <SkeletonBlock className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight text-ink">Accounts</h2>
        <div className="dash-card">
          <EmptyState
            icon={<LayoutGrid className="h-5 w-5" aria-hidden="true" />}
            title="No active accounts"
            description="Start an evaluation to get your first trading account."
            action={
              <Link
                href="/dashboard/new-challenge"
                className="inline-flex h-9 items-center rounded-lg bg-ink px-4 text-[13px] font-medium text-white transition-colors hover:bg-[var(--accent-700)]"
              >
                Start a New Challenge
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold tracking-tight text-ink">Accounts</h2>
        <span className="dash-num text-[13px] text-ink-400">
          {accounts.length} {accounts.length === 1 ? "account" : "accounts"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {accounts.map((account) => {
          // Format date safely
          let startedDate = "Unknown";
          if (account.created_at) {
            startedDate = new Date(account.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          }
          const status = account.status || "active";

          return (
            <div key={account.id} className="dash-card dash-card-hover overflow-hidden">
              {/* Header */}
              <div className="flex flex-col justify-between gap-3 border-b border-[var(--dash-hairline)] p-4 sm:flex-row sm:items-start sm:p-5">
                <div className="min-w-0">
                  <h3 className="truncate text-[15px] font-semibold tracking-tight text-ink">
                    {account.label || "Trading Account"}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-500">
                    <span className="dash-num">{account.id.substring(0, 8)}</span>
                    <span className="h-0.5 w-0.5 rounded-full bg-ink-300" aria-hidden="true" />
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" aria-hidden="true" />
                      {startedDate}
                    </span>
                    <span className="h-0.5 w-0.5 rounded-full bg-ink-300" aria-hidden="true" />
                    <span>{account.tpp_platforms?.name || "TPP"}</span>
                  </div>
                </div>
                <StatusPill tone={statusTone(status)} className="self-start capitalize">
                  {status}
                </StatusPill>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 divide-x divide-[var(--dash-hairline)]">
                <div className="px-4 py-3.5 sm:px-5">
                  <p className="dash-overline">Balance</p>
                  <p className="dash-figure mt-1 text-[15px] sm:text-base">{formatMoney(account.starting_balance)}</p>
                </div>
                <div className="px-4 py-3.5 sm:px-5">
                  <p className="dash-overline">Equity</p>
                  <p className="dash-figure mt-1 text-[15px] sm:text-base">{formatMoney(account.equity)}</p>
                </div>
                <div className="px-4 py-3.5 sm:px-5">
                  <p className="dash-overline">Phase</p>
                  <p className="mt-1 text-[15px] font-semibold capitalize tracking-tight text-ink sm:text-base">{formatPhase(account.phase)}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 border-t border-[var(--dash-hairline)] p-4 min-[420px]:flex-row min-[420px]:justify-end sm:px-5">
                <Link
                  className="inline-flex h-9 w-full items-center justify-center rounded-lg border border-[var(--dash-hairline)] bg-white px-4 text-[13px] font-medium text-ink-700 transition-colors hover:border-[var(--dash-hairline-strong)] hover:text-ink min-[420px]:w-auto"
                  href={`https://trade.thepeopleprop.live/?accountId=${account.terminal_account_id || account.id}`}
                  target="_blank"
                >
                  Open Terminal
                </Link>
                <Link
                  className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-ink px-4 text-[13px] font-medium text-white transition-colors hover:bg-[var(--accent-700)] min-[420px]:w-auto"
                  href={`/dashboard/account/${account.id}`}
                >
                  View Metrics
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
              </div>
            </div>
          );
        })}

        {/* New account card */}
        <Link
          href="/dashboard/new-challenge"
          className="group flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-[12px] border border-dashed border-ink-300 p-6 text-center transition-colors hover:border-ink-400 hover:bg-white"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-ink-200 bg-ink-50 text-ink-400 transition-colors group-hover:text-ink-700">
            <Trophy className="h-4 w-4" aria-hidden="true" />
          </div>
          <h3 className="text-sm font-semibold text-ink">Ready for a new challenge?</h3>
          <p className="mt-1 max-w-xs text-[13px] text-ink-500 text-pretty">
            Prove your skills and get funded up to $200,000.
          </p>
          <span className="mt-4 inline-flex items-center text-[13px] font-medium text-ink">
            Browse Programs
            <ChevronRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </span>
        </Link>
      </div>
    </div>
  );
}
