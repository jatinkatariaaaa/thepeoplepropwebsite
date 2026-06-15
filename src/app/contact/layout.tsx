import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbSchema } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Contact Us",
  description:
    "Get in touch with The People Prop. Reach our support team for help with evaluations, funded accounts, payouts, and partnerships.",
  path: "/contact",
  keywords: ["contact The People Prop", "prop firm support", "TPP contact"],
});

export default function ContactLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Contact", path: "/contact" },
        ])}
      />
      {children}
    </>
  );
}
