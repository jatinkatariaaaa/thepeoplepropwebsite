import Link from "next/link";
import { ChevronRight, Share2, Key, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Chip, LogoTile, Notice, btn } from "../glass";

type HeaderAccount = {
  id?: string;
  created_at?: string | null;
  status?: string;
  label?: string | null;
  phase?: string | null;
  tpp_platforms?: { name?: string | null } | null;
};

interface Props {
  account: HeaderAccount;
}

export function AccountHeader({ account }: Props) {
  const creationDate = account?.created_at
    ? new Date(account.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Unknown Date';

  return (
    <div className="space-y-6 mb-6">
      {/* Breadcrumbs */}
      <div className="flex items-center text-[13px] font-medium text-[var(--g-muted-ink)]">
        <Link href="/dashboard" className="hover:text-[var(--g-ink)] transition-colors">Home</Link>
        <ChevronRight className="w-4 h-4 mx-2 text-black/30" />
        <Link href="/dashboard" className="hover:text-[var(--g-ink)] transition-colors">Accounts</Link>
        <ChevronRight className="w-4 h-4 mx-2 text-black/30" />
        <span className="text-[var(--g-ink)]">#{account.id?.substring(0, 8)}</span>
      </div>

      {/* Trading Disabled Alert */}
      {account.status === 'breached' && (
        <Notice tone="amber" icon={Lock}>
          <h4 className="font-semibold text-[14px]">Trading Disabled</h4>
          <p className="text-[13px] mt-0.5 opacity-90">Trading is currently disabled because this account has been breached.</p>
        </Notice>
      )}

      {/* Main Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-4 mb-3">
            <Link href="/" aria-label="The People Prop home" className="shrink-0">
              <LogoTile />
            </Link>
            <h1 className="g-title text-[clamp(1.6rem,2.6vw,2.1rem)]">
              <span className="g-shade-light">#{account.id?.substring(0, 8)}</span>
            </h1>
            <span className="text-[12.5px] text-[var(--g-muted-ink)] font-medium mt-1">
              Created {creationDate}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Chip
              tone={
                account.status === 'active' ? 'emerald' :
                account.status === 'breached' ? 'red' :
                account.status === 'passed' ? 'lime' :
                'amber'
              }
              className="px-3 text-[12px] capitalize"
            >
              {account.status || 'Unknown'}
            </Chip>
            <Chip className="px-3 text-[12px]">
              {account.label || 'Trading Account'}
            </Chip>
            <Chip className="px-3 text-[12px] capitalize">
              {account.phase === 'challenge' ? 'Phase 1' : account.phase === 'verification' ? 'Phase 2' : account.phase === 'phase_3' ? 'Phase 3' : account.phase === 'funded' ? 'Funded' : account.phase || 'Phase 1'}
            </Chip>
            <Chip className="px-3 text-[12px]">
              {account.tpp_platforms?.name || 'TPP Dashboard'}
            </Chip>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className={cn(btn.light, btn.sm)}>
            <Share2 className="w-4 h-4" />
            Share
          </button>
          <button className={cn(btn.light, btn.sm)}>
            <Key className="w-4 h-4" />
            Credentials
          </button>
        </div>
      </div>
    </div>
  );
}
