import { Header } from "@/components/v2/redesign/header";
import { Hero } from "@/components/v2/redesign/hero";
import { Marquee } from "@/components/v2/redesign/marquee";
import { Edge } from "@/components/v2/redesign/edge";
import { Steps } from "@/components/v2/redesign/steps";
import { Pricing } from "@/components/v2/redesign/pricing";
import { Proof } from "@/components/v2/redesign/proof";
import { Platforms } from "@/components/v2/redesign/platforms";
import { Faq } from "@/components/v2/redesign/faq";
import { Cta } from "@/components/v2/redesign/cta";
import { Footer } from "@/components/v2/redesign/footer";

export default function V2Page() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Marquee />
        <Edge />
        <Steps />
        <Pricing />
        <Proof />
        <Platforms />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
