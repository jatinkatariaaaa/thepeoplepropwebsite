"use client";

import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";
import { Button, Container, Section } from "../ui";
import { Stagger, StaggerItem } from "../motion";
import { PageHero } from "../page-hero";
import { href, type PageKey } from "../routes";

const POPULAR: { key: PageKey; label: string; note: string }[] = [
  { key: "challenges", label: "Challenges", note: "Pick an account" },
  { key: "rules", label: "Trading rules", note: "Every rule in full" },
  { key: "faqs", label: "FAQ", note: "Common questions" },
  { key: "contact", label: "Contact", note: "Talk to the team" },
];

export function NotFoundPage() {
  return (
    <>
      <PageHero
        art="/art/page-not-found.webp"
        crumb="404"
        eyebrow="Error 404"
        icon={Compass}
        lead="Nothing"
        fade="to see here."
        lede="The link may be out of date, or the page may have moved. Try one of these instead."
        mobileFocus="62%"
      >
        <div className="flex flex-wrap gap-3">
          <Button href={href("home")}>Back to home</Button>
          <Button href={href("help")} kind="glass" arrow={false}>
            Help centre
          </Button>
        </div>
      </PageHero>
      <Section shell={false} className="pt-4 pb-32">
        <Container>
          <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {POPULAR.map((p) => (
              <StaggerItem key={p.key}>
                <Link href={href(p.key)} className="g-glass g-hair group flex items-center justify-between gap-4 rounded-[24px] p-5 transition-colors duration-500 hover:bg-white/[0.06]">
                  <span>
                    <span className="block text-[16px] font-semibold text-white">{p.label}</span>
                    <span className="mt-0.5 block text-[13px] text-white/50">{p.note}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-[var(--g-lime)] transition-transform group-hover:translate-x-0.5" />
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>
    </>
  );
}
