"use client";

import { useState } from "react";
import { Download, Award, Share2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Empty, Panel, Prop, btn } from "@/components/dashboard/glass";

type CertificateAccount = {
  id: string;
  starting_balance: number | string;
  status?: string | null;
  updated_at: string;
};

export function CertificatesClient({ accounts }: { accounts: CertificateAccount[] }) {
  const [selectedAccountId, setSelectedAccountId] = useState(accounts[0]?.id || null);

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);

  const handleCopyLink = () => {
    if (!selectedAccount) return;
    const url = `${window.location.origin}/verify/${selectedAccount.id}`;
    navigator.clipboard.writeText(url);
    toast.success("Verification link copied to clipboard!");
  };

  if (accounts.length === 0) {
    return (
      <Panel className="flex min-h-[300px] flex-col items-center justify-center">
        <Empty
          visual={<Prop src="/art/prop-rules.webp" width={733} height={810} className="mb-5 h-auto w-24 drop-shadow-[0_24px_22px_rgba(16,40,34,0.22)]" />}
          title="No Certificates Yet"
        >
          Pass your evaluation or get funded to unlock your first certificate. Keep trading!
        </Empty>
      </Panel>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:gap-8">
      {/* Sidebar List */}
      <div className="space-y-3 lg:col-span-1">
        <h3 className="mb-4 text-[12px] font-medium tracking-[0.12em] text-[var(--g-muted-ink)] uppercase">Your Achievements</h3>
        {accounts.map(acc => (
          <button
            key={acc.id}
            onClick={() => setSelectedAccountId(acc.id)}
            className={cn(
              "w-full cursor-pointer rounded-[18px] p-4 text-left ring-1 transition-all",
              selectedAccountId === acc.id
                ? "bg-white ring-[var(--g-ink)] shadow-[0_16px_32px_-20px_rgba(16,40,34,0.5)]"
                : "bg-white/55 ring-black/[0.06] hover:bg-white/80"
            )}
          >
            <div className="flex items-center gap-2 font-semibold text-[var(--g-ink)]">
              <Award className={cn("h-4 w-4", selectedAccountId === acc.id ? "text-[var(--g-emerald)]" : "text-black/35")} />
              ${acc.starting_balance.toLocaleString()} Account
            </div>
            <div className="mt-1.5 flex items-center justify-between text-xs text-[var(--g-muted-ink)]">
              <span className="capitalize">{acc.status}</span>
              <span>{new Date(acc.updated_at).toLocaleDateString()}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Main View */}
      <div className="lg:col-span-3">
        {selectedAccount && (
          <Panel className="overflow-hidden p-3">
            <div className="relative aspect-[1.41] w-full overflow-hidden rounded-[20px] bg-black/[0.03]">
              {/* Fallback loading state while image loads */}
              <div className="absolute inset-0 flex items-center justify-center text-[var(--g-muted-ink)]">
                Loading certificate...
              </div>
              <Image
                src={`/api/certificate/${selectedAccount.id}`}
                alt="Trading Certificate"
                fill
                className="object-contain relative z-10"
                unoptimized
              />
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-4 border-t border-black/[0.06] p-4 sm:p-6">
              <div>
                <h3 className="text-lg font-semibold tracking-[-0.02em] text-[var(--g-ink)]">Certificate of Funding</h3>
                <p className="text-sm text-[var(--g-muted-ink)]">ID: {selectedAccount.id.split("-")[0].toUpperCase()}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleCopyLink}
                  className={cn(btn.light, btn.sm)}
                >
                  <Share2 className="h-4 w-4" />
                  Share Link
                </button>
                <a
                  href={`/api/certificate/${selectedAccount.id}`}
                  download={`TPP_Certificate_${selectedAccount.id.split("-")[0]}.png`}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(btn.ink, btn.sm)}
                >
                  <Download className="h-4 w-4" />
                  Download PNG
                </a>
              </div>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}
