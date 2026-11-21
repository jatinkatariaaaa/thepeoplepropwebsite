import { issuanceId } from "@/lib/issuance-id";
import { supabaseAdmin } from "@/lib/supabase";
import { createTradingAccount, type TerminalRules } from "@/lib/terminal-api";
import {
  getInitialAccountLifecycle,
  getNextAccountLifecycle,
  lifecycleForPhase,
  phaseOfAccount,
  type AccountLifecycleConfig,
  type ProgramLifecycleRow,
} from "@/lib/program-lifecycle";
import { getPerkSettings } from "@/lib/settings";

/**
 * Everything that issues a trading account goes through issueAccount():
 * the first account of a purchase, the next phase after a pass, the funded
 * account after an Access activation, and a reset after a breach.
 */

const ACCOUNT_COLUMNS = "id, login, terminal_account_id, phase, phase_index, status, starting_balance, program_key";

export interface PurchaseForProvisioning {
  id: string;
  user_id: string;
  email?: string | null;
  program_key: string;
  account_size: number | string;
  addons?: unknown;
}

export interface ProvisioningResult {
  created: boolean;
  account: Record<string, unknown> | null;
  reason?: string;
  awaitingActivation?: boolean;
}

type AccountRow = Record<string, any>;

const addonList = (v: unknown): string[] => (Array.isArray(v) ? v.map(String) : []);

async function notify(userId: string | null | undefined, type: string, title: string, body: string, link: string) {
  if (!userId) return;
  await supabaseAdmin.from("user_notifications").insert({ user_id: userId, type, title, body, link });
}

async function loadProgram(key: string): Promise<(ProgramLifecycleRow & Record<string, any>) | null> {
  const { data } = await supabaseAdmin.from("tpp_programs").select("*").eq("key", key).maybeSingle();
  return data ?? null;
}

async function loadTerminalPlatform() {
  const { data: platform } = await supabaseAdmin.from("tpp_platforms").select("*").eq("name", "TPP TERMINAL").eq("is_active", true).maybeSingle();
  if (!platform) throw new Error("The TPP TERMINAL platform is not configured or is inactive");
  if (!platform.api_url || !platform.api_key) throw new Error("The TPP TERMINAL platform has no API URL or key");
  return platform;
}

/** The purchase that started this account's lineage, and the add-ons bought with it. */
async function lineageRoot(account: AccountRow) {
  const groupId = account.phase_group_id || account.id;
  const { data: root } = await supabaseAdmin.from("trading_accounts").select("id, purchase_id, profit_split").eq("id", groupId).maybeSingle();
  const purchaseId = root?.purchase_id ?? account.purchase_id ?? null;
  if (!purchaseId) return { groupId, purchase: null, addons: [] as string[] };
  const { data: purchase } = await supabaseAdmin.from("purchases").select("*").eq("id", purchaseId).maybeSingle();
  return { groupId, purchase: purchase ?? null, addons: addonList(purchase?.addons) };
}

interface IssueParams {
  userId: string;
  email?: string | null;
  programKey: string;
  size: number;
  lifecycle: AccountLifecycleConfig;
  addons: string[];
  programSplit: number;
  purchaseId?: string | null;
  previousAccountId?: string | null;
  phaseGroupId?: string | null;
  resetOfAccountId?: string | null;
}

