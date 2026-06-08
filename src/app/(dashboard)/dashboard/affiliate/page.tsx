"use client";

import { Copy, Users, Link as LinkIcon, DollarSign, WalletCards } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function AffiliatePage() {
  const [copied, setCopied] = useState(false);
  const referralLink = "https://thepeopleprop.com/ref/jatin_123";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-[var(--ink-950)] mb-2">Affiliate Program</h1>
        <p className="text-[var(--ink-500)]">Earn up to 15% commission for every trader you refer.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Earnings", value: "$1,250.00", icon: DollarSign, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Pending Payout", value: "$450.00", icon: WalletCards, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Total Referrals", value: "24", icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Link Clicks", value: "342", icon: LinkIcon, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-[var(--border)] shadow-sm">
            <div className="flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.bg)}>
                <stat.icon className={cn("w-6 h-6", stat.color)} />
              </div>
              <div>
                <p className="text-[13px] font-medium text-[var(--ink-500)]">{stat.label}</p>
                <p className="text-2xl font-bold text-[var(--ink-950)] mt-0.5">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden mb-8">
        <div className="p-6 border-b border-[var(--border)]">
          <h2 className="text-[16px] font-bold text-[var(--ink-950)]">Your Referral Link</h2>
          <p className="text-[13px] text-[var(--ink-500)] mt-1">Share this link to start earning commissions on referrals.</p>
        </div>
        <div className="p-6 bg-[var(--paper-2)]">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 bg-white border border-[var(--border)] rounded-xl h-12 flex items-center px-4 overflow-hidden">
              <span className="text-[14px] text-[var(--ink-600)] font-mono truncate">{referralLink}</span>
            </div>
            <button 
              onClick={handleCopy}
              className={cn(
                "h-12 px-6 rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 transition-all shrink-0",
                copied 
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200" 
                  : "bg-[var(--ink-950)] hover:bg-[var(--ink-800)] text-white shadow-md active:scale-[0.98]"
              )}
            >
              {copied ? "Copied!" : "Copy Link"}
              {!copied && <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[var(--border)]">
          <h2 className="text-[16px] font-bold text-[var(--ink-950)]">Recent Referrals</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-10">
            <Users className="w-10 h-10 text-[var(--ink-300)] mx-auto mb-3" />
            <p className="text-[14px] font-medium text-[var(--ink-950)]">No referrals yet</p>
            <p className="text-[13px] text-[var(--ink-500)] mt-1">Share your link to get your first referral.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
