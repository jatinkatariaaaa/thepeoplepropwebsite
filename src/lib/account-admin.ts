import { supabaseAdmin } from "@/lib/supabase";
import { provisionNextPhase, provisionReset } from "@/lib/account-provisioning";

/**
 * Firm-side actions on a trading account.
 *
 * The terminal's `accounts` row is the source of truth: the risk worker reads
 * it, and a trigger mirrors balance, equity and status onto the CRM's
 * `trading_accounts` row. So every action here changes the terminal row (via
 * the engine's SQL functions) and lets the trigger carry the result over.
 * Writing only the CRM row would be overwritten on the next risk tick.
 */

type CrmAccount = Record<string, any> & { id: string; terminal_account_id: string | null };

export class AccountActionError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

async function rpc(fn: string, args: Record<string, unknown>) {
  const { data, error } = await supabaseAdmin.rpc(fn, args);
  if (error) throw new AccountActionError(error.message, 400);
  return data;
}

/** Close positions at market, cancel orders and stop trading. */
export async function suspendAccount(account: CrmAccount, reason?: string) {
  if (account.terminal_account_id) await rpc("admin_freeze_account", { p_account_id: account.terminal_account_id, p_status: "suspended", p_reason: reason ?? null });
  else await supabaseAdmin.from("trading_accounts").update({ status: "suspended" }).eq("id", account.id);
}

/** A suspended account goes back to trading. */
export async function enableAccount(account: CrmAccount) {
  if (account.terminal_account_id) await rpc("admin_unfreeze_account", { p_account_id: account.terminal_account_id });
  else await supabaseAdmin.from("trading_accounts").update({ status: account.phase === "funded" ? "funded" : "active" }).eq("id", account.id);
}

/** Close the account as breached, for a rule violation found by the firm. No free reset is offered. */
export async function breachAccount(account: CrmAccount, reason: string) {
  if (account.terminal_account_id) await rpc("admin_freeze_account", { p_account_id: account.terminal_account_id, p_status: "breached", p_reason: reason });
  else await supabaseAdmin.from("trading_accounts").update({ status: "breached", breach_reason: reason }).eq("id", account.id);
  // The breach trigger may have offered a 24-hour reset; a firm-side breach does not earn one.
  await supabaseAdmin.from("account_resets").update({ status: "void", note: "Account closed by the firm" }).eq("source_account_id", account.id).eq("status", "eligible").neq("kind", "admin");
}

/** Mark an evaluation phase as passed and issue the next account (or ask an Access trader for the fee). */
export async function passAccount(account: CrmAccount) {
  if (account.phase === "funded") throw new AccountActionError("A funded account has no phase to pass.");
  if (account.terminal_account_id) {
    const { data: positions } = await supabaseAdmin.from("positions").select("id").eq("account_id", account.terminal_account_id).limit(1);
    if (positions?.length) await rpc("admin_freeze_account", { p_account_id: account.terminal_account_id, p_status: "suspended", p_reason: null });
    const { error } = await supabaseAdmin.from("accounts").update({ status: "passed" }).eq("id", account.terminal_account_id);
    if (error) throw new AccountActionError(error.message);
  } else {
    await supabaseAdmin.from("trading_accounts").update({ status: "passed" }).eq("id", account.id);
  }
  const { data: fresh } = await supabaseAdmin.from("trading_accounts").select("*").eq("id", account.id).single();
  return provisionNextPhase(fresh ?? { ...account, status: "passed" });
}

/**
 * A fresh start. Accounts from a purchase get a brand-new account at the same
 * phase and rules (clean trade history); others are reset in place.
 */
export async function resetAccount(account: CrmAccount, adminNote?: string) {
  if (account.program_key && account.user_id) {
    if (account.terminal_account_id && !["breached", "passed"].includes(account.status)) {
      await rpc("admin_freeze_account", { p_account_id: account.terminal_account_id, p_status: "suspended", p_reason: null });
    }
    const { data: offer, error } = await supabaseAdmin
      .from("account_resets")
      .upsert(
        { user_id: account.user_id, source_account_id: account.id, phase_group_id: account.phase_group_id || account.id, kind: "admin", status: "claimed", claimed_at: new Date().toISOString(), note: adminNote ?? "Reset by the firm" },
        { onConflict: "source_account_id" },
      )
      .select("id, source_account_id, user_id")
      .single();
    if (error || !offer) throw new AccountActionError(error?.message || "Could not record the reset.");
    const result = await provisionReset(offer);
    await supabaseAdmin.from("account_resets").update({ new_account_id: result.account?.id ?? null }).eq("id", offer.id);
    return { mode: "new_account" as const, account: result.account };
  }
  if (!account.terminal_account_id) throw new AccountActionError("This account has no terminal account to reset.");
  await rpc("admin_reset_account", { p_account_id: account.terminal_account_id });
  await supabaseAdmin.from("trading_accounts").update({ passed_at: null, breached_at: null, breach_reason: null, current_daily_drawdown: 0, current_max_drawdown: 0 }).eq("id", account.id);
  return { mode: "in_place" as const, account: null };
}

/** Leverage is enforced by the engine on every new position. */
export async function setLeverage(account: CrmAccount, leverage: number) {
  if (!Number.isInteger(leverage) || leverage < 1 || leverage > 500) throw new AccountActionError("Leverage must be a whole number between 1 and 500.");
  if (account.terminal_account_id) {
    const { error } = await supabaseAdmin.from("accounts").update({ leverage }).eq("id", account.terminal_account_id);
    if (error) throw new AccountActionError(error.message);
  }
  await supabaseAdmin.from("trading_accounts").update({ leverage }).eq("id", account.id);
}

/** Apply a rule template to an existing account: the CRM link and the limits the engine enforces. */
export async function applyRule(account: CrmAccount, ruleId: string, phase?: string | null) {
  const { data: rule } = await supabaseAdmin.from("trading_rules").select("*").eq("id", ruleId).maybeSingle();
  if (!rule) throw new AccountActionError("Rule not found.", 404);
  const nextPhase = phase || account.phase;
  const funded = nextPhase === "funded";
  if (account.terminal_account_id) {
    const { error } = await supabaseAdmin
      .from("accounts")
      .update({
        max_daily_drawdown: Number(rule.max_daily_drawdown_pct) / 100,
        max_overall_drawdown: Number(rule.max_overall_drawdown_pct) / 100,
        profit_target: funded ? 0 : Number(rule.profit_target_pct) / 100,
        min_trading_days: funded ? 0 : Number(rule.min_trading_days) || 0,
        phase: funded ? "funded" : "challenge",
      })
      .eq("id", account.terminal_account_id);
    if (error) throw new AccountActionError(error.message);
  }
  return { rule, phase: nextPhase };
}
