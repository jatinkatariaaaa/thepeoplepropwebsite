import type { Metadata } from "next";
import { preload } from "react-dom";
import { RulesPage } from "@/components/v2/glass/pages/rules-page";

export const metadata: Metadata = {
  title: "Trading rules",
  description: "The full TPP rulebook: profit target, daily and maximum loss, consistency, news trading, weekend holding, scaling and refunds.",
};

export default function Page() {
  preload("/v2/pt/page-rules.webp", { as: "image", fetchPriority: "high" });
  return <RulesPage />;
}
