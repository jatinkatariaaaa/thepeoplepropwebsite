"use client";

import { useId, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, DollarSign, Link2, Network, Users } from "lucide-react";
import { btn, Chip, field, fieldLabel, Notice, PageTitle, Panel, PanelHead, Stat } from "@/components/dashboard/glass";
import type { PartnerDeskLink, PartnerDeskSnapshot } from "@/lib/partner-desk-types";
import { formatPercent, percentToBps } from "@/lib/staff-access";

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const amount = (cents: number) => money.format(cents / 100);
const percent = (bps: number) => `${formatPercent(bps)}%`;
const body = "p-5 sm:p-6";

function ReferralLink({ code }: { code: string }) {
  const [feedback, setFeedback] = useState("");
  const path = `/r/${encodeURIComponent(code)}`;
  async function copyLink() {
    const url = new URL(path, window.location.origin).href;
    try {
      await navigator.clipboard.writeText(url);
      setFeedback("Copied");
    } catch {
      setFeedback(url);
    }
  }
  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-3">
        <code className="min-w-0 select-all break-all rounded-lg bg-black/[0.04] px-3 py-2 text-sm">{path}</code>
        <button type="button" onClick={copyLink} className={btn.light + " " + btn.sm}>
          {feedback === "Copied" ? <Check size={15} /> : <Copy size={15} />} Copy link
        </button>
      </div>
      <p aria-live="polite" className="mt-1 select-all break-all text-xs text-[var(--g-muted-ink)]">{feedback}</p>
    </div>
  );
}

function LinkEditor({ pool, link, close }: { pool: number; link?: PartnerDeskLink; close: () => void }) {
  const id = useId();
  const router = useRouter();
  const [email, setEmail] = useState(link?.recipient ?? "");
  const [rate, setRate] = useState(link ? String(formatPercent(link.shareBps)) : "");
  const [active, setActive] = useState(link?.active ?? true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [refreshing, startTransition] = useTransition();
  const share = percentToBps(rate);
  const valid = share !== null && share <= pool;

  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!valid || saving || refreshing) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/partner-desk/links", {
        method: link ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(link ? { id: link.id, shareBps: share, active } : { email: email.trim(), shareBps: share }),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.error || "Unable to save the referral link.");
      }
      startTransition(() => { router.refresh(); close(); });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save the referral link.");
    } finally {
      setSaving(false);
    }
  }
  return (
    <form onSubmit={save} className="space-y-4 rounded-2xl bg-black/[0.03] p-4 sm:p-5">
      <h3 className="font-semibold">{link ? "Edit referral link" : "Create a promoter link"}</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={id + "email"} className={fieldLabel}>Promoter’s account email</label>
          <input id={id + "email"} className={field()} type="email" required disabled={!!link} value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" />
        </div>
        <div>
          <label htmlFor={id + "share"} className={fieldLabel}>Promoter’s share of each sale (%)</label>
          <input id={id + "share"} className={field(rate !== "" && !valid)} type="number" min="0" max={pool / 100} step="0.01" required value={rate} onChange={e => setRate(e.target.value)} />
        </div>
      </div>
      {valid ? (
        <p className="text-sm" aria-live="polite">On a $100 eligible sale, the promoter earns <strong>{amount(share)}</strong>, you earn <strong>{amount(pool - share)}</strong> and the firm keeps <strong>{amount(10000 - pool)}</strong>.</p>
      ) : <p className="text-sm text-[var(--g-muted-ink)]">Choose up to {percent(pool)} of the sale for this promoter.</p>}
      {link && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} /> Link active</label>}
      {error && <div role="alert"><Notice tone="red">{error}</Notice></div>}
      <div className="flex gap-2">
        <button className={btn.ink + " " + btn.sm} disabled={!valid || saving || refreshing}>{saving || refreshing ? "Saving…" : link ? "Save changes" : "Create link"}</button>
        <button type="button" className={btn.light + " " + btn.sm} disabled={saving || refreshing} onClick={close}>Cancel</button>
      </div>
    </form>
  );
}

