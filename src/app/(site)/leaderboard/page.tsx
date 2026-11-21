import type { Metadata } from "next";
import { preload } from "react-dom";
import { LeaderboardPage } from "@/components/v2/glass/pages/leaderboard-page";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "The daily TPP leaderboard, ranked by realized profit and reset every day at 00:00 UTC.",
};

export default function Page() {
  preload("/art/page-leaderboard.webp", { as: "image", fetchPriority: "high" });
  return <LeaderboardPage />;
}
