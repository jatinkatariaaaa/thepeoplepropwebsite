import type { Metadata } from "next";
import { preload } from "react-dom";
import { LegalPage } from "@/components/v2/glass/pages/legal-page";

export const metadata: Metadata = {
  title: "Terms of service",
  description: "The terms that govern your use of The People Prop.",
};

export default function Page() {
  preload("/v2/pt/page-terms.webp", { as: "image", fetchPriority: "high" });
  return <LegalPage doc="terms" />;
}
