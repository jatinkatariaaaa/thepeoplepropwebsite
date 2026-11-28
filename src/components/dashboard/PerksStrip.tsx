"use client";

import { useEffect, useState } from "react";
import Link from "@/components/IntentLink";
import { ArrowRight, Coins, RotateCcw, Zap } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PERKS } from "@/data/catalogue";

type AccountLite = { id: string; status?: string | null; starting_balance?: number | string | null };

const usd = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

/** The three perks, with this trader's own numbers. */
export function PerksStrip({ accounts }: { accounts: AccountLite[] }) {
  const [rewards, setRewards] = useState(0);
  const [resets, setResets] = useState<{ id: string; source_account_id: string }[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const [s, r] = await Promise.all([
        supabase.from("stipend_accruals").select("amount").eq("user_id", session.user.id).eq("status", "accrued"),
        supabase.from("account_resets").select("id, source_account_id, eligible_until").eq("user_id", session.user.id).eq("status", "eligible"),
      ]);
      if (!alive) return;
      setRewards((s.data ?? []).reduce((sum, x) => sum + Number(x.amount), 0));
      setResets(((r.data ?? []) as { id: string; source_account_id: string; eligible_until: string | null }[]).filter((x) => !x.eligible_until || new Date(x.eligible_until).getTime() > Date.now()));
    })();
    return () => {
      alive = false;
    };
  }, []);

  const live = accounts.filter((a) => a.status === "active" || a.status === "funded");
  const monthly = live.reduce((sum, a) => sum + (Number(a.starting_balance) || 0) * (PERKS.stipend.ratePct / 100), 0);
  if (accounts.length === 0) return null;

  const cards = [
    {
      icon: Coins,
      label: "Monthly stipend",
      value: usd(monthly),
      note: rewards > 0 ? `${usd(rewards)} waiting in your rewards balance` : `${PERKS.stipend.ratePct}% of your active accounts, each ${PERKS.stipend.cycleDays}-day cycle with ${PERKS.stipend.minTradingDays}+ trading days`,
      href: "/dashboard/payouts",
      cta: "Rewards",
    },
    {
      icon: Zap,
      label: "On-demand payouts",
      value: `First ${PERKS.onDemandPayouts}`,
      note: "No waiting period on your first five payouts from each funded account",
      href: "/dashboard/payouts",
      cta: "Payouts",
    },
    resets.length
      ? { icon: RotateCcw, label: "Free reset ready", value: `${resets.length} to claim`, note: "An account failed early. Restart it at no cost before the offer lapses.", href: `/dashboard/account/${resets[0].source_account_id}`, cta: "Claim reset", hot: true }
      : { icon: RotateCcw, label: "24-hour free reset", value: "$50K+", note: "If a $50K+ account fails within 24 hours of its first trade, reset it once for free", href: "/challenges#perks", cta: "How it works" },
  ];

  return (
    <div className="mb-6 grid gap-3 md:grid-cols-3">
      {cards.map((c) => (
        <Link key={c.label} href={c.href} className={`group flex items-start gap-3.5 rounded-[22px] p-4 ring-1 transition-colors ${"hot" in c && c.hot ? "bg-[var(--g-lime)]/25 ring-[#8fc21d]/40" : "bg-white/55 ring-black/[0.06] hover:bg-white/80"}`}>
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] bg-[var(--g-ink)] text-[var(--g-lime)]">
            <c.icon className="h-[18px] w-[18px]" strokeWidth={2} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-baseline justify-between gap-2">
              <span className="text-[12.5px] font-medium text-[var(--g-muted-ink)]">{c.label}</span>
              <span className="g-num text-[16px] font-semibold tracking-[-0.02em] text-[var(--g-ink)]">{c.value}</span>
            </span>
            <span className="mt-1 block text-[12.5px] leading-snug text-[var(--g-muted-ink)]">{c.note}</span>
            <span className="mt-2 inline-flex items-center gap-1 text-[12.5px] font-semibold text-[var(--g-emerald)]">
              {c.cta} <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </span>
        </Link>
      ))}
    </div>
  );
}
