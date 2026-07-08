import Link from "next/link";
import { ChevronRight, Share2, Key, Lock } from "lucide-react";
import { StatusPill, type StatusTone } from "@/components/dashboard/ui/primitives";

interface Props {
  account: any;
}

function statusTone(status: string | null | undefined): StatusTone {
  if (status === "active" || status === "funded") return "success";
  if (status === "breached") return "danger";
  if (status === "passed") return "info";
  return "pending";
}

export function AccountHeader({ account }: Props) {
  const creationDate = account?.created_at
    ? new Date(account.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Unknown Date';

  const phaseLabel =
    account.phase === 'challenge' ? 'Phase 1'
    : account.phase === 'verification' ? 'Phase 2'
    : account.phase === 'phase_3' ? 'Phase 3'
    : account.phase === 'funded' ? 'Funded'
    : account.phase || 'Phase 1';

  return (
    <div className="mb-6 space-y-5">
      {/* Breadcrumbs */}
      <nav className="flex items-center text-[13px] text-ink-500" aria-label="Breadcrumb">
        <Link href="/dashboard" className="transition-colors hover:text-ink">Home</Link>
        <ChevronRight className="mx-1.5 h-3.5 w-3.5 text-ink-300" aria-hidden="true" />
        <Link href="/dashboard" className="transition-colors hover:text-ink">Accounts</Link>
        <ChevronRight className="mx-1.5 h-3.5 w-3.5 text-ink-300" aria-hidden="true" />
        <span className="dash-num font-medium text-ink">{account.id.substring(0, 8)}</span>
      </nav>

      {/* Trading Disabled Alert */}
      {account.status === 'breached' && (
        <div className="flex gap-3 rounded-none border border-rose-100 bg-rose-50 p-4 text-rose-700">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <div>
            <h4 className="text-sm font-semibold">Trading Disabled</h4>
            <p className="mt-0.5 text-[13px] opacity-90">Trading is currently disabled because this account has been breached.</p>
          </div>
        </div>
      )}

      {/* Main Header */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h1 className="dash-num text-xl font-semibold tracking-tight text-ink md:text-2xl">
              {account.id.substring(0, 8)}
            </h1>
            <span className="text-[13px] text-ink-500">Created {creationDate}</span>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <StatusPill tone={statusTone(account.status)} className="capitalize">
              {account.status || 'Unknown'}
            </StatusPill>
            <span className="inline-flex items-center rounded-full border border-ink-200 bg-white px-2.5 py-0.5 text-xs font-medium text-ink-600">
              {account.label || 'Trading Account'}
            </span>
            <span className="inline-flex items-center rounded-full border border-ink-200 bg-white px-2.5 py-0.5 text-xs font-medium capitalize text-ink-600">
              {phaseLabel}
            </span>
            <span className="inline-flex items-center rounded-full border border-ink-200 bg-white px-2.5 py-0.5 text-xs font-medium text-ink-600">
              {account.tpp_platforms?.name || 'TPP Dashboard'}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button className="inline-flex h-9 items-center gap-1.5 rounded-none border border-[var(--dash-hairline)] bg-white px-3.5 text-[13px] font-medium text-ink-700 transition-colors hover:border-[var(--dash-hairline-strong)] hover:text-ink">
            <Share2 className="h-4 w-4" aria-hidden="true" />
            Share
          </button>
          <button className="inline-flex h-9 items-center gap-1.5 rounded-none border border-[var(--dash-hairline)] bg-white px-3.5 text-[13px] font-medium text-ink-700 transition-colors hover:border-[var(--dash-hairline-strong)] hover:text-ink">
            <Key className="h-4 w-4" aria-hidden="true" />
            Credentials
          </button>
        </div>
      </div>
    </div>
  );
}
