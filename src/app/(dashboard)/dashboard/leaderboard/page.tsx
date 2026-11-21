import { DailyRankings } from "@/components/v2/glass/pages/leaderboard-page";
import { PageTitle } from "@/components/dashboard/glass";

export default function LeaderboardPage() {
  return (
    <div className="mx-auto max-w-7xl">
      <PageTitle lead="Daily" fade="leaderboard" lede="Realized net profit on funded simulation accounts." />
      <DailyRankings />
    </div>
  );
}
