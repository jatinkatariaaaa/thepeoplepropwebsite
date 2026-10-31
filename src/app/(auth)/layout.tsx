import type { Metadata, Viewport } from "next";
import { V2DataProvider } from "@/components/v2/glass/data";

export const metadata: Metadata = {
  title: "Log in",
};

export const viewport: Viewport = {
  themeColor: "#0e1110",
};

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <V2DataProvider>{children}</V2DataProvider>;
}
