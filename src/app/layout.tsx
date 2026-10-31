import type { Metadata } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "./glass.css";
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

const TITLE = "The People Prop — Fund your skills. Trade our capital.";
const DESCRIPTION =
  "Transparent rules, raw 0.0 pip spreads, no time limit and payouts processed in under 24 hours. Choose a 1-Step, 2-Step, 3-Step, Instant or Access account and trade with The People Prop.";

export const metadata: Metadata = {
  title: {
    default: TITLE,
    template: "%s · The People Prop",
  },
  description: DESCRIPTION,
  keywords: [
    "prop firm",
    "proprietary trading",
    "funded trader",
    "trading challenge",
    "forex prop firm",
    "TPP",
  ],
  icons: {
    icon: "/images/logo.webp",
    apple: "/images/logo.webp",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    siteName: "The People Prop",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${serif.variable} ${mono.variable}`}
      suppressHydrationWarning
    >
      <body className="flex flex-col text-ink antialiased">
        <SmoothScroll>
          <div className="flex-1">{children}</div>
        </SmoothScroll>
      </body>
    </html>
  );
}
