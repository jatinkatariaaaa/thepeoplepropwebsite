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
        "rounded-2xl border bg-white/40 backdrop-blur-sm transition-all overflow-hidden",
        open
          ? "border-[#0c0c0c]/30 shadow-sm"
          : "border-[#0c0c0c]/10 hover:border-[#0c0c0c]/20",
      )}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left px-5 md:px-6 py-5 flex items-start gap-4 hover:bg-[#0c0c0c]/5 transition-colors"
      >
        <div
          className={cn(
            "grid place-items-center w-10 h-10 rounded-xl shrink-0 transition-colors",
            open
              ? "bg-[#0c0c0c] text-[#cbfb45]"
              : "bg-transparent text-[#0c0c0c] border border-[#0c0c0c]/20",
          )}
        >
          <Icon className="w-4 h-4" strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-[17px] text-[#0c0c0c] tracking-tight">
            {rule.title}
          </h3>
          <p className="mt-1.5 text-[13.5px] text-[#0c0c0c]/60 leading-relaxed font-medium">
            {rule.summary}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 transition-transform duration-300 mt-3 shrink-0",
            open
              ? "rotate-180 text-[#0c0c0c]"
              : "text-[#0c0c0c]/40",
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
            <div className="px-5 md:px-6 pb-5 pt-1 ml-14 border-t border-[#0c0c0c]/10">
              <ul className="mt-4 space-y-2.5 text-[13.5px] text-[#0c0c0c]/80 leading-relaxed font-medium">
                {rule.details.map((d, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="mt-2 w-1 h-1 rounded-full bg-[#0c0c0c] shrink-0" />
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