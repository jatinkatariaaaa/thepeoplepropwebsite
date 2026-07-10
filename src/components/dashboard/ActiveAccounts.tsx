import Link from "next/link";
import { Trophy, Calendar, Eye, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
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
      <div className="space-y-4 sm:space-y-6">
        <h2 className="text-xl font-display font-bold text-[var(--ink-950)]">Active Accounts</h2>
        <div className="bg-white rounded-[20px] sm:rounded-[24px] border border-[var(--border)] p-6 sm:p-12 text-center text-[var(--ink-500)] flex justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-[var(--accent)] border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <h2 className="text-xl font-display font-bold text-[var(--ink-950)]">Active Accounts</h2>
        <div className="bg-white rounded-[20px] sm:rounded-[24px] border border-[var(--border)] p-6 sm:p-12 text-center text-[var(--ink-500)]">
          <p>You don&apos;t have any active accounts yet.</p>
          <Link href="/dashboard/new-challenge">
            <Button className="mt-4 w-full sm:w-auto bg-[var(--ink-950)] hover:bg-[var(--ink-800)] text-white">Start a New Challenge</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-display font-bold text-[var(--ink-950)]">Active Accounts</h2>
        <div className="flex max-w-full items-center gap-2 overflow-x-auto rounded-2xl bg-white/60 p-1 text-sm font-medium text-[var(--ink-500)] sm:bg-transparent sm:p-0">
          <button className="px-3 py-1.5 rounded-lg hover:bg-[var(--paper)] transition-colors">All</button>
          <button className="px-3 py-1.5 rounded-lg bg-[var(--paper)] text-[var(--ink-950)] shadow-sm">Ongoing</button>
          <button className="px-3 py-1.5 rounded-lg hover:bg-[var(--paper)] transition-colors">Passed</button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {accounts.map((account) => {
          // Format date safely
          let startedDate = "Unknown";
          if (account.created_at) {
            startedDate = new Date(account.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          }
          const status = account.status || "active";
          
          return (
          <div 
            key={account.id}
            className="bg-white rounded-[20px] sm:rounded-[24px] border border-[var(--border)] overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative"
          >
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <div className="shrink-0 w-8 h-8 rounded-full bg-[var(--teal-50)] flex items-center justify-center text-[var(--teal-800)]">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <h3 className="min-w-0 truncate font-bold text-[16px] text-[var(--ink-950)]">
                    {account.label || "Trading Account"}
                  </h3>
                </div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-medium text-[var(--ink-600)]">
                  <span>Account ID: {account.id.substring(0, 8)}...</span>
                  <span className="w-1 h-1 rounded-full bg-[var(--ink-300)]" />
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Started: {startedDate}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 self-start sm:justify-end">
                <span className="px-3 py-1 rounded-full bg-[var(--ink-100)] text-[12px] font-bold text-[var(--ink-700)] uppercase tracking-wider">
                  {account.tpp_platforms?.name || "TPP"}
                </span>
                <span className={cn(
                  "px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider flex items-center gap-1.5",
                  status === 'active' ? "bg-emerald-50 text-emerald-600" :
                  status === 'breached' ? "bg-red-50 text-red-600" :
                  status === 'passed' ? "bg-blue-50 text-blue-600" :
                  "bg-amber-50 text-amber-600"
                )}>
                  {status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                  {status}
                </span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 min-[520px]:grid-cols-3 p-4 sm:p-6 gap-3">
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--paper-2)]/60 p-3">
                <p className="text-[11px] font-bold text-[var(--ink-500)] uppercase tracking-wider mb-1">Starting Balance</p>
                <p className="text-[18px] sm:text-[20px] font-display font-bold text-[var(--ink-950)] leading-tight break-words">{formatMoney(account.starting_balance)}</p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--paper-2)]/60 p-3">
                <p className="text-[11px] font-bold text-[var(--ink-500)] uppercase tracking-wider mb-1">Current Equity</p>
                <p className="text-[18px] sm:text-[20px] font-display font-bold text-[var(--teal-800)] leading-tight break-words">{formatMoney(account.equity)}</p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--paper-2)]/60 p-3">
                <p className="text-[11px] font-bold text-[var(--ink-500)] uppercase tracking-wider mb-1">Phase</p>
                <p className="text-[18px] sm:text-[20px] font-display font-bold text-[var(--ink-950)] leading-tight capitalize break-words">{formatPhase(account.phase)}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 sm:px-6 pb-4 sm:pb-6 flex flex-col min-[420px]:flex-row min-[420px]:items-center min-[420px]:justify-end gap-3">
              <Link className="w-full min-[420px]:w-auto" href={`https://trade.thepeopleprop.live/?accountId=${account.terminal_account_id || account.id}`} target="_blank">
                <button className="w-full px-5 py-2.5 rounded-xl font-medium text-[14px] text-[var(--ink-700)] bg-[var(--paper-2)] border border-[var(--border)] hover:bg-[var(--border)] transition-colors">
                  Open Terminal
                </button>
              </Link>
              <Link className="w-full min-[420px]:w-auto" href={`/dashboard/account/${account.id}`}>
                <Button className="flex w-full items-center justify-center gap-2 h-10 px-5 rounded-xl bg-[var(--teal-900)] hover:bg-[var(--teal-800)] text-white shadow-sm text-[14px] font-semibold">
                  <Eye className="w-4 h-4" />
                  View Metrics
                </Button>
              </Link>
            </div>
          </div>
        )})}
        
        {/* Placeholder for new account card */}
        <Link href="/dashboard/new-challenge" className="bg-transparent rounded-2xl border-2 border-dashed border-[var(--ink-200)] flex flex-col items-center justify-center p-6 sm:p-12 text-center hover:bg-[var(--teal-50)]/40 hover:border-[var(--teal-700)] transition-colors cursor-pointer group min-h-[240px] sm:min-h-[260px]">
          <div className="w-12 h-12 rounded-full bg-[var(--ink-100)] flex items-center justify-center mb-4 group-hover:bg-[var(--teal-100)] transition-colors">
            <Trophy className="w-6 h-6 text-[var(--ink-400)] group-hover:text-[var(--teal-800)]" />
          </div>
          <h3 className="font-bold text-[16px] text-[var(--ink-950)] mb-2">Ready for a new challenge?</h3>
          <p className="text-[14px] text-[var(--ink-500)] max-w-sm">Prove your skills and get funded up to $200,000. Start your evaluation today.</p>
          <div className="mt-6 flex items-center font-bold text-[14px] text-[var(--teal-800)]">
            Browse Programs <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
}
