import { preload } from "react-dom";
import { Hero } from "@/components/v2/glass/hero";
import { Challenges } from "@/components/v2/glass/challenges";
import { TwoWays } from "@/components/v2/glass/two-ways";
import { Why } from "@/components/v2/glass/why";
import { Steps } from "@/components/v2/glass/steps";
import { PassFirst } from "@/components/v2/glass/pass-first";
import { Compare } from "@/components/v2/glass/compare";
import { Stories } from "@/components/v2/glass/stories";
import { Faq } from "@/components/v2/glass/faq";
import { Cta } from "@/components/v2/glass/cta";

export default function V2Page() {
  // The path-traced hero plate is the LCP element — fetch the right crop before hydration.
  preload("/v2/pt/hero-desktop.webp", { as: "image", fetchPriority: "high", media: "(min-width: 1024px)" });
  preload("/v2/pt/hero-mobile.webp", { as: "image", fetchPriority: "high", media: "(max-width: 1023px)" });

  return (
    <>
      <Hero />
      <Challenges />
      <TwoWays />
      <Why />
      <Steps />
      <PassFirst />
      <Compare />
      <Stories />
      <Faq />
      <Cta />
    </>
  );
}
