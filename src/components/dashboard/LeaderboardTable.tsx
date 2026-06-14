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
    <div className="bg-white rounded-[24px] border border-[var(--border)] overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-[var(--border)]">
        <Trophy className="w-5 h-5 text-[var(--accent-600)]" />
        <h2 className="text-[18px] font-display font-bold text-[var(--ink-950)]">Global Rankings</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="bg-[var(--paper-2)]/50 text-[11px] font-bold text-[var(--ink-500)] tracking-wider uppercase border-b border-[var(--border)]">
              <th className="px-6 py-4 font-bold">Rank</th>
              <th className="px-6 py-4 font-bold">Trader</th>
              <th className="px-6 py-4 font-bold">Country</th>
              <th className="px-6 py-4 font-bold">Account Size</th>
              <th className="px-6 py-4 font-bold">Profit</th>
              <th className="px-6 py-4 font-bold">Profit %</th>
              <th className="px-6 py-4 font-bold">Win Ratio</th>
              <th className="px-6 py-4 font-bold">Pair</th>
              <th className="px-6 py-4 font-bold">Avg. Win</th>
              <th className="px-6 py-4 font-bold">Avg. Loss</th>
              <th className="px-6 py-4 font-bold">Avg. Duration</th>
              <th className="px-6 py-4 font-bold">Trades</th>
              <th className="px-6 py-4 font-bold text-center">Losing Streak</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)] text-[13.5px] font-medium text-[var(--ink-950)]">
            {leaderboardData.map((row) => (
              <tr key={row.rank} className="hover:bg-[var(--paper-2)]/50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {row.rank === 1 && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-500 flex items-center justify-center shadow-sm">
                        <span className="text-yellow-900 font-bold text-xs">#1</span>
                      </div>
                    )}
                    {row.rank === 2 && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 flex items-center justify-center shadow-sm">
                        <span className="text-slate-800 font-bold text-xs">#2</span>
                      </div>
                    )}
                    {row.rank === 3 && (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-200 to-orange-400 flex items-center justify-center shadow-sm">
                        <span className="text-orange-900 font-bold text-xs">#3</span>
                      </div>
                    )}
                    {row.rank > 3 && (
                      <div className="w-8 h-8 rounded-full bg-[var(--paper-2)] border border-[var(--border)] flex items-center justify-center">
                        <span className="text-[var(--ink-500)] text-xs">{row.rank}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">{row.trader}</td>
                <td className="px-6 py-4 text-xl">{row.country}</td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-md bg-[var(--ink-100)] text-[var(--ink-700)] font-bold text-[12px]">
                    {row.account_size}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 font-bold">
                    {row.profitStr}
                  </span>
                </td>
                <td className="px-6 py-4 text-emerald-600 font-bold">{row.profitPercentStr}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-4 rounded-full bg-[var(--border)] overflow-hidden flex flex-col justify-end">
                      <div 
                        className="w-full bg-emerald-500 rounded-full" 
                        style={{ height: row.winRatioStr }}
                      />
                    </div>
                    {row.winRatioStr}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-md bg-[var(--ink-100)] text-[12px] font-bold text-[var(--ink-700)]">
                    {row.pair}
                  </span>
                </td>
                <td className="px-6 py-4 text-emerald-600">{row.avgWinStr}</td>
                <td className="px-6 py-4 text-rose-600">{row.avgLossStr}</td>
                <td className="px-6 py-4 text-[var(--ink-600)]">{row.duration}</td>
                <td className="px-6 py-4">{row.trades}</td>
                <td className="px-6 py-4 text-center text-rose-600 font-bold">{row.losing_streak}</td>
              </tr>
            ))}
            {leaderboardData.length === 0 && (
              <tr>
                <td colSpan={13} className="px-6 py-8 text-center text-[var(--ink-500)] italic">
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
