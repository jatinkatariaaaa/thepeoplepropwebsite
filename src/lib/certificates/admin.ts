import { supabaseAdmin } from "@/lib/supabase";
import { longDate, monthLabel, present, programLabel } from "./present";
import { isUuid, KIND_LABEL, type Certificate, type CertificateKind, type CertificateRow } from "./types";

/*
 * Admin issuing. Every certificate states a fact on a public verification page, so
 * each one is tied to the record that proves it: a passed phase, a funded account,
 * a paid payout (recorded here first when it was sent outside the dashboard), or the
 * largest paid payout of a period. Awards carry the admin's own title and wording.
 */

export class IssueError extends Error {}

export type IssueInput = {
  kind: CertificateKind;
  userId: string;
  tradingAccountId?: string | null;
  /** A terminal account with no dashboard record (older accounts), for phase-passed and funded certificates. */
  accountId?: string | null;
  payoutId?: string | null;
  periodType?: "month" | "year";
  title?: string;
  statement?: string;
  highlightLabel?: string;
  highlightValue?: string;
  traderName?: string;
  issuedAt?: string;
  note?: string;
  /** A payout already sent outside the dashboard: recorded as a paid payout first. */
  manualPayout?: { accountId: string; amount: number; method: string; reference: string; paidAt: string } | null;
  /** Staff test certificate: any details, staff accounts only, marked TEST everywhere. */
  test?: boolean;
  testDetails?: { programKey?: string; accountSize?: number; phaseIndex?: number; amount?: number; periodLabel?: string } | null;
};

type Draft = Omit<CertificateRow, "id" | "number" | "status" | "revoked_reason" | "revoked_at" | "created_at" | "source" | "issued_by">;

const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

async function profileName(userId: string) {
  const { data } = await supabaseAdmin.from("profiles").select("id, email, display_name, first_name, last_name").eq("id", userId).maybeSingle();
  if (!data) throw new IssueError("Trader not found.");
  const name = data.display_name?.trim() || [data.first_name, data.last_name].filter(Boolean).join(" ").trim() || "Valued Trader";
  return { name, email: data.email as string | null };
}

/** Admins and staff: profiles.is_admin or a row in admin_roles. */
export async function isStaff(userId: string) {
  const [{ data: profile }, { data: role }] = await Promise.all([
    supabaseAdmin.from("profiles").select("is_admin").eq("id", userId).maybeSingle(),
    supabaseAdmin.from("admin_roles").select("role").eq("user_id", userId).maybeSingle(),
  ]);
  return Boolean(profile?.is_admin || role);
}

async function activeExists(filter: Record<string, string>, kind: CertificateKind) {
  let q = supabaseAdmin.from("certificates").select("id, number").eq("kind", kind).eq("status", "active");
  for (const [k, v] of Object.entries(filter)) q = q.eq(k, v);
  const { data } = await q.limit(1);
  return data?.[0] ?? null;
}

function periodWindow(iso: string, type: "month" | "year") {
  const d = new Date(iso);
  const start = type === "year" ? new Date(Date.UTC(d.getUTCFullYear(), 0, 1)) : new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
  const end = type === "year" ? new Date(Date.UTC(d.getUTCFullYear() + 1, 0, 1)) : new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
  return { start, end, label: type === "year" ? String(d.getUTCFullYear()) : monthLabel(iso) };
}

