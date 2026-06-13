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
        "divide-y divide-[#0c0c0c]/10 rounded-2xl border border-[#0c0c0c]/10 bg-transparent overflow-hidden",
        className,
      )}
    >
      {items.map((item, i) => {
        const isOpen = open === i;
        const id = `acc-${i}`;
        return (
          <div key={i} className="bg-white/40 backdrop-blur-sm transition-colors">
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`${id}-panel`}
              id={`${id}-button`}
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full flex items-start justify-between gap-6 text-left px-5 md:px-7 py-5 md:py-6 group hover:bg-[#0c0c0c]/5 transition-colors"
            >
              <span className="text-[16px] md:text-[17px] font-bold text-[#0c0c0c] pr-4 leading-snug">
                {item.q}
              </span>
              <span
                className={cn(
                  "shrink-0 mt-0.5 grid place-items-center w-8 h-8 rounded-full border transition-all duration-300",
                  isOpen
                    ? "bg-[#0c0c0c] border-[#0c0c0c] rotate-45"
                    : "bg-transparent border-[#0c0c0c]/20 group-hover:border-[#0c0c0c]",
                )}
                aria-hidden="true"
              >
                <Plus
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isOpen ? "text-[#cbfb45]" : "text-[#0c0c0c]",
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
                  <div className="px-5 md:px-7 pb-6 text-[#0c0c0c]/60 text-[15px] leading-relaxed max-w-3xl font-medium">
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