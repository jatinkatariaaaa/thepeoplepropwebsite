"use client";

import { Copy, Users, Link as LinkIcon, DollarSign, WalletCards } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export function AffiliateClient() {
  const [copied, setCopied] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [affiliateData, setAffiliateData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAffiliate() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        
        // Fetch affiliate stats from the newly created table
        const { data } = await supabase
          .from("affiliates")
          .select("*")
          .eq("user_id", session.user.id)
          .single();
          
        if (data) {
          setAffiliateData(data);
        }
      }
      setLoading(false);
    }
    fetchAffiliate();
  }, []);

  const referralLink = userId ? `https://thepeopleprop.live/ref/${userId.substring(0, 8)}` : "Loading...";

  const handleCopy = () => {
    if (!userId) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const stats = [
    { label: "Total Earnings", value: loading ? "—" : `$${Number(affiliateData?.total_earnings || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}`, icon: DollarSign },
    { label: "Pending Payout", value: loading ? "—" : `$${Number(affiliateData?.pending_payout || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}`, icon: WalletCards },
    { label: "Total Referrals", value: loading ? "—" : String(affiliateData?.total_referrals || "0"), icon: Users },
    { label: "Link Clicks", value: loading ? "—" : String(affiliateData?.link_clicks || "0"), icon: LinkIcon },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
      <div className="mb-6">
        <p className="dash-overline mb-1.5">Growth</p>
        <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">Affiliate Program</h1>
        <p className="mt-1 text-sm text-ink-500">Earn up to 15% commission for every trader you refer.</p>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={i} className="dash-card dash-card-hover p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="dash-overline">{stat.label}</p>
              <stat.icon className="h-4 w-4 text-ink-300" aria-hidden="true" />
            </div>
            <p className="dash-figure text-xl sm:text-2xl">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="dash-card mb-6 overflow-hidden">
        <div className="border-b border-[var(--dash-hairline)] px-4 py-3.5 sm:px-5">
          <h2 className="text-[15px] font-semibold tracking-tight text-ink">Your Referral Link</h2>
          <p className="mt-1 text-[13px] text-ink-500">Share this link to start earning commissions on referrals.</p>
        </div>
        <div className="bg-[var(--dash-canvas)] p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex h-11 flex-1 items-center overflow-hidden rounded-lg border border-[var(--dash-hairline)] bg-white px-3.5">
              <span className={cn(
                "dash-num truncate text-[13px]",
                userId ? "text-ink-600" : "text-ink-300"
              )}>
                {referralLink}
              </span>
            </div>
            <button 
              onClick={handleCopy}
              disabled={!userId}
              className={cn(
                "flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg px-5 text-[13px] font-semibold transition-all",
                copied 
                  ? "border border-[#A7F3D0] bg-success-50 text-success-700" 
                  : "bg-ink text-white hover:bg-ink-800 active:scale-[0.98]",
                !userId && "opacity-50 cursor-not-allowed"
              )}
            >
              {copied ? "Copied!" : "Copy Link"}
              {!copied && <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      <div className="dash-card overflow-hidden">
        <div className="border-b border-[var(--dash-hairline)] px-4 py-3.5 sm:px-5">
          <h2 className="text-[15px] font-semibold tracking-tight text-ink">Recent Referrals</h2>
        </div>
        <div className="p-5">
          <div className="py-10 text-center">
            <Users className="mx-auto mb-3 h-6 w-6 text-ink-300" />
            <p className="text-sm font-semibold text-ink">No referrals yet</p>
            <p className="mt-1 text-[13px] text-ink-500">Share your link to get your first referral.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
