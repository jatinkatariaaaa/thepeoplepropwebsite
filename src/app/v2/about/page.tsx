import type { Metadata } from "next";
import { preload } from "react-dom";
import { AboutPage } from "@/components/v2/glass/pages/about-page";

export const metadata: Metadata = {
  title: "About us",
  description: "The People Prop is built by traders, for traders: published rules, fast payouts and real capital for real skill.",
};

export default function Page() {
  preload("/v2/pt/page-about.webp", { as: "image", fetchPriority: "high" });
  return <AboutPage />;
}
