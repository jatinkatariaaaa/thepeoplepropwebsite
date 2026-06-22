import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAdminUser, logAudit } from "@/lib/admin-auth";
import { generateAccountNumber } from "@/lib/trading";

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

    return NextResponse.json({ accounts: data || [] });
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
// Create / issue a new trading account.
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

    // Retry a few times in case of an account_number collision.
    let created: any = null;
    let lastError: any = null;
    for (let attempt = 0; attempt < 5; attempt++) {
      const accountNumber = generateAccountNumber();
      const insertPayload: Record<string, any> = {
        account_number: accountNumber,
        login: accountNumber,
        user_id,
        platform_id,
        rule_id: rule_id || null,
        leverage: leverage ? Number(leverage) : 100,
        phase: phase || "phase_1",
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
        created = data;
        break;
      }
      // 23505 = unique violation -> retry with a new number.
      if (error.code !== "23505") {
        lastError = error;
        break;
      }
      lastError = error;
    }

    if (!created) {
      throw lastError || new Error("Failed to create account");
    }

    await logAudit({
      adminId: admin.user.id,
      adminEmail: admin.email,
      action: "create_trading_account",
      entityType: "trading_accounts",
      entityId: created.id,
      newValue: created,
      request,
    });

    return NextResponse.json({ success: true, account: created });
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
