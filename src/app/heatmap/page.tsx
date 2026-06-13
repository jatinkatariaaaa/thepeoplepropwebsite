import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import ForexHeatmapWidget from "@/components/tradingview/ForexHeatmapWidget";
import { V3Navbar } from "@/components/layout/V3Navbar";
import { V3Footer } from "@/components/layout/V3Footer";

export const metadata: Metadata = {
  title: "Forex Heatmap — The People Prop",
  description: "Live Forex Heatmap. Track real-time currency strength and market movers.",
};

export default function HeatmapPage() {
  return (
    <div className="v3-page min-h-screen bg-[#f1eade] text-[#0c0c0c] antialiased">
      <V3Navbar />
      <div className="pt-24 lg:pt-32 pb-16">
      <PageHero
        eyebrow="Market Overview"
        title={
          <>
            Forex <span className="font-serif italic text-[#cbfb45] px-2 bg-[#0c0c0c] rounded-xl rotate-1 inline-block">Heatmap</span>.
          </>
        }
        description="Track real-time currency strength and identify major market movers at a glance."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Heatmap", href: "/heatmap" },
        ]}
      />

      <section className="relative py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="glass-strong rounded-3xl p-4 md:p-8 border border-white/60 shadow-[0_32px_64px_rgba(10,37,64,0.08)]">
            <div className="w-full h-[600px] md:h-[800px] overflow-hidden rounded-2xl">
              <ForexHeatmapWidget />
            </div>
          </div>
        </div>
      </section>
      </div>
      <V3Footer />
    </div>
  );
}
