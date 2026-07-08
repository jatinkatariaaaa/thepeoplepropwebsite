"use client";

import { useState } from "react";
import { Download, ExternalLink, Award, Share2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export function CertificatesClient({ accounts }: { accounts: any[] }) {
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
      <div className="dash-card flex min-h-[300px] flex-col items-center justify-center p-10 text-center">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-ink-200 bg-ink-50">
          <Award className="h-5 w-5 text-ink-400" strokeWidth={1.5} />
        </div>
        <h3 className="mb-1.5 text-base font-semibold tracking-tight text-ink">No Certificates Yet</h3>
        <p className="max-w-md text-sm text-ink-500">
          Pass your evaluation or get funded to unlock your first certificate. Keep trading!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
      {/* Sidebar List */}
      <div className="space-y-2 lg:col-span-1">
        <h3 className="dash-overline mb-3">Your Achievements</h3>
        {accounts.map(acc => (
          <button
            key={acc.id}
            onClick={() => setSelectedAccountId(acc.id)}
            className={`w-full rounded-none border p-3.5 text-left transition-all ${
              selectedAccountId === acc.id 
                ? "border-ink-400 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.06)] ring-1 ring-ink-400" 
                : "border-[var(--dash-hairline)] bg-white hover:border-[var(--dash-hairline-strong)]"
            }`}
          >
            <div className="flex items-center gap-2 text-[13px] font-semibold text-ink">
              <Award className={`h-4 w-4 ${selectedAccountId === acc.id ? "text-[var(--carbon-blue)]" : "text-ink-400"}`} />
              <span className="dash-num">${acc.starting_balance.toLocaleString()}</span> Account
            </div>
            <div className="mt-1.5 flex items-center justify-between text-xs text-ink-500">
              <span className="capitalize">{acc.status}</span>
              <span>{new Date(acc.updated_at).toLocaleDateString()}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Main View */}
      <div className="lg:col-span-3">
        {selectedAccount && (
          <div className="dash-card overflow-hidden p-3">
            <div className="relative aspect-[1.41] w-full overflow-hidden rounded-none bg-ink-50">
              {/* Fallback loading state while image loads */}
              <div className="absolute inset-0 flex items-center justify-center text-sm text-ink-400">
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
            
            <div className="mt-3 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--dash-hairline)] p-4 sm:p-5">
              <div>
                <h3 className="text-[15px] font-semibold tracking-tight text-ink">Certificate of Funding</h3>
                <p className="dash-num mt-0.5 text-xs text-ink-500">ID: {selectedAccount.id.split("-")[0].toUpperCase()}</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleCopyLink}
                  className="inline-flex h-10 items-center gap-2 rounded-none border border-[var(--dash-hairline)] bg-white px-4 text-[13px] font-medium text-ink-700 transition-colors hover:border-[var(--dash-hairline-strong)] hover:text-ink"
                >
                  <Share2 className="w-4 h-4" />
                  Share Link
                </button>
                <a 
                  href={`/api/certificate/${selectedAccount.id}`}
                  download={`TPP_Certificate_${selectedAccount.id.split("-")[0]}.png`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 items-center gap-2 rounded-none bg-[var(--carbon-blue)] px-4 text-[13px] font-semibold text-white transition-colors hover:bg-[var(--carbon-blue-hover)]"
                >
                  <Download className="w-4 h-4" />
                  Download PNG
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
