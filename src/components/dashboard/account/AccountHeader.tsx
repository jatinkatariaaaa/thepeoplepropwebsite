import Link from "next/link";
import { ChevronRight, Share2, Key, Lock } from "lucide-react";
import { NavbarLogo } from "@/components/ui/resizable-navbar";

interface Props {
  account: any;
}

export function AccountHeader({ account }: Props) {
  const creationDate = account?.created_at 
    ? new Date(account.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Unknown Date';
    
  return (
    <div className="space-y-6 mb-6">
      {/* Breadcrumbs */}
      <div className="flex items-center text-[13px] font-medium text-[var(--ink-500)]">
        <Link href="/dashboard" className="hover:text-[var(--ink-950)] transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <Link href="/dashboard" className="hover:text-[var(--ink-950)] transition-colors">Accounts</Link>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-[var(--ink-950)]">#{account.id.substring(0, 8)}</span>
      </div>

      {/* Trading Disabled Alert */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-amber-800">
        <Lock className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-[14px]">Trading Disabled</h4>
          <p className="text-[13px] mt-0.5 opacity-90">Trading is currently disabled for this account.</p>
        </div>
      </div>

      {/* Main Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-4 mb-3">
            <div className="scale-[0.8] origin-left -my-2">
              <NavbarLogo />
            </div>
            <h1 className="text-xl md:text-2xl font-display font-bold text-[var(--ink-950)]">
              #{account.id.substring(0, 8)}
            </h1>
            <span className="text-[12px] text-[var(--ink-500)] font-medium mt-1">
              Created {creationDate}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-3 py-1 rounded-full border text-[12px] font-bold capitalize ${
              account.status === 'active' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
              account.status === 'breached' ? 'bg-rose-50 border-rose-200 text-rose-600' :
              account.status === 'passed' ? 'bg-blue-50 border-blue-200 text-blue-600' :
              'bg-amber-50 border-amber-200 text-amber-600'
            }`}>
              {account.status || 'Unknown'}
            </span>
            <span className="px-3 py-1 rounded-full bg-[var(--paper-2)] border border-[var(--border)] text-[12px] font-bold text-[var(--ink-600)]">
              {account.label || 'Trading Account'}
            </span>
            <span className="px-3 py-1 rounded-full bg-[var(--paper-2)] border border-[var(--border)] text-[12px] font-bold text-[var(--ink-600)] capitalize">
              {account.phase || 'Phase 1'}
            </span>
            <span className="px-3 py-1 rounded-full bg-[var(--paper-2)] border border-[var(--border)] text-[12px] font-bold text-[var(--ink-600)]">
              TPP Dashboard
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] bg-white text-[13px] font-medium text-[var(--ink-700)] hover:bg-[var(--paper-2)] transition-colors shadow-sm">
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] bg-white text-[13px] font-medium text-[var(--ink-700)] hover:bg-[var(--paper-2)] transition-colors shadow-sm">
            <Key className="w-4 h-4" />
            Credentials
          </button>
        </div>
      </div>
    </div>
  );
}
