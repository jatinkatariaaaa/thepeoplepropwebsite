import type { ReactNode } from "react";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, breadcrumbSchema } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Live Forex Heatmap",
  description:
    "Track real-time currency strength with The People Prop live forex heatmap. Spot the strongest and weakest major currencies at a glance.",
  path: "/heatmap",
  keywords: ["forex heatmap", "currency strength meter", "live forex strength"],
});

export default function HeatmapLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Heatmap", path: "/heatmap" },
        ])}
      />
      {children}
    </>
  );
}
