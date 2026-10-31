import type { Metadata } from "next";
import { preload } from "react-dom";
import { LegalPage } from "@/components/v2/glass/pages/legal-page";

export const metadata: Metadata = {
  title: "Privacy policy",
  description: "How The People Prop collects, uses and protects your personal information.",
};

export default function Page() {
  preload("/art/page-privacy.webp", { as: "image", fetchPriority: "high" });
  return <LegalPage doc="privacy" />;
}
