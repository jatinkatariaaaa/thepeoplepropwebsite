"use client";

import { Copy, Users, Link as LinkIcon, DollarSign, WalletCards } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Empty, PageTitle, Panel, PanelHead, Stat, btn } from "@/components/dashboard/glass";

type AffiliateRow = {
  total_earnings?: number | string | null;
  pending_payout?: number | string | null;
  total_referrals?: number | string | null;
  link_clicks?: number | string | null;
};

export function AffiliateClient() {
  const [copied, setCopied] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [affiliateData, setAffiliateData] = useState<AffiliateRow | null>(null);
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
    { label: "Total Earnings", value: loading ? "-" : `$${Number(affiliateData?.total_earnings || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}`, icon: DollarSign },
    { label: "Pending Payout", value: loading ? "-" : `$${Number(affiliateData?.pending_payout || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}`, icon: WalletCards },
    { label: "Total Referrals", value: loading ? "-" : (affiliateData?.total_referrals || "0"), icon: Users },
    { label: "Link Clicks", value: loading ? "-" : (affiliateData?.link_clicks || "0"), icon: LinkIcon },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageTitle lead="Affiliate" fade="Program" lede="Earn up to 15% commission for every trader you refer." />

      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Stat key={i} label={stat.label} value={stat.value} icon={stat.icon} highlight={i === 0} />
        ))}
      </div>

      <Panel className="mb-6">
        <PanelHead title="Your Referral Link" sub="Share this link to start earning commissions on referrals." />
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex h-12 min-w-0 flex-1 items-center overflow-hidden rounded-[16px] bg-white/70 px-4 ring-1 ring-black/[0.08]">
              <span className={cn(
                "g-num truncate text-[14.5px]",
                userId ? "text-[var(--g-ink)]" : "text-black/35"
              )}>
                {referralLink}
              </span>
            </div>
            <button
              onClick={handleCopy}
              disabled={!userId}
              className={cn(
                "shrink-0",
                copied
                  ? "g-btn bg-[var(--g-emerald)]/10 text-[var(--g-emerald)] ring-1 ring-[var(--g-emerald)]/25"
                  : btn.ink
              )}
            >
              {copied ? "Copied!" : "Copy Link"}
              {!copied && <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </Panel>

      <Panel>
        <PanelHead title="Recent Referrals" />
        <Empty icon={Users} title="No referrals yet">
          Share your link to get your first referral.
        </Empty>
      </Panel>
    </div>
  );
}
