import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { disableTradingAccount } from "@/lib/terminal-api";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { login, current_balance, current_equity } = body;

    if (!login || current_balance === undefined || current_equity === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 1. Fetch Account and Rules
    // The Terminal sends its own UUID as 'login', which maps to terminal_account_id in CRM
    const { data: account, error: accError } = await supabaseAdmin
      .from("trading_accounts")
      .select("*, trading_rules(*), tpp_platforms(*)")
      .or(`login.eq.${login},terminal_account_id.eq.${login}`)
      .single();

    if (accError || !account) {
      console.error("Webhook account not found for:", login);
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    if (account.status !== "active") {
      return NextResponse.json({ message: "Account is not active, ignoring update" });
    }

    const rules = account.trading_rules;
    if (!rules) {
      return NextResponse.json({ error: "Rules not found for account" }, { status: 500 });
    }

    // 2. Calculate Limits
    const startingBalance = Number(account.starting_balance);
    const equity = Number(current_equity);
    const balance = Number(current_balance);
    
    // Calculate breach levels
    const dailyDrawdownPct = Number(rules.max_daily_drawdown_pct) || 0;
    const overallDrawdownPct = Number(rules.max_overall_drawdown_pct) || 0;
    const profitTargetPct = Number(rules.profit_target_pct) || 0;

    // TODO: In a production system, daily breach level should use the highest equity of the day or midnight balance.
    // For this MVP, we will use the starting balance to calculate the strict daily limits.
    const dailyBreachLevel = startingBalance - (startingBalance * (dailyDrawdownPct / 100));
    const overallBreachLevel = startingBalance - (startingBalance * (overallDrawdownPct / 100));
    
    // Profit target level
    let profitTargetLevel = Infinity;
    if (profitTargetPct > 0) {
      profitTargetLevel = startingBalance + (startingBalance * (profitTargetPct / 100));
    }

    // Update highest equity tracking
    const newHighestEquity = Math.max(Number(account.highest_equity || startingBalance), equity);

    // 3. Rule Enforcement Logic
    let newStatus = "active";
    let breachReason = "";

    if (equity <= dailyBreachLevel) {
      newStatus = "breached";
      breachReason = `Daily Drawdown Limit Reached. Equity dropped below $${dailyBreachLevel}`;
    } else if (equity <= overallBreachLevel) {
      newStatus = "breached";
      breachReason = `Overall Drawdown Limit Reached. Equity dropped below $${overallBreachLevel}`;
    } else if (equity >= profitTargetLevel) {
      newStatus = "passed";
    }

    // 4. Update Database
    await supabaseAdmin
      .from("trading_accounts")
      .update({
        balance: balance,
        equity: equity,
        highest_equity: newHighestEquity,
        status: newStatus
      })
      .eq("id", account.id);

    // 5. Trigger Terminal Disablement if Breached
    if (newStatus === "breached") {
      const platform = account.tpp_platforms;
      if (platform && platform.api_url && platform.api_key) {
        // Run asynchronously so we don't block the webhook response
        disableTradingAccount(platform.api_url, platform.api_key, login, breachReason)
          .catch(err => console.error("Failed to disable account via webhook:", err));
      }
    }

    return NextResponse.json({
      success: true,
      status: newStatus,
      reason: breachReason,
      current_equity: equity,
      daily_breach_level: dailyBreachLevel,
      overall_breach_level: overallBreachLevel
    });

  } catch (error: any) {
    console.error("Webhook processing error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
