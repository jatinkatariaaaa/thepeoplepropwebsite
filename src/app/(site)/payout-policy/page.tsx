import type { Metadata } from "next";
import { preload } from "react-dom";
import { LegalPage } from "@/components/v2/glass/pages/legal-page";

export const metadata: Metadata = {
  title: "Payout policy",
  description: "When you can withdraw, how much you receive and how The People Prop pays traders.",
};

export default function Page() {
  preload("/art/page-terms.webp", { as: "image", fetchPriority: "high" });
  return <LegalPage doc="payout-policy" />;
}
