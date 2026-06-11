import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const maxDuration = 60; // Max execution time 60 seconds
export const dynamic = "force-dynamic"; // Do not cache this route

export async function GET(request: Request) {
  // 1. Verify Vercel Cron Secret (optional but recommended for security)
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    // 2. Fetch all active/funded accounts
    const { data: accounts, error: accountsError } = await supabaseAdmin
      .from("accounts")
      .select("*")
      .in("status", ["active", "funded"]);

    if (accountsError || !accounts) throw accountsError;

    // 3. Fetch all open positions for these accounts
    const accountIds = accounts.map(a => a.id);
    if (accountIds.length === 0) {
      return NextResponse.json({ success: true, message: "No active accounts found" });
    }

    const { data: positions, error: positionsError } = await supabaseAdmin
      .from("positions")
      .select("*")
      .in("account_id", accountIds);

    if (positionsError || !positions) throw positionsError;

    if (positions.length === 0) {
      // We still need to call apply_risk_tick to update highest_equity and daily rollovers
      // even if there are no open positions, because balance could be the highest equity.
      for (const account of accounts) {
        await supabaseAdmin.rpc("apply_risk_tick", {
          p_account_id: account.id,
          p_equity: account.balance
        });
      }
      return NextResponse.json({ success: true, message: "No open positions. Updated equity high watermarks." });
    }

    // 4. Collect unique symbols and fetch live prices from Binance
    const uniqueSymbols = Array.from(new Set(positions.map(p => p.symbol)));
    const prices: Record<string, number> = {};

    // For multiple symbols, Binance allows an array of symbols: ["BTCUSDT", "ETHUSDT"]
    const symbolsParam = JSON.stringify(uniqueSymbols);
    const binanceRes = await fetch(`https://api.binance.com/api/v3/ticker/price?symbols=${encodeURIComponent(symbolsParam)}`);
    
    if (!binanceRes.ok) {
      throw new Error(`Binance API error: ${binanceRes.statusText}`);
    }
    
    const priceData = await binanceRes.json();
    for (const item of priceData) {
      prices[item.symbol] = parseFloat(item.price);
    }

    // 5. Evaluate risk for each account
    let breachCount = 0;

    for (const account of accounts) {
      const accountPositions = positions.filter(p => p.account_id === account.id);
      
      let totalFloatingPnl = 0;
      
      // Calculate floating PnL
      for (const p of accountPositions) {
        const currentPrice = prices[p.symbol];
        if (!currentPrice) continue; // Skip if price feed is down for this symbol

        const mult = p.direction === "long" ? 1 : -1;
        // PnL formula matching the terminal risk engine
        const pnlUsd = (currentPrice - p.open_price) * p.volume * p.contract_size * mult;
        totalFloatingPnl += pnlUsd;
      }

      const currentEquity = account.balance + totalFloatingPnl;
      
      const dailyDrawdownPct = account.max_daily_drawdown;
      const maxDrawdownPct = account.max_overall_drawdown;
      
      const dailyFloor = account.daily_start_balance * (1 - dailyDrawdownPct);
      const overallFloor = account.starting_balance * (1 - maxDrawdownPct);

      const isBreached = currentEquity <= dailyFloor || currentEquity <= overallFloor;

      if (isBreached) {
        // Step 1: Force close all open positions
        for (const p of accountPositions) {
          const currentPrice = prices[p.symbol] || p.open_price;
          const mult = p.direction === "long" ? 1 : -1;
          const grossPnl = (currentPrice - p.open_price) * p.volume * p.contract_size * mult;

          await supabaseAdmin.rpc("close_position", {
            p_position_id: p.id,
            p_exit_fill: currentPrice,
            p_gross_pnl: grossPnl,
            p_commission: p.commission,
            p_reason: "breach"
          });
        }
        
        // Step 2: Apply risk tick (this will freeze the account and log the event)
        await supabaseAdmin.rpc("apply_risk_tick", {
          p_account_id: account.id,
          p_equity: currentEquity
        });

        breachCount++;
      } else {
        // Update highest equity and handle daily rollover if not breached
        await supabaseAdmin.rpc("apply_risk_tick", {
          p_account_id: account.id,
          p_equity: currentEquity
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Processed ${accounts.length} accounts. Breached ${breachCount} accounts.` 
    });

  } catch (error: any) {
    console.error("Cron breach check error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
