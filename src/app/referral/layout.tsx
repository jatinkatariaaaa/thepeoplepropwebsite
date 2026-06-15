import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbSchema } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Affiliate & Referral Program",
  description:
    "Earn with The People Prop. Refer traders, grow our community, and unlock guaranteed evaluations and commissions through our affiliate program.",
  path: "/referral",
  keywords: [
    "prop firm affiliate program",
    "trading referral program",
    "The People Prop affiliate",
  ],
});

export default function ReferralLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Affiliate", path: "/referral" },
        ])}
      />
      {children}
    </>
  );
}
