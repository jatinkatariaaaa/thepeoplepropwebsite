"use client";

import Link from "next/link";
import { PageLayout, PageHero, PageSection } from "@/components/layout";
import { Reveal, GsapWords, Magnetic } from "@/components/ui/Animations";
import { RuleCard } from "@/components/rules/RuleCard";
import { RulesFAQ } from "@/components/rules/RulesFAQ";
import { rules } from "@/data/rules";
import { ArrowRight, ArrowUpRight } from "lucide-react";

export default function RulesPage() {
  return (
    <PageLayout>
      <PageHero
        eyebrow="The Rulebook"
        title="Fair rules set in stone"
        titleHighlight={["rules", "stone"]}
        description="Every constraint, ratio and review window — published openly. No mystery footnotes. No mid-evaluation changes."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "Rules", href: "/rules" },
        ]}
      />

      {/* ═══ Rule Cards ═══ */}
      <PageSection variant="cream">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            {/* Left: quick reference */}
            <Reveal>
              <aside className="lg:sticky lg:top-28 lg:self-start">
                <div className="mb-5 flex items-center gap-3 text-sm font-medium uppercase tracking-[0.2em] text-[#0c0c0c]/50">
                  <span className="h-px w-8 bg-[#0c0c0c]/20" />
                  Quick reference
                </div>
                <div className="space-y-3">
                  {rules.map((r) => (
                    <RuleCard key={r.id} rule={r} />
                  ))}
                </div>
              </aside>
            </Reveal>

            {/* Right: FAQ */}
            <Reveal delay={0.15}>
              <div>
                <div className="mb-5 flex items-center gap-3 text-sm font-medium uppercase tracking-[0.2em] text-[#0c0c0c]/50">
                  <span className="h-px w-8 bg-[#0c0c0c]/20" />
                  Detailed FAQ
                </div>
                <GsapWords
                  text="Plain-English answers written by traders"
                  highlight={["traders"]}
                  as="h2"
                  className="mb-8 max-w-md font-bold tracking-[-0.03em] text-[#0c0c0c]"
                  style={{
                    fontSize: "clamp(1.8rem, 3.5vw, 2.5rem)",
                    lineHeight: 1.05,
                  }}
                />
                <RulesFAQ />
              </div>
            </Reveal>
          </div>
        </div>
      </PageSection>

      {/* ═══ CTA — lime section ═══ */}
      <PageSection variant="lime">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <GsapWords
              text="Still have questions?"
              highlight={["questions?"]}
              as="h2"
              className="mb-6 font-bold tracking-[-0.03em] text-[#0c0c0c]"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
            />
            <p className="mb-10 text-lg leading-relaxed text-[#0c0c0c]/60">
              Our support team is available 24/7 to help you understand the
              rules and get started. Average response time under 5 minutes.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Magnetic>
                <Link
                  href="/contact"
                  className="group inline-flex h-12 items-center gap-2 rounded-full bg-[#0c0c0c] pl-2 pr-5 text-[15px] font-semibold text-white transition-all duration-300 hover:rounded-xl"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#cbfb45] transition-all duration-300 group-hover:rounded-md">
                    <ArrowUpRight className="h-4 w-4 text-[#0c0c0c] transition-transform duration-300 group-hover:rotate-45" />
                  </span>
                  Contact support
                </Link>
              </Magnetic>
              <Magnetic>
                <Link
                  href="/challenges"
                  className="inline-flex h-12 items-center rounded-full border border-[#0c0c0c]/30 px-6 text-[15px] font-medium text-[#0c0c0c] transition-all duration-300 hover:rounded-xl hover:bg-[#0c0c0c]/5"
                >
                  View challenges
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Magnetic>
            </div>
          </div>
        </Reveal>
      </PageSection>
    </PageLayout>
  );
}