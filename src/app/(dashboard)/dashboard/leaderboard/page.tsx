import { LeaderboardHighlights } from "@/components/dashboard/LeaderboardHighlights";
import { LeaderboardTable } from "@/components/dashboard/LeaderboardTable";
import { PageTitle } from "@/components/dashboard/glass";

// Re-render at most every hour so the leaderboard picks up the new
// daily data shortly after the UTC date changes.
export const revalidate = 3600;

export default function LeaderboardPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageTitle lead="Hall of" fade="Fame" lede="Top performing traders from our global community." />

      <LeaderboardHighlights />
      <LeaderboardTable />
    </div>
  );
}
