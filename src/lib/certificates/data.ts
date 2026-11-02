import { supabaseAdmin } from "@/lib/supabase";
import { programs } from "@/data/programs";
import type { Certificate } from "./types";

/*
 * Who gets which certificate. Every certificate is derived from live rows, so it
 * exists exactly when the event did:
 * - funded:  an `accounts` row in status "passed" or "funded" (same rule as before);
 * - payout:  a `payouts` row in status "paid";
 * - highest: a paid payout that is the largest paid payout of its calendar month
 *            (UTC), awarded once that month has ended so the title can't change.
 */

type AccountRow = {
  id: string;
  user_id: string | null;
  status: string | null;
  starting_balance: number | string | null;
  updated_at: string;
  business_account_id?: string | null;
};

type PayoutRow = {
  id: string;
  user_id: string | null;
  account_id: string | null;
  amount: number | string;
  status: string | null;
  processed_at: string | null;
  created_at: string;
};

const PAYOUT_COLUMNS = "id, user_id, account_id, amount, status, processed_at, created_at";

const usd = (value: number | string | null | undefined, cents: boolean) =>
  Number(value ?? 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: cents ? 2 : 0,
    maximumFractionDigits: cents ? 2 : 0,
  });

const longDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

const monthLabel = (date: Date) => date.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

export const certificateNumber = (id: string) => id.split("-")[0].toUpperCase();

const paidAt = (payout: PayoutRow) => payout.processed_at || payout.created_at;

function monthWindow(iso: string) {
  const d = new Date(iso);
  return {
    start: new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)),
    end: new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1)),
  };
}

async function traderNames(userIds: string[]) {
  const ids = [...new Set(userIds.filter(Boolean))];
  const names = new Map<string, string>();
  if (ids.length) {
    const { data } = await supabaseAdmin.from("profiles").select("id, display_name").in("id", ids);
    for (const row of data ?? []) if (row.display_name) names.set(row.id, row.display_name);
  }
  return (id: string | null) => (id && names.get(id)) || "Valued Trader";
}

/** Program labels for terminal accounts, via the CRM account they were provisioned from. */
async function programLabels(accounts: Pick<AccountRow, "id" | "business_account_id">[]) {
  const crmIds = [...new Set(accounts.map((a) => a.business_account_id).filter((id): id is string => Boolean(id)))];
  const byCrm = new Map<string, string>();
  if (crmIds.length) {
    const { data } = await supabaseAdmin.from("trading_accounts").select("id, program_key").in("id", crmIds);
    for (const row of data ?? []) {
      const label = programs.find((p) => p.key === row.program_key)?.label;
      if (label) byCrm.set(row.id, label);
    }
  }
  return (account: Pick<AccountRow, "business_account_id"> | null | undefined) =>
    (account?.business_account_id && byCrm.get(account.business_account_id)) || null;
}

/** Largest paid payout of a finished month, or null while the month is still running. */
async function monthTopAmount(start: Date, end: Date): Promise<number | null> {
  if (Date.now() < end.getTime()) return null;
  const s = start.toISOString();
  const e = end.toISOString();
  const { data } = await supabaseAdmin
    .from("payouts")
    .select("amount")
    .eq("status", "paid")
    .or(`and(processed_at.gte.${s},processed_at.lt.${e}),and(processed_at.is.null,created_at.gte.${s},created_at.lt.${e})`)
    .order("amount", { ascending: false })
    .limit(1);
  return data?.[0] ? Number(data[0].amount) : null;
}

function fundedCertificate(account: AccountRow, name: string, program: string | null): Certificate {
  return {
    kind: "funded",
    id: account.id,
    number: certificateNumber(account.id),
    traderName: name,
    issuedOn: longDate(account.updated_at),
    accountSize: usd(account.starting_balance, false),
    program,
    status: account.status ?? undefined,
  };
}

function payoutCertificate(payout: PayoutRow, account: AccountRow | null | undefined, name: string, program: string | null): Certificate {
  return {
    kind: "payout",
    id: payout.id,
    number: certificateNumber(payout.id),
    traderName: name,
    issuedOn: longDate(paidAt(payout)),
    accountSize: account ? usd(account.starting_balance, false) : "—",
    program,
    amount: usd(payout.amount, true),
  };
}

export async function getFundedCertificate(id: string): Promise<Certificate | null> {
  const { data, error } = await supabaseAdmin.from("accounts").select("*").eq("id", id).single();
  const account = data as AccountRow | null;
  if (error || !account || (account.status !== "passed" && account.status !== "funded")) return null;
  const [nameOf, programOf] = await Promise.all([traderNames([account.user_id ?? ""]), programLabels([account])]);
  return fundedCertificate(account, nameOf(account.user_id), programOf(account));
}

