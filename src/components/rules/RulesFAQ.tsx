"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Accordion } from "@/components/ui/Accordion";
import { faq } from "@/data/faq";

export function RulesFAQ() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return faq;
    return faq.filter(
      (f) =>
        f.q.toLowerCase().includes(term) ||
        f.a.toLowerCase().includes(term),
    );
  }, [q]);

  return (
    <div>
      <label className="relative block mb-5">
        <span className="sr-only">Search FAQ</span>
        <Search
          className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0c0c0c]/40"
          strokeWidth={2.2}
        />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search the FAQ..."
          className="w-full h-12 pl-12 pr-4 rounded-full bg-white/50 border border-[#0c0c0c]/10 text-[14px] text-[#0c0c0c] placeholder:text-[#0c0c0c]/40 focus:border-[#0c0c0c]/30 focus:outline-none transition-colors"
        />
      </label>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-[#0c0c0c]/10 bg-white/40 p-8 text-center text-[14px] text-[#0c0c0c]/60 font-medium">
          No questions match &ldquo;{q}&rdquo;. Try a different keyword.
        </div>
      ) : (
        <Accordion items={filtered} />
      )}
    </div>
  );
}