import { SiteHeader } from "@/components/v2/site-header";
import { Hero } from "@/components/v2/hero";
import { Intro } from "@/components/v2/intro";
import { Stats } from "@/components/v2/stats";
import { ChallengeConfigurator } from "@/components/v2/challenge-configurator";
import { PromoBanner } from "@/components/v2/promo-banner";
import { WhyChoose } from "@/components/v2/why-choose";
import { MarketPosition } from "@/components/v2/market-position";
import { FeatureList } from "@/components/v2/feature-list";
import { DashboardShowcase } from "@/components/v2/dashboard-showcase";
import { Platforms } from "@/components/v2/platforms";
import { Community } from "@/components/v2/community";
import { Cta } from "@/components/v2/cta";
import { SiteFooter } from "@/components/v2/site-footer";
import { Reveal } from "@/components/v2/motion";

export default function V2Page() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* ── Original landing sections 1–4, redesigned for V2 ── */}
        <Hero />
        <Intro />
        <Stats />
        <ChallengeConfigurator />

        {/* ── Existing V2 sections ── */}
        <PromoBanner />
        <WhyChoose />
        <Reveal>
          <MarketPosition />
        </Reveal>
        <Reveal>
          <FeatureList />
        </Reveal>
        <DashboardShowcase />
        <Reveal>
          <Platforms />
        </Reveal>
        <Community />
        <Cta />
      </main>
      <SiteFooter />
    </>
  );
}