export function PartnerDesk({ desk }: { desk: PartnerDeskSnapshot }) {
  const [editing, setEditing] = useState<string | null>(null);
  const { member, totalLogins, referredLogins, directLogins, commissions, links, promotions } = desk;
  const pool = member?.poolBps;
  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-8">
      <PageTitle lead="Partner" fade="Desk">{member && <Chip tone="emerald">{member.rank}</Chip>}</PageTitle>
      {(totalLogins !== undefined || referredLogins !== undefined || commissions) && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {totalLogins !== undefined && <Stat label="Users who have signed in" value={totalLogins.toLocaleString("en-US")} icon={Users} />}
          {referredLogins !== undefined && <Stat label="Signed in through your links" value={referredLogins.toLocaleString("en-US")} icon={Network} />}
          {commissions && <Stat label={`Your commission · ${commissions.sales.toLocaleString("en-US")} paid sales`} value={amount(commissions.earnedCents)} icon={DollarSign} highlight />}
        </div>
      )}
      {member?.directCode && <Panel>
        <PanelHead title="Your direct referral link" icon={Link2} sub={pool == null ? undefined : `Your share on a direct sale is ${percent(pool)}.`} />
        <div className={body + " space-y-3"}>
          {directLogins !== undefined && <p className="text-sm"><strong>{directLogins.toLocaleString("en-US")}</strong> signed in through this link</p>}
          <ReferralLink code={member.directCode} />
        </div>
      </Panel>}
      {links !== undefined && pool != null && <Panel>
        <PanelHead title="Promoter links" sub="Give each promoter their own link and share of future sales.">
          {editing === null && <button type="button" className={btn.ink + " " + btn.sm} onClick={() => setEditing("new")}>Add promoter</button>}
        </PanelHead>
        <div className={body + " space-y-5"}>
          {editing === "new" && <LinkEditor pool={pool} close={() => setEditing(null)} />}
          {links.length === 0 && editing !== "new" && <p className="text-sm text-[var(--g-muted-ink)]">Add a promoter using the email they signed up with.</p>}
          {links.map(link => <div key={link.id} className="space-y-3 border-b border-black/[0.07] pb-4 last:border-b-0 last:pb-0">
            {editing === link.id ? <LinkEditor pool={pool} link={link} close={() => setEditing(null)} /> : <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0"><p className="break-all font-semibold">{link.recipient}</p>
                  <p className="text-sm text-[var(--g-muted-ink)]">Promoter {percent(link.shareBps)} · {link.active ? `You ${percent(pool - link.shareBps)} · Active` : "Paused"}</p>
                  {link.referredLogins !== undefined && <p className="text-sm text-[var(--g-muted-ink)]">{link.referredLogins.toLocaleString("en-US")} signed in through this link</p>}
                </div>
                <button type="button" className={btn.light + " " + btn.sm} onClick={() => setEditing(link.id)}>Edit</button>
              </div>
              {link.active && <ReferralLink code={link.code} />}
            </>}
          </div>)}
        </div>
      </Panel>}
      {promotions.length > 0 && <Panel>
        <PanelHead title="Links assigned to you" sub="Your share and commission earned as a promoter." />
        <div className={body + " space-y-5"}>
          {promotions.map(promo => <div key={promo.code} className="space-y-2 border-b border-black/[0.07] pb-4 last:border-b-0 last:pb-0">
            <p className="font-semibold">{percent(promo.shareBps)} per eligible sale <Chip tone={promo.active ? "emerald" : "neutral"}>{promo.active ? "Active" : "Paused"}</Chip></p>
            <p className="text-sm">{amount(promo.earnedCents)} earned on {promo.sales} paid {promo.sales === 1 ? "sale" : "sales"}</p>
            {promo.active && <ReferralLink code={promo.code} />}
          </div>)}
        </div>
      </Panel>}
    </div>
  );
}
