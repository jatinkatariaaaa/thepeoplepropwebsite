const fs = require('fs');

const heatmapContent = `import type { Metadata } from "next";
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
      
      {/* 1. Hero wrapped in Black card */}
      <section className="pt-24 lg:pt-32 px-[5px] pb-[5px]">
        <div className="rounded-2xl bg-[#0c0c0c] text-white py-16 md:py-24 px-6 md:px-10 relative overflow-hidden">
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "64px 64px", maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)" }} />
          
          <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-4 py-2 mb-8 text-[13px] font-medium text-white/80">Market Overview</span>
            <h1 className="text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[0.95] tracking-[-0.03em] text-white mb-6">
              Forex <span className="font-serif italic text-[#0c0c0c] px-2 bg-[#cbfb45] rounded-xl rotate-1 inline-block">Heatmap</span>.
            </h1>
            <p className="max-w-2xl text-[15px] leading-relaxed text-white/60">
              Track real-time currency strength and identify major market movers at a glance.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Heatmap Widget in Creme card */}
      <section className="px-[5px] pb-[5px]">
        <div className="rounded-2xl bg-[#f1eade] border border-[#0c0c0c]/10 py-8 md:py-16 px-4 md:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="w-full h-[600px] md:h-[800px] overflow-hidden rounded-2xl shadow-sm border border-[#0c0c0c]/10">
              <ForexHeatmapWidget />
            </div>
          </div>
        </div>
      </section>

      <V3Footer />
    </div>
  );
}`;

fs.writeFileSync('src/app/heatmap/page.tsx', heatmapContent, 'utf8');
console.log('Heatmap page rewritten');
