"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Container, Eyebrow, SectionHeading } from "./primitives";
import { Reveal } from "@/components/v2/motion";

const FAQS = [
  {
    q: "How quickly do payouts actually arrive?",
    a: "Requests are reviewed continuously rather than in a weekly batch. Our median transfer time last quarter was under twelve hours, and the slowest case was two business days during a bank holiday.",
  },
  {
    q: "Is there really no consistency rule?",
    a: "Correct. There is no minimum trading day requirement, no cap on how much of your profit can come from a single day, and no restriction on lot sizing beyond the drawdown limits published on your account.",
  },
  {
    q: "What happens if I breach?",
    a: "The account closes at the breach level and your funded agreement ends. If the breach was caused by a platform or data outage on our side, we reissue the account at no cost.",
  },
  {
    q: "How does the 150% fee refund work?",
    a: "Once your first payout clears, we return your original evaluation fee plus fifty percent on top, paid alongside that first withdrawal. It is automatic — there is nothing to claim.",
  },
  {
    q: "Can I hold trades over the weekend or through news?",
    a: "Yes to both, on every account type. Expert advisors, hedging and copy trading across your own accounts are all permitted as well.",
  },
  {
    q: "How far can I scale?",
    a: "Every 10% gained on a funded account unlocks a 40% capital increase, reviewed automatically, up to a ceiling of $2,000,000 in allocated capital.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative isolate overflow-hidden py-28 sm:py-36">
      <Container>
        <div className="grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-4">
            <div className="flex flex-col gap-5 lg:sticky lg:top-28">
              <Eyebrow>Questions</Eyebrow>
              <SectionHeading className="text-3xl sm:text-4xl">
                Everything we get asked twice.
              </SectionHeading>
              <p className="text-[13.5px] leading-relaxed text-muted-foreground">
                Still unsure?{" "}
                <a
                  href="#cta"
                  className="text-foreground underline decoration-white/20 underline-offset-4 transition-colors hover:decoration-white/60"
                >
                  Talk to a human
                </a>{" "}
                — we answer on weekends too.
              </p>
            </div>
          </Reveal>

          <div className="lg:col-span-8">
            <ul className="flex flex-col">
              {FAQS.map((item, i) => {
                const isOpen = open === i;
                return (
                  <li key={item.q} className="border-b border-border first:border-t">
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      className="group flex w-full items-start justify-between gap-6 py-6 text-left"
                    >
                      <span
                        className={cn(
                          "font-heading text-[16.5px] transition-colors duration-300",
                          isOpen
                            ? "text-foreground"
                            : "text-foreground/70 group-hover:text-foreground",
                        )}
                      >
                        {item.q}
                      </span>
                      <Plus
                        aria-hidden="true"
                        className={cn(
                          "mt-1 h-4 w-4 shrink-0 transition-all duration-300",
                          isOpen
                            ? "rotate-45 text-highlight"
                            : "text-muted-foreground",
                        )}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen ? (
                        <motion.div
                          key="body"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            duration: 0.4,
                            ease: [0.21, 0.47, 0.32, 0.98],
                          }}
                          className="overflow-hidden"
                        >
                          <p className="max-w-2xl pr-10 pb-7 text-[13.5px] leading-relaxed text-muted-foreground text-pretty">
                            {item.a}
                          </p>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </Container>
    </section>
  );
}
