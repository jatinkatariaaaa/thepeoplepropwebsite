import type { Metadata } from "next";
import { preload } from "react-dom";
import { CareersPage } from "@/components/v2/glass/pages/careers-page";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join the remote-first team building The People Prop. Perks, culture and current openings.",
};

export default function Page() {
  preload("/v2/pt/page-careers.webp", { as: "image", fetchPriority: "high" });
  return <CareersPage />;
}
