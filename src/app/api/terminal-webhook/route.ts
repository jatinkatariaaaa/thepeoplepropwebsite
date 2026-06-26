import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createTradingAccount, disableTradingAccount } from "@/lib/terminal-api";
import {
  getNextAccountLifecycle,
  normalizePhase,
  type CrmPhase,
} from "@/lib/program-lifecycle";

type WebhookStatus = "active" | "passed" | "breached";

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function bearerToken(req: Request) {
  const header = req.headers.get("authorization");
  return header?.replace(/^Bearer\s+/i, "").trim() || "";
}

async function findAccount(login: string) {
  const select = "*, trading_rules(*), tpp_platforms(*)";

  if (isUuid(login)) {
    const byTerminalId = await supabaseAdmin
      .from("trading_accounts")
      .select(select)
      .eq("terminal_account_id", login)
      .maybeSingle();

    if (byTerminalId.error) throw byTerminalId.error;
    if (byTerminalId.data) return byTerminalId.data;
  }

  const byLogin = await supabaseAdmin
    .from("trading_accounts")
    .select(select)
    .eq("login", login)
    .maybeSingle();

  if (byLogin.error) throw byLogin.error;
  return byLogin.data;
}

async function promoteIfNeeded(account: any, startingBalance: number) {
  if (!account.program_key) {
    return { created: false, reason: "missing_program_key" };
  }

  const currentPhase = normalizePhase(account.phase);
  const { data: program, error: programError } = await supabaseAdmin
    .from("tpp_programs")
    .select("*")
    .eq("key", account.program_key)
    .single();

  if (programError || !program) {
    return { created: false, reason: "program_not_found" };
  }

  const nextLifecycle = getNextAccountLifecycle(program, currentPhase, account.rule_id || null);
  if (!nextLifecycle) {
    return { created: false, reason: "no_next_phase" };
  }

  const { data: existingNext, error: existingError } = await supabaseAdmin
    .from("trading_accounts")
    .select("id, login, terminal_account_id, phase, status")
    .eq("previous_account_id", account.id)
    .eq("phase", nextLifecycle.phase)
    .maybeSingle();

  if (existingError) throw existingError;
  if (existingNext) {
    return { created: false, existing: existingNext };
  }

  if (!nextLifecycle.ruleId) {
    return { created: false, reason: `missing_rule_for_${nextLifecycle.phase}` };
  }

  const { data: nextRules, error: rulesError } = await supabaseAdmin
    .from("trading_rules")
    .select("*")
    .eq("id", nextLifecycle.ruleId)
    .single();

  if (rulesError || !nextRules) {
    return { created: false, reason: "rules_not_found" };
  }

  const platform = account.tpp_platforms;
  if (!platform?.api_url || !platform?.api_key) {
    return { created: false, reason: "platform_api_missing" };
  }

  if (!account.user_id) {
    return { created: false, reason: "missing_user_id" };
  }

  const { data: userResult } = await supabaseAdmin.auth.admin.getUserById(account.user_id);
  const crmAccountId = randomUUID();
  const label = `TPP $${Number(startingBalance).toLocaleString()} ${nextLifecycle.label}`;

  const terminalResult = await createTradingAccount({
    apiUrl: platform.api_url,
    apiKey: platform.api_key,
    userEmail: userResult?.user?.email || "user@example.com",
    userId: account.user_id,
    accountSize: startingBalance,
    rules: nextRules,
    programKey: account.program_key,
    phase: nextLifecycle.terminalPhase,
    status: nextLifecycle.terminalStatus,
    label,
    businessAccountId: crmAccountId,
  });

  if (!terminalResult.success) {
    return { created: false, reason: terminalResult.error || "terminal_create_failed" };
  }

  const { error: insertError } = await supabaseAdmin.from("trading_accounts").insert({
    id: crmAccountId,
    user_id: account.user_id,
    platform_id: platform.id,
    rule_id: nextRules.id,
    account_number: terminalResult.login,
    login: terminalResult.login,
    password: terminalResult.password || "auto-generated",
    terminal_account_id: terminalResult.terminalAccountId || null,
    program_key: account.program_key,
    previous_account_id: account.id,
    phase_group_id: account.phase_group_id || account.id,
    phase_index: nextLifecycle.phaseIndex,
    balance: startingBalance,
    starting_balance: startingBalance,
    equity: startingBalance,
    highest_equity: startingBalance,
    current_daily_drawdown: 0,
    current_max_drawdown: 0,
    status: "active",
    phase: nextLifecycle.phase,
  });

  if (insertError) {
    if (insertError.code === "23505") {
      const { data: retryExisting } = await supabaseAdmin
        .from("trading_accounts")
        .select("id, login, terminal_account_id, phase, status")
        .eq("previous_account_id", account.id)
        .eq("phase", nextLifecycle.phase)
        .maybeSingle();

      if (retryExisting) return { created: false, existing: retryExisting };
    }

    throw insertError;
  }

  if (terminalResult.terminalAccountId) {
    await supabaseAdmin
      .from("accounts")
      .update({ business_account_id: crmAccountId })
      .eq("id", terminalResult.terminalAccountId);
  }

  return {
    created: true,
    account: {
      id: crmAccountId,
      login: terminalResult.login,
      terminal_account_id: terminalResult.terminalAccountId || null,
      phase: nextLifecycle.phase,
      status: "active",
    },
  };
}

