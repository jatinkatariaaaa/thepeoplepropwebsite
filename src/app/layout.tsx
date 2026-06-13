import type { Metadata } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { ChromeGate } from "@/components/layout/ChromeGate";
import { SmoothScroll } from "@/components/layout/SmoothScroll";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

const serif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "The People Prop — Trade Our Capital. Keep the Profits.",
  description:
    "TPP is a next-generation prop trading firm. Pass a single fair evaluation, get funded up to $200,000, and keep up to 90% of your profits. Guaranteed free evaluation Prizes on 1 August 2026.",
  keywords: [
    "prop firm",
    "proprietary trading",
    "funded trader",
    "trading challenge",
    "forex prop firm",
    "TPP",
  ],
  openGraph: {
    title: "The People Prop — Trade Our Capital. Keep the Profits.",
    description:
      "Funded accounts up to $200,000 with 90% profit splits and bi-weekly payouts. Guaranteed free evaluation Prizes on 1 August 2026.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${serif.variable} ${mono.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col text-ink antialiased">
        <SmoothScroll>
          <ChromeGate>
            <Navbar />
          </ChromeGate>
          <main className="flex-1">{children}</main>
        </SmoothScroll>
      </body>
    </html>
  );
}