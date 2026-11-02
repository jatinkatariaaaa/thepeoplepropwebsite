import { Info } from "lucide-react";
import { LeaderboardHighlights } from "@/components/dashboard/LeaderboardHighlights";
import { LeaderboardTable } from "@/components/dashboard/LeaderboardTable";
import { PageTitle } from "@/components/dashboard/glass";

// Re-render at most every hour so the leaderboard picks up the new
// daily data shortly after the UTC date changes.
export const revalidate = 3600;

export default function LeaderboardPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageTitle lead="Hall of" fade="Fame" lede="Top performing traders from our global community.">
        {/* The board comes from the date-seeded generator in src/lib/daily-leaderboard.ts, so say so, as the public leaderboard does. */}
        <p className="inline-flex items-center gap-2 rounded-full bg-white/60 px-3.5 py-1.5 text-[12.5px] text-[var(--g-muted-ink)] ring-1 ring-black/[0.07]">
          <Info className="h-3.5 w-3.5 shrink-0 text-[var(--g-emerald)]" />
          Sample rankings — live account data is not connected yet
        </p>
      </PageTitle>

      <LeaderboardHighlights />
      <LeaderboardTable />
    </div>
  );
}
