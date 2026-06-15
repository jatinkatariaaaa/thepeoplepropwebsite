import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { ChromeGate } from "@/components/layout/ChromeGate";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE, organizationSchema, websiteSchema } from "@/lib/seo";

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
  metadataBase: new URL(SITE.url),
  title: {
    default: "The People Prop — Trade Our Capital. Keep the Profits.",
    template: "%s | The People Prop",
  },
  description:
    "TPP is a next-generation prop trading firm. Pass a single fair evaluation, get funded up to $200,000, and keep up to 90% of your profits with bi-weekly payouts.",
  applicationName: SITE.name,
  keywords: [
    "prop firm",
    "proprietary trading firm",
    "funded trader program",
    "trading challenge",
    "forex prop firm",
    "funded forex account",
    "prop trading",
    "The People Prop",
    "TPP",
  ],
  authors: [{ name: SITE.name, url: SITE.url }],
  creator: SITE.name,
  publisher: SITE.name,
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: "The People Prop — Trade Our Capital. Keep the Profits.",
    description:
      "Funded accounts up to $200,000 with up to 90% profit splits and bi-weekly payouts. Pass one fair evaluation and get funded.",
    url: "/",
    locale: SITE.locale,
    images: [{ url: SITE.ogImage, width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: "The People Prop — Trade Our Capital. Keep the Profits.",
    description:
      "Funded accounts up to $200,000 with up to 90% profit splits and bi-weekly payouts.",
    site: SITE.twitter,
    creator: SITE.twitter,
    images: [SITE.ogImage],
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  manifest: "/manifest.webmanifest",
  category: "finance",
};

export const viewport: Viewport = {
  themeColor: "#0c0c0c",
  colorScheme: "dark light",
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
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
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
