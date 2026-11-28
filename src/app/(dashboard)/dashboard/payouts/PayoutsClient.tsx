"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "@/components/IntentLink";
import { CalendarClock, CircleCheck, Coins, Gauge, HandCoins, ShieldCheck, TriangleAlert, Wallet, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { PERKS } from "@/data/catalogue";
import { Chip, Empty, Meter, Notice, PageTitle, Panel, PanelHead, SelectChevron, Spinner, Stat, btn, field, fieldLabel, selectField, table, type Tone } from "@/components/dashboard/glass";

/**
 * Payouts and rewards. The figures in the request panel come from
 * /api/payouts/eligibility, the same check the request itself has to pass.
 */

const METHODS = [
  { value: "usdt_trc20", label: "USDT (TRC20)", placeholder: "TRC20 wallet address" },
  { value: "usdt_erc20", label: "USDT (ERC20)", placeholder: "ERC20 wallet address" },
  { value: "usdt_bep20", label: "USDT (BEP20)", placeholder: "BEP20 wallet address" },
  { value: "bank_transfer", label: "Bank transfer", placeholder: "Account holder, account number, IFSC or SWIFT, bank name" },
];

type Account = { id: string; terminal_account_id: string | null; starting_balance: number; program_key: string | null; status: string; profit_split: number | null };
type Payout = { id: string; amount: number; status: string; created_at: string; payment_method: string | null; sequence_no: number | null; on_demand: boolean | null; stipend_amount: number | null; fee_refund_amount: number | null; trader_share: number | null; rejected_reason: string | null };
type Accrual = { id: string; amount: number; status: string; period_start: string; period_end: string; account_size: number; trading_days: number };
type Check = {
  accountId: string;
  profit: number;
  splitPct: number;
  sequenceNo: number;
  onDemand: boolean;
  onDemandLeft: number;
  nextEligibleAt: string | null;
  consistency: { limitPct: number; bestDay: number; periodProfit: number; sharePct: number; ok: boolean; neededProfit: number };
  stipendBalance: number;
  feeRefund: number;
  minPayout: number;
  kycStatus: string;
  blockers: string[];
};

const usd = (n: number) => `$${Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const date = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
const STATUS: Record<string, Tone> = { pending: "amber", processing: "amber", approved: "emerald", paid: "lime", rejected: "red" };

export function PayoutsClient() {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [accruals, setAccruals] = useState<Accrual[]>([]);
  const [accountId, setAccountId] = useState("");
  const [check, setCheck] = useState<Check | null>(null);
  const [checking, setChecking] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState(METHODS[0].value);
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return setLoading(false);
    const uid = session.user.id;
    const [a, p, s] = await Promise.all([
      supabase.from("trading_accounts").select("id, terminal_account_id, starting_balance, program_key, status, profit_split").eq("user_id", uid).eq("phase", "funded").in("status", ["active", "funded"]).order("created_at", { ascending: false }),
      supabase.from("payouts").select("id, amount, status, created_at, payment_method, sequence_no, on_demand, stipend_amount, fee_refund_amount, trader_share, rejected_reason").eq("user_id", uid).order("created_at", { ascending: false }),
      supabase.from("stipend_accruals").select("id, amount, status, period_start, period_end, account_size, trading_days").eq("user_id", uid).order("period_end", { ascending: false }),
    ]);
    const list = (a.data ?? []) as Account[];
    setAccounts(list);
    setPayouts((p.data ?? []) as Payout[]);
    setAccruals((s.data ?? []) as Accrual[]);
    setAccountId((cur) => cur || list[0]?.id || "");
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const runCheck = useCallback(async (id: string) => {
    if (!id) return setCheck(null);
    setChecking(true);
    try {
      const res = await fetch(`/api/payouts/eligibility?accountId=${id}`, { cache: "no-store" });
      const data = await res.json();
      setCheck(res.ok ? (data as Check) : null);
      if (res.ok) setAmount(String((data as Check).profit || ""));
    } catch {
      setCheck(null);
    }
    setChecking(false);
  }, []);

  useEffect(() => {
    void runCheck(accountId);
  }, [accountId, runCheck]);

  const rewards = useMemo(() => {
    const sum = (status: string[]) => accruals.filter((x) => status.includes(x.status)).reduce((s, x) => s + Number(x.amount), 0);
    return { available: sum(["accrued"]), inPayout: sum(["released"]), paid: sum(["paid"]) };
  }, [accruals]);
  const totalPaid = payouts.filter((p) => p.status === "paid").reduce((s, p) => s + Number(p.amount), 0);

  const gross = Math.min(Number(amount) || 0, check?.profit ?? 0);
  const share = check ? Math.round(gross * check.splitPct) / 100 : 0;
  const total = check ? share + check.stipendBalance + check.feeRefund : 0;
  const placeholder = METHODS.find((m) => m.value === method)?.placeholder;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!check) return;
    setMessage(null);
    if (!details.trim()) return setMessage({ tone: "error", text: "Enter where the payout should be sent." });
    setBusy(true);
    try {
      const res = await fetch("/api/payouts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ accountId, amount: gross, paymentMethod: method, paymentDetails: details.trim() }) });
      const data = await res.json();
      if (!res.ok) setMessage({ tone: "error", text: data.error || "The request could not be made." });
      else {
        setMessage({ tone: "ok", text: "Request received. Approved payouts are sent within 24 hours on business days." });
        setDetails("");
        await load();
        await runCheck(accountId);
      }
    } catch {
      setMessage({ tone: "error", text: "Something went wrong. Please try again." });
    }
    setBusy(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageTitle lead="Payouts" fade="and rewards" lede={`Your first ${PERKS.onDemandPayouts} payouts on every funded account are on demand. Monthly stipends collect in your rewards balance and are paid with your payouts.`} />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Paid to you" value={usd(totalPaid)} icon={HandCoins} highlight className="col-span-2 lg:col-span-1" />
        <Stat label="Rewards balance" value={usd(rewards.available)} icon={Coins} />
        <Stat label="Stipends paid" value={usd(rewards.paid)} icon={CircleCheck} />
        <Stat label="Funded accounts" value={String(accounts.length)} icon={Wallet} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <Panel>
          <PanelHead icon={HandCoins} title="Request a payout" />
          <div className="p-5 sm:p-6">
            {accounts.length === 0 ? (
              <Empty icon={Wallet} title="No funded account yet" action={<Link href="/dashboard" className={cn(btn.ink, btn.sm)}>View my accounts</Link>}>
                Payouts open as soon as you are funded. Your rewards balance keeps growing in the meantime and is paid with your first payout.
              </Empty>
            ) : (
              <form onSubmit={submit} className="grid gap-4">
                <label>
                  <span className={fieldLabel}>Funded account</span>
                  <span className="relative block">
                    <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className={cn(field(), selectField)}>
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          ${Number(a.starting_balance).toLocaleString("en-US")} {a.program_key ?? ""} · {a.id.slice(0, 8)}
                        </option>
                      ))}
                    </select>
                    <SelectChevron />
                  </span>
                </label>

                {checking || !check ? (
                  <div className="flex justify-center py-8">{checking ? <Spinner /> : <p className="text-[13px] text-[var(--g-muted-ink)]">This account could not be checked. Try again in a moment.</p>}</div>
                ) : (
                  <>
                    {check.blockers.length > 0 && (
                      <Notice tone="amber" icon={TriangleAlert}>
                        <ul className="grid gap-1">
                          {check.blockers.map((b) => (
                            <li key={b}>{b}</li>
                          ))}
                        </ul>
                      </Notice>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <label>
                        <span className={fieldLabel}>Profit to withdraw</span>
                        <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} className={cn(field(), "g-num")} />
                        <span className="mt-1.5 block text-[12px] text-[var(--g-muted-ink)]">
                          Available {usd(check.profit)}{" "}
                          <button type="button" onClick={() => setAmount(String(check.profit))} className="cursor-pointer font-semibold text-[var(--g-emerald)]">
                            Max
                          </button>
                        </span>
                      </label>
                      <label>
                        <span className={fieldLabel}>Paid by</span>
                        <span className="relative block">
                          <select value={method} onChange={(e) => setMethod(e.target.value)} className={cn(field(), selectField)}>
                            {METHODS.map((m) => (
                              <option key={m.value} value={m.value}>
                                {m.label}
                              </option>
                            ))}
                          </select>
                          <SelectChevron />
                        </span>
                      </label>
                    </div>
                    <label>
                      <span className={fieldLabel}>{method === "bank_transfer" ? "Bank details" : "Wallet address"}</span>
                      <input value={details} onChange={(e) => setDetails(e.target.value)} placeholder={placeholder} className={field()} />
                    </label>

                    <dl className="grid gap-2 rounded-[20px] bg-black/[0.035] p-4 text-[13.5px] ring-1 ring-black/[0.05]">
                      <div className="flex justify-between gap-4">
                        <dt className="text-[var(--g-muted-ink)]">Your {check.splitPct}% share</dt>
                        <dd className="g-num font-semibold text-[var(--g-ink)]">{usd(share)}</dd>
                      </div>
                      {check.stipendBalance > 0 && (
                        <div className="flex justify-between gap-4">
                          <dt className="text-[var(--g-muted-ink)]">Rewards balance (stipends)</dt>
                          <dd className="g-num font-semibold text-[var(--g-emerald)]">+{usd(check.stipendBalance)}</dd>
                        </div>
                      )}
                      {check.feeRefund > 0 && (
                        <div className="flex justify-between gap-4">
                          <dt className="text-[var(--g-muted-ink)]">Evaluation fee refund</dt>
                          <dd className="g-num font-semibold text-[var(--g-emerald)]">+{usd(check.feeRefund)}</dd>
                        </div>
                      )}
                      <div className="mt-1 flex items-end justify-between gap-4 border-t border-black/[0.07] pt-3">
                        <dt className="text-[14px] font-semibold text-[var(--g-ink)]">You receive</dt>
                        <dd className="g-num text-[26px] leading-none font-semibold text-[var(--g-ink)]">{usd(total)}</dd>
                      </div>
                    </dl>

                    {check.kycStatus !== "approved" && (
                      <Notice tone="neutral" icon={ShieldCheck}>
                        Identity verification must be approved before a payout is sent. You can request now and{" "}
                        <Link href="/dashboard/settings" className="font-semibold text-[var(--g-emerald)] underline underline-offset-2">
                          verify in Settings
                        </Link>
                        .
                      </Notice>
                    )}
                    {message ? <Notice tone={message.tone === "ok" ? "emerald" : "red"}>{message.text}</Notice> : null}

                    <button type="submit" disabled={busy || check.blockers.length > 0 || share < check.minPayout} className={btn.lime}>
                      {busy ? "Sending request…" : share > 0 && share < check.minPayout ? `Minimum payout is $${check.minPayout}` : `Request ${usd(total)}`}
                    </button>
                  </>
                )}
              </form>
            )}
          </div>
        </Panel>

        <div className="grid content-start gap-4">
          {check && (
            <Panel>
              <PanelHead as="h3" icon={Zap} title={`Payout #${check.sequenceNo}`} sub={check.onDemand ? "On demand: no waiting period" : `Regular cycle: every ${PERKS.payoutCycleDays} days`} />
              <div className="grid gap-5 p-5 sm:p-6">
                <div>
                  <div className="mb-2 flex items-baseline justify-between text-[13px]">
                    <span className="text-[var(--g-muted-ink)]">On-demand payouts left</span>
                    <span className="g-num font-semibold text-[var(--g-ink)]">
                      {check.onDemandLeft} of {PERKS.onDemandPayouts}
                    </span>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {Array.from({ length: PERKS.onDemandPayouts }, (_, i) => (
                      <span key={i} className={cn("h-2 rounded-full", i < PERKS.onDemandPayouts - check.onDemandLeft ? "bg-black/15" : "bg-[linear-gradient(90deg,#cbfb45,#8fc21d)]")} />
                    ))}
                  </div>
                </div>
                {check.nextEligibleAt && (
                  <p className="flex items-center gap-2 text-[13px] text-[var(--g-muted-ink)]">
                    <CalendarClock className="h-4 w-4" /> Next request from {date(check.nextEligibleAt)}
                  </p>
                )}
                {check.consistency.limitPct > 0 && (
                  <div>
                    <div className="mb-2 flex items-baseline justify-between text-[13px]">
                      <span className="flex items-center gap-1.5 text-[var(--g-muted-ink)]">
                        <Gauge className="h-4 w-4" /> Consistency (limit {check.consistency.limitPct}%)
                      </span>
                      <span className={cn("g-num font-semibold", check.consistency.ok ? "text-[var(--g-ink)]" : "text-red-600")}>{check.consistency.sharePct}%</span>
                    </div>
                    <Meter value={Math.min(100, (check.consistency.sharePct / Math.max(1, check.consistency.limitPct)) * 100)} tone={check.consistency.ok ? "emerald" : "red"} />
                    <p className="mt-2 text-[12.5px] leading-relaxed text-[var(--g-muted-ink)]">
                      Best day {usd(check.consistency.bestDay)} of {usd(check.consistency.periodProfit)} made since your last payout.
                    </p>
                  </div>
                )}
              </div>
            </Panel>
          )}

          <Panel>
            <PanelHead as="h3" icon={Coins} title="Monthly stipend" sub={`${PERKS.stipend.ratePct}% of each active account, every ${PERKS.stipend.cycleDays} days with ${PERKS.stipend.minTradingDays}+ trading days`} />
            {accruals.length === 0 ? (
              <p className="px-5 py-7 text-center text-[13px] text-[var(--g-muted-ink)]">Your first stipend is credited when an account completes its first {PERKS.stipend.cycleDays}-day cycle.</p>
            ) : (
              <ul className="max-h-[300px] overflow-y-auto p-2 [scrollbar-width:thin]">
                {accruals.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-3 rounded-[14px] px-3 py-2.5">
                    <span className="min-w-0">
                      <span className="block text-[13.5px] font-medium text-[var(--g-ink)]">
                        ${Number(s.account_size) / 1000}K account · {s.trading_days} trading days
                      </span>
                      <span className="block text-[12px] text-[var(--g-muted-ink)]">
                        {date(s.period_start)} to {date(s.period_end)}
                      </span>
                    </span>
                    <span className="shrink-0 text-right">
                      <span className="g-num block text-[14px] font-semibold text-[var(--g-ink)]">{usd(s.amount)}</span>
                      <span className="block text-[11.5px] text-[var(--g-muted-ink)] capitalize">{s.status === "accrued" ? "In balance" : s.status === "released" ? "In a payout" : s.status}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>
      </div>

      <Panel className="mt-4">
        <PanelHead title="History" sub={`${payouts.length} ${payouts.length === 1 ? "request" : "requests"}`} />
        {payouts.length === 0 ? (
          <Empty icon={HandCoins} title="No payouts yet">
            Your requests and their status appear here.
          </Empty>
        ) : (
          <div className={table.scroll}>
            <table className="w-full min-w-[680px] border-collapse">
              <thead>
                <tr className={table.headRow}>
                  {["Requested", "Payout", "Amount", "Includes", "Paid by", "Status"].map((h) => (
                    <th key={h} className={table.th}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id} className={table.row}>
                    <td className={cn(table.td, "text-[13px] whitespace-nowrap text-[var(--g-muted-ink)]")}>{date(p.created_at)}</td>
                    <td className={cn(table.td, "text-[13px] text-[var(--g-ink)]")}>
                      {p.sequence_no ? `#${p.sequence_no}` : "—"} {p.on_demand ? <Chip tone="lime" className="ml-1">On demand</Chip> : null}
                    </td>
                    <td className={cn(table.td, "g-num text-[14px] font-semibold text-[var(--g-ink)]")}>{usd(p.amount)}</td>
                    <td className={cn(table.td, "text-[12.5px] text-[var(--g-muted-ink)]")}>
                      {[Number(p.stipend_amount) > 0 ? `${usd(Number(p.stipend_amount))} stipend` : null, Number(p.fee_refund_amount) > 0 ? `${usd(Number(p.fee_refund_amount))} fee refund` : null].filter(Boolean).join(" · ") || "Profit share"}
                    </td>
                    <td className={cn(table.td, "text-[13px] text-[var(--g-muted-ink)]")}>{METHODS.find((m) => m.value === p.payment_method)?.label ?? p.payment_method ?? "—"}</td>
                    <td className={table.td}>
                      <Chip tone={STATUS[p.status] ?? "neutral"} className="capitalize">
                        {p.status}
                      </Chip>
                      {p.status === "rejected" && p.rejected_reason ? <span className="mt-1 block max-w-[220px] text-[11.5px] text-[var(--g-muted-ink)]">{p.rejected_reason}</span> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