async function loadPaidPayout(id: string) {
  const { data, error } = await supabaseAdmin.from("payouts").select(PAYOUT_COLUMNS).eq("id", id).single();
  const payout = data as PayoutRow | null;
  if (error || !payout || payout.status !== "paid") return null;
  const account = payout.account_id
    ? ((await supabaseAdmin.from("accounts").select("id, starting_balance, business_account_id").eq("id", payout.account_id).maybeSingle()).data as AccountRow | null)
    : null;
  const [nameOf, programOf] = await Promise.all([traderNames([payout.user_id ?? ""]), programLabels(account ? [account] : [])]);
  return { payout, certificate: payoutCertificate(payout, account, nameOf(payout.user_id), programOf(account)) };
}

export async function getPayoutCertificate(id: string): Promise<Certificate | null> {
  return (await loadPaidPayout(id))?.certificate ?? null;
}

async function asHighest({ payout, certificate }: NonNullable<Awaited<ReturnType<typeof loadPaidPayout>>>): Promise<Certificate | null> {
  const { start, end } = monthWindow(paidAt(payout));
  const top = await monthTopAmount(start, end);
  if (top === null || Number(payout.amount) < top) return null;
  return { ...certificate, kind: "highest", period: monthLabel(start) };
}

/** The payout's highest-payout award, or null when it wasn't the top payout of a finished month. */
export async function getHighestPayoutCertificate(id: string): Promise<Certificate | null> {
  const loaded = await loadPaidPayout(id);
  return loaded ? asHighest(loaded) : null;
}

/**
 * The certificate behind an id printed on any certificate, for the public check
 * at /verify/<id>: the funding certificate for an account id, otherwise the
 * payout's certificate (as its highest-payout award when it earned one).
 */
export async function findCertificate(id: string): Promise<Certificate | null> {
  const funded = await getFundedCertificate(id);
  if (funded) return funded;
  const loaded = await loadPaidPayout(id);
  if (!loaded) return null;
  return (await asHighest(loaded)) ?? loaded.certificate;
}

/** Every certificate a trader holds, newest first: highest-payout awards, payouts, then funding. */
export async function listCertificates(userId: string): Promise<Certificate[]> {
  const [{ data: accounts }, { data: payouts }] = await Promise.all([
    supabaseAdmin.from("accounts").select("*").eq("user_id", userId).in("status", ["passed", "funded"]).order("created_at", { ascending: false }),
    supabaseAdmin.from("payouts").select(PAYOUT_COLUMNS).eq("user_id", userId).eq("status", "paid").order("created_at", { ascending: false }),
  ]);
  const accountRows = (accounts ?? []) as AccountRow[];
  const payoutRows = (payouts ?? []) as PayoutRow[];

  const payoutAccountIds = [...new Set(payoutRows.map((p) => p.account_id).filter((id): id is string => Boolean(id)))];
  const { data: payoutAccounts } = payoutAccountIds.length
    ? await supabaseAdmin.from("accounts").select("id, starting_balance, business_account_id").in("id", payoutAccountIds)
    : { data: [] as AccountRow[] };
  const accountById = new Map<string, AccountRow>();
  for (const a of [...accountRows, ...((payoutAccounts ?? []) as AccountRow[])]) accountById.set(a.id, a);

  const [nameOf, programOf] = await Promise.all([traderNames([userId]), programLabels([...accountById.values()])]);
  const name = nameOf(userId);

  // Highest-payout check, one query per finished month the trader was paid in.
  const months = new Map<string, Promise<number | null>>();
  const topOf = (payout: PayoutRow) => {
    const { start, end } = monthWindow(paidAt(payout));
    const key = start.toISOString();
    if (!months.has(key)) months.set(key, monthTopAmount(start, end));
    return months.get(key) as Promise<number | null>;
  };

  const awards: Certificate[] = [];
  const paid: Certificate[] = [];
  for (const payout of payoutRows) {
    const account = payout.account_id ? accountById.get(payout.account_id) : undefined;
    const certificate = payoutCertificate(payout, account, name, programOf(account));
    paid.push(certificate);
    const top = await topOf(payout);
    if (top !== null && Number(payout.amount) >= top) {
      awards.push({ ...certificate, kind: "highest", period: monthLabel(monthWindow(paidAt(payout)).start) });
    }
  }

  const funded = accountRows.map((account) => fundedCertificate(account, name, programOf(account)));
  return [...awards, ...paid, ...funded];
}
