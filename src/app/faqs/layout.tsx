import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbSchema, faqSchema } from "@/lib/seo";
import { faq } from "@/data/faq";

export const metadata = buildMetadata({
  title: "Frequently Asked Questions",
  description:
    "Answers to common questions about The People Prop evaluations, drawdown rules, profit splits, payouts, platforms, and the scaling plan.",
  path: "/faqs",
  keywords: [
    "prop firm FAQ",
    "funded account questions",
    "The People Prop rules",
    "trading challenge FAQ",
  ],
});

export default function FaqsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "FAQ", path: "/faqs" },
          ]),
          faqSchema(faq),
        ]}
      />
      {children}
    </>
  );
}
