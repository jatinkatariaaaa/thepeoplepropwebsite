import { supabaseAdmin } from "@/lib/supabase";
import { getPerkSettings, type PerkSettings } from "@/lib/settings";

/**
 * Payout rules in one place, used by the eligibility endpoint (what the
 * trader sees) and the request endpoint (what is enforced).
 */

const LIVE = ["pending", "approved", "paid", "processing"];
const money = (n: number) => Math.round(n * 100) / 100;

export interface PayoutCheck {
  accountId: string;
  terminalAccountId: string;
  programKey: string | null;
  startingBalance: number;
  balance: number;
  /** profit that can be withdrawn right now */
  profit: number;
  splitPct: number;
  /** number of this payout in the account's life: 1, 2, 3… */
  sequenceNo: number;
  onDemand: boolean;
  onDemandLeft: number;
  /** when the next request may be made, if the cycle applies and has not elapsed */
  nextEligibleAt: string | null;
  hasPending: boolean;
  openPositions: number;
  consistency: { limitPct: number; bestDay: number; periodProfit: number; sharePct: number; ok: boolean; neededProfit: number };
  stipendBalance: number;
  feeRefund: number;
  minPayout: number;
  kycStatus: string;
  /** why a request would be refused; empty when the trader can request */
  blockers: string[];
  settings: PerkSettings;
}

const REFUNDABLE = new Set(["1-step", "2-step", "3-step"]);

