import type { Metadata } from "next";
import { preload } from "react-dom";
import { ChallengesPage } from "@/components/v2/glass/pages/challenges-page";

export const metadata: Metadata = {
  title: "Challenges",
  description: "Compare the 1-Step, 2-Step, 3-Step, Instant and Access programs: targets, loss limits, payout rhythm and the fee for every account size.",
};

export default function Page() {
  preload("/art/page-challenges.webp", { as: "image", fetchPriority: "high" });
  return <ChallengesPage />;
}
