"use client";

import { useId, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { EASE } from "../motion";

export type QA = { q: string; a: string; category?: string | null };

/** Accordion row on dark glass. */
export function DarkQA({ item, open, onToggle }: { item: QA; open: boolean; onToggle: () => void }) {
  const id = useId();
  return (
    <li className={cn("rounded-[22px] transition-colors duration-500", open ? "g-glass g-hair" : "bg-white/[0.03] hover:bg-white/[0.06]")}>
      <h3>
        <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={id} className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left">
          <span className={cn("text-[16.5px] font-semibold tracking-[-0.02em] transition-colors", open ? "text-white" : "text-white/80")}>{item.q}</span>
          <span
            className={cn(
              "grid h-9 w-9 shrink-0 place-items-center rounded-full transition-all duration-500 [transition-timing-function:var(--g-out)]",
              open ? "rotate-45 bg-[var(--g-lime)] text-[var(--g-ink)]" : "bg-white/[0.07] text-white/70",
            )}
          >
            <Plus className="h-4 w-4" strokeWidth={2.2} />
          </span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div id={id} key="a" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: EASE }} className="overflow-hidden">
            <p className="max-w-2xl px-6 pb-6 text-[15px] leading-relaxed whitespace-pre-line text-white/60">{item.a}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  );
}

/** Search box + category chips + accordion, on dark glass. */
export function QASearch({ items, placeholder = "Search the FAQ…" }: { items: QA[]; placeholder?: string }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");
  const cats = useMemo(() => Array.from(new Set(items.map((i) => i.category).filter((c): c is string => Boolean(c)))), [items]);
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return items.filter((i) => (cat === "all" || i.category === cat) && (!t || i.q.toLowerCase().includes(t) || i.a.toLowerCase().includes(t)));
  }, [items, q, cat]);
  const [open, setOpen] = useState<string | null>(null);
  const first = list[0]?.q ?? null;
  const current = open === "__none__" ? null : (open ?? first);

  return (
    <div>
      <label className="g-glass g-hair relative flex h-14 items-center rounded-full pr-5 pl-12">
        <span className="sr-only">Search the questions</span>
        <Search className="absolute left-5 h-4 w-4 text-white/45" strokeWidth={2.2} />
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(null);
          }}
          placeholder={placeholder}
          className="h-full w-full bg-transparent text-[15px] text-white outline-none placeholder:text-white/35"
        />
        <span className="g-num ml-3 shrink-0 text-[12.5px] text-white/40">{list.length} results</span>
      </label>
      {cats.length > 1 ? (
        <div className="g-noscroll -mx-1 mt-4 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {["all", ...cats].map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={cat === c}
              onClick={() => {
                setCat(c);
                setOpen(null);
              }}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold capitalize transition-colors duration-300",
                cat === c ? "bg-white text-[var(--g-ink)]" : "bg-white/[0.05] text-white/60 hover:bg-white/[0.09] hover:text-white",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      ) : null}
      {list.length ? (
        <ul className="mt-6 flex flex-col gap-2.5">
          {list.map((item) => (
            <DarkQA key={item.q} item={item} open={current === item.q} onToggle={() => setOpen(current === item.q ? "__none__" : item.q)} />
          ))}
        </ul>
      ) : (
        <p className="mt-6 rounded-[22px] bg-white/[0.03] p-8 text-center text-[14px] text-white/55">No questions match “{q}”. Try a different keyword.</p>
      )}
    </div>
  );
}