const usd = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Checks the input against the records and returns the row to insert. Inserts nothing. */
export async function buildDraft(input: IssueInput): Promise<{ draft: Draft; manual: IssueInput["manualPayout"] }> {
  if (!isUuid(input.userId || "")) throw new IssueError("Pick a trader.");
  const { name } = await profileName(input.userId);
  const traderName = text(input.traderName, 80) || name;
  const base = {
    user_id: input.userId,
    trader_name: traderName,
    account_id: null as string | null,
    trading_account_id: null as string | null,
    payout_id: null as string | null,
    program_key: null as string | null,
    account_size: null as number | null,
    phase_index: null as number | null,
    amount: null as number | null,
    period_label: null as string | null,
    title: null as string | null,
    statement: null as string | null,
    highlight_label: null as string | null,
    highlight_value: null as string | null,
    issued_at: new Date().toISOString(),
    note: text(input.note, 300) || null,
    is_test: false,
  };

  // Test certificates for design and dashboard checks: any details, staff accounts only.
  if (input.test) {
    if (!(await isStaff(input.userId))) throw new IssueError("Test certificates can only go to staff accounts. Pick your own admin account.");
    const d = input.testDetails ?? {};
    const issued = input.issuedAt ? new Date(input.issuedAt) : new Date();
    if (Number.isNaN(issued.getTime())) throw new IssueError("Enter a valid date.");
    const kind = input.kind;
    const amount = Math.round(Number(d.amount) * 100) / 100;
    const size = Number(d.accountSize) > 0 ? Number(d.accountSize) : null;
    const paid = kind === "payout" || kind === "highest_payout";
    if (paid && !(amount > 0)) throw new IssueError("Enter an amount for the test certificate.");
    if (kind === "award" && text(input.title, 60).length < 3) throw new IssueError("Give the award a title.");
    return {
      draft: {
        ...base,
        kind,
        is_test: true,
        program_key: d.programKey && programLabel(d.programKey) ? d.programKey : null,
        account_size: size,
        phase_index: kind === "phase_pass" ? Math.min(3, Math.max(1, Number(d.phaseIndex) || 1)) : null,
        amount: paid ? amount : null,
        period_label: kind === "highest_payout" ? text(d.periodLabel, 30) || monthLabel(issued.toISOString()) : null,
        title: kind === "award" ? text(input.title, 60) : null,
        statement: kind === "award" ? text(input.statement, 220) || null : null,
        highlight_label: kind === "award" ? text(input.highlightLabel, 24) || null : null,
        highlight_value: kind === "award" ? text(input.highlightValue, 24) || null : null,
        issued_at: issued.toISOString(),
      },
      manual: null,
    };
  }

  const crmAccount = async () => {
    if (!isUuid(input.tradingAccountId || "")) throw new IssueError("Pick the account.");
    const { data } = await supabaseAdmin
      .from("trading_accounts")
      .select("id, user_id, phase, phase_index, status, passed_at, program_key, starting_balance, terminal_account_id, created_at")
      .eq("id", input.tradingAccountId as string)
      .maybeSingle();
    if (!data || data.user_id !== input.userId) throw new IssueError("That account does not belong to this trader.");
    return data;
  };

  // Older accounts that exist only in the terminal: certify them from the terminal row.
  if ((input.kind === "phase_pass" || input.kind === "funded") && !input.tradingAccountId && input.accountId) {
    if (!isUuid(input.accountId)) throw new IssueError("Pick the account.");
    const { data: t } = await supabaseAdmin.from("accounts").select("id, user_id, phase, status, program_key, starting_balance, updated_at, created_at").eq("id", input.accountId).maybeSingle();
    if (!t || t.user_id !== input.userId) throw new IssueError("That account does not belong to this trader.");
    const { count: linked } = await supabaseAdmin.from("trading_accounts").select("id", { count: "exact", head: true }).eq("terminal_account_id", t.id);
    if (linked) throw new IssueError("This account has a dashboard record; pick it from the list instead.");
    if (input.kind === "phase_pass" && t.status !== "passed") throw new IssueError("This account has not passed. Mark it passed in Trading Accounts first.");
    if (input.kind === "funded" && t.phase !== "funded") throw new IssueError("That account is not a funded account.");
    const { data: dup } = await supabaseAdmin.from("certificates").select("number").eq("account_id", t.id).eq("kind", input.kind).eq("status", "active").is("trading_account_id", null).limit(1);
    if (dup?.[0]) throw new IssueError(`This account already has certificate ${dup[0].number}.`);
    return {
      draft: { ...base, kind: input.kind, account_id: t.id, program_key: t.program_key, account_size: Number(t.starting_balance), issued_at: input.kind === "phase_pass" ? t.updated_at : t.created_at },
      manual: null,
    };
  }

  switch (input.kind) {
    case "phase_pass": {
      const a = await crmAccount();
      if (a.phase === "funded") throw new IssueError("That is a funded account. Issue a Certificate of Funding instead.");
      const { count } = await supabaseAdmin.from("trading_accounts").select("id", { count: "exact", head: true }).eq("previous_account_id", a.id);
      // A pass the terminal recorded but the dashboard record missed (a failed sync) counts too.
      const { data: term } = a.terminal_account_id ? await supabaseAdmin.from("accounts").select("status").eq("id", a.terminal_account_id).maybeSingle() : { data: null };
      if (!a.passed_at && a.status !== "passed" && !count && term?.status !== "passed") throw new IssueError("This phase has not been passed. Mark it passed in Trading Accounts first; the certificate is then issued automatically.");
      const dup = await activeExists({ trading_account_id: a.id }, "phase_pass");
      if (dup) throw new IssueError(`This phase already has certificate ${dup.number}.`);
      return {
        draft: { ...base, kind: "phase_pass", trading_account_id: a.id, account_id: a.terminal_account_id, program_key: a.program_key, account_size: Number(a.starting_balance), phase_index: a.phase_index && a.phase_index !== 99 ? a.phase_index : null, issued_at: a.passed_at || new Date().toISOString() },
        manual: null,
      };
    }
    case "funded": {
      const a = await crmAccount();
      if (a.phase !== "funded") throw new IssueError("That account is not a funded account.");
      const dup = await activeExists({ trading_account_id: a.id }, "funded");
      if (dup) throw new IssueError(`This account already has certificate ${dup.number}.`);
      return {
        draft: { ...base, kind: "funded", trading_account_id: a.id, account_id: a.terminal_account_id, program_key: a.program_key, account_size: Number(a.starting_balance), issued_at: a.created_at },
        manual: null,
      };
    }
    case "payout": {
      if (input.manualPayout) {
        const m = input.manualPayout;
        const amount = Math.round(Number(m.amount) * 100) / 100;
        if (!(amount > 0) || amount > 10_000_000) throw new IssueError("Enter the amount that was paid.");
        if (text(m.reference, 120).length < 3) throw new IssueError("Add the transfer reference (transaction hash or bank reference).");
        const paidAt = new Date(m.paidAt);
        if (Number.isNaN(paidAt.getTime()) || paidAt.getTime() > Date.now() + 60_000) throw new IssueError("Enter the date the payout was sent.");
        if (!isUuid(m.accountId || "")) throw new IssueError("Pick the account the payout came from.");
        const { data: acc } = await supabaseAdmin.from("accounts").select("id, user_id, program_key, starting_balance").eq("id", m.accountId).maybeSingle();
        if (!acc || acc.user_id !== input.userId) throw new IssueError("That account does not belong to this trader.");
        const { data: crm } = await supabaseAdmin.from("trading_accounts").select("program_key, starting_balance").eq("terminal_account_id", acc.id).maybeSingle();
        return {
          draft: { ...base, kind: "payout", account_id: acc.id, program_key: crm?.program_key ?? acc.program_key, account_size: Number(crm?.starting_balance ?? acc.starting_balance), amount, issued_at: paidAt.toISOString() },
          manual: { ...m, amount, paidAt: paidAt.toISOString(), reference: text(m.reference, 120), method: text(m.method, 40) || "other" },
        };
      }
      if (!isUuid(input.payoutId || "")) throw new IssueError("Pick a paid payout, or record one that was sent outside the dashboard.");
      const { data: p } = await supabaseAdmin.from("payouts").select("id, user_id, status, amount, processed_at, created_at, account_id, trading_account_id").eq("id", input.payoutId as string).maybeSingle();
      if (!p || p.user_id !== input.userId) throw new IssueError("That payout does not belong to this trader.");
      if (p.status !== "paid") throw new IssueError("Only a paid payout gets a certificate. Mark it paid in Payouts first.");
      const dup = await activeExists({ payout_id: p.id }, "payout");
      if (dup) throw new IssueError(`This payout already has certificate ${dup.number}.`);
      const { data: acc } = await supabaseAdmin.from("accounts").select("program_key, starting_balance").eq("id", p.account_id).maybeSingle();
      const { data: crm } = p.trading_account_id ? await supabaseAdmin.from("trading_accounts").select("program_key, starting_balance").eq("id", p.trading_account_id).maybeSingle() : { data: null };
      return {
        draft: { ...base, kind: "payout", payout_id: p.id, account_id: p.account_id, trading_account_id: p.trading_account_id, program_key: crm?.program_key ?? acc?.program_key ?? null, account_size: Number(crm?.starting_balance ?? acc?.starting_balance ?? 0) || null, amount: Number(p.amount), issued_at: p.processed_at || p.created_at },
        manual: null,
      };
    }
    case "highest_payout": {
      if (!isUuid(input.payoutId || "")) throw new IssueError("Pick the payout to award.");
      const { data: p } = await supabaseAdmin.from("payouts").select("id, user_id, status, amount, processed_at, created_at, account_id, trading_account_id").eq("id", input.payoutId as string).maybeSingle();
      if (!p || p.user_id !== input.userId) throw new IssueError("That payout does not belong to this trader.");
      if (p.status !== "paid") throw new IssueError("Only a paid payout can be awarded.");
      const when = p.processed_at || p.created_at;
      const { start, end, label } = periodWindow(when, input.periodType === "year" ? "year" : "month");
      const s = start.toISOString();
      const e = end.toISOString();
      const { data: top } = await supabaseAdmin
        .from("payouts")
        .select("id, amount")
        .eq("status", "paid")
        .or(`and(processed_at.gte.${s},processed_at.lt.${e}),and(processed_at.is.null,created_at.gte.${s},created_at.lt.${e})`)
        .order("amount", { ascending: false })
        .limit(1);
      const best = top?.[0];
      if (best && Number(best.amount) > Number(p.amount)) throw new IssueError(`A larger payout (${usd(Number(best.amount))}) was paid in ${label}. Only the largest one can carry this award.`);
      const { data: taken } = await supabaseAdmin.from("certificates").select("number").eq("kind", "highest_payout").eq("status", "active").eq("period_label", label).limit(1);
      if (taken?.[0]) throw new IssueError(`${label} already has a highest-payout award (${taken[0].number}). Revoke it first to award another.`);
      const { data: acc } = await supabaseAdmin.from("accounts").select("program_key, starting_balance").eq("id", p.account_id).maybeSingle();
      return {
        draft: { ...base, kind: "highest_payout", payout_id: p.id, account_id: p.account_id, trading_account_id: p.trading_account_id, program_key: acc?.program_key ?? null, account_size: Number(acc?.starting_balance ?? 0) || null, amount: Number(p.amount), period_label: label, issued_at: when },
        manual: null,
      };
    }
    case "award": {
      const title = text(input.title, 60);
      const statement = text(input.statement, 220);
      if (title.length < 3) throw new IssueError("Give the award a title, like Trader of the Month.");
      if (statement.length < 10) throw new IssueError("Add the sentence printed under the name, starting with “for …”.");
      let account: { program_key: string | null; starting_balance: number | null; id: string; terminal_account_id: string | null } | null = null;
      if (input.tradingAccountId) {
        const a = await crmAccount();
        account = { id: a.id, program_key: a.program_key, starting_balance: Number(a.starting_balance), terminal_account_id: a.terminal_account_id };
      }
      const issued = input.issuedAt ? new Date(input.issuedAt) : new Date();
      if (Number.isNaN(issued.getTime()) || issued.getTime() > Date.now() + 60_000) throw new IssueError("The award date can't be in the future.");
      return {
        draft: {
          ...base,
          kind: "award",
          title,
          statement,
          highlight_label: text(input.highlightLabel, 24) || null,
          highlight_value: text(input.highlightValue, 24) || null,
          trading_account_id: account?.id ?? null,
          account_id: account?.terminal_account_id ?? null,
          program_key: account?.program_key ?? null,
          account_size: account?.starting_balance ?? null,
          issued_at: issued.toISOString(),
        },
        manual: null,
      };
    }
  }
  throw new IssueError("Unknown certificate type.");
}

