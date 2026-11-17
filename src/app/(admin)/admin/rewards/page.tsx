"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Coins, Play, Save, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Chip, Empty, Notice, PageTitle, Panel, PanelHead, Spinner, Stat, btn, field, fieldLabel, segment, table, type Tone } from "@/components/dashboard/glass";

/** Stipends: what has been credited, what it costs each month, and the rules that decide it. */

type Accrual = { id: string; amount: number; status: string; period_no: number; period_start: string; period_end: string; account_size: number; trading_days: number; created_at: string; profile: { email: string | null } | null };
type Settings = {
  stipendEnabled: boolean;
  stipendRatePct: number;
  stipendCycleDays: number;
  stipendMinTradingDays: number;
  stipendRelease: "with_payout" | "monthly_cash";
  onDemandPayouts: number;
  payoutCycleDays: number;
  payoutMinAmount: number;
  freeResetEnabled: boolean;
  freeResetMinSize: number;
  freeResetWindowHours: number;
  freeResetClaimHours: number;
  accessActivationHours: number;
  affiliateCommissionPct: number;
};

const KEYS: Record<keyof Settings, string> = {
  stipendEnabled: "stipend_enabled",
  stipendRatePct: "stipend_rate_pct",
  stipendCycleDays: "stipend_cycle_days",
  stipendMinTradingDays: "stipend_min_trading_days",
  stipendRelease: "stipend_release",
  onDemandPayouts: "on_demand_payouts",
  payoutCycleDays: "payout_cycle_days",
  payoutMinAmount: "payout_min_amount",
  freeResetEnabled: "free_reset_enabled",
  freeResetMinSize: "free_reset_min_size",
  freeResetWindowHours: "free_reset_window_hours",
  freeResetClaimHours: "free_reset_claim_hours",
  accessActivationHours: "access_activation_hours",
  affiliateCommissionPct: "affiliate_commission_pct",
};

const NUMBERS: { key: keyof Settings; label: string; unit: string; group: string }[] = [
  { key: "stipendRatePct", label: "Stipend rate", unit: "% of account size", group: "Monthly stipend" },
  { key: "stipendCycleDays", label: "Cycle length", unit: "days", group: "Monthly stipend" },
  { key: "stipendMinTradingDays", label: "Trading days needed per cycle", unit: "days", group: "Monthly stipend" },
  { key: "onDemandPayouts", label: "On-demand payouts per account", unit: "payouts", group: "Payouts" },
  { key: "payoutCycleDays", label: "Cycle after the on-demand payouts", unit: "days", group: "Payouts" },
  { key: "payoutMinAmount", label: "Minimum payout", unit: "USD", group: "Payouts" },
  { key: "affiliateCommissionPct", label: "Default affiliate commission", unit: "% of the fee", group: "Payouts" },
  { key: "freeResetMinSize", label: "Smallest account that qualifies", unit: "USD", group: "Free reset" },
  { key: "freeResetWindowHours", label: "Must fail within", unit: "hours of first trade", group: "Free reset" },
  { key: "freeResetClaimHours", label: "Time to claim", unit: "hours", group: "Free reset" },
  { key: "accessActivationHours", label: "Access: time to pay the fee after passing", unit: "hours", group: "Free reset" },
];

