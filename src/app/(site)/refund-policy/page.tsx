import type { Metadata } from "next";
import { preload } from "react-dom";
import { LegalPage } from "@/components/v2/glass/pages/legal-page";

export const metadata: Metadata = {
  title: "Refund policy",
  description: "When a fee can be returned and how the evaluation-fee refund works.",
};

export default function Page() {
  preload("/art/page-terms.webp", { as: "image", fetchPriority: "high" });
  return <LegalPage doc="refund-policy" />;
}
