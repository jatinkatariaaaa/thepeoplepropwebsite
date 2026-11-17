"use client";

import { Calculator, Ruler, Shield } from "lucide-react";
import { PositionCalculator } from "@/components/tools/position-calculator";
import { LossLimitLab } from "@/components/tools/loss-limit-lab";
import { Button, Container, Eyebrow, Lede, Section, Title } from "../ui";
import { Reveal } from "../motion";
import { PageHero } from "../page-hero";
import { Cta } from "../cta";
import { href } from "../routes";

export function ToolsPage() {
  return (
    <>
      <PageHero
        art="/art/page-heatmap.webp"
        crumb="Tools"
        eyebrow="Trading tools"
        icon={Calculator}
        lead="Size the trade"
        fade="before you take it."
        lede="A position calculator and a loss-limit planner built on the contract sizes, leverage and limits of TPP Terminal. Free to use, no account needed."
      >
        <div className="flex flex-wrap gap-3">
          <Button href="#position">Position calculator</Button>
          <Button href="#limits" kind="glass" arrow={false}>
            Loss-limit planner
          </Button>
        </div>
      </PageHero>

      <Section id="position" shell={false} className="scroll-mt-24 pt-10 pb-28 sm:pb-36">
        <Container>
          <div className="grid items-end gap-8 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <Reveal>
                <Eyebrow icon={Ruler}>Position calculator</Eyebrow>
              </Reveal>
              <Reveal delay={0.06}>
                <Title className="mt-6 text-[clamp(2.2rem,4.4vw,3.8rem)]" lead="Risk first." fade="Lot size second." />
              </Reveal>
            </div>
            <Reveal delay={0.12}>
              <Lede className="lg:mb-2">Enter the balance, the share of it you are willing to lose and where your stop sits. The calculator returns the lot size that loses exactly that if the stop is hit.</Lede>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="mt-12">
            <PositionCalculator tone="dark" />
          </Reveal>
        </Container>
      </Section>

      <section id="limits" className="g-light relative isolate z-10 -mt-12 scroll-mt-24 overflow-clip rounded-t-[44px] pt-24 pb-40 sm:rounded-t-[56px] sm:pt-32 sm:pb-48">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Reveal className="flex justify-center">
              <Eyebrow tone="light" icon={Shield}>
                Loss-limit planner
              </Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <Title tone="light" className="mt-6 text-[clamp(2.2rem,4.4vw,3.8rem)]" lead="Know your floor" fade="before the open." />
            </Reveal>
            <Reveal delay={0.12} className="flex justify-center">
              <Lede tone="light" className="mt-6 text-center">
                The daily limit moves with your balance. The maximum limit never does. See which one is closer for your account today.
              </Lede>
            </Reveal>
          </div>
          <Reveal delay={0.1} className="mt-12">
            <LossLimitLab />
          </Reveal>
        </Container>
      </section>

      <Cta
        size="md"
        title={
          <>
            <span className="g-shade-dark">Put the plan </span>
            <span className="g-shade-lime">to work.</span>
          </>
        }
        lede="The same calculator, plus a trading journal that fills itself from your trades, is inside every trader dashboard."
        primary={{ label: "View account types", href: href("challenges") }}
        secondary={{ label: "Read the rules", href: href("rules") }}
      />
    </>
  );
}
