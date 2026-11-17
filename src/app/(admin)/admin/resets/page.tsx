"use client";

import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, Plus, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Chip, Empty, PageTitle, Panel, PanelHead, Spinner, Stat, btn, field, fieldLabel, table, type Tone } from "@/components/dashboard/glass";

/** Reset offers after a breach, and passed Access accounts waiting for their fee. */

type Profile = { email: string | null } | null;
type Reset = {
  id: string;
  kind: string;
  status: string;
  failed_after_hours: number | null;
  eligible_until: string | null;
  claimed_at: string | null;
  created_at: string;
  new_account_id: string | null;
  source_account_id: string;
  profile: Profile;
  source: { login: string; starting_balance: number; program_key: string | null; phase: string } | null;
};
type Activation = { id: string; login: string; starting_balance: number; program_key: string | null; activation_fee: number; activation_due_at: string | null; passed_at: string | null; profile: Profile };

const KIND: Record<string, string> = { free_24h: "24-hour rule", paid: "Free Retry add-on", admin: "Granted by admin" };
const TONE: Record<string, Tone> = { eligible: "amber", claimed: "lime", expired: "neutral", void: "red" };
const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—");
const usd = (n: number) => `$${Number(n).toLocaleString("en-US")}`;

export default function AdminResetsPage() {
  const [loading, setLoading] = useState(true);
  const [resets, setResets] = useState<Reset[]>([]);
  const [activations, setActivations] = useState<Activation[]>([]);
  const [busy, setBusy] = useState(false);
  const [grant, setGrant] = useState({ accountId: "", hours: "72", note: "" });

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/resets", { cache: "no-store" });
    const data = await res.json();
    if (res.ok) {
      setResets(data.resets);
      setActivations(data.activations);
    } else toast.error(data.error || "Could not load resets");
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const act = async (body: Record<string, unknown>, done: string) => {
    setBusy(true);
    const res = await fetch("/api/admin/resets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return toast.error(data.error || "That did not work");
    toast.success(done);
    void load();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  const open = resets.filter((r) => r.status === "eligible").length;

  return (
    <div className="mx-auto max-w-7xl">
      <PageTitle lead="Resets" fade="and activations" lede="Reset offers are created automatically when a $50K+ account fails within 24 hours, or when the trader bought Free Retry. You can also grant one by hand." />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Offers waiting to be claimed" value={String(open)} icon={RotateCcw} highlight />
        <Stat label="Resets claimed" value={String(resets.filter((r) => r.status === "claimed").length)} />
        <Stat label="Access accounts awaiting fee" value={String(activations.length)} icon={BadgeCheck} />
        <Stat label="Fees outstanding" value={usd(activations.reduce((s, a) => s + Number(a.activation_fee), 0))} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,0.8fr)]">
        <Panel>
          <PanelHead icon={RotateCcw} title="Reset offers" sub={`${resets.length} in total`} />
          {resets.length === 0 ? (
            <Empty icon={RotateCcw} title="No reset offers yet">
              They appear here the moment a qualifying account breaches.
            </Empty>
          ) : (
            <div className={table.scroll}>
              <table className="w-full min-w-[720px] border-collapse">
                <thead>
                  <tr className={table.headRow}>
                    {["Trader", "Account", "Why", "Failed after", "Claim by", "Status", ""].map((h) => (
                      <th key={h} className={table.th}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resets.map((r) => (
                    <tr key={r.id} className={table.row}>
                      <td className={cn(table.td, "max-w-[190px] truncate text-[13px] text-[var(--g-ink)]")}>{r.profile?.email ?? "—"}</td>
                      <td className={cn(table.td, "text-[13px] whitespace-nowrap text-[var(--g-muted-ink)]")}>
                        <a href={`/admin/trading/accounts/${r.source_account_id}`} className="font-medium text-[var(--g-emerald)] hover:underline">
                          {r.source ? `${usd(r.source.starting_balance)} ${r.source.program_key ?? ""}` : r.source_account_id.slice(0, 8)}
                        </a>
                      </td>
                      <td className={cn(table.td, "text-[12.5px] text-[var(--g-muted-ink)]")}>{KIND[r.kind] ?? r.kind}</td>
                      <td className={cn(table.td, "g-num text-[13px] text-[var(--g-muted-ink)]")}>{r.failed_after_hours != null ? `${Number(r.failed_after_hours).toFixed(1)}h` : "—"}</td>
                      <td className={cn(table.td, "text-[12.5px] whitespace-nowrap text-[var(--g-muted-ink)]")}>{when(r.eligible_until)}</td>
                      <td className={table.td}>
                        <Chip tone={TONE[r.status] ?? "neutral"} className="capitalize">
                          {r.status}
                        </Chip>
                      </td>
                      <td className={cn(table.td, "text-right whitespace-nowrap")}>
                        {r.status === "eligible" ? (
                          <button type="button" disabled={busy} onClick={() => void act({ action: "void", id: r.id }, "Offer withdrawn")} className="cursor-pointer text-[12.5px] font-semibold text-red-600 hover:underline">
                            Withdraw
                          </button>
                        ) : r.status === "expired" ? (
                          <button type="button" disabled={busy} onClick={() => void act({ action: "extend", id: r.id, hours: 72 }, "Offer reopened for 72 hours")} className="cursor-pointer text-[12.5px] font-semibold text-[var(--g-emerald)] hover:underline">
                            Reopen 72h
                          </button>
                        ) : r.new_account_id ? (
                          <a href={`/admin/trading/accounts/${r.new_account_id}`} className="text-[12.5px] font-semibold text-[var(--g-emerald)] hover:underline">
                            New account
                          </a>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <div className="grid content-start gap-4">
          <Panel>
            <PanelHead as="h3" icon={Plus} title="Grant a reset" sub="For a breached account that falls outside the automatic rules." />
            <form
              className="grid gap-3 p-5"
              onSubmit={(e) => {
                e.preventDefault();
                if (!grant.accountId.trim()) return toast.error("Paste the account ID");
                void act({ action: "grant", accountId: grant.accountId.trim(), hours: Number(grant.hours), note: grant.note }, "Reset offered to the trader").then(() => setGrant({ accountId: "", hours: "72", note: "" }));
              }}
            >
              <label>
                <span className={fieldLabel}>Account ID</span>
                <input value={grant.accountId} onChange={(e) => setGrant({ ...grant, accountId: e.target.value })} placeholder="From Trading Accounts" className={cn(field(), "g-num text-[13px]")} />
              </label>
              <div className="grid grid-cols-[110px_1fr] gap-3">
                <label>
                  <span className={fieldLabel}>Claim within</span>
                  <input type="number" min={1} max={720} value={grant.hours} onChange={(e) => setGrant({ ...grant, hours: e.target.value })} className={cn(field(), "g-num")} />
                </label>
                <label>
                  <span className={fieldLabel}>Note (internal)</span>
                  <input value={grant.note} onChange={(e) => setGrant({ ...grant, note: e.target.value })} className={field()} />
                </label>
              </div>
              <button type="submit" disabled={busy} className={cn(btn.ink, btn.sm, "mt-1")}>
                Offer reset
              </button>
            </form>
          </Panel>

          <Panel>
            <PanelHead as="h3" icon={BadgeCheck} title="Access activations" sub="Passed, fee not yet paid" />
            {activations.length === 0 ? (
              <p className="px-5 py-7 text-center text-[13px] text-[var(--g-muted-ink)]">No account is waiting for its fee.</p>
            ) : (
              <ul className="grid gap-2 p-3">
                {activations.map((a) => {
                  const late = a.activation_due_at ? new Date(a.activation_due_at).getTime() < Date.now() : false;
                  return (
                    <li key={a.id} className="rounded-[18px] bg-black/[0.035] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[13.5px] font-semibold text-[var(--g-ink)]">{a.profile?.email ?? "—"}</p>
                          <p className="g-num mt-0.5 text-[12.5px] text-[var(--g-muted-ink)]">
                            {usd(a.starting_balance)} account · fee {usd(a.activation_fee)}
                          </p>
                        </div>
                        <Chip tone={late ? "red" : "amber"}>{late ? "Window closed" : `Due ${when(a.activation_due_at)}`}</Chip>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <button type="button" disabled={busy} onClick={() => void act({ action: "extend_activation", accountId: a.id, hours: 48 }, "Window extended by 48 hours")} className={cn(btn.light, btn.sm, "h-9! text-[12.5px]!")}>
                          Give 48h more
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => window.confirm(`Issue the funded account to ${a.profile?.email ?? "this trader"} without collecting the ${usd(a.activation_fee)} fee?`) && void act({ action: "activate", accountId: a.id }, "Funded account issued")}
                          className={cn(btn.ink, btn.sm, "h-9! text-[12.5px]!")}
                        >
                          Issue without fee
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
