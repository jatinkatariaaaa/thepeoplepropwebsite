import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  buildMetadata,
  breadcrumbSchema,
  productSchema,
} from "@/lib/seo";
import { challenges } from "@/data/challenges";

export const metadata = buildMetadata({
  title: "Funded Trading Challenges & Pricing",
  description:
    "Choose your evaluation: from a $5,000 starter to a $200,000 funded account. One fair challenge, up to 90% profit split, and a fee refund on your first payout. Fees from $49.",
  path: "/challenges",
  keywords: [
    "funded trading challenge",
    "prop firm challenge",
    "buy funded account",
    "trading evaluation",
    "forex prop challenge pricing",
  ],
});

export default function ChallengesLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Challenges", path: "/challenges" },
          ]),
          ...challenges.map((c) => productSchema(c)),
        ]}
      />
      {children}
    </>
  );
}
