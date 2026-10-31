import type { Metadata } from "next";
import { preload } from "react-dom";
import { LeaderboardPage } from "@/components/v2/glass/pages/leaderboard-page";

// the sample board is date-seeded: regenerate hourly so the HTML matches the day
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "The daily TPP leaderboard, ranked by realized profit and reset every day at 00:00 UTC.",
};

export default function Page() {
  preload("/v2/pt/page-leaderboard.webp", { as: "image", fetchPriority: "high" });
  return <LeaderboardPage />;
}