export async function checkPayout(userId: string, accountRef: string): Promise<PayoutCheck> {
  const settings = await getPerkSettings();

  // Accept either the CRM account id or the terminal account id.
  let { data: account } = await supabaseAdmin.from("trading_accounts").select("*, trading_rules(*)").eq("id", accountRef).eq("user_id", userId).maybeSingle();
  if (!account) {
    ({ data: account } = await supabaseAdmin.from("trading_accounts").select("*, trading_rules(*)").eq("terminal_account_id", accountRef).eq("user_id", userId).maybeSingle());
  }
  if (!account || !account.terminal_account_id) throw new Error("Account not found.");

  const { data: terminal } = await supabaseAdmin.from("accounts").select("*").eq("id", account.terminal_account_id).maybeSingle();
  if (!terminal) throw new Error("The trading account could not be loaded.");

  const groupId = account.phase_group_id || account.id;
  const { data: lineage } = await supabaseAdmin.from("trading_accounts").select("id, terminal_account_id, purchase_id").or(`phase_group_id.eq.${groupId},id.eq.${groupId}`);
  const lineageIds = (lineage ?? []).map((a) => a.id);
  const terminalIds = (lineage ?? []).map((a) => a.terminal_account_id).filter(Boolean) as string[];

  // Every payout this purchased account has ever requested, old rows included.
  const { data: history } = await supabaseAdmin
    .from("payouts")
    .select("id, status, created_at, trading_account_id, account_id")
    .eq("user_id", userId)
    .or(`trading_account_id.in.(${lineageIds.join(",")}),account_id.in.(${terminalIds.join(",")})`)
    .order("created_at", { ascending: false });
  const counted = (history ?? []).filter((p) => LIVE.includes(p.status));
  const sequenceNo = counted.length + 1;
  const onDemand = sequenceNo <= settings.onDemandPayouts;
  const last = counted[0];
  const hasPending = counted.some((p) => p.status === "pending" || p.status === "processing");

  let nextEligibleAt: string | null = null;
  if (!onDemand && last) {
    const next = new Date(new Date(last.created_at).getTime() + settings.payoutCycleDays * 86_400_000);
    if (next.getTime() > Date.now()) nextEligibleAt = next.toISOString();
  }

  const { count: openPositions } = await supabaseAdmin.from("positions").select("id", { count: "exact", head: true }).eq("account_id", terminal.id);

  // Consistency: the best day's share of the profit made since the last payout.
  const limitPct = Number(account.trading_rules?.consistency_pct) || 0;
  let tradesQuery = supabaseAdmin.from("trades").select("net_pnl, close_time").eq("account_id", terminal.id);
  if (last) tradesQuery = tradesQuery.gt("close_time", last.created_at);
  const { data: trades } = await tradesQuery;
  const byDay = new Map<string, number>();
  for (const t of trades ?? []) {
    // trading days roll over at 5pm New York
    const day = new Date(new Date(t.close_time).toLocaleString("en-US", { timeZone: "America/New_York" }));
    day.setHours(day.getHours() + 7);
    const key = `${day.getFullYear()}-${day.getMonth() + 1}-${day.getDate()}`;
    byDay.set(key, (byDay.get(key) ?? 0) + Number(t.net_pnl));
  }
  const periodProfit = money([...byDay.values()].reduce((s, v) => s + v, 0));
  const bestDay = money(Math.max(0, ...byDay.values()));
  const sharePct = periodProfit > 0 ? money((bestDay / periodProfit) * 100) : 0;
  const consistencyOk = limitPct <= 0 || bestDay <= 0 || (periodProfit > 0 && sharePct <= limitPct);
  const neededProfit = limitPct > 0 ? money(bestDay / (limitPct / 100)) : 0;

  const { data: accruals } = await supabaseAdmin.from("stipend_accruals").select("amount").eq("user_id", userId).eq("status", "accrued");
  const stipendBalance = money((accruals ?? []).reduce((s, a) => s + Number(a.amount), 0));

  let feeRefund = 0;
  if (sequenceNo === 1 && account.program_key && REFUNDABLE.has(account.program_key)) {
    const rootPurchaseId = (lineage ?? []).find((a) => a.id === groupId)?.purchase_id;
    if (rootPurchaseId) {
      const { data: purchase } = await supabaseAdmin.from("purchases").select("price_amount, refund_status, payment_status").eq("id", rootPurchaseId).maybeSingle();
      if (purchase && purchase.payment_status === "paid" && (purchase.refund_status ?? "none") === "none") feeRefund = money(Number(purchase.price_amount) || 0);
    }
  }

  const { data: profile } = await supabaseAdmin.from("profiles").select("kyc_status").eq("id", userId).maybeSingle();

  const profit = money(Math.max(0, Number(terminal.balance) - Number(terminal.starting_balance)));
  const splitPct = Number(account.profit_split) || 80;

  const blockers: string[] = [];
  if (terminal.phase !== "funded" || !["active", "funded"].includes(terminal.status)) blockers.push("Payouts are available on an active funded account.");
  if (hasPending) blockers.push("You already have a payout under review for this account.");
  if ((openPositions ?? 0) > 0) blockers.push("Close all open positions before requesting a payout.");
  if (profit <= 0) blockers.push("There is no profit to withdraw yet.");
  if (nextEligibleAt) blockers.push(`Your next payout can be requested on ${new Date(nextEligibleAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.`);
  if (!consistencyOk) {
    blockers.push(`Consistency: your best day ($${bestDay.toLocaleString("en-US")}) is ${sharePct}% of this period's profit; the limit is ${limitPct}%. Reach $${neededProfit.toLocaleString("en-US")} of profit in this period to qualify.`);
  }

  return {
    accountId: account.id,
    terminalAccountId: terminal.id,
    programKey: account.program_key,
    startingBalance: Number(terminal.starting_balance),
    balance: Number(terminal.balance),
    profit,
    splitPct,
    sequenceNo,
    onDemand,
    onDemandLeft: Math.max(0, settings.onDemandPayouts - counted.length),
    nextEligibleAt,
    hasPending,
    openPositions: openPositions ?? 0,
    consistency: { limitPct, bestDay, periodProfit, sharePct, ok: consistencyOk, neededProfit },
    stipendBalance,
    feeRefund,
    minPayout: settings.payoutMinAmount,
    kycStatus: profile?.kyc_status || "pending",
    blockers,
    settings,
  };
}
