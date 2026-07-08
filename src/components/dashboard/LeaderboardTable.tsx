import { Trophy } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase";

export async function LeaderboardTable() {
  const { data: rawLeaderboardData, error } = await supabaseAdmin
    .from("leaderboard")
    .select("*")
    .order("profit", { ascending: false });

  // Map to format that matches the existing UI structure
  const leaderboardData = (rawLeaderboardData || []).map((row, idx) => ({
    ...row,
    rank: idx + 1,
    profitStr: `+$${Number(row.profit).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
    profitPercentStr: `+${Number(row.profit_percent).toFixed(2)}%`,
    winRatioStr: `${Number(row.win_ratio).toFixed(1)}%`,
    avgWinStr: `$${Number(row.avg_win).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
    avgLossStr: `-$${Number(row.avg_loss).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
  }));

  return (
    <div className="dash-card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-[var(--dash-hairline)] px-4 py-3.5 sm:px-5">
        <Trophy className="h-4 w-4 text-ink-400" aria-hidden="true" />
        <h2 className="text-[15px] font-semibold tracking-tight text-ink">Global Rankings</h2>
      </div>
      
      <div className="dash-scroll-x">
        <table className="dash-table whitespace-nowrap">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Trader</th>
              <th>Country</th>
              <th>Account Size</th>
              <th>Profit</th>
              <th>Profit %</th>
              <th>Win Ratio</th>
              <th>Pair</th>
              <th>Avg. Win</th>
              <th>Avg. Loss</th>
              <th>Avg. Duration</th>
              <th>Trades</th>
              <th className="text-center">Losing Streak</th>
            </tr>
          </thead>
          <tbody>
            {leaderboardData.map((row) => (
              <tr key={row.rank} className="group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {row.rank <= 3 ? (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-ink-950">
                        <span className="dash-num text-[10px] font-semibold text-white">{row.rank}</span>
                      </div>
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--dash-hairline)] bg-ink-50">
                        <span className="dash-num text-[10px] text-ink-500">{row.rank}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="font-medium text-ink">{row.trader}</td>
                <td className="text-base">{row.country}</td>
                <td className="px-6 py-4">
                  <span className="dash-num rounded border border-[var(--dash-hairline)] bg-ink-50 px-1.5 py-0.5 text-[11px] font-medium text-ink-700">
                    {row.account_size}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="dash-num font-semibold text-[var(--dash-positive)]">
                    {row.profitStr}
                  </span>
                </td>
                <td className="dash-num font-medium text-[var(--dash-positive)]">{row.profitPercentStr}</td>
                <td className="px-6 py-4">
                  <div className="dash-num flex items-center gap-2">
                    <div className="flex h-4 w-1 flex-col justify-end overflow-hidden rounded-full bg-ink-100">
                      <div 
                        className="w-full rounded-full bg-[var(--dash-positive)]" 
                        style={{ height: row.winRatioStr }}
                      />
                    </div>
                    {row.winRatioStr}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="dash-num rounded border border-[var(--dash-hairline)] bg-ink-50 px-1.5 py-0.5 text-[11px] font-medium text-ink-700">
                    {row.pair}
                  </span>
                </td>
                <td className="dash-num text-[var(--dash-positive)]">{row.avgWinStr}</td>
                <td className="dash-num text-[var(--dash-negative)]">{row.avgLossStr}</td>
                <td className="text-ink-600">{row.duration}</td>
                <td className="dash-num">{row.trades}</td>
                <td className="dash-num text-center font-medium text-[var(--dash-negative)]">{row.losing_streak}</td>
              </tr>
            ))}
            {leaderboardData.length === 0 && (
              <tr>
                <td colSpan={13} className="py-10 text-center text-[13px] text-ink-500">
                  Leaderboard is currently being updated. Check back soon.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
