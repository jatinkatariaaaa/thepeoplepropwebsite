import { Trophy } from "lucide-react";

const leaderboardData = [
  {
    rank: 1,
    trader: "Alex M.",
    country: "🇺🇸",
    accountSize: "$200,000",
    profit: "+$42,150.00",
    profitPercent: "+21.07%",
    winRatio: "68.4%",
    pair: "NAS100",
    avgWin: "$3,450.20",
    avgLoss: "-$1,200.50",
    duration: "4h 12m",
    trades: 45,
    losingStreak: 2,
  },
  {
    rank: 2,
    trader: "Sofia R.",
    country: "🇪🇸",
    accountSize: "$100,000",
    profit: "+$28,430.15",
    profitPercent: "+28.43%",
    winRatio: "74.1%",
    pair: "XAUUSD",
    avgWin: "$2,100.80",
    avgLoss: "-$850.30",
    duration: "1h 45m",
    trades: 62,
    losingStreak: 3,
  },
  {
    rank: 3,
    trader: "James T.",
    country: "🇬🇧",
    accountSize: "$200,000",
    profit: "+$24,600.75",
    profitPercent: "+12.30%",
    winRatio: "55.2%",
    pair: "US30",
    avgWin: "$4,800.00",
    avgLoss: "-$2,100.00",
    duration: "6h 30m",
    trades: 28,
    losingStreak: 4,
  },
  {
    rank: 4,
    trader: "Arjun K.",
    country: "🇮🇳",
    accountSize: "$50,000",
    profit: "+$15,840.50",
    profitPercent: "+31.68%",
    winRatio: "82.5%",
    pair: "GBPUSD",
    avgWin: "$950.40",
    avgLoss: "-$300.20",
    duration: "45m",
    trades: 85,
    losingStreak: 1,
  },
  {
    rank: 5,
    trader: "Omar F.",
    country: "🇦🇪",
    accountSize: "$100,000",
    profit: "+$14,200.00",
    profitPercent: "+14.20%",
    winRatio: "61.0%",
    pair: "XAUUSD",
    avgWin: "$1,850.00",
    avgLoss: "-$1,100.00",
    duration: "2h 15m",
    trades: 41,
    losingStreak: 3,
  },
  {
    rank: 6,
    trader: "Liam P.",
    country: "🇦🇺",
    accountSize: "$200,000",
    profit: "+$13,500.25",
    profitPercent: "+6.75%",
    winRatio: "48.5%",
    pair: "AUDUSD",
    avgWin: "$2,600.00",
    avgLoss: "-$1,500.00",
    duration: "5h 10m",
    trades: 52,
    losingStreak: 5,
  },
  {
    rank: 7,
    trader: "Nina K.",
    country: "🇩🇪",
    accountSize: "$25,000",
    profit: "+$11,250.80",
    profitPercent: "+45.00%",
    winRatio: "78.2%",
    pair: "GER40",
    avgWin: "$840.50",
    avgLoss: "-$210.00",
    duration: "35m",
    trades: 94,
    losingStreak: 2,
  },
  {
    rank: 8,
    trader: "Chen W.",
    country: "🇸🇬",
    accountSize: "$100,000",
    profit: "+$9,800.00",
    profitPercent: "+9.80%",
    winRatio: "59.4%",
    pair: "USDJPY",
    avgWin: "$1,200.00",
    avgLoss: "-$650.00",
    duration: "1h 50m",
    trades: 37,
    losingStreak: 3,
  },
  {
    rank: 9,
    trader: "Thabo M.",
    country: "🇿🇦",
    accountSize: "$50,000",
    profit: "+$8,450.40",
    profitPercent: "+16.90%",
    winRatio: "65.8%",
    pair: "XAUUSD",
    avgWin: "$920.00",
    avgLoss: "-$480.00",
    duration: "3h 20m",
    trades: 48,
    losingStreak: 4,
  },
  {
    rank: 10,
    trader: "Emily S.",
    country: "🇨🇦",
    accountSize: "$200,000",
    profit: "+$7,900.00",
    profitPercent: "+3.95%",
    winRatio: "42.1%",
    pair: "USDCAD",
    avgWin: "$3,100.00",
    avgLoss: "-$1,800.00",
    duration: "8h 45m",
    trades: 19,
    losingStreak: 6,
  }
];

export function LeaderboardTable() {
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
                    {row.accountSize}
                  </span>
                </td>
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
