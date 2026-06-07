import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import ForexHeatmapWidget from "@/components/tradingview/ForexHeatmapWidget";

export const metadata: Metadata = {
  title: "Forex Heatmap — The People Prop",
  description: "Live Forex Heatmap. Track real-time currency strength and market movers.",
};

export default function HeatmapPage() {
  return (
    <>
      <PageHero
        eyebrow="Market Overview"
        title={
          <>
            Forex <span className="word-serif">Heatmap</span>.
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
    </>
  );
}
