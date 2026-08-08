import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The People Prop — Trade Institutional Capital. Keep the Upside.",
  description:
    "Funded accounts up to $500,000. 100% profit split, 150% fee refund, 12-hour payouts and zero consistency rules. Built by traders, for traders.",
};

export const viewport = {
  themeColor: "#04060b",
};

export default function V2Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="v2-scope min-h-screen overflow-x-clip bg-background font-sans text-foreground antialiased">
      {children}
    </div>
  );
}
