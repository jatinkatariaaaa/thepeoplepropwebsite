import type { Viewport } from "next";
import { SiteShell } from "@/components/v2/glass/shell";

export const viewport: Viewport = {
  themeColor: "#0e1110",
};

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <SiteShell>{children}</SiteShell>;
}
