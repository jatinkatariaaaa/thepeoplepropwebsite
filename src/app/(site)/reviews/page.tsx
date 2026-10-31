import type { Metadata } from "next";
import { preload } from "react-dom";
import { ReviewsPage } from "@/components/v2/glass/pages/reviews-page";

export const metadata: Metadata = {
  title: "Reviews",
  description: "What funded traders say about The People Prop: payouts, rules and support, in their own words.",
};

export default function Page() {
  preload("/art/page-reviews.webp", { as: "image", fetchPriority: "high" });
  return <ReviewsPage />;
}
