import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: accountId } = await params;

    // Fetch the terminal_account_id from CRM db
    const { data: crmAccount, error: accError } = await supabaseAdmin
      .from("trading_accounts")
      .select("terminal_account_id, starting_balance")
      .eq("id", accountId)
      .single();

    if (accError || !crmAccount || !crmAccount.terminal_account_id) {
      return NextResponse.json({ error: "Account not found or not linked to terminal" }, { status: 404 });
    }

    // Fetch trades from the Terminal DB (which shares the same Supabase project)
    const { data: trades, error: tradesError } = await supabaseAdmin
      .from("trades")
      .select("*")
      .eq("account_id", crmAccount.terminal_account_id)
      .order("close_time", { ascending: true });

    if (tradesError) {
      return NextResponse.json({ error: "Failed to fetch trades" }, { status: 500 });
    }

    if (!trades || trades.length === 0) {
      return NextResponse.json({
        totalTrades: 0,
        winRate: 0,
        profitFactor: 0,
        averageWin: 0,
        averageLoss: 0,
        biggestWin: 0,
        biggestLoss: 0,
        dailyPnL: [],
        equityCurve: [{ time: "Start", equity: Number(crmAccount.starting_balance) }]
      });
    }

    let grossWins = 0;
    let grossLosses = 0;
    let totalWins = 0;
    let totalLosses = 0;
    let biggestWin = 0;
    let biggestLoss = 0;
    
    // For equity curve and calendar
    let currentEquity = Number(crmAccount.starting_balance);
    const equityCurve = [{ time: "Start", equity: currentEquity }];
    const pnlByDate: Record<string, number> = {};

    trades.forEach((trade) => {
      const net = Number(trade.net_pnl);
      const dateStr = new Date(trade.close_time).toISOString().split('T')[0];

      if (!pnlByDate[dateStr]) pnlByDate[dateStr] = 0;
      pnlByDate[dateStr] += net;

      currentEquity += net;
      equityCurve.push({ time: new Date(trade.close_time).toLocaleString(), equity: currentEquity });

      if (net > 0) {
        grossWins += net;
        totalWins++;
        if (net > biggestWin) biggestWin = net;
      } else if (net < 0) {
        grossLosses += Math.abs(net);
        totalLosses++;
        if (net < biggestLoss) biggestLoss = net;
      }
    });

    const totalTrades = trades.length;
    const winRate = totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0;
    const profitFactor = grossLosses > 0 ? (grossWins / grossLosses) : (grossWins > 0 ? grossWins : 0);
    const averageWin = totalWins > 0 ? grossWins / totalWins : 0;
    const averageLoss = totalLosses > 0 ? grossLosses / totalLosses : 0;

    // Convert daily PnL map to array
    const dailyPnL = Object.keys(pnlByDate).map(date => ({
      date,
      pnl: pnlByDate[date]
    })).sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      totalTrades,
      winRate,
      profitFactor,
      averageWin,
      averageLoss,
      biggestWin,
      biggestLoss,
      dailyPnL,
      equityCurve
    });

  } catch (error: any) {
    console.error("Account metrics error:", error.message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
