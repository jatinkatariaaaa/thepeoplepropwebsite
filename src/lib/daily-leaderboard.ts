import "server-only";
import { supabaseAdmin } from "@/lib/supabase";

export async function getDailyLeaderboard() {
  const { data, error } = await supabaseAdmin.rpc("daily_realized_leaderboard");
  if (error) {
    console.error("Could not load the daily leaderboard", error.code);
    return { entries: [], unavailable: true };
  }

  const rows = (data ?? []) as { rank: number; profit: number; trade_count: number; win_rate: number }[];
  const entries = rows.map((row) => ({
    rank: Number(row.rank),
    profit: Number(row.profit),
    trades: Number(row.trade_count),
    winRate: Number(row.win_rate),
  }));
  return { entries, unavailable: false };
}