async function issueAccount(p: IssueParams): Promise<AccountRow> {
  if (!p.lifecycle.ruleId) throw new Error(`No trading rule is configured for ${p.programKey} ${p.lifecycle.label}`);

  const { data: rules, error: rulesError } = await supabaseAdmin.from("trading_rules").select("*").eq("id", p.lifecycle.ruleId).single();
  if (rulesError || !rules) throw new Error(`Trading rule not found for ${p.programKey} ${p.lifecycle.label}`);

  const platform = await loadTerminalPlatform();
  const crmAccountId = p.purchaseId ? issuanceId("purchase",p.purchaseId)
    : p.previousAccountId ? issuanceId("phase",p.previousAccountId,p.lifecycle.phase)
    : p.resetOfAccountId ? issuanceId("reset",p.resetOfAccountId) : null;
  if (!crmAccountId) throw new Error("An issuance source is required.");
  const label = `TPP $${p.size.toLocaleString("en-US")} ${p.lifecycle.label}`;

  // The No Minimum Trading Days add-on lifts the minimum on evaluation phases.
  const terminalRules: TerminalRules = { ...rules };
  if (p.addons.includes("no-min-days")) terminalRules.min_trading_days = 0;

  const terminal = await createTradingAccount({
    apiUrl: platform.api_url,
    apiKey: platform.api_key,
    userEmail: p.email || "",
    userId: p.userId,
    accountSize: p.size,
    rules: terminalRules,
    programKey: p.programKey,
    phase: p.lifecycle.terminalPhase,
    status: p.lifecycle.terminalStatus,
    label,
    businessAccountId: crmAccountId,
  });
  if (!terminal.success) throw new Error(terminal.error || "Terminal account creation failed");

  const { data: account, error } = await supabaseAdmin
    .from("trading_accounts")
    .insert({
      id: crmAccountId,
      purchase_id: p.purchaseId ?? null,
      user_id: p.userId,
      platform_id: platform.id,
      rule_id: rules.id,
      account_number: terminal.login,
      login: terminal.login,
      password: terminal.password || "sso",
      terminal_account_id: terminal.terminalAccountId || null,
      program_key: p.programKey,
      previous_account_id: p.previousAccountId ?? null,
      phase_group_id: p.phaseGroupId ?? crmAccountId,
      phase_index: p.lifecycle.phaseIndex,
      reset_of_account_id: p.resetOfAccountId ?? null,
      profit_split: p.addons.includes("split-100") ? 100 : p.programSplit,
      balance: p.size,
      starting_balance: p.size,
      equity: p.size,
      highest_equity: p.size,
      current_daily_drawdown: 0,
      current_max_drawdown: 0,
      status: "active",
      phase: p.lifecycle.phase,
    })
    .select(ACCOUNT_COLUMNS)
    .single();
  if (error) throw error;

  // The database sets the reciprocal link in the CRM insert transaction.
  return account;
}

/** First account of a paid purchase. Safe to call twice: the purchase can only ever own one account. */
export async function provisionTradingAccountForPurchase(purchase: PurchaseForProvisioning): Promise<ProvisioningResult> {
  if (!purchase?.id) throw new Error("Purchase id is required for provisioning");
  if (!purchase.user_id) throw new Error("Purchase user_id is required for provisioning");
  if (!purchase.program_key) throw new Error("Purchase program_key is required for provisioning");

  const findExisting = () => supabaseAdmin.from("trading_accounts").select(ACCOUNT_COLUMNS).eq("purchase_id", purchase.id).maybeSingle();

  const existing = await findExisting();
  if (existing.error) throw existing.error;
  if (existing.data) return { created: false, account: existing.data };

  const size = Number(purchase.account_size);
  if (!Number.isFinite(size) || size <= 0) throw new Error("account_size must be a positive number");

  const program = await loadProgram(purchase.program_key);
  if (!program) throw new Error(`Program not found for ${purchase.program_key}`);

  try {
    const account = await issueAccount({
      userId: purchase.user_id,
      email: purchase.email,
      programKey: purchase.program_key,
      size,
      lifecycle: getInitialAccountLifecycle(program),
      addons: addonList(purchase.addons),
      programSplit: Number(program.profit_split) || 80,
      purchaseId: purchase.id,
    });
    await notify(purchase.user_id, "account_ready", "Your account is ready", `Your ${program.short_label || purchase.program_key} $${size.toLocaleString("en-US")} account is live. Open it from your dashboard.`, `/dashboard/account/${account.id}`);
    return { created: true, account };
  } catch (err) {
    // A concurrent request may have created it between the check and the insert.
    if ((err as { code?: string }).code === "23505") {
      const retry = await findExisting();
      if (retry.data) return { created: false, account: retry.data };
    }
    throw err;
  }
}

/**
 * Issue the next account after a passed phase.
 * Access (pay_after_pass) stops before the funded account until the fee is paid,
 * unless `activationPaid` says the payment has just cleared.
 */
