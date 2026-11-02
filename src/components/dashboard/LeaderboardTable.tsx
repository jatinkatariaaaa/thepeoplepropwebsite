import { Trophy } from "lucide-react";
import { getDailyLeaderboard } from "@/lib/daily-leaderboard";
import { cn } from "@/lib/utils";
import { Panel, PanelHead, table } from "./glass";

export async function LeaderboardTable() {
  const rawLeaderboardData = getDailyLeaderboard(20);

  // Map to format that matches the existing UI structure
  const leaderboardData = rawLeaderboardData.map((row) => ({
    ...row,
    profitStr: `+$${Number(row.profit).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
    profitPercentStr: `+${Number(row.profit_percent).toFixed(2)}%`,
    winRatioStr: `${Number(row.win_ratio).toFixed(1)}%`,
    avgWinStr: `$${Number(row.avg_win).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
    avgLossStr: `-$${Number(row.avg_loss).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`,
  }));

  return (
    <Panel className="overflow-hidden">
      <PanelHead title="Global Rankings" icon={Trophy} />

      <div className={table.scroll}>
        <table className="w-full text-left whitespace-nowrap">
          <thead>
            <tr className={table.headRow}>
              <th className={table.th}>Rank</th>
              <th className={table.th}>Trader</th>
              <th className={table.th}>Country</th>
              <th className={table.th}>Account Size</th>
              <th className={table.th}>Profit</th>
              <th className={table.th}>Profit %</th>
              <th className={table.th}>Win Ratio</th>
              <th className={table.th}>Pair</th>
              <th className={table.th}>Avg. Win</th>
              <th className={table.th}>Avg. Loss</th>
              <th className={table.th}>Avg. Duration</th>
              <th className={table.th}>Trades</th>
              <th className={cn(table.th, "text-center")}>Losing Streak</th>
            </tr>
          </thead>
          <tbody className="text-[13.5px] font-medium text-[var(--g-ink)]">
            {leaderboardData.map((row) => (
              <tr key={row.rank} className={table.row}>
                <td className={table.td}>
                  <div className="flex items-center gap-2">
                    {row.rank === 1 && (
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-[var(--g-lime)] shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
                        <span className="text-xs font-bold text-[var(--g-ink)]">#1</span>
                      </div>
                    )}
                    {row.rank === 2 && (
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-[linear-gradient(160deg,#ffffff_0%,#c9d1ce_100%)] ring-1 ring-black/10">
                        <span className="text-xs font-bold text-[var(--g-ink)]">#2</span>
                      </div>
                    )}
                    {row.rank === 3 && (
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-[linear-gradient(160deg,#f6e7d8_0%,#c99c73_100%)] ring-1 ring-black/10">
                        <span className="text-xs font-bold text-[#4a2f17]">#3</span>
                      </div>
                    )}
                    {row.rank > 3 && (
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-black/[0.04] ring-1 ring-black/[0.06]">
                        <span className="g-num text-xs text-[var(--g-muted-ink)]">{row.rank}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className={table.td}>{row.trader}</td>
                <td className={cn(table.td, "text-xl")}>{row.country}</td>
                <td className={table.td}>
                  <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[12px] font-semibold text-[var(--g-ink)] ring-1 ring-black/[0.06]">
                    {row.account_size}
                  </span>
                </td>
                <td className={table.td}>
                  <span className="g-num rounded-full bg-[var(--g-emerald)]/10 px-2.5 py-1 font-semibold text-[var(--g-emerald)]">
                    {row.profitStr}
                  </span>
                </td>
                <td className={cn(table.td, "g-num font-semibold text-[var(--g-emerald)]")}>{row.profitPercentStr}</td>
                <td className={table.td}>
                  <div className="flex items-center gap-2">
                    <div className="flex h-4 w-1.5 flex-col justify-end overflow-hidden rounded-full bg-black/[0.08]">
                      <div
                        className="w-full rounded-full bg-[var(--g-emerald)]"
                        style={{ height: row.winRatioStr }}
                      />
                    </div>
                    <span className="g-num">{row.winRatioStr}</span>
                  </div>
                </td>
                <td className={table.td}>
                  <span className="rounded-full bg-black/[0.04] px-2.5 py-1 text-[12px] font-semibold text-[var(--g-ink)] ring-1 ring-black/[0.06]">
                    {row.pair}
                  </span>
                </td>
                <td className={cn(table.td, "g-num text-[var(--g-emerald)]")}>{row.avgWinStr}</td>
                <td className={cn(table.td, "g-num text-red-600")}>{row.avgLossStr}</td>
                <td className={cn(table.td, "text-[var(--g-muted-ink)]")}>{row.duration}</td>
                <td className={cn(table.td, "g-num")}>{row.trades}</td>
                <td className={cn(table.td, "g-num text-center font-semibold text-red-600")}>{row.losing_streak}</td>
              </tr>
            ))}
            {leaderboardData.length === 0 && (
              <tr>
                <td colSpan={13} className="px-6 py-8 text-center text-[var(--g-muted-ink)] italic">
                  Leaderboard is currently being updated. Check back soon.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
