import type { Metadata } from "next";
import { preload } from "react-dom";
import { Hero } from "@/components/v2/glass/home/hero";
import { Edge } from "@/components/v2/glass/home/edge";
import { Challenges } from "@/components/v2/glass/challenges";
import { Journey } from "@/components/v2/glass/home/journey";
import { Access } from "@/components/v2/glass/home/access";
import { Voices } from "@/components/v2/glass/home/voices";
import { Versus } from "@/components/v2/glass/home/versus";
import { Faq } from "@/components/v2/glass/faq";
import { Cta } from "@/components/v2/glass/cta";

/* Preview of the next landing page. It moves to / once it is signed off; until then it stays out of search. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/* Each section after the hero is a sheet that overlaps the one before it. */
const SHEET = "z-10 -mt-12 overflow-clip rounded-t-[44px] pt-28 sm:rounded-t-[56px] sm:pt-36";

export default function LandingPreviewPage() {
  // The path-traced hero plate is the LCP element — fetch the right crop before hydration.
  preload("/art/ascent-hero.webp", { as: "image", fetchPriority: "high", media: "(min-width: 1024px)" });
  preload("/art/ascent-mobile.webp", { as: "image", fetchPriority: "high", media: "(max-width: 1023px)" });

  return (
    <>
      <Hero />
      <Edge />
      <Challenges className={SHEET} />
      <Journey />
      <Access />
      <Voices />
      <Versus />
      <Faq className={SHEET} />
      <Cta />
    </>
  );
}
