"use client";

import { BarChart3, Globe, Grid3x3, Zap } from "lucide-react";
import ForexHeatmapWidget from "@/components/tradingview/ForexHeatmapWidget";
import { Button, Container, Lede, Section, Title } from "../ui";
import { Reveal, Stagger, StaggerItem } from "../motion";
import { PageHero } from "../page-hero";
import { Cta } from "../cta";
import { href } from "../routes";

const FEATURES = [
  { icon: Globe, title: "Forex pairs", body: "Major, minor, and exotic currency pairs — all in one comprehensive view." },
  { icon: Zap, title: "Real-time data", body: "Live market data with instant updates so you never miss a move." },
  { icon: BarChart3, title: "Visual analysis", body: "Color-coded performance lets you spot opportunities at a glance." },
];

/** The TradingView widget, framed as a glass terminal window. */
function Terminal() {
  return (
    <Section id="heatmap" shell={false} className="scroll-mt-24 pt-10 pb-28 sm:pb-36">
      <Container>
        <Reveal>
          <div className="g-glass-ink g-hair overflow-hidden rounded-[30px]">
            <div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-3.5">
              <span className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-white/15" />
                <span className="h-3 w-3 rounded-full bg-white/15" />
                <span className="h-3 w-3 rounded-full bg-white/15" />
              </span>
              <span className="text-[13px] font-medium text-white/70">Forex heatmap</span>
              <span className="ml-auto inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-1 text-[12px] text-white/65">
                <span className="relative grid h-2 w-2 place-items-center">
                  <span className="absolute h-2 w-2 animate-ping rounded-full bg-[var(--g-lime)]/60" />
                  <span className="relative h-2 w-2 rounded-full bg-[var(--g-lime)]" />
                </span>
                Live via TradingView
              </span>
            </div>
            <div className="h-[520px] bg-[#0f0f0f] p-2 sm:h-[640px]">
              <ForexHeatmapWidget />
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}

function Features() {
  return (
    <section className="g-light relative isolate z-10 -mt-12 overflow-clip rounded-t-[44px] pt-24 pb-40 sm:rounded-t-[56px] sm:pt-32 sm:pb-48">
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <Title tone="light" className="text-[clamp(2.2rem,4.4vw,3.8rem)]" lead="Everything you need" fade="in one view." />
          </Reveal>
          <Reveal delay={0.08} className="flex justify-center">
            <Lede tone="light" className="mt-6 text-center">
              Our heatmap gives you a real-time, bird&apos;s-eye view of the entire forex market.
            </Lede>
          </Reveal>
        </div>
        <Stagger className="mt-14 grid gap-4 md:grid-cols-3" gap={0.08}>
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <StaggerItem key={title}>
              <div className="g-card-paper g-hair g-hair-ink h-full rounded-[26px] p-7">
                <span className="grid h-12 w-12 place-items-center rounded-[16px] bg-[var(--g-ink)] text-[var(--g-lime)]">
                  <Icon className="h-5 w-5" strokeWidth={1.9} />
                </span>
                <h3 className="mt-6 text-[19px] font-semibold tracking-[-0.02em] text-[var(--g-ink)]">{title}</h3>
                <p className="mt-2 text-[14.5px] leading-relaxed text-[var(--g-muted-ink)]">{body}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </section>
  );
}

export function HeatmapPage() {
  return (
    <>
      <PageHero
        art="/art/page-heatmap.webp"
        crumb="Heatmap"
        eyebrow="Market overview"
        icon={Grid3x3}
        lead="Forex"
        fade="heatmap."
        lede="Track real-time currency strength and identify major market movers at a glance."
      >
        <div className="flex flex-wrap gap-3">
          <Button href="#heatmap">Open the heatmap</Button>
          <Button href={href("challenges")} kind="glass" arrow={false}>
            Trade it funded
          </Button>
        </div>
      </PageHero>
      <Terminal />
      <Features />
      <Cta />
    </>
  );
}