/** A draft as the artwork shows it, for the admin preview. */
export function draftCertificate(draft: Draft): Certificate {
  return present({ ...draft, id: "00000000-0000-4000-8000-000000000000", number: "TPP-PREVIEW", status: "active", revoked_reason: null, revoked_at: null, created_at: new Date().toISOString(), source: "admin", issued_by: null } as CertificateRow);
}

/** Inserts the certificate (recording the outside payout first when there is one). */
export async function issueCertificate(input: IssueInput, adminId: string): Promise<Certificate> {
  const { draft, manual } = await buildDraft(input);

  if (manual) {
    const { data: payout, error } = await supabaseAdmin
      .from("payouts")
      .insert({
        user_id: input.userId,
        account_id: manual.accountId,
        amount: manual.amount,
        trader_share: manual.amount,
        crypto_address: `Recorded by admin: ${manual.method}`,
        status: "paid",
        payment_method: manual.method,
        tx_reference: manual.reference,
        processed_at: manual.paidAt,
        processed_by: adminId,
        notes: "Paid outside the dashboard and recorded by an admin.",
      })
      .select("id")
      .single();
    if (error || !payout) throw new IssueError(error?.message || "Could not record the payout.");
    // The payout trigger issued the certificate; mark it as issued by this admin.
    const { data: cert } = await supabaseAdmin
      .from("certificates")
      .update({ source: "admin", issued_by: adminId, trader_name: draft.trader_name, note: draft.note })
      .eq("payout_id", payout.id)
      .eq("kind", "payout")
      .select("*")
      .single();
    if (!cert) throw new IssueError("The payout was recorded, but its certificate was not created.");
    return present(cert as CertificateRow);
  }

  const { data, error } = await supabaseAdmin.from("certificates").insert({ ...draft, source: "admin", issued_by: adminId }).select("*").single();
  if (error || !data) throw new IssueError(error?.code === "23505" ? "This record already has a live certificate." : error?.message || "Could not issue the certificate.");
  const cert = present(data as CertificateRow);
  if (cert.isTest) return cert;
  await supabaseAdmin.from("user_notifications").insert({
    user_id: input.userId,
    type: "certificate",
    title: `New certificate: ${cert.kind === "award" ? cert.title : KIND_LABEL[cert.kind]}`,
    body: "Download it or share its verification link from Certificates.",
    link: "/dashboard/certificates",
  });
  return cert;
}