export async function provisionNextPhase(account: AccountRow, opts: { activationPaid?: boolean } = {}): Promise<ProvisioningResult> {
  if (!account.program_key) return { created: false, account: null, reason: "missing_program_key" };
  if (!account.user_id) return { created: false, account: null, reason: "missing_user_id" };

  const program = await loadProgram(account.program_key);
  if (!program) return { created: false, account: null, reason: "program_not_found" };

  const next = getNextAccountLifecycle(program, phaseOfAccount(account), account.rule_id || null);
  if (!next) return { created: false, account: null, reason: "no_next_phase" };

  const findNext = () => supabaseAdmin.from("trading_accounts").select(ACCOUNT_COLUMNS).eq("previous_account_id", account.id).eq("phase", next.phase).maybeSingle();
  const existing = await findNext();
  if (existing.error) throw existing.error;
  if (existing.data) return { created: false, account: existing.data };

  const root = await lineageRoot(account);
  const size = Number(account.starting_balance);

  if (next.phase === "funded" && program.pay_after_pass && !opts.activationPaid) {
    const fee = Number(root.purchase?.activation_fee ?? 0);
    if (fee > 0) {
      if (!account.activation_due_at) {
        const settings = await getPerkSettings();
        const dueAt = new Date(Date.now() + settings.accessActivationHours * 3600_000).toISOString();
        await supabaseAdmin.from("trading_accounts").update({ activation_due_at: dueAt, activation_fee: fee }).eq("id", account.id);
        await notify(account.user_id, "activation_due", "You passed. Activate your funded account", `Pay the $${fee.toLocaleString("en-US")} account fee within ${settings.accessActivationHours} hours to receive your funded account.`, `/dashboard/account/${account.id}`);
      }
      return { created: false, account: null, reason: "awaiting_activation", awaitingActivation: true };
    }
  }

  const { data: userResult } = await supabaseAdmin.auth.admin.getUserById(account.user_id);
  try {
    const created = await issueAccount({
      userId: account.user_id,
      email: userResult?.user?.email,
      programKey: account.program_key,
      size,
      lifecycle: next,
      addons: root.addons,
      programSplit: Number(account.profit_split) || Number(program.profit_split) || 80,
      previousAccountId: account.id,
      phaseGroupId: root.groupId,
    });
    await notify(
      account.user_id,
      next.phase === "funded" ? "funded" : "phase_passed",
      next.phase === "funded" ? "You are funded" : `${next.label} is open`,
      next.phase === "funded" ? `Your $${size.toLocaleString("en-US")} funded account is live. Your first five payouts are on demand.` : `You passed the previous phase. Your ${next.label} account is ready to trade.`,
      `/dashboard/account/${created.id}`,
    );
    return { created: true, account: created };
  } catch (err) {
    if ((err as { code?: string }).code === "23505") {
      const retry = await findNext();
      if (retry.data) return { created: false, account: retry.data };
    }
    return { created: false, account: null, reason: (err as Error).message || "terminal_create_failed" };
  }
}

/** A fresh account at the same phase, size and rules as a breached one. */
export async function provisionReset(reset: { id: string; source_account_id: string; user_id: string }): Promise<ProvisioningResult> {
  const { data: source, error } = await supabaseAdmin.from("trading_accounts").select("*").eq("id", reset.source_account_id).single();
  if (error || !source) throw new Error("The account to reset was not found");
  if (source.user_id !== reset.user_id) throw new Error("This reset belongs to another trader");
  if (!source.program_key) throw new Error("The account has no program and cannot be reset");

  const { data: already } = await supabaseAdmin.from("trading_accounts").select(ACCOUNT_COLUMNS).eq("reset_of_account_id", source.id).maybeSingle();
  if (already) return { created: false, account: already };

  const program = await loadProgram(source.program_key);
  if (!program) throw new Error("Program not found");

  const root = await lineageRoot(source);
  const { data: userResult } = await supabaseAdmin.auth.admin.getUserById(source.user_id);
  const lifecycle = { ...lifecycleForPhase(program, phaseOfAccount(source), source.rule_id || null), ruleId: source.rule_id as string | null };

  const account = await issueAccount({
    userId: source.user_id,
    email: userResult?.user?.email,
    programKey: source.program_key,
    size: Number(source.starting_balance),
    lifecycle,
    addons: root.addons,
    programSplit: Number(source.profit_split) || Number(program.profit_split) || 80,
    phaseGroupId: root.groupId,
    resetOfAccountId: source.id,
  });
  await notify(source.user_id, "reset_done", "Your account was reset", `A fresh ${lifecycle.label} account with a full balance is ready.`, `/dashboard/account/${account.id}`);
  return { created: true, account };
}
