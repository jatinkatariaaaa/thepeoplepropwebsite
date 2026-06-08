import { Trophy, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

const leaderboardData = [
  {
    rank: 1,
    trader: "Yevhen C",
    country: "🇺🇦",
    profit: "+$33,417.56",
    profitPercent: "+16.71%",
    winRatio: "22.2%",
    pair: "XAUUSD",
    avgWin: "$18,513.53",
    avgLoss: "-$515.64",
    duration: "7h 6m",
    trades: 9,
    losingStreak: 6,
  },
  {
    rank: 2,
    trader: "Lazar I",
    country: "🇩🇪",
    profit: "+$18,652.22",
    profitPercent: "+9.33%",
    winRatio: "72.7%",
    pair: "GER40",
    avgWin: "$1,762.89",
    avgLoss: "-$1,592.33",
    duration: "1h 29m",
    trades: 22,
    losingStreak: 3,
  },
  {
    rank: 3,
    trader: "Varun P",
    country: "🇮🇳",
    profit: "+$18,246.71",
    profitPercent: "+9.12%",
    winRatio: "56.3%",
    pair: "NDX100",
    avgWin: "$987.87",
    avgLoss: "-$620.75",
    duration: "43m",
    trades: 32,
    losingStreak: 5,
  },
  {
    rank: 4,
    trader: "Mohamad Hatem S",
    country: "🇱🇧",
    profit: "+$15,472.30",
    profitPercent: "+7.74%",
    winRatio: "39.1%",
    pair: "XAUUSD",
    avgWin: "$1,425.24",
    avgLoss: "-$622.38",
    duration: "25m",
    trades: 87,
    losingStreak: 13,
  },
  {
    rank: 5,
    trader: "Marvin M",
    country: "🇩🇪",
    profit: "+$13,594.05",
    profitPercent: "+6.80%",
    winRatio: "75.0%",
    pair: "XAUUSD",
    avgWin: "$4,979.75",
    avgLoss: "-$1,345.20",
    duration: "5h 28m",
    trades: 4,
    losingStreak: 1,
  }
];

export function LeaderboardTable() {
  return (
    <div className="bg-white rounded-[24px] border border-[var(--border)] overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-[var(--border)]">
        <Trophy className="w-5 h-5 text-[var(--accent-600)]" />
        <h2 className="text-[18px] font-display font-bold text-[var(--ink-950)]">Leaderboard</h2>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className="bg-[var(--paper-2)]/50 text-[11px] font-bold text-[var(--ink-500)] tracking-wider uppercase border-b border-[var(--border)]">
              <th className="px-6 py-4 font-bold">Rank</th>
              <th className="px-6 py-4 font-bold">Trader</th>
              <th className="px-6 py-4 font-bold">Country</th>
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
                  <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 font-bold">
                    {row.profit}
                  </span>
                </td>
                <td className="px-6 py-4 text-emerald-600 font-bold">{row.profitPercent}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-4 rounded-full bg-[var(--border)] overflow-hidden flex flex-col justify-end">
                      <div 
                        className="w-full bg-emerald-500 rounded-full" 
                        style={{ height: row.winRatio }}
                      />
                    </div>
                    {row.winRatio}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 rounded-md bg-[var(--ink-100)] text-[12px] font-bold text-[var(--ink-700)]">
                    {row.pair}
                  </span>
                </td>
                <td className="px-6 py-4 text-emerald-600">{row.avgWin}</td>
                <td className="px-6 py-4 text-rose-600">{row.avgLoss}</td>
                <td className="px-6 py-4 text-[var(--ink-600)]">{row.duration}</td>
                <td className="px-6 py-4">{row.trades}</td>
                <td className="px-6 py-4 text-center text-rose-600 font-bold">{row.losingStreak}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
