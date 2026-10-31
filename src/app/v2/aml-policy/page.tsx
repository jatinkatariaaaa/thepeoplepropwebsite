import type { Metadata } from "next";
import { preload } from "react-dom";
import { LegalPage } from "@/components/v2/glass/pages/legal-page";

export const metadata: Metadata = {
  title: "AML policy",
  description: "The People Prop anti-money laundering and identity verification policy.",
};

export default function Page() {
  preload("/v2/pt/page-aml-policy.webp", { as: "image", fetchPriority: "high" });
  return <LegalPage doc="aml-policy" />;
}
