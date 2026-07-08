import { LeaderboardHighlights } from "@/components/dashboard/LeaderboardHighlights";
import { LeaderboardTable } from "@/components/dashboard/LeaderboardTable";

export default function LeaderboardPage() {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
      <div className="mb-6">
        <p className="dash-overline mb-1.5">Community</p>
        <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
          Leaderboard
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Top performing traders from our global community.
        </p>
      </div>
      
      <LeaderboardHighlights />
      <LeaderboardTable />
    </div>
  );
}
