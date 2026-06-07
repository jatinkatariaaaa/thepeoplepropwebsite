import { Hero } from "@/components/landing/Hero";
import { CountdownBanner } from "@/components/landing/CountdownBanner";
import { ChallengeCalculator } from "@/components/landing/ChallengeCalculator";
import { FeaturedIn } from "@/components/landing/FeaturedIn";
import { CardStackSection } from "@/components/landing/CardStackSection";
import { Features } from "@/components/landing/Features";
import { WhyChooseUs } from "@/components/landing/WhyChooseUs";
import { EvaluationSteps } from "@/components/landing/EvaluationSteps";
import { PayoutSection } from "@/components/landing/PayoutSection";
import { ProfitCalculator } from "@/components/landing/ProfitCalculator";

import { Testimonials } from "@/components/landing/Testimonials";
import { ReferralPromo } from "@/components/landing/ReferralPromo";
import { FAQPreview } from "@/components/landing/FAQPreview";
import { FinalCTA } from "@/components/landing/FinalCTA";

import { SectionReveal3D } from "@/components/ui/SectionReveal3D";

export default function Home() {
  return (
    <>
      <Hero />
      <CountdownBanner />
      
      <SectionReveal3D>
        <ChallengeCalculator />
      </SectionReveal3D>
      
      <SectionReveal3D>
        <FeaturedIn />
      </SectionReveal3D>
      
      <CardStackSection />
      
      <SectionReveal3D>
        <Features />
      </SectionReveal3D>
      
      <SectionReveal3D>
        <WhyChooseUs />
      </SectionReveal3D>
      
      <SectionReveal3D>
        <EvaluationSteps />
      </SectionReveal3D>
      
      <SectionReveal3D>
        <PayoutSection />
      </SectionReveal3D>

      <SectionReveal3D>
        <ProfitCalculator />
      </SectionReveal3D>

      <SectionReveal3D>
        <ReferralPromo />
      </SectionReveal3D>
      
      <SectionReveal3D>
        <FAQPreview />
      </SectionReveal3D>
      
      <SectionReveal3D>
        <FinalCTA />
      </SectionReveal3D>
    </>
  );
}
