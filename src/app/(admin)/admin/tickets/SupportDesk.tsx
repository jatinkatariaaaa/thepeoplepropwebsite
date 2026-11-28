"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Link from "@/components/IntentLink";
import { ArrowLeft, CheckCircle2, Inbox, LifeBuoy, MessageSquarePlus, RotateCcw, Search, Send, UserRound, X, XCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Chip, Empty, PageTitle, Panel, PanelHead, SelectChevron, Spinner, btn, field, fieldLabel, selectField, type Tone } from "@/components/dashboard/glass";
import {
  DESK_VIEWS,
  MAX_MESSAGE,
  MAX_SUBJECT,
  PRIORITY_LABEL,
  STATUS_LABEL,
  TICKET_PRIORITIES,
  stamp,
  timeAgo,
  type DeskTicket,
  type DeskUser,
  type DeskView,
  type TicketMessage,
  type TicketPriority,
  type TicketRow,
  type TicketStatus,
} from "@/lib/support";

const STATUS_TONE: Record<TicketStatus, Tone> = { open: "amber", in_progress: "emerald", resolved: "lime", closed: "neutral" };
const PRIORITY_TONE: Record<TicketPriority, Tone> = { low: "neutral", medium: "neutral", high: "amber", urgent: "red" };

type Detail = { ticket: TicketRow; messages: TicketMessage[]; user: DeskUser | null };

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: "no-store", ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as { error?: string }).error || "Something went wrong");
  return json as T;
}

/** Keep the address bar on the open ticket without remounting the page. */
function showInUrl(id: string | null) {
  const path = id ? `/admin/tickets/${id}` : "/admin/tickets";
  if (window.location.pathname !== path) window.history.replaceState(window.history.state, "", path);
}

