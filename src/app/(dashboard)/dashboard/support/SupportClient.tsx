"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, LifeBuoy, MessageSquarePlus, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Chip, Empty, PageTitle, Panel, PanelHead, Spinner, btn, field, fieldLabel, type Tone } from "@/components/dashboard/glass";

/** Support tickets: a trader opens one, an admin answers it from Admin → Support Tickets. */

type Ticket = { id: string; subject: string; status: string; priority: string; created_at: string; updated_at: string };
type Message = { id: string; sender_role: "user" | "admin"; message: string; created_at: string };

const STATUS: Record<string, { label: string; tone: Tone }> = {
  open: { label: "Open", tone: "amber" },
  in_progress: { label: "In progress", tone: "emerald" },
  resolved: { label: "Resolved", tone: "lime" },
  closed: { label: "Closed", tone: "neutral" },
};

const TOPICS = ["Payout", "Account or rules", "Payment or billing", "Identity verification", "Platform", "Something else"];
const when = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export function SupportClient() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [active, setActive] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [composing, setComposing] = useState(false);
  const [form, setForm] = useState({ topic: TOPICS[0], subject: "", message: "" });
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const thread = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return setLoading(false);
    setUser({ id: session.user.id, email: session.user.email ?? "" });
    const { data } = await supabase.from("support_tickets").select("id, subject, status, priority, created_at, updated_at").eq("user_id", session.user.id).order("updated_at", { ascending: false });
    setTickets((data ?? []) as Ticket[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const open = async (t: Ticket) => {
    setActive(t);
    setComposing(false);
    setMessages([]);
    const { data } = await supabase.from("ticket_messages").select("id, sender_role, message, created_at").eq("ticket_id", t.id).order("created_at");
    setMessages((data ?? []) as Message[]);
    requestAnimationFrame(() => thread.current?.scrollTo({ top: thread.current.scrollHeight }));
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (form.subject.trim().length < 4 || form.message.trim().length < 10) return setError("Add a subject and a few lines about what happened.");
    setBusy(true);
    setError(null);
    const { data: ticket, error: err } = await supabase
      .from("support_tickets")
      .insert({ user_id: user.id, user_email: user.email, subject: `[${form.topic}] ${form.subject.trim()}`.slice(0, 200), priority: form.topic === "Payout" || form.topic === "Payment or billing" ? "high" : "medium" })
      .select("id, subject, status, priority, created_at, updated_at")
      .single();
    if (err || !ticket) {
      setBusy(false);
      return setError(err?.message || "Could not open the ticket.");
    }
    await supabase.from("ticket_messages").insert({ ticket_id: ticket.id, sender_id: user.id, sender_role: "user", message: form.message.trim().slice(0, 5000) });
    setBusy(false);
    setForm({ topic: TOPICS[0], subject: "", message: "" });
    setTickets((prev) => [ticket as Ticket, ...prev]);
    void open(ticket as Ticket);
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !active || !reply.trim()) return;
    setBusy(true);
    const { data, error: err } = await supabase
      .from("ticket_messages")
      .insert({ ticket_id: active.id, sender_id: user.id, sender_role: "user", message: reply.trim().slice(0, 5000) })
      .select("id, sender_role, message, created_at")
      .single();
    setBusy(false);
    if (err || !data) return setError(err?.message || "Could not send the message.");
    setMessages((prev) => [...prev, data as Message]);
    setReply("");
    requestAnimationFrame(() => thread.current?.scrollTo({ top: thread.current.scrollHeight, behavior: "smooth" }));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageTitle lead="Support" lede="Open a ticket and a person on our team will answer, usually within one business day. For rule questions the assistant answers straight away.">
        <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("tpp:assistant", { detail: { open: true } }))} className={cn(btn.light, btn.sm)}>
          <Sparkles className="h-4 w-4" /> Ask the assistant
        </button>
        <button type="button" onClick={() => { setComposing(true); setActive(null); setError(null); }} className={cn(btn.ink, btn.sm)}>
          <MessageSquarePlus className="h-4 w-4" /> New ticket
        </button>
      </PageTitle>

      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Panel className={cn("self-start overflow-hidden", (active || composing) && "hidden lg:block")}>
          <PanelHead as="h3" title="Your tickets" sub={`${tickets.length} total`} />
          {tickets.length === 0 ? (
            <p className="px-5 py-8 text-center text-[13px] text-[var(--g-muted-ink)]">No tickets yet.</p>
          ) : (
            <ul className="max-h-[560px] overflow-y-auto p-1.5 [scrollbar-width:thin]">
              {tickets.map((t) => (
                <li key={t.id}>
                  <button type="button" onClick={() => void open(t)} className={cn("w-full cursor-pointer rounded-[16px] px-3.5 py-3 text-left transition-colors", active?.id === t.id ? "bg-black/[0.06]" : "hover:bg-black/[0.03]")}>
                    <span className="flex items-center justify-between gap-2">
                      <Chip tone={STATUS[t.status]?.tone ?? "neutral"}>{STATUS[t.status]?.label ?? t.status}</Chip>
                      <span className="text-[11.5px] text-[var(--g-muted-ink)]">{when(t.updated_at)}</span>
                    </span>
                    <span className="mt-1.5 line-clamp-2 block text-[13.5px] font-semibold text-[var(--g-ink)]">{t.subject}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel className="min-h-[420px] overflow-hidden">
          {composing ? (
            <form onSubmit={create}>
              <PanelHead as="h3" title="New ticket" sub="The more detail you give, the faster we can help. Include the account ID if it is about one account." />
              <div className="grid gap-4 p-5 sm:p-6">
                <div>
                  <span className={fieldLabel}>Topic</span>
                  <div className="flex flex-wrap gap-1.5">
                    {TOPICS.map((t) => (
                      <button key={t} type="button" aria-pressed={form.topic === t} onClick={() => setForm({ ...form, topic: t })} className={cn("h-9 cursor-pointer rounded-full px-3.5 text-[13px] font-medium ring-1 transition-colors", form.topic === t ? "bg-[var(--g-ink)] text-white ring-transparent" : "bg-white/60 text-[var(--g-muted-ink)] ring-black/10 hover:text-[var(--g-ink)]")}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <label>
                  <span className={fieldLabel}>Subject</span>
                  <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} maxLength={160} className={field()} />
                </label>
                <label>
                  <span className={fieldLabel}>What happened?</span>
                  <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={7} maxLength={5000} className={cn(field(), "h-auto! resize-y py-3 leading-relaxed")} />
                </label>
                {error ? <p className="text-[13px] font-medium text-red-600">{error}</p> : null}
                <div className="flex justify-end gap-2.5">
                  <button type="button" onClick={() => setComposing(false)} className={cn(btn.light, btn.sm)}>
                    Cancel
                  </button>
                  <button type="submit" disabled={busy} className={cn(btn.lime, btn.sm)}>
                    {busy ? "Sending…" : "Open ticket"}
                  </button>
                </div>
              </div>
            </form>
          ) : active ? (
            <div className="flex h-full max-h-[680px] flex-col">
              <div className="flex items-center gap-3 border-b border-black/[0.06] px-5 py-4">
                <button type="button" aria-label="Back to tickets" onClick={() => setActive(null)} className="grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-black/[0.05] text-[var(--g-ink)] lg:hidden">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold text-[var(--g-ink)]">{active.subject}</p>
                  <p className="text-[12px] text-[var(--g-muted-ink)]">Opened {when(active.created_at)}</p>
                </div>
                <Chip tone={STATUS[active.status]?.tone ?? "neutral"}>{STATUS[active.status]?.label ?? active.status}</Chip>
              </div>
              <div ref={thread} className="flex-1 space-y-3 overflow-y-auto p-5 [scrollbar-width:thin]">
                {messages.map((m) => (
                  <div key={m.id} className={cn("flex", m.sender_role === "user" ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[85%] rounded-[20px] px-4 py-3", m.sender_role === "user" ? "rounded-br-[6px] bg-[var(--g-ink)] text-white" : "rounded-bl-[6px] bg-black/[0.05] text-[var(--g-ink)]")}>
                      <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{m.message}</p>
                      <p className={cn("mt-1.5 text-[11px]", m.sender_role === "user" ? "text-white/50" : "text-[var(--g-muted-ink)]")}>
                        {m.sender_role === "admin" ? "TPP Support · " : ""}
                        {when(m.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {active.status === "closed" ? (
                <p className="border-t border-black/[0.06] px-5 py-4 text-center text-[13px] text-[var(--g-muted-ink)]">This ticket is closed. Open a new one if you need more help.</p>
              ) : (
                <form onSubmit={send} className="flex items-end gap-2 border-t border-black/[0.06] p-3">
                  <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={1} placeholder="Write a reply" aria-label="Reply" className={cn(field(), "h-auto! max-h-32 min-h-12 flex-1 resize-none py-3")} />
                  <button type="submit" disabled={busy || !reply.trim()} aria-label="Send" className={cn(btn.lime, "h-12! w-12! px-0!")}>
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          ) : (
            <Empty icon={LifeBuoy} title="How can we help?" action={<button type="button" onClick={() => setComposing(true)} className={cn(btn.lime, btn.sm)}>Open a ticket</button>}>
              Choose a ticket on the left, or open a new one. You can also email support@thepeopleprop.com.
            </Empty>
          )}
        </Panel>
      </div>
    </div>
  );
}
