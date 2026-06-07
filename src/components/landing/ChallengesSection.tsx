"use client";

import { AnimatedSection, AnimatedItem } from "@/components/ui/AnimatedSection";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
import { ChallengeCard } from "@/components/ChallengeCard";
import { challenges } from "@/data/challenges";
import { ArrowRight } from "lucide-react";

export function ChallengesSection() {
  return (
    <section className="relative py-12 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex items-end justify-between gap-8 flex-wrap mb-12 md:mb-16">
          <SectionHeading
            eyebrow="Choose Your Account"
            title={
              <>
                One evaluation.
                <br />
                Funded for life.
              </>
            }
            description="Pick the account that matches your conviction. Every plan ships with the same fair rules — only the capital and the split scale up."
          />
          <Button href="/challenges" variant="outline" className="hidden md:inline-flex">
            View All Challenges
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <AnimatedSection
          stagger
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {challenges.map((c) => (
            <AnimatedItem key={c.id}>
              <ChallengeCard c={c} />
            </AnimatedItem>
          ))}
        </AnimatedSection>
      </div>
    </section>
  );
}
