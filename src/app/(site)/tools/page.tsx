import type { Metadata } from "next";
import { preload } from "react-dom";
import { ToolsPage } from "@/components/v2/glass/pages/tools-page";

export const metadata: Metadata = {
  title: "Trading tools",
  description: "Free position size calculator and loss-limit planner for prop traders, using the same contract sizes and limits as TPP Terminal.",
};

export default function Page() {
  preload("/art/page-heatmap.webp", { as: "image", fetchPriority: "high" });
  return <ToolsPage />;
}
