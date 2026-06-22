import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    // 1. Verify Authorization Header (Mocked basic auth or Bearer token)
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // In a real scenario, validate against the platform's configured API Key or a generic webhook secret
    const token = authHeader.split(" ")[1];
    if (token !== process.env.WEBHOOK_SECRET && token !== "MOCK_WEBHOOK_SECRET") {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const payload = await request.json();
    const { action, external_id, account_number, data } = payload;
    
    if (!action || !account_number) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. Find the Trading Account
    const { data: account, error: accountError } = await supabaseAdmin
      .from("trading_accounts")
      .select("id, status, balance, equity")
      .eq("account_number", account_number)
      .single();

    if (accountError || !account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // 3. Handle specific webhook actions
    switch (action) {
      case "BALANCE_UPDATE":
        // Update account metrics
        await supabaseAdmin
          .from("trading_accounts")
          .update({
            balance: data.balance,
            equity: data.equity,
            current_daily_drawdown: data.daily_drawdown || 0,
            current_max_drawdown: data.max_drawdown || 0,
            highest_equity: Math.max(account.equity, data.equity),
            updated_at: new Date().toISOString()
          })
          .eq("id", account.id);
        break;

      case "RULE_BREACH":
        // Mark account as breached and create an alert
        await supabaseAdmin
          .from("trading_accounts")
          .update({
            status: "breached",
            updated_at: new Date().toISOString()
          })
          .eq("id", account.id);

        await supabaseAdmin
          .from("trading_alerts")
          .insert({
            account_id: account.id,
            type: "rule_violation",
            message: `Account breached: ${data.reason || 'Drawdown limit reached'}`
          });
        break;
        
      case "DRAWDOWN_WARNING":
        await supabaseAdmin
          .from("trading_alerts")
          .insert({
            account_id: account.id,
            type: "drawdown_warning",
            message: `Drawdown warning: Equity has dropped significantly to $${data.equity}`
          });
        break;

      default:
        return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
