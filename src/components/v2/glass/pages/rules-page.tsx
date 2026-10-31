"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  CalendarDays,
  Check,
  Newspaper,
  Scale,
  ScrollText,
  Shield,
  Target,
  TrendingUp,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { rules, type Rule } from "@/data/rules";
import { faq } from "@/data/faq";
import { cn } from "@/lib/utils";
import { Button, Container, Eyebrow, Lede, Section, Title } from "../ui";
import { Reveal } from "../motion";
import { FaqItem } from "../faq";
import { PageHero } from "../page-hero";
import { Cta } from "../cta";
import { href } from "../routes";

const ICON: Record<Rule["icon"], LucideIcon> = {
  target: Target,
  alert: TriangleAlert,
  shield: Shield,
  scale: Scale,
  newspaper: Newspaper,
  calendar: CalendarDays,
  trending: TrendingUp,
  refund: BadgeDollarSign,
};

/** The rulebook as numbered chapters, with a sticky index that follows the reader. */
function Chapters() {
  const [active, setActive] = useState(rules[0]?.id);
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-40% 0px -55% 0px" });
    rules.forEach((r) => {
      const el = document.getElementById(r.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  return (
    <Section id="chapters" shell={false} className="pt-10 pb-28 sm:pb-36">
      <Container>
        <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-16">
          <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <Eyebrow icon={ScrollText}>Quick reference</Eyebrow>
            </Reveal>
            <nav aria-label="Rules" className="g-noscroll -mx-5 mt-6 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0">
              {rules.map((r, i) => (
                <a
                  key={r.id}
                  href={`#${r.id}`}
                  className={cn(
                    "flex shrink-0 items-center gap-3 rounded-full px-4 py-2.5 text-[14px] font-medium transition-colors duration-300 lg:rounded-[14px]",
                    active === r.id ? "bg-white/[0.09] text-white" : "text-white/50 hover:text-white",
                  )}
                >
                  <span className={cn("g-num text-[12px]", active === r.id ? "text-[var(--g-lime)]" : "text-white/30")}>{String(i + 1).padStart(2, "0")}</span>
                  {r.title}
                </a>
              ))}
            </nav>
          </aside>

          <div className="flex min-w-0 flex-col gap-4">
            {rules.map((r, i) => {
              const Icon = ICON[r.icon];
              return (
                <Reveal key={r.id}>
                  <article id={r.id} className="g-card-dark g-hair scroll-mt-28 rounded-[30px] p-6 sm:p-9">
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <span className="g-num g-shade-dark block text-[56px] leading-none font-semibold tracking-[-0.05em] sm:text-[72px]">{String(i + 1).padStart(2, "0")}</span>
                        <h2 className="mt-4 text-[26px] font-semibold tracking-[-0.03em] text-white sm:text-[30px]">{r.title}</h2>
                      </div>
                      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-[18px] bg-[var(--g-lime)]/10 text-[var(--g-lime)] ring-1 ring-[var(--g-lime)]/25">
                        <Icon className="h-6 w-6" strokeWidth={1.8} />
                      </span>
                    </div>
                    <p className="mt-4 max-w-2xl text-[17px] leading-relaxed text-white/80">{r.summary}</p>
                    <ul className="mt-6 grid gap-2.5 border-t border-white/[0.07] pt-6">
                      {r.details.map((d) => (
                        <li key={d} className="flex items-start gap-3 text-[15px] leading-relaxed text-white/60">
                          <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/[0.07]">
                            <Check className="h-3 w-3 text-[var(--g-lime)]" strokeWidth={3} />
                          </span>
                          {d}
                        </li>
                      ))}
                    </ul>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </Container>
    </Section>
  );
}

function RulesQA() {
  const items = faq.filter((f) => f.category === "rules");
  const [open, setOpen] = useState<string | null>(items[0]?.q ?? null);
  return (
    <section className="g-light relative isolate z-10 -mt-12 overflow-clip rounded-t-[44px] pt-24 pb-40 sm:rounded-t-[56px] sm:pt-32 sm:pb-48">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <Eyebrow tone="light">Detailed FAQ</Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <Title tone="light" className="mt-6 text-[clamp(2rem,3.6vw,3.2rem)]" lead="Plain-English answers" fade="written by traders." />
            </Reveal>
            <Reveal delay={0.1}>
              <Lede tone="light" className="mt-5">
                The rule questions we hear most. For everything else, search the full FAQ.
              </Lede>
              <Link href={href("faqs")} className="group mt-7 inline-flex items-center gap-1.5 text-[14px] font-semibold text-[var(--g-emerald)]">
                Search all questions <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Reveal>
          </div>
          <ul className="flex flex-col gap-2.5">
            {items.map((item) => (
              <FaqItem key={item.q} item={item} open={open === item.q} onToggle={() => setOpen(open === item.q ? null : item.q)} />
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

export function RulesPage() {
  return (
    <>
      <PageHero
        art="/art/page-rules.webp"
        crumb="Rules"
        eyebrow="The rulebook"
        icon={ScrollText}
        lead="Fair rules,"
        fade="set in stone."
        lede="Every constraint, ratio and review window — published openly. No mystery footnotes. No mid-evaluation changes."
      >
        <div className="flex flex-wrap gap-3">
          <Button href="#chapters">Read the rulebook</Button>
          <Button href={href("challenges")} kind="glass" arrow={false}>
            View challenges
          </Button>
        </div>
      </PageHero>
      <Chapters />
      <RulesQA />
      <Cta
        title={
          <>
            <span className="g-shade-dark">Still have </span>
            <span className="g-shade-lime">questions?</span>
          </>
        }
        lede="Our support team is available 24/7 to help you understand the rules and get started. Average response time under 5 minutes."
        primary={{ label: "Contact support", href: href("contact") }}
        secondary={{ label: "View challenges", href: href("challenges") }}
      />
    </>
  );
}
