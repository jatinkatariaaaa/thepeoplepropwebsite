import type { Metadata } from "next";
import { preload } from "react-dom";
import { ContestPage } from "@/components/v2/glass/pages/contest-page";

export const metadata: Metadata = {
  title: "Contest",
  description: "Invite 10 friends to The People Prop and get a free 10K 3-Step evaluation account.",
};

export default function Page() {
  preload("/v2/pt/page-contest.webp", { as: "image", fetchPriority: "high" });
  return <ContestPage />;
}
