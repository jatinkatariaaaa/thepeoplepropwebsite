import type { Metadata } from "next";
import { preload } from "react-dom";
import { StatusPage } from "@/components/v2/glass/pages/status-page";

export const metadata: Metadata = {
  title: "System status",
  description: "Live checks of the services you use with The People Prop: sign-in, trader data and crypto checkout, refreshed every minute.",
};

export default function Page() {
  preload("/art/page-status.webp", { as: "image", fetchPriority: "high" });
  return <StatusPage />;
}
