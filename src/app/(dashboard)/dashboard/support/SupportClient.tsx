"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, LifeBuoy, MessageSquarePlus, Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { MAX_MESSAGE, MAX_SUBJECT, stamp, timeAgo, type Sender, type TicketStatus } from "@/lib/support";
import { Chip, Empty, PageTitle, Panel, PanelHead, Spinner, btn, field, fieldLabel, type Tone } from "@/components/dashboard/glass";

/**
 * Support tickets: a trader opens one here and the team answers from Admin → Support.
 * Replies show up in the thread (it refreshes itself) and in the notification bell, which
 * links back with ?ticket=<id>. ?new=1 opens a blank ticket.
 */

type Ticket = {
  id: string;
  subject: string;
  status: TicketStatus;
  priority: string;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
  last_sender: Sender | null;
  user_unread: boolean | null;
};
type Message = { id: string; sender_role: Sender; message: string; created_at: string };

const TICKET_FIELDS = "id, subject, status, priority, created_at, updated_at, last_message_at, last_sender, user_unread";

/** Status in the trader's terms: whose turn it is. */
function badge(t: Ticket): { label: string; tone: Tone } {
  if (t.status === "resolved") return { label: "Resolved", tone: "lime" };
  if (t.status === "closed") return { label: "Closed", tone: "neutral" };
  if (t.last_sender === "admin") return { label: t.user_unread ? "New reply" : "Answered", tone: "emerald" };
  return { label: "Waiting for support", tone: "amber" };
}

