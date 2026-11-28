"use client";

import { useState } from "react";
import Link from "@/components/IntentLink";
import { AlertTriangle, ArrowRight, CheckCircle, Clock, Gift, Info, ShieldCheck, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClaimResult } from "@/lib/referral-link";
import { useHydratedPrograms } from "@/hooks/useHydratedPrograms";
import { Empty, Meter, Notice, PageTitle, Panel, PanelHead, Prop, btn } from "@/components/dashboard/glass";
import { LoadingBlocks, ProgressRing, ReferralLinkPanel, ReferralTable, compact, programName, useReferrals } from "@/components/dashboard/referrals";

export function ContestDashboard() {
  const { data, error, loading, reload } = useReferrals();
  const { programs } = useHydratedPrograms();
  const [claiming, setClaiming] = useState(false);
  const [claim, setClaim] = useState<ClaimResult | null>(null);

  if (loading) return <LoadingBlocks />;
  if (error || !data) {
    return (
      <div className="mx-auto max-w-6xl">
        <Panel>
          <Empty
            visual={
              <span className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-red-500/10 text-red-600 ring-1 ring-red-500/20">
                <Gift className="h-6 w-6" />
              </span>
            }
            title="Unable to load the contest"
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

  const { reward, verified, signups, flagged } = data;
  const program = programs.find((p) => p.key === reward.program);
  const label = `${compact(Number(reward.size))} ${program?.shortLabel ?? programName(reward.program)}`;
  const remaining = Math.max(0, reward.target - verified);
  const held = !reward.claimed && (reward.status === "held" || (claim && !claim.ok && claim.reason === "held"));
  const declined = !reward.claimed && reward.status === "rejected";
  const eligible = verified >= reward.target && !reward.claimed && !held && !declined;
  const accountId = (claim?.ok && claim.accountId) || reward.accountId;

  const onClaim = async () => {
    if (claiming) return;
    setClaiming(true);
    try {
      const res = await fetch("/api/referrals/claim", { method: "POST" });
      const result = (await res.json()) as ClaimResult;
      setClaim(result);
      if (result.ok || result.reason === "held") reload();
    } catch {
      setClaim({ ok: false, reason: "error", message: "We couldn't reach the server. Please try again." });
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle
        lead="Contest"
        fade={`${reward.target} friends, one free account.`}
        lede={`Share your link. When ${reward.target} different people sign up through it, claim a free ${label} challenge. One per person.`}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        {/* progress and claim */}
        <div className="g-card-dark g-hair relative flex flex-col overflow-hidden rounded-[28px] p-6 text-white sm:p-8">
          <span aria-hidden="true" className="pointer-events-none absolute -top-28 -right-20 h-72 w-72 rounded-full bg-[radial-gradient(closest-side,rgba(203,251,69,0.18),transparent)]" />
          <div className="relative flex flex-col items-center gap-7 sm:flex-row sm:items-center lg:my-auto">
            <ProgressRing value={verified} target={reward.target} dark />
            <div className="min-w-0 flex-1 text-center sm:text-left">
              {reward.claimed ? (
                <>
                  <p className="inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--g-lime-soft)]">
                    <CheckCircle className="h-4 w-4" /> Reward claimed
                  </p>
                  <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.03em]">Your free {label} is yours.</h2>
                  <p className="mt-2 text-[14px] leading-relaxed text-white/60">Find it with your other accounts and start trading.</p>
                  <Link href={accountId ? `/dashboard/account/${accountId}` : "/dashboard"} className={cn(btn.lime, btn.sm, "mt-5")}>
                    Open the account <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              ) : held ? (
                <>
                  <p className="inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--g-lime-soft)]">
                    <Clock className="h-4 w-4" /> Claim under review
                  </p>
                  <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.03em]">We&apos;re checking your sign-ups.</h2>
                  <p className="mt-2 text-[14px] leading-relaxed text-white/60">
                    Some sign-ups failed our checks, so a person on our team looks at the claim. Your free {label} is created as soon as it&apos;s approved, usually within 24 hours.
                  </p>
                </>
              ) : declined ? (
                <>
                  <p className="inline-flex items-center gap-2 text-[13px] font-semibold text-red-300">
                    <AlertTriangle className="h-4 w-4" /> Claim declined
                  </p>
                  <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.03em]">This claim wasn&apos;t approved.</h2>
                  <p className="mt-2 text-[14px] leading-relaxed text-white/60">{reward.note || "Too many of your sign-ups failed our checks."}</p>
                  <Link href="/dashboard/support?new=1" className={cn(btn.light, btn.sm, "mt-5")}>
                    Contact support
                  </Link>
                </>
              ) : eligible ? (
                <>
                  <p className="inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--g-lime-soft)]">
                    <Trophy className="h-4 w-4" /> Target reached
                  </p>
                  <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.03em]">Claim your free {label}.</h2>
                  <p className="mt-2 text-[14px] leading-relaxed text-white/60">It&apos;s created straight away, no payment needed.</p>
                  <button type="button" onClick={onClaim} disabled={claiming} className={cn(btn.lime, "mt-5", claiming && "cursor-wait")}>
                    <Gift className="h-4 w-4" />
                    {claiming ? "Creating your account…" : "Claim free account"}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-[13px] font-semibold text-white/55">Your progress</p>
                  <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.03em]">
                    {remaining} more {remaining === 1 ? "friend" : "friends"} to go.
                  </h2>
                  <p className="mt-2 text-[14px] leading-relaxed text-white/60">
                    A friend counts when they sign up through your link on their own device and internet connection.
                  </p>
                  <Meter value={Math.round((verified / reward.target) * 100)} className="mt-5 bg-white/10" />
                </>
              )}
            </div>
          </div>

          <dl className="relative mt-8 grid grid-cols-3 divide-x divide-white/10 rounded-[20px] bg-white/[0.05] ring-1 ring-white/10">
            {[
              { k: "Signed up", v: signups },
              { k: "Count", v: verified },
              { k: "Don't count", v: flagged },
            ].map(({ k, v }) => (
              <div key={k} className="px-3 py-4 text-center">
                <dd className="g-num text-[22px] font-semibold text-white">{v}</dd>
                <dt className="mt-0.5 text-[11.5px] text-white/50">{k}</dt>
              </div>
            ))}
          </dl>

          {claim ? (
            <Notice tone={claim.ok ? "lime" : claim.reason === "error" ? "red" : "amber"} icon={claim.ok ? CheckCircle : AlertTriangle} className="relative mt-5">
              {claim.message}
            </Notice>
          ) : null}
        </div>

        <div className="flex flex-col gap-6">
          <ReferralLinkPanel link={data.link} sub="Your only link: it counts here and in the Affiliate section." />

          {/* what you win */}
          <Panel className="relative overflow-hidden">
            <PanelHead title="Your reward" sub={`A ${label} challenge with the standard rules.`} icon={Gift} />
            <Prop src="/art/prop-paid.webp" width={220} height={220} className="absolute right-2 bottom-2 w-28 opacity-95 sm:w-32" />
            <dl className="relative grid max-w-[70%] grid-cols-1 gap-x-6 gap-y-3 p-5 sm:max-w-[62%] sm:grid-cols-2 sm:p-6">
              {[
                { k: "Account size", v: compact(Number(reward.size)) },
                { k: "Profit target", v: program?.profitTarget ?? "—" },
                { k: "Daily loss limit", v: program?.dailyDrawdown ?? "—" },
                { k: "Max loss limit", v: program?.maxDrawdown ?? "—" },
              ].map(({ k, v }) => (
                <div key={k}>
                  <dt className="text-[12px] text-[var(--g-muted-ink)]">{k}</dt>
                  <dd className="g-num mt-0.5 text-[15px] font-semibold text-[var(--g-ink)]">{v}</dd>
                </div>
              ))}
            </dl>
          </Panel>
        </div>
      </div>

      <Notice tone="neutral" icon={ShieldCheck} className="mt-6">
        <strong className="font-semibold text-[var(--g-ink)]">What counts.</strong>{" "}
        One sign-up per person: each friend uses their own device and internet
        connection. Sign-ups from your connection or device, or several from the same one, don&apos;t count. If any sign-up fails these checks, our team reviews
        the claim before the account is created.
      </Notice>

      <div className="mt-6">
        <ReferralTable referrals={data.referrals} mode="contest" />
      </div>

      <Notice tone="emerald" icon={Info} className="mt-6">
        The same sign-ups count in the{" "}
        <Link href="/dashboard/affiliate" className="font-semibold underline underline-offset-2">
          Affiliate section
        </Link>
        , where you earn {data.earnings.ratePct}% when a friend buys a challenge.
      </Notice>
    </div>
  );
}
