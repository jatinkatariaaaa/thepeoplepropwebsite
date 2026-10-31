import type { Metadata } from "next";
import { preload } from "react-dom";
import { HelpPage } from "@/components/v2/glass/pages/help-page";

export const metadata: Metadata = {
  title: "Help centre",
  description: "Search every answer The People Prop publishes, from the FAQ to the full rulebook, or reach the support team by email, Telegram or Discord.",
};

export default function Page() {
  preload("/art/page-help.webp", { as: "image", fetchPriority: "high" });
  return <HelpPage />;
}
