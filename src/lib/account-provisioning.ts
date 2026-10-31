import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { createTradingAccount } from "@/lib/terminal-api";
import { getInitialAccountLifecycle } from "@/lib/program-lifecycle";

export interface PurchaseForProvisioning {
  id: string;
  user_id: string;
  email?: string | null;
  program_key: string;
  account_size: number | string;
}

export interface ProvisioningResult {
  created: boolean;
  account: any;
}

function toPositiveNumber(value: unknown, fieldName: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${fieldName} must be a positive number`);
  }
  return parsed;
}

export async function provisionTradingAccountForPurchase(
  purchase: PurchaseForProvisioning,
): Promise<ProvisioningResult> {
  if (!purchase?.id) throw new Error("Purchase id is required for provisioning");
  if (!purchase.user_id) throw new Error("Purchase user_id is required for provisioning");
  if (!purchase.program_key) throw new Error("Purchase program_key is required for provisioning");

  const existing = await supabaseAdmin
    .from("trading_accounts")
    .select("id, login, terminal_account_id, phase, status")
    .eq("purchase_id", purchase.id)
    .maybeSingle();

  if (existing.error) throw existing.error;
  if (existing.data) {
    return { created: false, account: existing.data };
  }

  const accountSize = toPositiveNumber(purchase.account_size, "account_size");

  const { data: program, error: programError } = await supabaseAdmin
    .from("tpp_programs")
    .select("*")
    .eq("key", purchase.program_key)
    .single();

  if (programError || !program) {
    throw new Error(`Program not found for ${purchase.program_key}`);
  }

  const lifecycle = getInitialAccountLifecycle(program);
  if (!lifecycle.ruleId) {
    throw new Error(`No initial trading rule configured for ${purchase.program_key}`);
  }

  const { data: rules, error: rulesError } = await supabaseAdmin
    .from("trading_rules")
    .select("*")
    .eq("id", lifecycle.ruleId)
    .single();

  if (rulesError || !rules) {
    throw new Error(`Trading rule not found for ${purchase.program_key}`);
  }

  const { data: platform, error: platformError } = await supabaseAdmin
    .from("tpp_platforms")
    .select("*")
    .eq("name", "TPP TERMINAL")
    .eq("is_active", true)
    .single();

  if (platformError || !platform) {
    throw new Error("Active TPP TERMINAL platform is not configured");
  }

  if (!platform.api_url || !platform.api_key) {
    throw new Error("TPP TERMINAL platform API URL/key is missing");
  }

  const crmAccountId = randomUUID();
  const label = `TPP $${accountSize.toLocaleString()} ${lifecycle.label}`;

  const terminalResult = await createTradingAccount({
    apiUrl: platform.api_url,
    apiKey: platform.api_key,
    userEmail: purchase.email || "user@example.com",
    userId: purchase.user_id,
    accountSize,
    rules,
    programKey: purchase.program_key,
    phase: lifecycle.terminalPhase,
    status: lifecycle.terminalStatus,
    label,
    businessAccountId: crmAccountId,
  });

  if (!terminalResult.success) {
    throw new Error(terminalResult.error || "Terminal account creation failed");
  }

  const accountLogin = terminalResult.login;
  const { data: account, error: accountError } = await supabaseAdmin
    .from("trading_accounts")
    .insert({
      id: crmAccountId,
      purchase_id: purchase.id,
      user_id: purchase.user_id,
      platform_id: platform.id,
      rule_id: rules.id,
      account_number: accountLogin,
      login: accountLogin,
      password: terminalResult.password || "auto-generated",
      terminal_account_id: terminalResult.terminalAccountId || null,
      program_key: purchase.program_key,
      phase_group_id: crmAccountId,
      phase_index: lifecycle.phaseIndex,
      balance: accountSize,
      starting_balance: accountSize,
      equity: accountSize,
      highest_equity: accountSize,
      current_daily_drawdown: 0,
      current_max_drawdown: 0,
      status: "active",
      phase: lifecycle.phase,
    })
    .select("id, login, terminal_account_id, phase, status")
    .single();

  if (accountError) {
    if (accountError.code === "23505") {
      const { data: retryExisting, error: retryError } = await supabaseAdmin
        .from("trading_accounts")
        .select("id, login, terminal_account_id, phase, status")
        .eq("purchase_id", purchase.id)
        .maybeSingle();

      if (retryError) throw retryError;
      if (retryExisting) return { created: false, account: retryExisting };
    }

    throw accountError;
  }

  if (terminalResult.terminalAccountId) {
    await supabaseAdmin
      .from("accounts")
      .update({ business_account_id: crmAccountId })
      .eq("id", terminalResult.terminalAccountId);
  }

  return { created: true, account };
}