const TOPICS = ["Payout", "Account or rules", "Payment or billing", "Identity verification", "Platform", "Contest or affiliate", "Something else"];

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
  const activeId = active?.id ?? null;

  const scrollDown = (smooth = false) => requestAnimationFrame(() => thread.current?.scrollTo({ top: thread.current.scrollHeight, behavior: smooth ? "smooth" : "auto" }));

  const fetchTickets = useCallback(async (uid: string) => {
    const { data } = await supabase.from("support_tickets").select(TICKET_FIELDS).eq("user_id", uid).order("updated_at", { ascending: false });
    const rows = (data ?? []) as Ticket[];
    setTickets(rows);
    return rows;
  }, []);

  const fetchMessages = useCallback(async (ticketId: string) => {
    const { data } = await supabase.from("ticket_messages").select("id, sender_role, message, created_at").eq("ticket_id", ticketId).order("created_at");
    return (data ?? []) as Message[];
  }, []);

  /** Mark the ticket read, locally and in the database. */
  const markSeen = useCallback(async (t: Ticket) => {
    if (!t.user_unread) return;
    setTickets((prev) => prev.map((x) => (x.id === t.id ? { ...x, user_unread: false } : x)));
    setActive((a) => (a?.id === t.id ? { ...a, user_unread: false } : a));
    await supabase.rpc("support_ticket_seen", { p_ticket: t.id });
  }, []);

  const open = useCallback(
    async (t: Ticket) => {
      setActive(t);
      setComposing(false);
      setError(null);
      setMessages([]);
      const url = new URL(window.location.href);
      url.searchParams.set("ticket", t.id);
      url.searchParams.delete("new");
      window.history.replaceState(window.history.state, "", url);
      setMessages(await fetchMessages(t.id));
      scrollDown();
      void markSeen(t);
    },
    [fetchMessages, markSeen],
  );

  const startNew = () => {
    setComposing(true);
    setActive(null);
    setError(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("ticket");
    window.history.replaceState(window.history.state, "", url);
  };

  const cancelNew = () => {
    setComposing(false);
    const url = new URL(window.location.href);
    url.searchParams.delete("new");
    window.history.replaceState(window.history.state, "", url);
  };

  const back = () => {
    setActive(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("ticket");
    window.history.replaceState(window.history.state, "", url);
  };

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return setLoading(false);
      setUser({ id: session.user.id, email: session.user.email ?? "" });
      await fetchTickets(session.user.id);
      setLoading(false);
    })();
  }, [fetchTickets]);

  // Links in: ?ticket=<id> from a notification (also while this page is already open), ?new=1 from the header.
  const params = useSearchParams();
  const wantedTicket = params.get("ticket");
  const wantsNew = params.get("new") === "1";
  useEffect(() => {
    if (loading || !user || !wantedTicket || wantedTicket === activeId) return;
    const found = tickets.find((t) => t.id === wantedTicket);
    if (found) void open(found);
    else void fetchTickets(user.id).then((rows) => {
      const fresh = rows.find((t) => t.id === wantedTicket);
      if (fresh) void open(fresh);
    });
    // react to the address only, not to every list refresh
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, user, wantedTicket]);
  // ?new=1 shows the blank ticket until the trader opens a ticket or cancels
  const showCompose = composing || (wantsNew && !wantedTicket && !active);

  // replies from the team turn up without a reload while the page is open
  useEffect(() => {
    if (!user) return;
    const tick = async () => {
      if (document.visibilityState !== "visible") return;
      const rows = await fetchTickets(user.id);
      if (!activeId) return;
      const fresh = rows.find((t) => t.id === activeId);
      if (!fresh) return;
      setActive((a) => (a?.id === fresh.id ? { ...a, ...fresh } : a));
      const latest = await fetchMessages(activeId);
      setMessages((prev) => {
        if (latest.length === prev.length) return prev;
        scrollDown(true);
        return latest;
      });
      void markSeen(fresh);
    };
    const timer = setInterval(() => void tick(), 15000);
    return () => clearInterval(timer);
  }, [user, activeId, fetchTickets, fetchMessages, markSeen]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || busy) return;
    if (form.subject.trim().length < 4 || form.message.trim().length < 10) return setError("Add a subject and a few lines about what happened.");
    setBusy(true);
    setError(null);
    const { data: ticket, error: err } = await supabase
      .from("support_tickets")
      .insert({
        user_id: user.id,
        user_email: user.email,
        subject: `[${form.topic}] ${form.subject.trim()}`.slice(0, MAX_SUBJECT + 30),
        priority: form.topic === "Payout" || form.topic === "Payment or billing" ? "high" : "medium",
      })
      .select(TICKET_FIELDS)
      .single();
    if (err || !ticket) {
      setBusy(false);
      return setError(err?.message || "Could not open the ticket.");
    }
    const { error: msgErr } = await supabase.from("ticket_messages").insert({ ticket_id: ticket.id, sender_id: user.id, sender_role: "user", message: form.message.trim().slice(0, MAX_MESSAGE) });
    setBusy(false);
    if (msgErr) return setError(msgErr.message || "The ticket was opened but your message didn't send. Open it and try again.");
    setForm({ topic: TOPICS[0], subject: "", message: "" });
    const rows = await fetchTickets(user.id);
    void open(rows.find((t) => t.id === ticket.id) ?? (ticket as Ticket));
  };

  const send = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user || !active || !reply.trim() || busy) return;
    setBusy(true);
    const { data, error: err } = await supabase
      .from("ticket_messages")
      .insert({ ticket_id: active.id, sender_id: user.id, sender_role: "user", message: reply.trim().slice(0, MAX_MESSAGE) })
      .select("id, sender_role, message, created_at")
      .single();
    setBusy(false);
    if (err || !data) return setError(err?.message || "Could not send the message.");
    setError(null);
    setMessages((prev) => [...prev, data as Message]);
    setReply("");
    scrollDown(true);
    // the ticket moves to "waiting for support" (and reopens if it was resolved)
    const rows = await fetchTickets(user.id);
    const fresh = rows.find((t) => t.id === active.id);
    if (fresh) setActive(fresh);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  const unread = tickets.filter((t) => t.user_unread).length;

  return (
    <div className="mx-auto max-w-5xl">
      <PageTitle lead="Support" lede="Open a ticket and a person on our team will answer, usually within one business day. Replies appear here and in your notifications. For rule questions the assistant answers straight away.">
        <button type="button" onClick={() => window.dispatchEvent(new CustomEvent("tpp:assistant", { detail: { open: true } }))} className={cn(btn.light, btn.sm)}>
          <Sparkles className="h-4 w-4" /> Ask the assistant
        </button>
        <button type="button" onClick={startNew} className={cn(btn.ink, btn.sm)}>
          <MessageSquarePlus className="h-4 w-4" /> New ticket
        </button>
      </PageTitle>

      <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Panel className={cn("self-start overflow-hidden", (active || showCompose) && "hidden lg:block")}>
          <PanelHead as="h3" title="Your tickets" sub={unread ? `${unread} with a new reply` : `${tickets.length} total`} />
          {tickets.length === 0 ? (
            <p className="px-5 py-8 text-center text-[13px] text-[var(--g-muted-ink)]">No tickets yet.</p>
          ) : (
            <ul className="max-h-[560px] overflow-y-auto p-1.5 [scrollbar-width:thin]">
              {tickets.map((t) => {
                const b = badge(t);
                return (
                  <li key={t.id}>
                    <button type="button" onClick={() => void open(t)} className={cn("w-full cursor-pointer rounded-[16px] px-3.5 py-3 text-left transition-colors", active?.id === t.id ? "bg-black/[0.06]" : "hover:bg-black/[0.03]")}>
                      <span className="flex items-center justify-between gap-2">
                        <Chip tone={b.tone}>
                          {t.user_unread ? <span className="h-1.5 w-1.5 rounded-full bg-current" /> : null}
                          {b.label}
                        </Chip>
                        <span className="text-[11.5px] text-[var(--g-muted-ink)]">{timeAgo(t.last_message_at ?? t.updated_at)}</span>
                      </span>
                      <span className={cn("mt-1.5 line-clamp-2 block text-[13.5px] text-[var(--g-ink)]", t.user_unread ? "font-bold" : "font-semibold")}>{t.subject}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>

        <Panel className="min-h-[420px] overflow-hidden">
          {showCompose ? (
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
                  <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} maxLength={MAX_SUBJECT} className={field()} />
                </label>
                <label>
                  <span className={fieldLabel}>What happened?</span>
                  <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={7} maxLength={MAX_MESSAGE} className={cn(field(), "h-auto! resize-y py-3 leading-relaxed")} />
                </label>
                {error ? <p className="text-[13px] font-medium text-red-600">{error}</p> : null}
                <div className="flex justify-end gap-2.5">
                  <button type="button" onClick={cancelNew} className={cn(btn.light, btn.sm)}>
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
                <button type="button" aria-label="Back to tickets" onClick={back} className="grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-black/[0.05] text-[var(--g-ink)] lg:hidden">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-semibold text-[var(--g-ink)]">{active.subject}</p>
                  <p className="text-[12px] text-[var(--g-muted-ink)]">
                    Ticket #{active.id.slice(0, 8)} · opened {stamp(active.created_at)}
                  </p>
                </div>
                <Chip tone={badge(active).tone}>{badge(active).label}</Chip>
              </div>
              <div ref={thread} className="flex-1 space-y-3 overflow-y-auto p-5 [scrollbar-width:thin]">
                {messages.map((m) => (
                  <div key={m.id} className={cn("flex", m.sender_role === "user" ? "justify-end" : "justify-start")}>
                    <div className={cn("max-w-[85%] rounded-[20px] px-4 py-3", m.sender_role === "user" ? "rounded-br-[6px] bg-[var(--g-ink)] text-white" : "rounded-bl-[6px] bg-black/[0.05] text-[var(--g-ink)]")}>
                      <p className="text-[14px] leading-relaxed break-words whitespace-pre-wrap">{m.message}</p>
                      <p className={cn("mt-1.5 text-[11px]", m.sender_role === "user" ? "text-white/50" : "text-[var(--g-muted-ink)]")}>
                        {m.sender_role === "admin" ? "TPP Support · " : ""}
                        {stamp(m.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
                {active.last_sender === "user" && active.status !== "resolved" && active.status !== "closed" ? (
                  <p className="pt-1 text-center text-[12px] text-[var(--g-muted-ink)]">We&apos;ve got your message. You&apos;ll see our reply here and in your notifications.</p>
                ) : null}
              </div>
              {active.status === "resolved" || active.status === "closed" ? (
                <p className="border-t border-black/[0.06] px-5 pt-3 text-[12.5px] text-[var(--g-muted-ink)]">This ticket is {active.status}. Write below if you still need help and it opens again.</p>
              ) : null}
              <form onSubmit={(e) => void send(e)} className="flex items-end gap-2 border-t border-black/[0.06] p-3">
                <textarea value={reply} onChange={(e) => setReply(e.target.value)} rows={1} maxLength={MAX_MESSAGE} placeholder="Write a reply" aria-label="Reply" className={cn(field(), "h-auto! max-h-32 min-h-12 flex-1 resize-none py-3")} />
                <button type="submit" disabled={busy || !reply.trim()} aria-label="Send" className={cn(btn.lime, "h-12! w-12! px-0!")}>
                  <Send className="h-4 w-4" />
                </button>
              </form>
              {error ? <p className="px-5 pb-3 text-[12.5px] font-medium text-red-600">{error}</p> : null}
            </div>
          ) : (
            <Empty icon={LifeBuoy} title="How can we help?" action={<button type="button" onClick={startNew} className={cn(btn.lime, btn.sm)}>Open a ticket</button>}>
              Choose a ticket on the left, or open a new one. You can also email support@thepeopleprop.com.
            </Empty>
          )}
        </Panel>
      </div>
    </div>
  );
}
