"use client";

import Link from "next/link";
import { ArrowRight, DollarSign, Gift, Link as LinkIcon, ShoppingBag, Users, WalletCards } from "lucide-react";
import { cn } from "@/lib/utils";
import { Empty, Meter, PageTitle, Panel, PanelHead, Stat, btn } from "@/components/dashboard/glass";
import { LoadingBlocks, ReferralLinkPanel, ReferralTable, compact, money, programName, useReferrals } from "@/components/dashboard/referrals";

export function AffiliateClient() {
  const { data, error, loading, reload } = useReferrals();

  if (loading) return <LoadingBlocks />;
  if (error || !data) {
    return (
      <div className="mx-auto max-w-7xl">
        <Panel>
          <Empty
            icon={Users}
            title="Unable to load your affiliate data"
            action={
              <button type="button" onClick={reload} className={cn(btn.ink, btn.sm)}>
                Try again
              </button>
            }
          >
            {error}
          </Empty>
        </Panel>
      </div>
    );
  }

  const { earnings, reward } = data;
  const stats = [
    { label: "Total earnings", value: money(earnings.total), icon: DollarSign },
    { label: "Pending payout", value: money(earnings.pending), icon: WalletCards },
    { label: "Paid referrals", value: data.paid, icon: ShoppingBag },
    { label: "Sign-ups", value: data.signups, icon: Users },
    { label: "Link clicks", value: data.clicks, icon: LinkIcon },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageTitle
        lead="Affiliate"
        fade="Program"
        lede={`Earn ${earnings.ratePct}% of every challenge your referrals buy. It's the same link as the contest, so every sign-up counts there too.`}
      />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat, i) => (
          <Stat key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} highlight={i === 0} className={i === 0 ? "col-span-2 md:col-span-1" : undefined} />
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
        <ReferralLinkPanel link={data.link} sub={`You earn ${earnings.ratePct}% when someone who signed up through it buys a challenge.`} />

        <Panel>
          <PanelHead title="Contest" sub="Your sign-ups also count toward a free account." icon={Gift} />
          <div className="p-5 sm:p-6">
            {reward.claimed ? (
              <p className="text-[14px] font-semibold text-[var(--g-ink)]">Free {compact(Number(reward.size))} {programName(reward.program)} claimed.</p>
            ) : (
              <>
                <p className="text-[14px] text-[var(--g-muted-ink)]">
                  <span className="g-num font-semibold text-[var(--g-ink)]">{Math.min(data.verified, reward.target)}</span> of {reward.target} confirmed sign-ups toward a free{" "}
                  {compact(Number(reward.size))} {programName(reward.program)}.
                </p>
                <Meter value={Math.min(100, Math.round((data.verified / reward.target) * 100))} className="mt-4" />
              </>
            )}
            <Link href="/dashboard/contest" className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--g-emerald)] hover:text-[var(--g-ink)]">
              Open the contest <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Panel>
      </div>

      <ReferralTable referrals={data.referrals} title="Referrals" />
    </div>
  );
}
