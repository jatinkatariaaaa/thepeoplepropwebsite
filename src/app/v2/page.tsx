import { SiteHeader } from '@/components/v2/site-header'
import { Hero } from '@/components/v2/hero'
import { PromoBanner } from '@/components/v2/promo-banner'
import { WhyChoose } from '@/components/v2/why-choose'
import { Pricing } from '@/components/v2/pricing'
import { DashboardShowcase } from '@/components/v2/dashboard-showcase'
import { Platforms } from '@/components/v2/platforms'
import { Community } from '@/components/v2/community'
import { SiteFooter } from '@/components/v2/site-footer'
import { FinalCta, HowItWorks, ProofAndFaq, TraderAdvantage } from '@/components/v2/landing-sections'
import { Reveal } from '@/components/v2/motion'

export default function V2Page() {
  return (
    <>
      <SiteHeader />
      <div>
        <Hero />
        <PromoBanner />
        <WhyChoose />
        <HowItWorks />
        <Pricing />
        <DashboardShowcase />
        <TraderAdvantage />
        <Reveal><Platforms /></Reveal>
        <ProofAndFaq />
        <Community />
        <FinalCta />
      </div>
      <SiteFooter />
    </>
  )
}
