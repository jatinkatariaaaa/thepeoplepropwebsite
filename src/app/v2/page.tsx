import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { ChallengeCalculator } from "@/components/landing/ChallengeCalculator";
import { NavV2 } from "@/components/landing-v2/NavV2";
import { HeroV2 } from "@/components/landing-v2/HeroV2";
import { PromoBannerV2 } from "@/components/landing-v2/PromoBannerV2";
import { FeatureGridV2 } from "@/components/landing-v2/FeatureGridV2";
import { DashboardShowcaseV2 } from "@/components/landing-v2/DashboardShowcaseV2";
import { PlatformsV2 } from "@/components/landing-v2/PlatformsV2";
import { SupportV2 } from "@/components/landing-v2/SupportV2";
import { FaqV2 } from "@/components/landing-v2/FaqV2";
import { FinalCtaV2 } from "@/components/landing-v2/FinalCtaV2";

export const metadata: Metadata = {
  title: "The People Prop — The Home of Traders | V2",
  description:
    "Trade our capital up to $200,000. Transparent rules, up to 90% profit split, and payouts in under 24 hours. The home of real traders.",
};

/* ═══════════════════════════════════════════════════════════════
   V2 Landing Page — Meridian-style visual system on TPP branding.

   Section order mirrors meridian-funded.com:
   1. Floating pill nav (logo pill + nav pill with CTA)
   2. Full-bleed city hero → headline on dark navy tiles
   3. Overlapping stat cards + blue limited-offer promo strip
   4. Numbered feature list with hairline dividers
   5. "Choose your challenge" configurator
   6. Blue dashboard showcase band
   7. Available trading platforms
   8. 24/7 support + community split cards
   9. Split FAQ
   10. "Ready to start trading?" + city skyline band
   11. Footer

   Palette: royal blue #2e6bff · navy ink #0e1b33 · white ·
   light blue wash #f4f8ff.

   The original landing page at "/" is untouched — iterate here.
   ═══════════════════════════════════════════════════════════════ */
export default function LandingV2Page() {
  return (
    <div
      className="page-wrapper min-h-screen bg-white text-[#0e1b33] antialiased"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <NavV2 />
      <HeroV2 />
      <PromoBannerV2 />
      <FeatureGridV2 />

      {/* Challenge configurator */}
      <section className="mx-auto max-w-[1320px] px-4 pb-20 pt-4 lg:pb-28">
        <div className="mb-12 text-center">
          <h2
            className="text-balance font-bold tracking-[-0.02em] text-[#0e1b33]"
            style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)", lineHeight: 1.05 }}
          >
            Choose your <span className="text-[#2e6bff]">challenge</span>
          </h2>
          <p className="mx-auto mt-4 max-w-[460px] text-pretty text-[15px] leading-relaxed text-[#475467]">
            Pick a program, account size and platform — see every rule upfront
            before you pay.
          </p>
        </div>
        <ChallengeCalculator />
      </section>

      <DashboardShowcaseV2 />
      <PlatformsV2 />
      <SupportV2 />
      <FaqV2 />
      <FinalCtaV2 />
      <Footer />
    </div>
  );
}
