"use client";

import { useState } from "react";
import Link from "next/link";
import { PageLayout, PageHero, PageSection } from "@/components/layout";
import { Reveal, GsapWords, Magnetic, FaqRow } from "@/components/ui/Animations";
import { faq } from "@/data/faq";
import { ArrowUpRight, ArrowRight } from "lucide-react";

export default function FaqsPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <PageLayout>
      <PageHero
        eyebrow="FAQ"
        title="Frequently asked questions"
        titleHighlight={["questions"]}
        description="Everything you need to know about The People Prop. Can't find what you're looking for? Reach out to our support team."
        breadcrumb={[
          { label: "Home", href: "/" },
          { label: "FAQ", href: "/faqs" },
        ]}
      />

      {/* ═══ FAQ Accordion — dark section ═══ */}
      <PageSection variant="dark">
        <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          {/* Left sticky heading */}
          <Reveal>
            <div className="lg:sticky lg:top-32">
              <div className="mb-4 text-sm font-medium uppercase tracking-[0.3em] text-[#cbfb45]">
                Quick answers
              </div>
              <GsapWords
                text="The questions traders ask first"
                highlight={["traders"]}
                className="font-bold tracking-[-0.03em] text-white"
                style={{ fontSize: "clamp(1.9rem, 4vw, 3rem)" }}
              />
              <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-white/50">
                We believe in transparency. Here are honest answers to the
                questions we get asked most often.
              </p>
              <Magnetic className="mt-8 hidden lg:inline-block">
                <Link
                  href="/contact"
                  className="inline-flex h-11 items-center gap-2 rounded-full border border-white/20 px-5 text-[15px] font-medium text-white transition-all duration-300 hover:rounded-lg hover:border-[#cbfb45] hover:text-[#cbfb45]"
                >
                  Ask us directly
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Magnetic>
            </div>
          </Reveal>

          {/* Right: accordion */}
          <Reveal delay={0.1}>
            <div className="flex flex-col gap-3">
              {faq.map((item, i) => (
                <FaqRow
                  key={item.q}
                  item={item}
                  open={openIndex === i}
                  onToggle={() => setOpenIndex(openIndex === i ? null : i)}
                />
              ))}
            </div>
          </Reveal>
        </div>
      </PageSection>

      {/* ═══ CTA — lime section ═══ */}
      <PageSection variant="lime">
        <Reveal>
          <div className="mx-auto max-w-2xl text-center">
            <GsapWords
              text="Still need help?"
              highlight={["help?"]}
              as="h2"
              className="mb-6 font-bold tracking-[-0.03em] text-[#0c0c0c]"
              style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
            />
            <p className="mb-10 text-lg leading-relaxed text-[#0c0c0c]/60">
              Our support team responds in under 5 minutes on Telegram and
              Discord. We&apos;re here to help.
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
