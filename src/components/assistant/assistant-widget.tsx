"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "@/components/IntentLink";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, LifeBuoy, MessageCircle, RotateCcw, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { isProgramKey, programDetails } from "@/data/catalogue";

/**
 * The support assistant, as a chat launcher in the corner of every page.
 * Any page can open it with:
 *   window.dispatchEvent(new CustomEvent("tpp:assistant", { detail: { open: true, question } }))
 */

type Msg = { role: "user" | "assistant"; content: string };

const STORE = "tpp-assistant-v1";
const EASE = [0.16, 1, 0.3, 1] as const;

const STARTERS = ["Which account type should I choose?", "How is the daily loss limit calculated?", "How does the monthly stipend work?", "When can I request my first payout?"];

function sessionId() {
  try {
    const existing = sessionStorage.getItem(`${STORE}-id`);
    if (existing) return existing;
    const id = crypto.randomUUID();
    sessionStorage.setItem(`${STORE}-id`, id);
    return id;
  } catch {
    return null;
  }
}

export function AssistantWidget({ supportHref = "/contact" }: { supportHref?: string }) {
  const pathname = usePathname() ?? "/";
  const programMatch = pathname.match(/^\/challenges\/([^/]+)/)?.[1];
  const program = programMatch && isProgramKey(programMatch) ? programMatch : null;

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesRef = useRef<Msg[]>([]);
  messagesRef.current = messages;

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORE);
      if (saved) setMessages(JSON.parse(saved) as Msg[]);
    } catch {
      /* a private window has no storage; the chat still works */
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORE, JSON.stringify(messages.slice(-24)));
    } catch {
      /* ignore */
    }
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || busy) return;
      const history: Msg[] = [...messagesRef.current, { role: "user", content: question }];
      setMessages([...history, { role: "assistant", content: "" }]);
      setInput("");
      setBusy(true);

      const write = (content: string) => setMessages([...history, { role: "assistant", content }]);
      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history, program, sessionId: sessionId() }),
        });
        if (!res.body) {
          write((await res.text()) || "Something went wrong. Please try again.");
        } else {
          const reader = res.body.getReader();
          const decoder = new TextDecoder();
          let answer = "";
          for (;;) {
            const { done, value } = await reader.read();
            if (done) break;
            answer += decoder.decode(value, { stream: true });
            write(answer);
          }
          if (!answer.trim()) write("I could not answer that. Please try rephrasing, or contact support.");
        }
      } catch {
        write("I could not reach the assistant. Check your connection and try again.");
      }
      setBusy(false);
    },
    [busy, program],
  );

  useEffect(() => {
    const onEvent = (e: Event) => {
      const detail = (e as CustomEvent<{ open?: boolean; question?: string }>).detail ?? {};
      if (detail.open !== false) setOpen(true);
      if (detail.question) void send(detail.question);
    };
    window.addEventListener("tpp:assistant", onEvent);
    return () => window.removeEventListener("tpp:assistant", onEvent);
  }, [send]);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-[70] flex flex-col items-end gap-3 sm:right-6 sm:bottom-6">
      <AnimatePresence>
        {open ? (
          <motion.div
            key="panel"
            role="dialog"
            aria-label="Support assistant"
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.32, ease: EASE }}
            className="pointer-events-auto flex h-[min(620px,calc(100dvh-7rem))] w-[min(400px,calc(100vw-2rem))] origin-bottom-right flex-col overflow-hidden rounded-[28px] bg-[#111514] text-white shadow-[0_40px_90px_-30px_rgba(0,0,0,0.75),inset_0_0_0_1px_rgba(255,255,255,0.09)]"
          >
            <header className="flex items-center gap-3 border-b border-white/[0.07] bg-[linear-gradient(180deg,#1b2120,#141817)] px-5 py-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] bg-[var(--g-lime,#cbfb45)] text-[#0e1110]">
                <Sparkles className="h-[18px] w-[18px]" strokeWidth={2.2} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[15px] leading-tight font-semibold tracking-[-0.01em]">TPP Assistant</p>
                <p className="mt-0.5 truncate text-[12px] text-white/50">{program ? `Answering for ${programDetails[program].name}` : "Answers from our published rulebook"}</p>
              </div>
              {messages.length ? (
                <button type="button" onClick={() => setMessages([])} aria-label="Start a new chat" className="grid h-9 w-9 place-items-center rounded-full text-white/50 transition-colors hover:bg-white/[0.08] hover:text-white">
                  <RotateCcw className="h-4 w-4" />
                </button>
              ) : null}
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="grid h-9 w-9 place-items-center rounded-full text-white/50 transition-colors hover:bg-white/[0.08] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </header>

            <div ref={scroller} aria-live="polite" className="flex-1 space-y-3 overflow-y-auto px-4 py-4 [scrollbar-width:thin]">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col justify-end">
                  <p className="text-[21px] leading-tight font-semibold tracking-[-0.03em]">
                    Ask about any account type, <span className="text-white/45">the rules or your payouts.</span>
                  </p>
                  <div className="mt-5 grid gap-2">
                    {STARTERS.map((s) => (
                      <button key={s} type="button" onClick={() => void send(s)} className="rounded-[16px] bg-white/[0.05] px-4 py-3 text-left text-[13.5px] text-white/80 ring-1 ring-white/[0.07] transition-colors hover:bg-white/[0.09] hover:text-white">
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((m, i) => (
                  <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                    <p
                      className={cn(
                        "max-w-[88%] rounded-[20px] px-4 py-2.5 text-[14px] leading-relaxed whitespace-pre-wrap",
                        m.role === "user" ? "rounded-br-[6px] bg-[var(--g-lime,#cbfb45)] text-[#0e1110]" : "rounded-bl-[6px] bg-white/[0.07] text-white/90",
                      )}
                    >
                      {m.content || (
                        <span className="inline-flex gap-1 py-1.5" aria-label="Thinking">
                          {[0, 1, 2].map((d) => (
                            <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/50" style={{ animationDelay: `${d * 0.15}s` }} />
                          ))}
                        </span>
                      )}
                    </p>
                  </div>
                ))
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void send(input);
              }}
              className="border-t border-white/[0.07] p-3"
            >
              <div className="flex items-end gap-2 rounded-[20px] bg-white/[0.06] p-1.5 pl-4 ring-1 ring-white/[0.08] focus-within:ring-[var(--g-lime,#cbfb45)]/60">
                <textarea
                  ref={inputRef}
                  rows={1}
                  value={input}
                  maxLength={2000}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send(input);
                    }
                  }}
                  placeholder="Type your question"
                  aria-label="Your question"
                  className="max-h-28 min-h-[40px] flex-1 resize-none bg-transparent py-2.5 text-[14px] text-white outline-none placeholder:text-white/35"
                />
                <button type="submit" disabled={busy || !input.trim()} aria-label="Send" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--g-lime,#cbfb45)] text-[#0e1110] transition-opacity disabled:opacity-35">
                  <ArrowUp className="h-4 w-4" strokeWidth={2.6} />
                </button>
              </div>
              <p className="mt-2.5 flex items-center justify-between gap-3 px-1 text-[11.5px] text-white/40">
                <span>It cannot see your account.</span>
                <Link href={supportHref} onClick={() => setOpen(false)} className="inline-flex items-center gap-1.5 font-medium text-white/65 hover:text-white">
                  <LifeBuoy className="h-3.5 w-3.5" /> Talk to a person
                </Link>
              </p>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close the assistant" : "Open the assistant"}
        className="pointer-events-auto group flex h-14 items-center gap-2.5 rounded-full bg-[#0e1110] pr-5 pl-4 text-white shadow-[0_18px_40px_-14px_rgba(0,0,0,0.7),inset_0_0_0_1px_rgba(255,255,255,0.12)] transition-transform duration-300 hover:-translate-y-0.5"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--g-lime,#cbfb45)] text-[#0e1110]">{open ? <X className="h-4 w-4" strokeWidth={2.4} /> : <MessageCircle className="h-4 w-4" strokeWidth={2.4} />}</span>
        <span className="text-[14px] font-semibold tracking-[-0.01em]">{open ? "Close" : "Ask TPP"}</span>
      </button>
    </div>
  );
}