/** What a trader has that can carry a certificate, for the issue form. */
export async function certificateCandidates(userId: string) {
  if (!isUuid(userId)) throw new IssueError("Pick a trader.");
  const [{ data: accounts }, { data: terminal }, { data: payouts }, { data: certs }] = await Promise.all([
    supabaseAdmin
      .from("trading_accounts")
      .select("id, login, phase, phase_index, status, passed_at, program_key, starting_balance, terminal_account_id, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    supabaseAdmin.from("accounts").select("id, label, phase, status, starting_balance, program_key, updated_at, created_at").eq("user_id", userId).order("created_at", { ascending: false }),
    supabaseAdmin.from("payouts").select("id, amount, status, processed_at, created_at, account_id, payment_method, tx_reference").eq("user_id", userId).order("created_at", { ascending: false }),
    supabaseAdmin.from("certificates").select("id, number, kind, status, account_id, trading_account_id, payout_id").eq("user_id", userId).eq("status", "active"),
  ]);
  const { data: next } = (accounts ?? []).length
    ? await supabaseAdmin.from("trading_accounts").select("previous_account_id").in("previous_account_id", (accounts ?? []).map((a) => a.id))
    : { data: [] as { previous_account_id: string }[] };
  const advanced = new Set((next ?? []).map((n) => n.previous_account_id));
  const terminalPassed = new Set((terminal ?? []).filter((t) => t.status === "passed").map((t) => t.id));
  const money = (n: number | string) => Number(n).toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const cert = (match: (c: NonNullable<typeof certs>[number]) => boolean) => {
    const c = (certs ?? []).find(match);
    return c ? { id: c.id, number: c.number } : null;
  };

  const linkedTerminal = new Set((accounts ?? []).map((a) => a.terminal_account_id).filter(Boolean));
  const dashboard = (accounts ?? []).map((a) => ({
    id: a.id,
    source: "dashboard" as const,
    label: `${money(a.starting_balance)} ${programLabel(a.program_key) ?? ""}`.trim(),
    phase: a.phase === "funded" ? "Funded" : a.phase_index && a.phase_index !== 99 ? `Phase ${a.phase_index}` : "Evaluation",
    status: a.status as string,
    funded: a.phase === "funded",
    passed: a.phase !== "funded" && (Boolean(a.passed_at) || a.status === "passed" || advanced.has(a.id) || (Boolean(a.terminal_account_id) && terminalPassed.has(a.terminal_account_id as string))),
    passedOn: a.passed_at ? longDate(a.passed_at) : null,
    phaseCertificate: cert((c) => c.kind === "phase_pass" && c.trading_account_id === a.id),
    fundedCertificate: cert((c) => c.kind === "funded" && c.trading_account_id === a.id),
  }));
  // Accounts that exist only in the terminal (no dashboard record), e.g. older ones.
  const terminalOnly = (terminal ?? [])
    .filter((t) => !linkedTerminal.has(t.id))
    .map((t) => ({
      id: t.id,
      source: "terminal" as const,
      label: `${money(t.starting_balance)} ${t.label || programLabel(t.program_key) || "account"}`.trim(),
      phase: t.phase === "funded" ? "Funded" : "Evaluation",
      status: t.status as string,
      funded: t.phase === "funded",
      passed: t.phase !== "funded" && t.status === "passed",
      passedOn: t.status === "passed" ? longDate(t.updated_at) : null,
      phaseCertificate: cert((c) => c.kind === "phase_pass" && c.account_id === t.id && !c.trading_account_id),
      fundedCertificate: cert((c) => c.kind === "funded" && c.account_id === t.id && !c.trading_account_id),
    }));

  return {
    isStaff: await isStaff(userId),
    accounts: [...dashboard, ...terminalOnly],
    terminalAccounts: (terminal ?? []).map((a) => ({ id: a.id, label: `${money(a.starting_balance)} · ${a.label || programLabel(a.program_key) || "account"}`, status: a.status })),
    payouts: (payouts ?? []).map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      status: p.status,
      paidOn: longDate(p.processed_at || p.created_at),
      method: p.payment_method,
      reference: p.tx_reference,
      payoutCertificate: cert((c) => c.kind === "payout" && c.payout_id === p.id)?.number ?? null,
      highestCertificate: cert((c) => c.kind === "highest_payout" && c.payout_id === p.id)?.number ?? null,
    })),
  };
}

/** Traders by email or name, for the issue form. */
export async function searchTraders(q: string) {
  const term = q.trim().replace(/[%,()]/g, "");
  if (term.length < 2) return [];
  const { data } = await supabaseAdmin
    .from("profiles")
    .select("id, email, display_name, first_name, last_name")
    .or(`email.ilike.%${term}%,display_name.ilike.%${term}%,first_name.ilike.%${term}%,last_name.ilike.%${term}%`)
    .limit(8);
  return (data ?? []).map((p) => ({ id: p.id, email: p.email, name: p.display_name || [p.first_name, p.last_name].filter(Boolean).join(" ") || null }));
}
