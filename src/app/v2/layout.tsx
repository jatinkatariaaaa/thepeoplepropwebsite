import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The People Prop — Funded Prop Trading Firm | Up to $500K",
  description:
    "The home of traders. 100% profit split, 150% fee refund, 12h payouts, zero consistency rules. Start your challenge today.",
};

export default function V2Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div
      className={`v2-scope ${bricolage.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
    >
      {children}
    </div>
  );
}
