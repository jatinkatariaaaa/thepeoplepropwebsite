import type { Metadata } from "next";
import { preload } from "react-dom";
import { FaqsPage } from "@/components/v2/glass/pages/faqs-page";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to the questions traders ask most about The People Prop: challenges, rules, payouts and platforms.",
};

export default function Page() {
  preload("/v2/pt/page-faqs.webp", { as: "image", fetchPriority: "high" });
  return <FaqsPage />;
}
