"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CircleHelp, Mail, MessagesSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { faq as staticFaq } from "@/data/faq";
import { Button, Container, Eyebrow, Lede, Section, Title } from "../ui";
import { Reveal } from "../motion";
import { PageHero } from "../page-hero";
import { Cta } from "../cta";
import { href } from "../routes";
import { QASearch, type QA } from "./shared";

const SUPABASE_READY = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

/** Same source as the current FAQ page (`tpp_faqs`), with the static FAQ as a fallback so the page is never empty. */
function useFaqs(): QA[] {
  const [items, setItems] = useState<QA[]>(staticFaq);
  useEffect(() => {
    if (!SUPABASE_READY) return;
    let alive = true;
    supabase
      .from("tpp_faqs")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => {
        if (!alive || !data || data.length === 0) return;
        setItems(data.map((f: { question: string; answer: string; category?: string | null }) => ({ q: f.question, a: f.answer, category: f.category ?? null })));
      });
    return () => {
      alive = false;
    };
  }, []);
  return items;
}

export function FaqsPage() {
  const items = useFaqs();
  return (
    <>
      <PageHero
        art="/v2/pt/page-faqs.webp"
        crumb="FAQ"
        eyebrow="FAQ"
        icon={CircleHelp}
        lead="Questions,"
        fade="answered."
        lede="Everything you need to know about The People Prop. Can't find what you're looking for? Reach out to our support team."
        mobileFocus="70%"
      >
        <div className="flex flex-wrap gap-3">
          <Button href="#faq-list">Browse questions</Button>
          <Button href={href("contact")} kind="glass" arrow={false}>
            Ask us directly
          </Button>
        </div>
      </PageHero>

      <Section id="faq-list" shell={false} className="scroll-mt-24 pt-10 pb-40 sm:pb-48">
        <Container>
          <div className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-16">
            <div className="lg:sticky lg:top-28 lg:self-start">
              <Reveal>
                <Eyebrow icon={MessagesSquare}>Quick answers</Eyebrow>
              </Reveal>
              <Reveal delay={0.06}>
                <Title className="mt-6 text-[clamp(2rem,3.6vw,3.2rem)]" lead="The questions traders" fade="ask first." />
              </Reveal>
              <Reveal delay={0.1}>
                <Lede className="mt-5">We believe in transparency. Here are honest answers to the questions we get asked most often.</Lede>
              </Reveal>
              <Reveal delay={0.14}>
                <div className="g-glass g-hair mt-8 rounded-[24px] p-5">
                  <p className="flex items-center gap-3 text-[14.5px] font-semibold text-white">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--g-lime)] text-[var(--g-ink)]">
                      <Mail className="h-4 w-4" />
                    </span>
                    Still unsure?
                  </p>
                  <a href="mailto:support@thepeopleprop.com" className="mt-4 block text-[14px] text-white/70 underline decoration-white/20 underline-offset-4 hover:text-white">
                    support@thepeopleprop.com
                  </a>
                  <Link href={href("contact")} className="group mt-3 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--g-lime)]">
                    All ways to reach us <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </Reveal>
            </div>
            <Reveal delay={0.08} className="min-w-0">
              <QASearch items={items} />
            </Reveal>
          </div>
        </Container>
      </Section>

      <Cta
        title={
          <>
            <span className="g-shade-dark">Still need </span>
            <span className="g-shade-lime">help?</span>
          </>
        }
        lede="Our support team responds in under 5 minutes on Telegram and Discord. We're here to help."
        primary={{ label: "Contact support", href: href("contact") }}
        secondary={{ label: "View challenges", href: href("challenges") }}
      />
    </>
  );
}
