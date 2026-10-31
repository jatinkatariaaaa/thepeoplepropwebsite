import type { Metadata, Viewport } from "next";
import { Header } from "@/components/v2/glass/header";
import { Footer } from "@/components/v2/glass/footer";
import { V2DataProvider } from "@/components/v2/glass/data";
import "./glass.css";

export const metadata: Metadata = {
  title: {
    default: "The People Prop — Fund your skills. Trade our capital.",
    template: "%s · The People Prop",
  },
  description:
    "Transparent rules, raw 0.0 pip spreads, no time limit and payouts processed in under 24 hours. Choose a 1-Step, 2-Step, 3-Step, Instant or Access account and trade with The People Prop.",
};

export const viewport: Viewport = {
  themeColor: "#0e1110",
};

/** One shell for every glass page: shared data, header and footer. */
export default function V2Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="v2-scope min-h-screen overflow-x-clip antialiased">
      <V2DataProvider>
        <Header />
        <div id="content">{children}</div>
        <Footer />
      </V2DataProvider>
    </div>
  );
}