export async function POST(req: Request) {
  try {
    const webhookSecret = process.env.TERMINAL_WEBHOOK_SECRET || process.env.CRM_WEBHOOK_SECRET;
    if (webhookSecret && bearerToken(req) !== webhookSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const login = String(body.login || body.terminal_account_id || "");
    const balance = Number(body.current_balance);
    const equity = Number(body.current_equity);
    const webhookStatus = body.status as WebhookStatus | undefined;

    if (!login || !Number.isFinite(balance) || !Number.isFinite(equity)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const account = await findAccount(login);
    if (!account) {
      console.error("Webhook account not found for:", login);
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const isPassedRetry = webhookStatus === "passed" && account.status === "passed";
    if (account.status !== "active" && !isPassedRetry) {
      return NextResponse.json({ message: "Account is not active, ignoring update", status: account.status });
    }

    const rules = account.trading_rules;
    const startingBalance = Number(account.starting_balance);
    const dailyDrawdownPct = Number(rules?.max_daily_drawdown_pct) || 0;
    const overallDrawdownPct = Number(rules?.max_overall_drawdown_pct) || 0;
    const profitTargetPct = Number(rules?.profit_target_pct) || 0;
    const dailyBreachLevel = dailyDrawdownPct > 0 ? startingBalance - startingBalance * (dailyDrawdownPct / 100) : -Infinity;
    const overallBreachLevel =
      overallDrawdownPct > 0 ? startingBalance - startingBalance * (overallDrawdownPct / 100) : -Infinity;
    const profitTargetLevel = profitTargetPct > 0 ? startingBalance + startingBalance * (profitTargetPct / 100) : Infinity;
    const newHighestEquity = Math.max(Number(account.highest_equity || startingBalance), equity);

    let newStatus: WebhookStatus = account.status === "passed" ? "passed" : "active";
    let breachReason = "";

    if (webhookStatus === "passed") {
      newStatus = "passed";
    } else if (webhookStatus === "breached") {
      newStatus = "breached";
      breachReason = body.reason || "Terminal risk worker reported breach";
    } else if (equity <= dailyBreachLevel) {
      newStatus = "breached";
      breachReason = `Daily Drawdown Limit Reached. Equity dropped below $${dailyBreachLevel}`;
    } else if (equity <= overallBreachLevel) {
      newStatus = "breached";
      breachReason = `Overall Drawdown Limit Reached. Equity dropped below $${overallBreachLevel}`;
    } else if (equity >= profitTargetLevel) {
      newStatus = "passed";
    }

    const updatePayload: Record<string, unknown> = {
      balance,
      equity,
      highest_equity: newHighestEquity,
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    if (newStatus === "passed" && !account.passed_at) {
      updatePayload.passed_at = new Date().toISOString();
    }

    const { error: updateError } = await supabaseAdmin
      .from("trading_accounts")
      .update(updatePayload)
      .eq("id", account.id);

    if (updateError) throw updateError;

    if (newStatus === "breached") {
      const platform = account.tpp_platforms;
      if (platform?.api_url && platform?.api_key) {
        disableTradingAccount(platform.api_url, platform.api_key, login, breachReason)
          .catch((err) => console.error("Failed to disable account via webhook:", err));
      }
    }

    const promotion = newStatus === "passed" ? await promoteIfNeeded(account, startingBalance) : null;

    return NextResponse.json({
      success: true,
      status: newStatus,
      reason: breachReason,
      current_equity: equity,
      daily_breach_level: dailyBreachLevel,
      overall_breach_level: overallBreachLevel,
      promotion,
    });
  } catch (error: any) {
    console.error("Webhook processing error:", error.message);
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
  }
}
