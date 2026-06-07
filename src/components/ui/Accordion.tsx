"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AccordionItemData {
  q: string;
  a: string;
}

export function Accordion({
  items,
  className,
}: {
  items: AccordionItemData[];
  className?: string;
}) {
  const [open, setOpen] = React.useState<number | null>(0);

  return (
    <div
      className={cn(
        "divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-white shadow-[var(--shadow-sm)]",
        className,
      )}
    >
      {items.map((item, i) => {
        const isOpen = open === i;
        const id = `acc-${i}`;
        return (
          <div key={i}>
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`${id}-panel`}
              id={`${id}-button`}
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-start justify-between gap-6 text-left px-5 md:px-7 py-5 md:py-6 group hover:bg-[var(--ink-50)]/60 transition-colors"
            >
              <span className="text-[16px] md:text-[17px] font-medium text-[var(--ink-950)] pr-4 leading-snug">
                {item.q}
              </span>
              <span
                className={cn(
                  "shrink-0 mt-0.5 grid place-items-center w-8 h-8 rounded-full border transition-all duration-300",
                  isOpen
                    ? "bg-[var(--accent)] border-[var(--accent)] rotate-45"
                    : "bg-white border-[var(--border-strong)] group-hover:border-[var(--ink-700)]",
                )}
                aria-hidden="true"
              >
                <Plus
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isOpen ? "text-white" : "text-[var(--ink-700)]",
                  )}
                />
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  id={`${id}-panel`}
                  role="region"
                  aria-labelledby={`${id}-button`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="px-5 md:px-7 pb-6 text-[var(--ink-500)] text-[15px] leading-relaxed max-w-3xl">
                    {item.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}