export function SupportDesk({ initialId = null }: { initialId?: string | null }) {
  const [view, setView] = useState<DeskView>("needs_reply");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [tickets, setTickets] = useState<DeskTicket[]>([]);
  const [counts, setCounts] = useState<Partial<Record<DeskView, number>>>({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  // which view and search the list on screen belongs to; anything else means it is loading
  const [listedFor, setListedFor] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(initialId);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [composing, setComposing] = useState(false);

  // a search waits for the typing to settle
  useEffect(() => {
    const t = setTimeout(() => setSearch(query.trim()), 300);
    return () => clearTimeout(t);
  }, [query]);

  const listKey = `${view}|${search}`;
  const listLoading = listedFor !== listKey;

  const loadList = useCallback(
    async (opts: { page?: number; quiet?: boolean } = {}) => {
      const p = opts.page ?? 1;
      try {
        const params = new URLSearchParams({ view, page: String(p) });
        if (search) params.set("q", search);
        const data = await api<{ tickets: DeskTicket[]; total: number; counts: Record<DeskView, number> }>(`/api/admin/tickets?${params}`);
        setTickets((prev) => (p > 1 ? [...prev, ...data.tickets.filter((t) => !prev.some((x) => x.id === t.id))] : data.tickets));
        setTotal(data.total);
        setCounts(data.counts);
        setPage(p);
      } catch (e) {
        if (!opts.quiet) toast.error(e instanceof Error ? e.message : "Couldn't load tickets");
      } finally {
        setListedFor(`${view}|${search}`);
      }
    },
    [view, search],
  );

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const loadDetail = useCallback(async (id: string, quiet = false) => {
    try {
      const data = await api<Detail>(`/api/admin/tickets/${id}`);
      setDetail(data);
      // opening it clears its unread dot in the list
      setTickets((prev) => prev.map((t) => (t.id === id ? { ...t, admin_unread: false } : t)));
    } catch (e) {
      if (!quiet) {
        toast.error(e instanceof Error ? e.message : "Couldn't open the ticket");
        setSelected(null);
        showInUrl(null);
      }
    }
  }, []);

  useEffect(() => {
    if (selected) void loadDetail(selected);
  }, [selected, loadDetail]);

  // the conversation on screen is the selected ticket's, or nothing yet
  const shownDetail = detail && detail.ticket.id === selected ? detail : null;

  // new messages and tickets turn up without a reload
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState !== "visible") return;
      void loadList({ quiet: true });
      if (selected) void loadDetail(selected, true);
    };
    const timer = setInterval(tick, 20000);
    return () => clearInterval(timer);
  }, [loadList, loadDetail, selected]);

  const open = (id: string) => {
    setComposing(false);
    setSelected(id);
    showInUrl(id);
  };
  const close = () => {
    setSelected(null);
    showInUrl(null);
  };

  const applyTicket = (ticket: TicketRow) => {
    setDetail((d) => (d && d.ticket.id === ticket.id ? { ...d, ticket } : d));
    setTickets((prev) => prev.map((t) => (t.id === ticket.id ? { ...t, ...ticket } : t)));
  };

  const update = async (patch: { status?: TicketStatus; priority?: TicketPriority }) => {
    if (!shownDetail) return;
    try {
      const data = await api<{ ticket: TicketRow }>(`/api/admin/tickets/${shownDetail.ticket.id}`, { method: "PATCH", body: JSON.stringify(patch) });
      applyTicket(data.ticket);
      toast.success(patch.status ? `Marked ${STATUS_LABEL[patch.status].toLowerCase()}` : "Priority updated");
      void loadList({ quiet: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't update the ticket");
    }
  };

  const sent = (data: Detail) => {
    setDetail(data);
    applyTicket(data.ticket);
    void loadList({ quiet: true });
  };

  const showList = !selected && !composing;

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageTitle
        lead="Support"
        fade="desk"
        lede="Tickets traders open from their dashboard. Your reply appears on their Support page and in their notifications straight away."
      >
        <button type="button" onClick={() => { setComposing(true); setSelected(null); showInUrl(null); }} className={cn(btn.ink, btn.sm)}>
          <MessageSquarePlus className="h-4 w-4" /> Message a trader
        </button>
      </PageTitle>

      <div className="grid gap-4 xl:grid-cols-[400px_minmax(0,1fr)]">
        {/* inbox */}
        <Panel className={cn("flex min-h-[560px] flex-col self-start overflow-hidden xl:sticky xl:top-4 xl:max-h-[calc(100vh-2rem)]", !showList && "hidden xl:flex")}>
          <div className="space-y-3 border-b border-black/[0.06] p-4">
            <div className="flex gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:none]">
              {DESK_VIEWS.map((d) => (
                <button
                  key={d.key}
                  type="button"
                  title={d.hint || undefined}
                  aria-pressed={view === d.key}
                  onClick={() => setView(d.key)}
                  className={cn(
                    "inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 text-[12.5px] font-semibold ring-1 transition-colors",
                    view === d.key ? "bg-[var(--g-ink)] text-white ring-transparent" : "bg-white/60 text-[var(--g-muted-ink)] ring-black/10 hover:text-[var(--g-ink)]",
                  )}
                >
                  {d.label}
                  {counts[d.key] !== undefined ? (
                    <span className={cn("g-num rounded-full px-1.5 text-[11px]", view === d.key ? "bg-white/15" : d.key === "needs_reply" && counts[d.key] ? "bg-amber-400/25 text-amber-900" : "bg-black/[0.05]")}>
                      {counts[d.key]}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
            <label className="relative block">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-black/35" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search subject or email" aria-label="Search tickets" className={cn(field(), "h-10! pl-10 text-[13.5px]")} />
            </label>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-1.5 [scrollbar-width:thin]">
            {listLoading ? (
              <div className="flex justify-center py-16">
                <Spinner />
              </div>
            ) : tickets.length === 0 ? (
              <Empty icon={Inbox} title={view === "needs_reply" ? "Nothing waiting on you" : "No tickets here"}>
                {view === "needs_reply" ? "Every ticket has an answer. New ones appear here as traders write in." : "Try another view or search."}
              </Empty>
            ) : (
              <ul>
                {tickets.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => open(t.id)}
                      className={cn("relative w-full cursor-pointer rounded-[16px] px-3.5 py-3 text-left transition-colors", selected === t.id ? "bg-black/[0.06]" : "hover:bg-black/[0.03]")}
                    >
                      <span className="flex items-center gap-2">
                        {t.admin_unread ? <span aria-label="New message" className="h-2 w-2 shrink-0 rounded-full bg-[var(--g-emerald)]" /> : null}
                        <span className={cn("min-w-0 flex-1 truncate text-[13px]", t.admin_unread ? "font-semibold text-[var(--g-ink)]" : "text-[var(--g-muted-ink)]")}>{t.user_name || t.user_email}</span>
                        <span className="shrink-0 text-[11.5px] text-[var(--g-muted-ink)]">{timeAgo(t.last_message_at ?? t.created_at)}</span>
                      </span>
                      <span className="mt-1 line-clamp-1 block text-[13.5px] font-semibold text-[var(--g-ink)]">{t.subject}</span>
                      {t.preview ? <span className="mt-0.5 line-clamp-2 block text-[12.5px] leading-snug text-[var(--g-muted-ink)]">{t.preview}</span> : null}
                      <span className="mt-2 flex flex-wrap items-center gap-1.5">
                        <Chip tone={STATUS_TONE[t.status]}>{STATUS_LABEL[t.status]}</Chip>
                        {t.priority === "high" || t.priority === "urgent" ? <Chip tone={PRIORITY_TONE[t.priority]}>{PRIORITY_LABEL[t.priority]}</Chip> : null}
                        {t.last_sender === "user" && (t.status === "open" || t.status === "in_progress") ? (
                          <span className="text-[11.5px] font-medium text-amber-700">Waiting on us</span>
                        ) : null}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {!listLoading && tickets.length < total ? (
              <div className="p-3">
                <button type="button" onClick={() => void loadList({ page: page + 1 })} className={cn(btn.light, btn.sm, "w-full")}>
                  Load more ({total - tickets.length})
                </button>
              </div>
            ) : null}
          </div>
        </Panel>

        {/* conversation */}
        <div className={cn(showList && "hidden xl:block")}>
          {composing ? (
            <Compose
              onCancel={() => setComposing(false)}
              onCreated={(id) => {
                setComposing(false);
                setView("waiting");
                open(id);
              }}
            />
          ) : selected ? (
            shownDetail ? (
              <Thread key={shownDetail.ticket.id} detail={shownDetail} onBack={close} onUpdate={update} onSent={sent} />
            ) : (
              <Panel className="flex min-h-[560px] items-center justify-center">
                <Spinner />
              </Panel>
            )
          ) : (
            <Panel className="min-h-[560px]">
              <Empty icon={LifeBuoy} title="Pick a ticket" action={<button type="button" onClick={() => setComposing(true)} className={cn(btn.light, btn.sm)}>Message a trader</button>}>
                Choose a conversation on the left. Tickets waiting on a reply are listed first, oldest at the top.
              </Empty>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}

function Thread({
  detail,
  onBack,
  onUpdate,
  onSent,
}: {
  detail: Detail;
  onBack: () => void;
  onUpdate: (patch: { status?: TicketStatus; priority?: TicketPriority }) => void;
  onSent: (data: Detail) => void;
}) {
  const { ticket, messages, user } = detail;
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState<null | "send" | "resolve">(null);
  const scroller = useRef<HTMLDivElement>(null);
  const lastId = messages[messages.length - 1]?.id;

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [ticket.id, lastId]);

  // the thread is keyed by ticket, so a draft never carries over to another ticket

  const send = async (resolve: boolean, e?: FormEvent) => {
    e?.preventDefault();
    const text = reply.trim();
    if (!text || sending) return;
    setSending(resolve ? "resolve" : "send");
    try {
      const data = await api<Detail>(`/api/admin/tickets/${ticket.id}/messages`, {
        method: "POST",
        body: JSON.stringify(resolve ? { message: text, status: "resolved" } : { message: text }),
      });
      setReply("");
      onSent(data);
      toast.success(resolve ? "Reply sent and ticket resolved" : "Reply sent");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't send the reply");
    } finally {
      setSending(null);
    }
  };

  const done = ticket.status === "resolved" || ticket.status === "closed";

  return (
    <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_280px]">
      <Panel className="flex h-[calc(100vh-12rem)] min-h-[560px] flex-col overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 border-b border-black/[0.06] px-4 py-3.5 sm:px-5">
          <button type="button" aria-label="Back to tickets" onClick={onBack} className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full bg-black/[0.05] text-[var(--g-ink)] xl:hidden">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15.5px] font-semibold text-[var(--g-ink)]">{ticket.subject}</p>
            <p className="truncate text-[12.5px] text-[var(--g-muted-ink)]">
              {user?.name ? `${user.name} · ` : ""}
              {user?.email || ticket.user_email} · #{ticket.id.slice(0, 8)} · opened {stamp(ticket.created_at)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="relative">
              <select
                aria-label="Priority"
                value={ticket.priority}
                onChange={(e) => onUpdate({ priority: e.target.value as TicketPriority })}
                className={cn(field(), selectField, "h-9! w-[118px] rounded-full! text-[13px]")}
              >
                {TICKET_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_LABEL[p]}
                  </option>
                ))}
              </select>
              <SelectChevron />
            </span>
            <Chip tone={STATUS_TONE[ticket.status]}>{STATUS_LABEL[ticket.status]}</Chip>
            {done ? (
              <button type="button" onClick={() => onUpdate({ status: "open" })} className={cn(btn.light, "h-9! px-3.5! text-[13px]!")}>
                <RotateCcw className="h-3.5 w-3.5" /> Reopen
              </button>
            ) : (
              <>
                <button type="button" onClick={() => onUpdate({ status: "resolved" })} className={cn(btn.light, "h-9! px-3.5! text-[13px]!")}>
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--g-emerald)]" /> Resolve
                </button>
                <button type="button" onClick={() => onUpdate({ status: "closed" })} aria-label="Close ticket" title="Close without resolving" className={cn(btn.light, "h-9! w-9! px-0!")}>
                  <XCircle className="h-4 w-4 text-black/45" />
                </button>
              </>
            )}
          </div>
        </div>

        <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-6 [scrollbar-width:thin]">
          {messages.length === 0 ? <p className="py-10 text-center text-[13px] text-[var(--g-muted-ink)]">No messages yet. Write the first one below.</p> : null}
          {messages.map((m) => {
            const team = m.sender_role === "admin";
            return (
              <div key={m.id} className={cn("flex", team ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[82%] rounded-[20px] px-4 py-3", team ? "rounded-br-[6px] bg-[var(--g-ink)] text-white" : "rounded-bl-[6px] bg-white text-[var(--g-ink)] ring-1 ring-black/[0.07]")}>
                  <p className="text-[14px] leading-relaxed break-words whitespace-pre-wrap">{m.message}</p>
                  <p className={cn("mt-1.5 text-[11px]", team ? "text-white/50" : "text-[var(--g-muted-ink)]")}>
                    {team ? `${m.sender_name ? `${m.sender_name} · ` : ""}TPP Support` : user?.name || "Trader"} · {stamp(m.created_at)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={(e) => void send(false, e)} className="border-t border-black/[0.06] p-3 sm:p-4">
          {ticket.status === "closed" ? <p className="mb-2 text-[12.5px] text-[var(--g-muted-ink)]">This ticket is closed. Replying reopens it for the trader.</p> : null}
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void send(false);
            }}
            rows={3}
            maxLength={MAX_MESSAGE}
            placeholder={`Reply to ${user?.name?.split(" ")[0] || "the trader"}…`}
            aria-label="Reply"
            className={cn(field(), "h-auto! resize-y py-3 leading-relaxed")}
          />
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11.5px] text-[var(--g-muted-ink)]">Ctrl + Enter to send · the trader is notified</span>
            <div className="flex gap-2">
              {!done ? (
                <button type="button" disabled={!reply.trim() || Boolean(sending)} onClick={() => void send(true)} className={cn(btn.light, btn.sm)}>
                  <CheckCircle2 className="h-4 w-4 text-[var(--g-emerald)]" />
                  {sending === "resolve" ? "Sending…" : "Send & resolve"}
                </button>
              ) : null}
              <button type="submit" disabled={!reply.trim() || Boolean(sending)} className={cn(btn.lime, btn.sm)}>
                <Send className="h-4 w-4" />
                {sending === "send" ? "Sending…" : "Send reply"}
              </button>
            </div>
          </div>
        </form>
      </Panel>

      {user ? <TraderCard user={user} /> : null}
    </div>
  );
}

function TraderCard({ user }: { user: DeskUser }) {
  const rows = useMemo(
    () => [
      { k: "Joined", v: user.joined ? new Date(user.joined).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—" },
      { k: "Identity (KYC)", v: user.kyc ? user.kyc.replace(/_/g, " ") : "not started" },
      { k: "Account status", v: user.status || "active" },
      { k: "Trading accounts", v: String(user.accounts) },
      { k: "Tickets", v: String(user.tickets) },
    ],
    [user],
  );
  return (
    <Panel className="self-start overflow-hidden">
      <PanelHead as="h3" title="Trader" icon={UserRound} />
      <div className="p-5">
        <p className="text-[15px] font-semibold text-[var(--g-ink)]">{user.name || "No name yet"}</p>
        <p className="g-num mt-0.5 text-[13px] break-all text-[var(--g-muted-ink)]">{user.email}</p>
        <dl className="mt-4 space-y-2.5">
          {rows.map((r) => (
            <div key={r.k} className="flex items-center justify-between gap-3 text-[13px]">
              <dt className="text-[var(--g-muted-ink)]">{r.k}</dt>
              <dd className="font-medium text-[var(--g-ink)] capitalize">{r.v}</dd>
            </div>
          ))}
        </dl>
        <Link href={`/admin/users?search=${encodeURIComponent(user.email || "")}`} className={cn(btn.light, btn.sm, "mt-5 w-full")}>
          Open in Users
        </Link>
      </div>
    </Panel>
  );
}

function Compose({ onCancel, onCreated }: { onCancel: () => void; onCreated: (id: string) => void }) {
  const [form, setForm] = useState({ email: "", subject: "", message: "", priority: "medium" as TicketPriority });
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      const data = await api<{ id: string }>("/api/admin/tickets", { method: "POST", body: JSON.stringify(form) });
      toast.success("Message sent. The trader sees it on their Support page.");
      onCreated(data.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't send the message");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Panel className="overflow-hidden">
      <PanelHead as="h3" title="Message a trader" sub="Opens a ticket in their name with your message first. They get a notification and can reply from their dashboard." icon={MessageSquarePlus}>
        <button type="button" onClick={onCancel} aria-label="Cancel" className="grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-black/[0.05] text-[var(--g-ink)]">
          <X className="h-4 w-4" />
        </button>
      </PanelHead>
      <form onSubmit={submit} className="grid gap-4 p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_160px]">
          <label>
            <span className={fieldLabel}>Trader&apos;s email</span>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={field()} placeholder="name@example.com" />
          </label>
          <label>
            <span className={fieldLabel}>Priority</span>
            <span className="relative block">
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TicketPriority })} className={cn(field(), selectField)}>
                {TICKET_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_LABEL[p]}
                  </option>
                ))}
              </select>
              <SelectChevron />
            </span>
          </label>
        </div>
        <label>
          <span className={fieldLabel}>Subject</span>
          <input required minLength={3} maxLength={MAX_SUBJECT} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className={field()} placeholder="e.g. About your payout request" />
        </label>
        <label>
          <span className={fieldLabel}>Message</span>
          <textarea required rows={7} maxLength={MAX_MESSAGE} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className={cn(field(), "h-auto! resize-y py-3 leading-relaxed")} />
        </label>
        <div className="flex justify-end gap-2.5">
          <button type="button" onClick={onCancel} className={cn(btn.light, btn.sm)}>
            Cancel
          </button>
          <button type="submit" disabled={busy} className={cn(btn.lime, btn.sm)}>
            <Send className="h-4 w-4" />
            {busy ? "Sending…" : "Send message"}
          </button>
        </div>
      </form>
    </Panel>
  );
}
