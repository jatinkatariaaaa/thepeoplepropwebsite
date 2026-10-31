import { LeaderboardHighlights } from "@/components/dashboard/LeaderboardHighlights";
import { LeaderboardTable } from "@/components/dashboard/LeaderboardTable";

// Re-render at most every hour so the leaderboard picks up the new
// daily data shortly after the UTC date changes.
export const revalidate = 3600;

export default function LeaderboardPage() {
  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-[var(--ink-950)] tracking-tight">
          Hall of Fame
        </h1>
        <p className="text-[14px] text-[var(--ink-500)] mt-1 font-medium">
          Top performing traders from our global community.
        </p>
      </div>
      
      <LeaderboardHighlights />
      <LeaderboardTable />
    </div>
  );
}
