"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, CheckCircle, Clock, Copy, Link2, Mail, Send, Share2, ShoppingBag, Users, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { CHECK_LABEL, type ReferralSummary } from "@/lib/referral-link";
import { Chip, Empty, Panel, PanelHead, btn, table } from "./glass";

/*
 * Pieces shared by the Contest and Affiliate pages. Both read the same summary:
 * one link, one list of referrals; the contest counts confirmed sign-ups, the
 * affiliate programme counts purchases.
 */

export function useReferrals() {
  const [data, setData] = useState<ReferralSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    fetch("/api/referrals", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? "Couldn't load your referrals.");
        return res.json() as Promise<ReferralSummary>;
      })
      .then((summary) => {
        if (!alive) return;
        setData(summary);
        setError(null);
      })
      .catch((e: Error) => {
        if (alive) setError(e.message);
      });
    return () => {
      alive = false;
    };
  }, [tick]);

  const reload = useCallback(() => setTick((n) => n + 1), []);
  return { data, error, loading: !data && !error, reload };
}

export const money = (n: number) => `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const compact = (n: number) => (n >= 1000 ? `$${Math.round(n / 1000)}K` : `$${n}`);
export const programName = (key: string) => key.replace(/(^|-)(\w)/g, (_, dash: string, c: string) => `${dash}${c.toUpperCase()}`);

const SHARE_TEXT = "Join The People Prop and start your trading journey! Sign up with my link:";

/** The one link, with copy and share buttons. */
export function ReferralLinkPanel({ link, sub, className }: { link: string; sub: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);
  useEffect(() => {
    // feature-detect after mount: the native share sheet only exists in some browsers
    const t = setTimeout(() => setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function"), 0);
    return () => clearTimeout(t);
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked: the link is selectable in the field
    }
  };
  const message = `${SHARE_TEXT} ${link}`;
  const channels = [
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(message)}`, icon: Send, tint: "text-[#1da851]" },
    { label: "Telegram", href: `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(SHARE_TEXT)}`, icon: Send, tint: "text-[#0088cc]" },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`, icon: Share2, tint: "text-[var(--g-ink)]" },
    { label: "Email", href: `mailto:?subject=${encodeURIComponent("Join me on The People Prop")}&body=${encodeURIComponent(message)}`, icon: Mail, tint: "text-[var(--g-emerald)]" },
  ];

  return (
    <Panel className={className}>
      <PanelHead title="Your referral link" sub={sub} icon={Link2} />
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            readOnly
            value={link}
            aria-label="Your referral link"
            onFocus={(e) => e.currentTarget.select()}
            className="g-num h-12 min-w-0 shrink-0 rounded-[16px] sm:flex-1 sm:shrink bg-white/70 px-4 text-[14.5px] text-[var(--g-ink)] ring-1 ring-black/[0.08] outline-none focus:ring-2 focus:ring-[var(--g-emerald)]/60"
          />
          <button
            type="button"
            onClick={copy}
            className={cn("shrink-0", copied ? "g-btn bg-[var(--g-emerald)]/10 text-[var(--g-emerald)] ring-1 ring-[var(--g-emerald)]/25" : btn.ink)}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {channels.map(({ label, href, icon: Icon, tint }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" className={cn(btn.light, btn.sm)}>
              <Icon className={cn("h-4 w-4", tint)} />
              {label}
            </a>
          ))}
          {canShare ? (
            <button type="button" onClick={() => navigator.share({ title: "The People Prop", text: SHARE_TEXT, url: link }).catch(() => {})} className={cn(btn.light, btn.sm)}>
              <Share2 className="h-4 w-4" />
              More…
            </button>
          ) : null}
        </div>
      </div>
    </Panel>
  );
}

/** Progress toward the reward as a ring: confirmed sign-ups of the target. */
export function ProgressRing({ value, target, size = 176, dark = false }: { value: number; target: number; size?: number; dark?: boolean }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const done = Math.min(1, target > 0 ? value / target : 0);
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="60" cy="60" r={r} fill="none" stroke={dark ? "rgba(255,255,255,0.1)" : "rgba(14,17,16,0.07)"} strokeWidth="9" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="url(#tpp-ring)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - done)}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
        <defs>
          <linearGradient id="tpp-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8fc21d" />
            <stop offset="100%" stopColor="#cbfb45" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className={cn("g-num text-[44px] leading-none font-semibold tracking-[-0.05em]", dark ? "text-white" : "text-[var(--g-ink)]")}>
            {Math.min(value, target)}
            <span className={cn("text-[20px]", dark ? "text-white/40" : "text-black/30")}>/{target}</span>
          </p>
          <p className={cn("mt-1.5 text-[12px] font-medium", dark ? "text-white/55" : "text-[var(--g-muted-ink)]")}>sign-ups that count</p>
        </div>
      </div>
    </div>
  );
}

const date = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

/** Contest view: does this sign-up count toward the reward, and if not, why. */
function CountChip({ r }: { r: ReferralSummary["referrals"][number] }) {
  if (r.counted) {
    return (
      <Chip tone="lime">
        <CheckCircle className="h-3.5 w-3.5" /> Counts
      </Chip>
    );
  }
  return (
    <Chip tone={r.reason === "unconfirmed" ? "amber" : "neutral"}>
      {r.reason === "unconfirmed" ? <Clock className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
      {r.reason ? CHECK_LABEL[r.reason] : "Doesn't count"}
    </Chip>
  );
}

/** Affiliate view: email confirmed or still waiting. */
function EmailChip({ r }: { r: ReferralSummary["referrals"][number] }) {
  return r.verified ? (
    <Chip tone="lime">
      <CheckCircle className="h-3.5 w-3.5" /> Confirmed
    </Chip>
  ) : (
    <Chip tone="amber">
      <Clock className="h-3.5 w-3.5" /> Waiting
    </Chip>
  );
}

/** Everyone who signed up through the link: whether they count (contest) and bought a challenge (affiliate). */
export function ReferralTable({ referrals, title = "Your referrals", mode = "affiliate" }: { referrals: ReferralSummary["referrals"]; title?: string; mode?: "contest" | "affiliate" }) {
  const Status = mode === "contest" ? CountChip : EmailChip;
  return (
    <Panel className="overflow-hidden">
      <PanelHead title={title} sub="Emails are partly hidden to protect your friends' privacy." icon={Users} />
      {referrals.length === 0 ? (
        <Empty icon={Users} title="No referrals yet">
          Share your link. Friends who sign up through it appear here.
        </Empty>
      ) : (
        <>
          {/* phones: one stacked row per friend, so the status chips are never scrolled out of view */}
          <ul className="divide-y divide-black/[0.05] sm:hidden">
            {referrals.map((r, i) => (
              <li key={`${r.email}-${r.joinedAt}-${i}`} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div className="min-w-0">
                  <p className="g-num truncate text-[14px] text-[var(--g-ink)]">{r.email}</p>
                  <p className="mt-0.5 text-[12px] text-[var(--g-muted-ink)]">{date(r.joinedAt)}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <Status r={r} />
                  {r.paid ? (
                    <Chip tone="emerald">
                      <ShoppingBag className="h-3.5 w-3.5" /> Bought
                    </Chip>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
          <div className={cn(table.scroll, "hidden sm:block")}>
            <table className="w-full text-[13.5px]">
              <thead>
                <tr className={table.headRow}>
                  <th className={table.th}>Friend</th>
                  <th className={table.th}>Signed up</th>
                  <th className={table.th}>{mode === "contest" ? "Contest" : "Email"}</th>
                  <th className={table.th}>Challenge</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((r, i) => (
                  <tr key={`${r.email}-${r.joinedAt}-${i}`} className={table.row}>
                    <td className={cn(table.td, "g-num text-[var(--g-ink)]")}>{r.email}</td>
                    <td className={cn(table.td, "whitespace-nowrap text-[var(--g-muted-ink)]")}>{date(r.joinedAt)}</td>
                    <td className={table.td}>
                      <Status r={r} />
                    </td>
                    <td className={table.td}>
                      {r.paid ? (
                        <Chip tone="emerald">
                          <ShoppingBag className="h-3.5 w-3.5" /> Bought
                        </Chip>
                      ) : (
                        <span className="text-[12.5px] text-black/35">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Panel>
  );
}

export function LoadingBlocks() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8">
        <div className="h-9 w-48 animate-pulse rounded-[12px] bg-black/[0.06]" />
        <div className="mt-3 h-5 w-80 max-w-full animate-pulse rounded-[10px] bg-black/[0.05]" />
      </div>
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 animate-pulse rounded-[28px] bg-white/55 ring-1 ring-black/[0.05]" />
        ))}
      </div>
    </div>
  );
}
