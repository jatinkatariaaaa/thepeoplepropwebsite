"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Target,
  ShieldAlert,
  Shield,
  Scale,
  Newspaper,
  CalendarDays,
  TrendingUp,
  RotateCcw,
  ChevronDown,
} from "lucide-react";
import type { Rule } from "@/data/rules";
import { cn } from "@/lib/utils";

const iconMap = {
  target: Target,
  alert: ShieldAlert,
  shield: Shield,
  scale: Scale,
  newspaper: Newspaper,
  calendar: CalendarDays,
  trending: TrendingUp,
  refund: RotateCcw,
};

export function RuleCard({ rule }: { rule: Rule }) {
  const [open, setOpen] = useState(false);
  const Icon = iconMap[rule.icon];

  return (
    <div
      className={cn(
        "rounded-2xl border bg-white transition-all",
        open
          ? "border-[var(--accent)]/45 shadow-[0_18px_36px_-22px_rgba(14,124,92,0.35)]"
          : "border-[var(--border)] hover:border-[var(--border-strong)] shadow-[0_1px_2px_rgba(11,15,26,0.04)]",
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-5 md:px-6 py-5 flex items-start gap-4"
      >
        <div
          className={cn(
            "grid place-items-center w-10 h-10 rounded-xl shrink-0 transition-colors",
            open
              ? "bg-[var(--accent)] text-white"
              : "bg-[var(--accent-50)] text-[var(--accent-700)] border border-[rgba(14,124,92,0.18)]",
          )}
        >
          <Icon className="w-4 h-4" strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-[17px] text-[var(--ink-950)] tracking-tight">
            {rule.title}
          </h3>
          <p className="mt-1.5 text-[13.5px] text-[var(--ink-500)] leading-relaxed">
            {rule.summary}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform duration-300 mt-3 shrink-0",
            open
              ? "rotate-180 text-[var(--accent-700)]"
              : "text-[var(--ink-400)]",
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 md:px-6 pb-5 pt-1 ml-14 border-t border-[var(--border)]">
              <ul className="mt-4 space-y-2.5 text-[13.5px] text-[var(--ink-700)] leading-relaxed">
                {rule.details.map((d, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-2 w-1 h-1 rounded-full bg-[var(--accent)] shrink-0" />
                    <span>{d}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}