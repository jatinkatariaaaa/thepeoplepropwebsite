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
          className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-400)]"
          strokeWidth={2.2}
        />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search the FAQ..."
          className="w-full h-12 pl-12 pr-4 rounded-full bg-white border border-[var(--border-strong)] text-[14px] text-[var(--ink-950)] placeholder:text-[var(--ink-400)] focus:border-[var(--accent)] focus:outline-none transition-colors"
        />
      </label>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-white p-8 text-center text-[14px] text-[var(--ink-500)]">
          No questions match &ldquo;{q}&rdquo;. Try a different keyword.
        </div>
      ) : (
        <Accordion items={filtered} />
      )}
    </div>
  );
}