import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { getAdminUser, logAudit } from "@/lib/admin-auth";
import { generateAccountNumber } from "@/lib/trading";

const PHASE_INDEX: Record<string, number> = {
  challenge: 1,
  verification: 2,
  phase_3: 3,
  funded: 99,
};

function pctToDecimal(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed / 100 : fallback;
}

// GET /api/admin/trading/accounts
// Returns all trading accounts (joined) for the admin list.
export async function GET(request: Request) {
  try {
    await getAdminUser(request);

    const { data, error } = await supabaseAdmin
      .from("trading_accounts")
      .select(
        `*, profiles (id, email, display_name), tpp_platforms (name), trading_rules (name)`
      )
      .order("created_at", { ascending: false });

    if (error) throw error;

    const terminalIds = (data || [])
      .map((account: any) => account.terminal_account_id)
      .filter(Boolean);

    let terminalById = new Map<string, any>();
    if (terminalIds.length > 0) {
      const { data: terminalAccounts, error: terminalError } = await supabaseAdmin
        .from("accounts")
        .select("id, balance, equity, highest_equity, status, phase, updated_at")
        .in("id", terminalIds);

      if (terminalError) throw terminalError;
      terminalById = new Map((terminalAccounts || []).map((terminal: any) => [terminal.id, terminal]));
    }

    const accounts = (data || []).map((account: any) => {
      const terminal = account.terminal_account_id ? terminalById.get(account.terminal_account_id) : null;
      if (!terminal) return account;

      return {
        ...account,
        balance: terminal.balance ?? account.balance,
        equity: terminal.equity ?? account.equity,
        highest_equity: terminal.highest_equity ?? account.highest_equity,
        terminal_status: terminal.status,
        terminal_updated_at: terminal.updated_at,
      };
    });

    return NextResponse.json({ accounts });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === "Unauthorized" ? 401 : 403 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/admin/trading/accounts
// Create / issue a new trading account and its terminal shadow account.
export async function POST(request: Request) {
  try {
    const admin = await getAdminUser(request);
    const body = await request.json();

    const {
      user_id,
      platform_id,
      rule_id,
      starting_balance,
      leverage,
      phase,
    } = body;

    if (!user_id || !platform_id || !starting_balance) {
      return NextResponse.json(
        { error: "Customer, platform and starting balance are required" },
        { status: 400 }
      );
    }

    const startBal = Number(starting_balance);
    if (!Number.isFinite(startBal) || startBal <= 0) {
      return NextResponse.json(
        { error: "Starting balance must be a positive number" },
        { status: 400 }
      );
    }

    const crmPhase = ["challenge", "verification", "phase_3", "funded"].includes(phase) ? phase : "challenge";
    const terminalPhase = crmPhase === "funded" ? "funded" : "challenge";
    const terminalStatus = crmPhase === "funded" ? "funded" : "active";

    // 1. Fetch trading rules to populate terminal account risk limits
    let maxDailyDrawdownPct = 0.05;
    let maxOverallDrawdownPct = 0.10;
    let profitTargetPct = terminalPhase === "funded" ? 0 : 0.08;
    
    if (rule_id) {
      const { data: ruleData } = await supabaseAdmin
        .from("trading_rules")
        .select("max_daily_drawdown_pct, max_overall_drawdown_pct, profit_target_pct")
        .eq("id", rule_id)
        .single();
        
      if (ruleData) {
        maxDailyDrawdownPct = pctToDecimal(ruleData.max_daily_drawdown_pct, 0.05);
        maxOverallDrawdownPct = pctToDecimal(ruleData.max_overall_drawdown_pct, 0.10);
        profitTargetPct = terminalPhase === "funded" ? 0 : pctToDecimal(ruleData.profit_target_pct, 0.08);
      }
    }

    // 2. Retry a few times in case of an account_number collision.
    let createdTradingAccount: any = null;
    let lastError: any = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      const crmAccountId = randomUUID();
      const accountNumber = generateAccountNumber();
      const insertPayload: Record<string, any> = {
        id: crmAccountId,
        account_number: accountNumber,
        login: accountNumber,
        password: Math.random().toString(36).slice(-8), // Temporary password
        user_id,
        platform_id,
        rule_id: rule_id || null,
        leverage: leverage ? Number(leverage) : 100,
        phase: crmPhase,
        phase_group_id: crmAccountId,
        phase_index: PHASE_INDEX[crmPhase],
        status: "active",
        balance: startBal,
        equity: startBal,
        starting_balance: startBal,
        highest_equity: startBal,
        current_daily_drawdown: 0,
        current_max_drawdown: 0,
      };

      const { data, error } = await supabaseAdmin
        .from("trading_accounts")
        .insert(insertPayload)
        .select("*")
        .single();

      if (!error) {
        createdTradingAccount = data;
        break;
      }
      // 23505 = unique violation -> retry with a new number.
      if (error.code !== "23505") {
        lastError = error;
        break;
      }
      lastError = error;
    }

    if (!createdTradingAccount) {
      throw lastError || new Error("Failed to create trading account");
    }

    // 3. Create the Terminal Shadow Account (accounts table)
    const { data: terminalAccount, error: terminalError } = await supabaseAdmin
      .from("accounts")
      .insert({
        user_id: user_id,
        label: `TPP ${createdTradingAccount.account_number}`,
        phase: terminalPhase,
        status: terminalStatus,
        starting_balance: startBal,
        balance: startBal,
        equity: startBal,
        daily_start_balance: startBal,
        highest_equity: startBal,
        max_daily_drawdown: maxDailyDrawdownPct,
        max_overall_drawdown: maxOverallDrawdownPct,
        profit_target: profitTargetPct,
        business_account_id: createdTradingAccount.id
      })
      .select()
      .single();

    if (terminalError) {
      console.error("Terminal account creation failed:", terminalError);
      // Even if this fails, we created the CRM account. We should ideally use a transaction,
      // but Supabase JS doesn't have local transactions. The trigger/sync might fail, but
      // the CRM account exists.
    } else if (terminalAccount) {
      // 4. Update the trading_accounts row with the terminal_account_id
      await supabaseAdmin
        .from("trading_accounts")
        .update({ terminal_account_id: terminalAccount.id })
        .eq("id", createdTradingAccount.id);
        
      createdTradingAccount.terminal_account_id = terminalAccount.id;
    }

    await logAudit({
      adminId: admin.user.id,
      adminEmail: admin.email,
      action: "create_trading_account",
      entityType: "trading_accounts",
      entityId: createdTradingAccount.id,
      newValue: createdTradingAccount,
      request,
    });

    return NextResponse.json({ success: true, account: createdTradingAccount });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === "Unauthorized" ? 401 : 403 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
