"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CircleHelp, Mail, Plus } from "lucide-react";
import { faq, type FAQItem } from "@/data/faq";
import { cn } from "@/lib/utils";
import { Container, Eyebrow, Lede, Title } from "./ui";
import { EASE, Parallax, Reveal } from "./motion";
import { href } from "./routes";

const TABS: { key: "all" | NonNullable<FAQItem["category"]>; label: string }[] = [
  { key: "all", label: "All" },
  { key: "general", label: "General" },
  { key: "rules", label: "Rules" },
  { key: "payouts", label: "Payouts" },
  { key: "platform", label: "Platform" },
];

/** One accordion row (light surfaces). Shared with the inner pages. */
export function FaqItem({ item, open, onToggle }: { item: Pick<FAQItem, "q" | "a">; open: boolean; onToggle: () => void }) {
  const id = useId();
  return (
    <li
      className={cn(
        "rounded-[24px] transition-[background-color,box-shadow] duration-500",
        open ? "bg-white shadow-[0_24px_50px_-30px_rgba(16,40,34,0.35),inset_0_0_0_1px_rgba(14,17,16,0.06)]" : "bg-black/[0.03] hover:bg-black/[0.05]",
      )}
    >
      <h3>
        <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={id} className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left sm:px-7 sm:py-6">
          <span className="text-[16.5px] font-semibold tracking-[-0.02em] text-[var(--g-ink)] sm:text-[17.5px]">{item.q}</span>
          <span
            className={cn(
              "grid h-9 w-9 shrink-0 place-items-center rounded-full transition-all duration-500 [transition-timing-function:var(--g-out)]",
              open ? "rotate-45 bg-[var(--g-ink)] text-[var(--g-lime)]" : "bg-white text-[var(--g-ink)] shadow-[0_6px_14px_-8px_rgba(0,0,0,0.3)]",
            )}
          >
            <Plus className="h-4 w-4" strokeWidth={2.2} />
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={id}
            key="a"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="overflow-hidden"
          >
            <p className="max-w-2xl px-6 pb-6 text-[15px] leading-relaxed text-[var(--g-muted-ink)] sm:px-7">{item.a}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  );
}

export function Faq() {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("all");
  const [open, setOpen] = useState<string | null>(faq[0]?.q ?? null);
  const items = useMemo(() => (tab === "all" ? faq.slice(0, 8) : faq.filter((f) => f.category === tab)), [tab]);

  return (
    <section id="faq" className="relative isolate scroll-mt-24 bg-white pt-16 pb-40 text-[var(--g-ink)] sm:pt-24 sm:pb-48">
      <Container>
        <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              <Eyebrow tone="light" icon={CircleHelp}>
                FAQ
              </Eyebrow>
            </Reveal>
            <Reveal delay={0.06}>
              <Title tone="light" className="mt-6 text-[clamp(2.2rem,3.9vw,3.6rem)]" lead="The questions traders" fade="ask first." />
            </Reveal>
            <Reveal delay={0.1}>
              <Lede tone="light" className="mt-6">
                Everything you need to know before getting started. For the full list, see the rules page.
              </Lede>
            </Reveal>

            <Parallax speed={0.1} className="relative mt-8 hidden lg:block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/v2/pt/prop-question.webp" alt="" aria-hidden="true" loading="lazy" decoding="async" className="g-float w-[230px] drop-shadow-[0_36px_30px_rgba(16,40,34,0.25)]" />
            </Parallax>

            <Reveal delay={0.15} className="mt-8">
              <div className="g-card-paper g-hair g-hair-ink flex flex-col gap-4 rounded-[24px] p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--g-ink)] text-[var(--g-lime)]">
                    <Mail className="h-4 w-4" />
                  </span>
                  <div className="leading-tight">
                    <p className="text-[14px] font-semibold">Still unsure?</p>
                    <a href="mailto:support@thepeopleprop.com" className="text-[13px] text-[var(--g-muted-ink)] underline decoration-black/20 underline-offset-4 hover:text-[var(--g-ink)]">
                      support@thepeopleprop.com
                    </a>
                  </div>
                </div>
                <Link href={href("faqs")} className="group inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-[var(--g-emerald)]">
                  See all questions
                  <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </Reveal>
          </div>

          <div className="min-w-0">
            <Reveal className="g-noscroll -mx-1 flex gap-1 overflow-x-auto px-1 pb-1">
              <div className="flex gap-1 rounded-full bg-black/[0.04] p-1">
                {TABS.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    aria-pressed={tab === t.key}
                    onClick={() => setTab(t.key)}
                    className={cn("relative isolate shrink-0 rounded-full px-4 py-2 text-[13.5px] font-semibold transition-colors duration-300", tab === t.key ? "text-white" : "text-black/55 hover:text-black")}
                  >
                    {tab === t.key ? (
                      <motion.span layoutId="g-faq-tab" className="absolute inset-0 -z-10 rounded-full bg-[var(--g-ink)]" transition={{ type: "spring", stiffness: 380, damping: 34 }} />
                    ) : null}
                    {t.label}
                  </button>
                ))}
              </div>
            </Reveal>

            <motion.ul layout className="mt-6 flex flex-col gap-2.5">
              {items.map((item) => (
                <FaqItem key={item.q} item={item} open={open === item.q} onToggle={() => setOpen(open === item.q ? null : item.q)} />
              ))}
            </motion.ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
