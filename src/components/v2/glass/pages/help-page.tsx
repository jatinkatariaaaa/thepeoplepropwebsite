"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, CircleHelp, LayoutDashboard, LifeBuoy, MessagesSquare, Newspaper, Scale, Trophy, type LucideIcon } from "lucide-react";
import { rules } from "@/data/rules";
import { Button, Container, Eyebrow, Lede, Section, Title } from "../ui";
import { Reveal, Stagger, StaggerItem } from "../motion";
import { PageHero } from "../page-hero";
import { Cta } from "../cta";
import { usePrograms } from "../data";
import { APP, href } from "../routes";
import { useFaqs } from "./faqs-page";
import { QASearch, type QA } from "./shared";
import { SupportChannels } from "./channels";

type Topic = { title: string; body: string; to: string; icon: LucideIcon; cta: string };

const list = new Intl.ListFormat("en", { type: "conjunction" });

export function HelpPage() {
  const faqs = useFaqs();
  const programs = usePrograms();

  // one index: the published FAQ plus every rule in the rulebook
  const items = useMemo<QA[]>(() => [...faqs, ...rules.map((r) => ({ q: r.title, a: [r.summary, ...r.details].join("\n\n"), category: "rulebook" }))], [faqs]);

  const topics: Topic[] = [
    { title: "Choosing an account", body: `Compare the ${list.format(programs.map((p) => p.shortLabel))} accounts side by side.`, to: href("challenges"), icon: Trophy, cta: "Compare challenges" },
    { title: "Trading rules", body: "Profit targets, loss limits, news trading and every other rule, written out in full.", to: href("rules"), icon: Scale, cta: "Read the rulebook" },
    { title: "Frequently asked", body: "Payouts, platforms and the questions traders ask us most.", to: href("faqs"), icon: CircleHelp, cta: "Browse the FAQ" },
    { title: "Your dashboard", body: "Sign in to see your accounts, payouts and certificates.", to: APP.login, icon: LayoutDashboard, cta: "Log in" },
    { title: "Guides & market notes", body: "Strategy write-ups and how-tos from the team.", to: href("blog"), icon: Newspaper, cta: "Read the blog" },
    { title: "Talk to us", body: "Email, Telegram or Discord, whichever suits you.", to: href("contact"), icon: MessagesSquare, cta: "Contact support" },
  ];

  return (
    <>
      <PageHero
        art="/art/page-help.webp"
        crumb="Help centre"
        eyebrow="Help centre"
        icon={LifeBuoy}
        lead="How can we"
        fade="help?"
        lede="Search every answer we publish, from the FAQ to the full rulebook, or go straight to the page you need."
        mobileFocus="70%"
      >
        <div className="flex flex-wrap gap-3">
          <Button href="#search">Search answers</Button>
          <Button href={href("contact")} kind="glass" arrow={false}>
            Contact support
          </Button>
        </div>
      </PageHero>

      <Section shell={false} className="pt-6 pb-24">
        <Container>
          <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map(({ title, body, to, icon: Icon, cta }) => (
              <StaggerItem key={title} className="h-full">
                <Link href={to} className="g-glass g-hair group flex h-full flex-col rounded-[28px] p-6 transition-colors duration-500 hover:bg-white/[0.06] sm:p-7">
                  <span className="grid h-12 w-12 place-items-center rounded-[16px] bg-white/[0.07] text-[var(--g-lime)] ring-1 ring-white/10 transition-colors duration-500 group-hover:bg-[var(--g-lime)] group-hover:text-[var(--g-ink)]">
                    <Icon className="h-5 w-5" strokeWidth={1.9} />
                  </span>
                  <span className="mt-7 text-[19px] font-semibold tracking-[-0.02em] text-white">{title}</span>
                  <span className="mt-2 flex-1 text-[14.5px] leading-relaxed text-white/55">{body}</span>
                  <span className="mt-7 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--g-lime)]">
                    {cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </Container>
      </Section>

      <Section id="search" className="py-24 sm:py-32">
        <Container>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-16">
            <Reveal>
              <div className="lg:sticky lg:top-32">
                <Eyebrow icon={BookOpen}>Search</Eyebrow>
                <Title className="mt-6 text-[clamp(2rem,3.6vw,3.2rem)]" lead="Every answer," fade="one search." />
                <Lede className="mt-5">
                  {items.length} answers from the FAQ and the rulebook. Try a word like “payout”, “news” or “drawdown”.
                </Lede>
              </div>
            </Reveal>
            <Reveal delay={0.08} className="min-w-0">
              <QASearch items={items} placeholder="Search answers…" />
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section shell={false} className="pt-24 pb-40 sm:pb-48">
        <Container>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-16">
            <Reveal>
              <Eyebrow icon={MessagesSquare}>Still stuck?</Eyebrow>
              <Title className="mt-6 text-[clamp(2rem,3.6vw,3.2rem)]" lead="Talk to" fade="the team." />
              <Lede className="mt-5">If the answer isn&apos;t here, message us. Including your account number helps us find it faster.</Lede>
            </Reveal>
            <Reveal delay={0.08} className="min-w-0">
              <div className="flex flex-col gap-3">
                <SupportChannels />
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Cta />
    </>
  );
}
