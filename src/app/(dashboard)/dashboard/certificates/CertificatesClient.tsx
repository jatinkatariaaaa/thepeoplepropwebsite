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
      <div className="bg-white rounded-2xl border border-[var(--border)] shadow-sm flex flex-col items-center justify-center text-center p-12 min-h-[300px]">
        <div className="w-16 h-16 rounded-full bg-[var(--paper-2)] flex items-center justify-center mb-4">
          <Award className="w-8 h-8 text-[var(--ink-400)]" strokeWidth={1.5} />
        </div>
        <h3 className="text-xl font-bold text-[var(--ink-950)] mb-2">No Certificates Yet</h3>
        <p className="text-base text-[var(--ink-500)] max-w-md">
          Pass your evaluation or get funded to unlock your first certificate. Keep trading!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Sidebar List */}
      <div className="lg:col-span-1 space-y-3">
        <h3 className="text-sm font-bold text-[var(--ink-500)] uppercase tracking-wider mb-4">Your Achievements</h3>
        {accounts.map(acc => (
          <button
            key={acc.id}
            onClick={() => setSelectedAccountId(acc.id)}
            className={`w-full text-left p-4 rounded-xl border transition-all ${
              selectedAccountId === acc.id 
                ? "bg-[var(--brand-50)] border-[var(--brand-500)] shadow-sm ring-1 ring-[var(--brand-500)]" 
                : "bg-white border-[var(--border)] hover:bg-[var(--paper-2)]"
            }`}
          >
            <div className="font-bold text-[var(--ink-950)] flex items-center gap-2">
              <Award className={`w-4 h-4 ${selectedAccountId === acc.id ? "text-[var(--brand-500)]" : "text-[var(--ink-400)]"}`} />
              ${acc.starting_balance.toLocaleString()} Account
            </div>
            <div className="text-xs text-[var(--ink-500)] mt-1.5 flex items-center justify-between">
              <span className="capitalize">{acc.status}</span>
              <span>{new Date(acc.updated_at).toLocaleDateString()}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Main View */}
      <div className="lg:col-span-3">
        {selectedAccount && (
          <div className="bg-white rounded-3xl border border-[var(--border)] shadow-sm overflow-hidden p-3">
            <div className="relative aspect-[1.41] w-full rounded-2xl overflow-hidden bg-[var(--paper-2)]">
              {/* Fallback loading state while image loads */}
              <div className="absolute inset-0 flex items-center justify-center text-[var(--ink-400)]">
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
            
            <div className="p-6 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] mt-3">
              <div>
                <h3 className="text-lg font-bold text-[var(--ink-950)]">Certificate of Funding</h3>
                <p className="text-sm text-[var(--ink-500)]">ID: {selectedAccount.id.split("-")[0].toUpperCase()}</p>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleCopyLink}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm border border-[var(--border)] bg-white text-[var(--ink-700)] hover:bg-[var(--paper-2)] transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share Link
                </button>
                <a 
                  href={`/api/certificate/${selectedAccount.id}`}
                  download={`TPP_Certificate_${selectedAccount.id.split("-")[0]}.png`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm bg-[var(--ink-950)] text-white hover:bg-[var(--ink-800)] transition-colors"
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
