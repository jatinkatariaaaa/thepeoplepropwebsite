import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { ChallengeCalculator } from "@/components/landing/ChallengeCalculator";
import { HeroV2 } from "@/components/landing-v2/HeroV2";
import { PromoBannerV2 } from "@/components/landing-v2/PromoBannerV2";
import { FeatureGridV2 } from "@/components/landing-v2/FeatureGridV2";
import { DashboardShowcaseV2 } from "@/components/landing-v2/DashboardShowcaseV2";
import { FaqV2 } from "@/components/landing-v2/FaqV2";
import { FinalCtaV2 } from "@/components/landing-v2/FinalCtaV2";

export const metadata: Metadata = {
  title: "The People Prop — The Home of Traders | V2",
  description:
    "Trade our capital up to $200,000. Transparent rules, up to 90% profit split, and payouts in under 24 hours. The home of real traders.",
};

/* ═══════════════════════════════════════════════════════════════
   V2 Landing Page — Meridian-inspired redesign on the TPP theme.

   Layout language borrowed from meridian-funded.com:
   • Full-bleed image hero with headline on dark tiles
   • Overlapping stat cards + limited-offer promo strip
   • Challenge configurator
   • Numbered feature grid with hairline dividers
   • Dark dashboard showcase band
   • Split FAQ + giant closing CTA with connector line

   Adapted to the TPP palette: cream #f1eade, ink #0c0c0c,
   lime #cbfb45 (with #9bc927 for lime-on-light text contrast).

   The original landing page at "/" is untouched — iterate here.
   ═══════════════════════════════════════════════════════════════ */
export default function LandingV2Page() {
  return (
    <div
      className="page-wrapper min-h-screen bg-[#f1eade] text-[#0c0c0c] antialiased"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      <HeroV2 />
      <PromoBannerV2 />

      {/* Challenge configurator */}
      <section className="mx-auto max-w-[1320px] px-4 pb-8 pt-20 lg:pt-28">
        <div className="mb-12 text-center">
          <h2
            className="text-balance font-bold tracking-[-0.03em] text-[#0c0c0c]"
            style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.05 }}
          >
            Choose your <span className="text-[#9bc927]">challenge</span>
          </h2>
          <p className="mx-auto mt-4 max-w-[460px] text-pretty text-[15px] leading-relaxed text-[#0c0c0c]/55">
            Pick a program, account size and platform — see every rule upfront
            before you pay.
          </p>
        </div>
        <ChallengeCalculator />
      </section>

      <FeatureGridV2 />
      <DashboardShowcaseV2 />
      <FaqV2 />
      <FinalCtaV2 />
      <Footer />
    </div>
  );
}
