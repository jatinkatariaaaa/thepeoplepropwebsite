"use client";

import {
  PageLayout,
  PageHero,
  PageSection,
  Reveal,
  GsapWords,
  LIME,
} from "@/components/layout";
import ForexHeatmapWidget from "@/components/tradingview/ForexHeatmapWidget";
import { Globe, Zap, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "Forex Pairs",
    description:
      "Major, minor, and exotic currency pairs — all in one comprehensive view.",
  },
  {
    icon: Zap,
    title: "Real-Time Data",
    description:
      "Live market data with instant updates so you never miss a move.",
  },
  {
    icon: BarChart3,
    title: "Visual Analysis",
    description:
      "Color-coded performance lets you spot opportunities at a glance.",
  },
];

export default function HeatmapPage() {
  return (
    <PageLayout>
      {/* ── Hero ── */}
      <PageHero
        eyebrow="Market Overview"
        title="Forex Heatmap"
        titleHighlight={["Heatmap"]}
        description="Track real-time currency strength and identify major market movers at a glance."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Heatmap", href: "/heatmap" },
        ]}
      />

      {/* ── Dark section — Heatmap Widget ── */}
      <PageSection variant="dark">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal>
            <div className="rounded-2xl overflow-hidden border border-white/[0.06] bg-[#1A2326]">
              <div className="w-full h-[600px] md:h-[800px]">
                <ForexHeatmapWidget />
              </div>
            </div>
          </Reveal>
        </div>
      </PageSection>

      {/* ── Cream section — Feature cards ── */}
      <PageSection variant="cream">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal>
            <div className="mb-12 text-center">
              <GsapWords
                text="Everything you need in one view"
                highlight={["need"]}
                className="font-bold tracking-[-0.03em] text-[#0c0c0c]"
                style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)" }}
              />
              <p className="mx-auto mt-4 max-w-xl text-[#6c6a68]">
                Our heatmap gives you a real-time, bird&apos;s-eye view of the
                entire forex market.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.1}>
                <div className="group rounded-2xl border border-[#0c0c0c]/10 bg-white/50 p-8 md:backdrop-blur-sm transition-shadow hover:shadow-lg">
                  {/* Icon */}
                  <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-[#0c0c0c]">
                    <f.icon className="h-5 w-5 text-[#cbfb45]" />
                  </div>

                  {/* Title */}
                  <h3 className="mb-2 text-lg font-bold tracking-[-0.02em] text-[#0c0c0c]">
                    {f.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[15px] leading-relaxed text-[#6c6a68]">
                    {f.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </PageSection>
    </PageLayout>
  );
}
