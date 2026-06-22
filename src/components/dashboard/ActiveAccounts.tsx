import Link from "next/link";
import { Trophy, Calendar, Eye, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const activeAccounts = [
  {
    id: "2147457810",
    name: "Account 1",
    phase: "Phase 1",
    challengeName: "Normal Two Step No Time Limit",
    status: "Ongoing",
    platform: "MatchTrader",
    started: "Jun 1, 2026",
    startingBalance: "$25,000",
    currentEquity: "$25,000",
  }
];

export function ActiveAccounts({ accounts = [], loading = false }: { accounts?: any[], loading?: boolean }) {
  if (loading) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-display font-bold text-[var(--ink-950)]">Active Accounts</h2>
        <div className="bg-white rounded-[24px] border border-[var(--border)] p-12 text-center text-[var(--ink-500)] flex justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-[var(--accent)] border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-display font-bold text-[var(--ink-950)]">Active Accounts</h2>
        <div className="bg-white rounded-[24px] border border-[var(--border)] p-12 text-center text-[var(--ink-500)]">
          <p>You don't have any active accounts yet.</p>
          <Link href="/dashboard/new-challenge">
            <Button className="mt-4 bg-[var(--ink-950)] hover:bg-[var(--ink-800)] text-white">Start a New Challenge</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-display font-bold text-[var(--ink-950)]">Active Accounts</h2>
        <div className="flex items-center gap-2 text-sm font-medium text-[var(--ink-500)]">
          <button className="px-3 py-1.5 rounded-lg hover:bg-[var(--paper)] transition-colors">All</button>
          <button className="px-3 py-1.5 rounded-lg bg-[var(--paper)] text-[var(--ink-950)] shadow-sm">Ongoing</button>
          <button className="px-3 py-1.5 rounded-lg hover:bg-[var(--paper)] transition-colors">Passed</button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {accounts.map((account) => {
          // Format date safely
          let startedDate = "Unknown";
          if (account.created_at) {
            startedDate = new Date(account.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          }
          
          return (
          <div 
            key={account.id}
            className="bg-white rounded-[24px] border border-[var(--border)] overflow-hidden shadow-sm hover:shadow-md transition-shadow group relative"
          >
            {/* Header */}
            <div className="p-6 border-b border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--accent-50)] flex items-center justify-center text-[var(--accent-700)]">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-[16px] text-[var(--ink-950)]">
                    {account.label || "Trading Account"}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-[13px] font-medium text-[var(--ink-600)]">
                  <span>Account ID: {account.id.substring(0, 8)}...</span>
                  <span className="w-1 h-1 rounded-full bg-[var(--ink-300)]" />
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Started: {startedDate}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 self-start sm:self-auto">
                <span className="px-3 py-1 rounded-full bg-[var(--ink-100)] text-[12px] font-bold text-[var(--ink-700)] uppercase tracking-wider">
                  {account.tpp_platforms?.name || "TPP"}
                </span>
                <span className={cn(
                  "px-3 py-1 rounded-full text-[12px] font-bold uppercase tracking-wider flex items-center gap-1.5",
                  account.status === 'active' ? "bg-emerald-50 text-emerald-600" : 
                  account.status === 'breached' ? "bg-red-50 text-red-600" :
                  account.status === 'passed' ? "bg-blue-50 text-blue-600" :
                  "bg-amber-50 text-amber-600"
                )}>
                  {account.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                  {account.status}
                </span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 p-6 gap-4">
              <div>
                <p className="text-[12px] font-bold text-[var(--ink-500)] uppercase tracking-wider mb-1">Starting Balance</p>
                <p className="text-[20px] font-display font-bold text-[var(--ink-950)]">${Number(account.starting_balance).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
              </div>
              <div>
                <p className="text-[12px] font-bold text-[var(--ink-500)] uppercase tracking-wider mb-1">Current Equity</p>
                <p className="text-[20px] font-display font-bold text-[var(--accent-600)]">${Number(account.equity).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
              </div>
              <div>
                <p className="text-[12px] font-bold text-[var(--ink-500)] uppercase tracking-wider mb-1">Phase</p>
                <p className="text-[20px] font-display font-bold text-[var(--ink-950)] capitalize">{account.phase}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex items-center justify-end gap-3">
              <Link href={`https://trade.thepeopleprop.live/login`} target="_blank">
                <button className="px-5 py-2.5 rounded-xl font-medium text-[14px] text-[var(--ink-700)] bg-[var(--paper-2)] border border-[var(--border)] hover:bg-[var(--border)] transition-colors">
                  Open Terminal
                </button>
              </Link>
              <Link href={`/dashboard/account/${account.id}`}>
                <Button className="flex items-center gap-2 h-10 px-5 rounded-xl bg-[var(--accent)] hover:bg-[var(--accent-700)] text-white shadow-sm text-[14px] font-medium">
                  <Eye className="w-4 h-4" />
                  View Metrics
                </Button>
              </Link>
            </div>
            
            {/* Edge Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)] opacity-[0.03] blur-2xl rounded-full pointer-events-none group-hover:opacity-[0.06] transition-opacity duration-500" />
          </div>
        )})}
        
        {/* Placeholder for new account card */}
        <div className="bg-transparent rounded-[24px] border-2 border-dashed border-[var(--ink-200)] flex flex-col items-center justify-center p-12 text-center hover:bg-[var(--paper)] hover:border-[var(--accent-300)] transition-colors cursor-pointer group min-h-[260px]">
          <div className="w-12 h-12 rounded-full bg-[var(--ink-100)] flex items-center justify-center mb-4 group-hover:bg-[var(--accent-50)] group-hover:text-[var(--accent-600)] transition-colors">
            <Trophy className="w-6 h-6 text-[var(--ink-400)] group-hover:text-[var(--accent-600)]" />
          </div>
          <h3 className="font-bold text-[16px] text-[var(--ink-950)] mb-2">Ready for a new challenge?</h3>
          <p className="text-[14px] text-[var(--ink-500)] max-w-sm">Prove your skills and get funded up to $200,000. Start your evaluation today.</p>
          <div className="mt-6 flex items-center font-bold text-[14px] text-[var(--accent-600)]">
            Browse Programs <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </div>
  );
}
