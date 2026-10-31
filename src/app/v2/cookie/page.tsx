import type { Metadata } from "next";
import { preload } from "react-dom";
import { LegalPage } from "@/components/v2/glass/pages/legal-page";

export const metadata: Metadata = {
  title: "Cookie policy",
  description: "How The People Prop uses cookies and similar technologies.",
};

export default function Page() {
  preload("/v2/pt/page-cookie.webp", { as: "image", fetchPriority: "high" });
  return <LegalPage doc="cookie" />;
}
