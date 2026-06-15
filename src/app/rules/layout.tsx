import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbSchema } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Trading Rules & Evaluation Objectives",
  description:
    "The complete trading rules for The People Prop: 10% profit target, 4% daily and 8% maximum drawdown, minimum trading days, the consistency rule, and what is allowed.",
  path: "/rules",
  keywords: [
    "prop firm trading rules",
    "drawdown rules",
    "profit target",
    "consistency rule",
    "evaluation objectives",
  ],
});

export default function RulesLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Trading Rules", path: "/rules" },
        ])}
      />
      {children}
    </>
  );
}
