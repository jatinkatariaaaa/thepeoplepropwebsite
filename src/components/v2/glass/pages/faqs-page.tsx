"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowRight, Bot, CircleHelp, LifeBuoy, Mail, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { PROGRAM_ORDER, allFaqs, isProgramKey, programDetails } from "@/data/catalogue";
import type { ProgramKey } from "@/data/programs";
import { Button, Container, Eyebrow, Section, Title } from "../ui";
import { Reveal } from "../motion";
import { PageHero } from "../page-hero";
import { Cta } from "../cta";
import { href, programHref } from "../routes";
import { DarkQA, type QA } from "./shared";

const SUPABASE_READY = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

type Item = QA & { program: ProgramKey | null };

const CATALOGUE: Item[] = allFaqs().map((f) => ({ q: f.q, a: f.a, category: f.category ?? null, program: f.program }));

/** Every published question: tpp_faqs when it has been filled from Admin, otherwise the catalogue. */
function useAllFaqs(): Item[] {
  const [items, setItems] = useState<Item[]>(CATALOGUE);
  useEffect(() => {
    if (!SUPABASE_READY) return;
    let alive = true;
    supabase
      .from("tpp_faqs")
      .select("question, answer, category, program_key, sort_order")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => {
        // A handful of placeholder rows is not a help centre; wait until Admin has synced the catalogue.
        if (!alive || !data || data.length < 20) return;
        setItems(
          data.map((f: { question: string; answer: string; category?: string | null; program_key?: string | null }) => ({
            q: f.question,
            a: f.answer,
            category: f.category ?? null,
            program: f.program_key && isProgramKey(f.program_key) ? f.program_key : null,
          })),
        );
      });
    return () => {
      alive = false;
    };
  }, []);
  return items;
}

/** The general questions, for pages that only need those. */
export function useFaqs(): QA[] {
  return useAllFaqs().filter((f) => f.program === null);
}

const askAssistant = (question?: string) => window.dispatchEvent(new CustomEvent("tpp:assistant", { detail: { open: true, question } }));

