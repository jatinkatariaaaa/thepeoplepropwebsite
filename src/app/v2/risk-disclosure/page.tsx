import type { Metadata } from "next";
import { preload } from "react-dom";
import { LegalPage } from "@/components/v2/glass/pages/legal-page";

export const metadata: Metadata = {
  title: "Risk disclosure",
  description: "The risks of trading and of using The People Prop services.",
};

export default function Page() {
  preload("/v2/pt/page-risk-disclosure.webp", { as: "image", fetchPriority: "high" });
  return <LegalPage doc="risk-disclosure" />;
}
