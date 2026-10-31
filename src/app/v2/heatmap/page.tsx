import type { Metadata } from "next";
import { preload } from "react-dom";
import { HeatmapPage } from "@/components/v2/glass/pages/heatmap-page";

export const metadata: Metadata = {
  title: "Forex heatmap",
  description: "A live forex heatmap: currency strength and the biggest market movers at a glance.",
};

export default function Page() {
  preload("/v2/pt/page-heatmap.webp", { as: "image", fetchPriority: "high" });
  return <HeatmapPage />;
}