function HelpCentre() {
  const items = useAllFaqs();
  const params = useSearchParams();
  const initial = params.get("program");
  const [scope, setScope] = useState<"all" | "general" | ProgramKey>(initial && isProgramKey(initial) ? initial : "all");
  const [category, setCategory] = useState("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const scoped = useMemo(() => items.filter((i) => (scope === "all" ? true : scope === "general" ? i.program === null : i.program === scope)), [items, scope]);
  const categories = useMemo(() => Array.from(new Set(scoped.filter((i) => i.program === null).map((i) => i.category).filter((c): c is string => Boolean(c)))), [scoped]);
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return scoped.filter((i) => (category === "all" || i.category === category) && (!t || i.q.toLowerCase().includes(t) || i.a.toLowerCase().includes(t)));
  }, [scoped, category, q]);

  const tabs: { key: typeof scope; label: string }[] = [{ key: "all", label: "Everything" }, { key: "general", label: "General" }, ...PROGRAM_ORDER.map((k) => ({ key: k, label: programDetails[k].name }))];
  const pick = (k: typeof scope) => {
    setScope(k);
    setCategory("all");
    setOpen(null);
  };

  return (
    <Section id="faq-list" shell={false} className="scroll-mt-24 pt-10 pb-40 sm:pb-48">
      <Container>
        <Reveal>
          <label className="g-glass g-hair relative mx-auto flex h-16 max-w-3xl items-center rounded-full pr-6 pl-14">
            <span className="sr-only">Search the help centre</span>
            <Search className="absolute left-6 h-5 w-5 text-white/45" strokeWidth={2.2} />
            <input
              type="search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setOpen(null);
              }}
              placeholder="Search payouts, stipend, daily loss, reset…"
              className="h-full w-full bg-transparent text-[16px] text-white outline-none placeholder:text-white/35"
            />
            <span className="g-num ml-3 shrink-0 text-[13px] text-white/40">{list.length}</span>
          </label>
        </Reveal>

        <Reveal delay={0.06}>
          <div role="tablist" aria-label="Account type" className="g-noscroll -mx-5 mt-8 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0">
            {tabs.map((t) => {
              const on = scope === t.key;
              return (
                <button key={t.key} type="button" role="tab" aria-selected={on} onClick={() => pick(t.key)} className={cn("shrink-0 rounded-full px-5 py-2.5 text-[14px] font-semibold transition-colors duration-300", on ? "bg-white text-[var(--g-ink)]" : "g-hair bg-white/[0.05] text-white/65 hover:bg-white/[0.1] hover:text-white")}>
                  {t.label}
                </button>
              );
            })}
          </div>
        </Reveal>

        <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-14">
          <aside className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            {scope !== "all" && scope !== "general" ? (
              <div className="g-card-dark g-hair rounded-[24px] p-5">
                <p className="text-[12px] font-medium text-white/45">Account type</p>
                <p className="mt-1 text-[20px] font-semibold tracking-[-0.02em] text-white">{programDetails[scope].name}</p>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-white/55">{programDetails[scope].motto}.</p>
                <Link href={programHref(scope)} className="group mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--g-lime)]">
                  Objectives and terms <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            ) : (
              <nav aria-label="Topics" className="g-noscroll -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0">
                {["all", ...categories].map((c) => {
                  const on = category === c;
                  const count = c === "all" ? scoped.length : scoped.filter((i) => i.category === c).length;
                  return (
                    <button key={c} type="button" aria-pressed={on} onClick={() => { setCategory(c); setOpen(null); }} className={cn("flex shrink-0 items-center justify-between gap-4 rounded-full px-4 py-2.5 text-left text-[14px] font-medium transition-colors duration-300 lg:rounded-[14px]", on ? "bg-white/[0.09] text-white" : "text-white/50 hover:text-white")}>
                      {c === "all" ? "All topics" : c}
                      <span className={cn("g-num text-[12px]", on ? "text-[var(--g-lime)]" : "text-white/30")}>{count}</span>
                    </button>
                  );
                })}
              </nav>
            )}

            <div className="g-glass g-hair mt-4 rounded-[24px] p-5">
              <p className="flex items-center gap-3 text-[14.5px] font-semibold text-white">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--g-lime)] text-[var(--g-ink)]">
                  <Bot className="h-[18px] w-[18px]" />
                </span>
                Ask the assistant
              </p>
              <p className="mt-3 text-[13.5px] leading-relaxed text-white/55">It answers from this rulebook, for the account type you ask about, at any hour.</p>
              <button type="button" onClick={() => askAssistant(q.trim() || undefined)} className="g-btn g-btn-lime mt-4 h-11 w-full text-[14px]">
                Start a chat
              </button>
              <a href="mailto:support@thepeopleprop.com" className="mt-4 flex items-center gap-2 text-[13.5px] text-white/60 hover:text-white">
                <Mail className="h-4 w-4" /> support@thepeopleprop.com
              </a>
            </div>
          </aside>

          <div className="min-w-0">
            {list.length ? (
              <ul className="flex flex-col gap-2.5">
                {list.map((item) => {
                  const id = `${item.program ?? "g"}:${item.q}`;
                  return <DarkQA key={id} item={item} open={open === id} onToggle={() => setOpen(open === id ? null : id)} badge={scope === "all" && item.program ? programDetails[item.program].name : undefined} />;
                })}
              </ul>
            ) : (
              <div className="rounded-[24px] bg-white/[0.03] p-10 text-center">
                <p className="text-[16px] font-semibold text-white">No question matches “{q}”.</p>
                <p className="mt-2 text-[14px] text-white/55">Ask the assistant the same thing in your own words.</p>
                <button type="button" onClick={() => askAssistant(q.trim())} className="g-btn g-btn-lime mt-5 h-11 px-6 text-[14px]">
                  Ask the assistant
                </button>
              </div>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}

export function FaqsPage() {
  return (
    <>
      <PageHero
        art="/art/page-faqs.webp"
        crumb="Help centre"
        eyebrow="Help centre"
        icon={CircleHelp}
        lead="Ask about"
        fade="your account type."
        lede="Every question is answered for the account it belongs to. Choose 1-Step, 2-Step, 3-Step, Instant or Access, or search the whole help centre at once."
        mobileFocus="70%"
      >
        <div className="flex flex-wrap gap-3">
          <Button href="#faq-list">Browse the answers</Button>
          <Button href={href("contact")} kind="glass" arrow={false}>
            Contact support
          </Button>
        </div>
      </PageHero>

      <Suspense fallback={null}>
        <HelpCentre />
      </Suspense>

      <section className="g-light relative isolate z-10 -mt-12 overflow-clip rounded-t-[44px] pt-20 pb-36 sm:rounded-t-[56px] sm:pt-24 sm:pb-44">
        <Container>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { icon: LifeBuoy, title: "Open a ticket", body: "From your dashboard, under Support. We answer within one business day.", to: "/dashboard/support", cta: "Go to support" },
              { icon: CircleHelp, title: "Read the rules", body: "How the loss limits are measured, with a planner you can try.", to: href("rules"), cta: "Trading rules" },
              { icon: Mail, title: "Email us", body: "support@thepeopleprop.com, for anything about billing or your identity check.", to: href("contact"), cta: "Contact page" },
            ].map(({ icon: Icon, title, body, to, cta }) => (
              <Reveal key={title}>
                <Link href={to} className="g-card-paper g-hair g-hair-ink group flex h-full flex-col rounded-[26px] p-6 text-[var(--g-ink)] transition-transform duration-500 hover:-translate-y-1">
                  <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-[var(--g-ink)] text-[var(--g-lime)]">
                    <Icon className="h-5 w-5" strokeWidth={1.9} />
                  </span>
                  <h3 className="mt-5 text-[18px] font-semibold tracking-[-0.02em]">{title}</h3>
                  <p className="mt-1.5 flex-1 text-[14px] leading-relaxed text-[var(--g-muted-ink)]">{body}</p>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--g-emerald)]">
                    {cta} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <Cta
        size="md"
        title={
          <>
            <span className="g-shade-dark">Found your </span>
            <span className="g-shade-lime">answer?</span>
          </>
        }
        lede="Pick the account type that fits and start trading today."
        primary={{ label: "View account types", href: href("challenges") }}
        secondary={{ label: "Trading rules", href: href("rules") }}
      />
    </>
  );
}