const usd = (n: number) => `$${Number(n).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
const date = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const TONE: Record<string, Tone> = { accrued: "emerald", released: "amber", paid: "lime", void: "neutral" };

export default function AdminRewardsPage() {
  const [loading, setLoading] = useState(true);
  const [accruals, setAccruals] = useState<Accrual[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [exposure, setExposure] = useState({ accounts: 0, monthly: 0 });
  const [filter, setFilter] = useState("all");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/rewards", { cache: "no-store" });
    const data = await res.json();
    if (res.ok) {
      setAccruals(data.accruals);
      setSettings(data.settings);
      setExposure({ accounts: data.activeAccounts, monthly: data.monthlyExposure });
    } else toast.error(data.error || "Could not load stipends");
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const totals = useMemo(() => {
    const sum = (s: string) => accruals.filter((a) => a.status === s).reduce((t, a) => t + Number(a.amount), 0);
    return { accrued: sum("accrued"), released: sum("released"), paid: sum("paid") };
  }, [accruals]);

  const act = async (body: Record<string, unknown>, done: string) => {
    setBusy(true);
    const res = await fetch("/api/admin/rewards", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return toast.error(data.error || "That did not work");
    toast.success(body.action === "run" ? `Done: ${data.result?.stipends ?? 0} stipends credited` : done);
    void load();
  };

  const save = async () => {
    if (!settings) return;
    setBusy(true);
    const updates = (Object.keys(KEYS) as (keyof Settings)[]).map((k) => ({ category: "trading", key: KEYS[k], value: settings[k] }));
    const res = await fetch("/api/admin/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ updates }) });
    setBusy(false);
    if (res.ok) toast.success("Settings saved. They apply to new cycles and new requests.");
    else toast.error((await res.json()).error || "Could not save");
    void load();
  };

  if (loading || !settings) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  const list = accruals.filter((a) => filter === "all" || a.status === filter);
  const groups = [...new Set(NUMBERS.map((n) => n.group))];

  return (
    <div className="mx-auto max-w-7xl">
      <PageTitle lead="Stipends" fade="and rewards" lede="Every active account earns a stipend each cycle. This page shows what that costs, what has been credited, and the rules that decide it.">
        <button type="button" disabled={busy} onClick={() => void act({ action: "run" }, "")} className={cn(btn.ink, btn.sm)}>
          <Play className="h-4 w-4" /> Run accrual now
        </button>
      </PageTitle>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Next cycle, if every account qualifies" value={usd(exposure.monthly)} icon={Coins} highlight className="col-span-2 lg:col-span-1" />
        <Stat label="In traders' balances" value={usd(totals.accrued)} />
        <Stat label="Attached to pending payouts" value={usd(totals.released)} />
        <Stat label="Paid out" value={usd(totals.paid)} />
      </div>

      {settings.stipendRelease === "monthly_cash" && (
        <Notice tone="red" icon={TriangleAlert} className="mb-6">
          Stipends are set to be withdrawable on their own. With {exposure.accounts} active accounts that is up to {usd(exposure.monthly)} a month in cash, including to traders who never reach a funded account. &quot;Paid with payouts&quot; limits it to traders who earn a payout.
        </Notice>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
        <Panel>
          <PanelHead title="Ledger" sub={`${accruals.length} stipends · ${exposure.accounts} active accounts`}>
            <div className={segment.wrap}>
              {["all", "accrued", "released", "paid", "void"].map((s) => (
                <button key={s} type="button" onClick={() => setFilter(s)} className={cn(segment.item(filter === s), "capitalize")}>
                  {s}
                </button>
              ))}
            </div>
          </PanelHead>
          {list.length === 0 ? (
            <Empty icon={Coins} title="No stipends here yet">
              The accrual runs every day at 00:10 UTC. An account earns its first stipend when it completes a {settings.stipendCycleDays}-day cycle with at least {settings.stipendMinTradingDays} trading days.
            </Empty>
          ) : (
            <div className={cn(table.scroll, "max-h-[620px] overflow-y-auto")}>
              <table className="w-full min-w-[640px] border-collapse">
                <thead>
                  <tr className={table.headRow}>
                    {["Trader", "Account", "Cycle", "Days", "Amount", "Status", ""].map((h) => (
                      <th key={h} className={table.th}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {list.map((a) => (
                    <tr key={a.id} className={table.row}>
                      <td className={cn(table.td, "max-w-[200px] truncate text-[13px] text-[var(--g-ink)]")}>{a.profile?.email ?? "—"}</td>
                      <td className={cn(table.td, "g-num text-[13px] text-[var(--g-muted-ink)]")}>${Number(a.account_size) / 1000}K</td>
                      <td className={cn(table.td, "text-[12.5px] whitespace-nowrap text-[var(--g-muted-ink)]")}>
                        #{a.period_no} · {date(a.period_start)} to {date(a.period_end)}
                      </td>
                      <td className={cn(table.td, "g-num text-[13px] text-[var(--g-muted-ink)]")}>{a.trading_days}</td>
                      <td className={cn(table.td, "g-num text-[14px] font-semibold text-[var(--g-ink)]")}>{usd(a.amount)}</td>
                      <td className={table.td}>
                        <Chip tone={TONE[a.status] ?? "neutral"} className="capitalize">
                          {a.status}
                        </Chip>
                      </td>
                      <td className={cn(table.td, "text-right")}>
                        {a.status === "accrued" ? (
                          <button type="button" disabled={busy} onClick={() => void act({ action: "void", id: a.id }, "Stipend voided")} className="cursor-pointer text-[12.5px] font-semibold text-red-600 hover:underline">
                            Void
                          </button>
                        ) : a.status === "void" ? (
                          <button type="button" disabled={busy} onClick={() => void act({ action: "restore", id: a.id }, "Stipend restored")} className="cursor-pointer text-[12.5px] font-semibold text-[var(--g-emerald)] hover:underline">
                            Restore
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel className="self-start">
          <PanelHead title="Rules" sub="Used by the daily accrual, the payout checks and the reset offers.">
            <button type="button" disabled={busy} onClick={() => void save()} className={cn(btn.lime, btn.sm)}>
              <Save className="h-4 w-4" /> Save
            </button>
          </PanelHead>
          <div className="grid gap-6 p-5 sm:p-6">
            <div className="grid gap-3">
              {(
                [
                  ["stipendEnabled", "Monthly stipend"],
                  ["freeResetEnabled", "24-hour free reset"],
                ] as const
              ).map(([k, label]) => (
                <label key={k} className="flex cursor-pointer items-center justify-between gap-4 rounded-[16px] bg-black/[0.035] px-4 py-3">
                  <span className="text-[14px] font-medium text-[var(--g-ink)]">{label}</span>
                  <input type="checkbox" checked={settings[k]} onChange={(e) => setSettings({ ...settings, [k]: e.target.checked })} className="h-5 w-5 cursor-pointer accent-[var(--g-emerald)]" />
                </label>
              ))}
              <div>
                <span className={fieldLabel}>Stipends are paid</span>
                <div className={cn(segment.wrap, "flex w-full")}>
                  {(
                    [
                      ["with_payout", "With payouts"],
                      ["monthly_cash", "On their own"],
                    ] as const
                  ).map(([v, label]) => (
                    <button key={v} type="button" onClick={() => setSettings({ ...settings, stipendRelease: v })} className={cn(segment.item(settings.stipendRelease === v), "flex-1 justify-center")}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {groups.map((g) => (
              <fieldset key={g} className="grid gap-3">
                <legend className="mb-1 text-[12px] font-semibold tracking-[0.12em] text-[var(--g-muted-ink)] uppercase">{g}</legend>
                {NUMBERS.filter((n) => n.group === g).map((n) => (
                  <label key={n.key} className="grid grid-cols-[1fr_130px] items-center gap-3">
                    <span className="text-[13.5px] text-[var(--g-ink)]">
                      {n.label} <span className="text-[12px] text-[var(--g-muted-ink)]">({n.unit})</span>
                    </span>
                    <input type="number" min={0} step="any" value={settings[n.key] as number} onChange={(e) => setSettings({ ...settings, [n.key]: Number(e.target.value) })} className={cn(field(), "g-num h-10! text-right")} />
                  </label>
                ))}
              </fieldset>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
