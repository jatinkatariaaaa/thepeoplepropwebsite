"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpenText, ChevronLeft, ChevronRight, NotebookPen, Plus, Star, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { Chip, Empty, PageTitle, Panel, PanelHead, Spinner, Stat, btn, field, fieldLabel, segment, table } from "@/components/dashboard/glass";

/**
 * Trading journal. Closed trades arrive on their own from TPP Terminal; the
 * trader adds what the terminal cannot know: the setup, how it was executed,
 * what went wrong. The breakdowns below are computed from both.
 */

type Trade = {
  id: string;
  account_id: string;
  symbol: string;
  direction: "buy" | "sell";
  volume: number;
  open_price: number;
  close_price: number;
  open_time: string;
  close_time: string;
  net_pnl: number;
  reason: string;
};

type Entry = {
  id?: string;
  trade_id: string | null;
  account_id: string | null;
  entry_date: string;
  symbol: string | null;
  title: string | null;
  notes: string | null;
  setup: string | null;
  tags: string[];
  mistakes: string[];
  emotion: string | null;
  rating: number | null;
  followed_plan: boolean | null;
  screenshot_url: string | null;
};

type Account = { id: string; terminal_account_id: string | null; starting_balance: number; phase: string; program_key: string | null; status: string };

const SETUPS = ["Breakout", "Pullback", "Trend continuation", "Range", "Reversal", "Liquidity sweep", "News", "Other"];
const MISTAKES = ["Entered early", "Chased price", "Moved the stop", "Oversized", "No clear plan", "Revenge trade", "Closed too soon", "Held too long"];
const EMOTIONS = ["Calm", "Confident", "Hesitant", "Impatient", "Frustrated", "Fearful"];
const RANGES = [
  ["7", "7 days"],
  ["30", "30 days"],
  ["90", "90 days"],
  ["all", "All time"],
] as const;

const usd = (n: number) => `${n < 0 ? "-" : ""}$${Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const dayKey = (iso: string) => new Date(iso).toLocaleDateString("en-CA");
const tone = (n: number) => (n > 0 ? "text-emerald-700" : n < 0 ? "text-red-600" : "text-[var(--g-muted-ink)]");

function session(iso: string) {
  const h = new Date(iso).getUTCHours();
  if (h < 7) return "Asia";
  if (h < 12) return "London";
  if (h < 17) return "London / New York";
  if (h < 21) return "New York";
  return "Late";
}

const blank = (trade?: Trade): Entry => ({
  trade_id: trade?.id ?? null,
  account_id: trade?.account_id ?? null,
  entry_date: trade ? dayKey(trade.close_time) : new Date().toLocaleDateString("en-CA"),
  symbol: trade?.symbol ?? null,
  title: null,
  notes: null,
  setup: null,
  tags: [],
  mistakes: [],
  emotion: null,
  rating: null,
  followed_plan: null,
  screenshot_url: null,
});

function Breakdown({ title, rows }: { title: string; rows: { key: string; n: number; pnl: number; wins: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => Math.abs(r.pnl)));
  return (
    <Panel>
      <PanelHead as="h3" title={title} />
      <div className="p-4 sm:p-5">
        {rows.length === 0 ? (
          <p className="py-6 text-center text-[13px] text-[var(--g-muted-ink)]">No trades in this view yet.</p>
        ) : (
          <ul className="grid gap-2.5">
            {rows.slice(0, 7).map((r) => (
              <li key={r.key}>
                <div className="flex items-baseline justify-between gap-3 text-[13px]">
                  <span className="min-w-0 truncate font-medium text-[var(--g-ink)]">{r.key}</span>
                  <span className="g-num shrink-0 text-[var(--g-muted-ink)]">
                    {r.n} · {Math.round((r.wins / r.n) * 100)}% · <b className={cn("font-semibold", tone(r.pnl))}>{usd(r.pnl)}</b>
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
                  <div className={cn("h-full rounded-full", r.pnl >= 0 ? "bg-[var(--g-emerald)]" : "bg-red-500")} style={{ width: `${(Math.abs(r.pnl) / max) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Panel>
  );
}

export function JournalClient() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [accountFilter, setAccountFilter] = useState("all");
  const [range, setRange] = useState<(typeof RANGES)[number][0]>("30");
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [editing, setEditing] = useState<{ entry: Entry; trade?: Trade } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data: { session: s } } = await supabase.auth.getSession();
    if (!s?.user) return setLoading(false);
    setUserId(s.user.id);

    const { data: accts } = await supabase.from("trading_accounts").select("id, terminal_account_id, starting_balance, phase, program_key, status").eq("user_id", s.user.id).order("created_at", { ascending: false });
    const list = (accts ?? []) as Account[];
    setAccounts(list);

    const ids = list.map((a) => a.terminal_account_id).filter(Boolean) as string[];
    const [{ data: tr }, { data: en }] = await Promise.all([
      ids.length
        ? supabase.from("trades").select("id, account_id, symbol, direction, volume, open_price, close_price, open_time, close_time, net_pnl, reason").in("account_id", ids).order("close_time", { ascending: false }).limit(2000)
        : Promise.resolve({ data: [] as Trade[] }),
      supabase.from("journal_entries").select("*").eq("user_id", s.user.id).order("entry_date", { ascending: false }).limit(2000),
    ]);
    setTrades(((tr ?? []) as Trade[]).map((t) => ({ ...t, net_pnl: Number(t.net_pnl), volume: Number(t.volume), open_price: Number(t.open_price), close_price: Number(t.close_price) })));
    setEntries((en ?? []) as Entry[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const byTrade = useMemo(() => new Map(entries.filter((e) => e.trade_id).map((e) => [e.trade_id as string, e])), [entries]);
  const accountLabel = useCallback(
    (terminalId: string) => {
      const a = accounts.find((x) => x.terminal_account_id === terminalId);
      return a ? `$${Number(a.starting_balance) / 1000}K ${a.phase === "funded" ? "Funded" : "Evaluation"}` : "Account";
    },
    [accounts],
  );

  const view = useMemo(() => {
    const since = range === "all" ? 0 : Date.now() - Number(range) * 86_400_000;
    return trades.filter((t) => (accountFilter === "all" || t.account_id === accountFilter) && new Date(t.close_time).getTime() >= since);
  }, [trades, accountFilter, range]);

  const stats = useMemo(() => {
    const wins = view.filter((t) => t.net_pnl > 0);
    const losses = view.filter((t) => t.net_pnl < 0);
    const gross = wins.reduce((s, t) => s + t.net_pnl, 0);
    const lost = Math.abs(losses.reduce((s, t) => s + t.net_pnl, 0));
    const net = gross - lost;
    const group = (key: (t: Trade) => string | null) => {
      const m = new Map<string, { key: string; n: number; pnl: number; wins: number }>();
      for (const t of view) {
        const k = key(t);
        if (!k) continue;
        const row = m.get(k) ?? { key: k, n: 0, pnl: 0, wins: 0 };
        row.n += 1;
        row.pnl += t.net_pnl;
        if (t.net_pnl > 0) row.wins += 1;
        m.set(k, row);
      }
      return [...m.values()].sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl));
    };
    const mistakes = new Map<string, { key: string; n: number; pnl: number; wins: number }>();
    for (const t of view) {
      for (const k of byTrade.get(t.id)?.mistakes ?? []) {
        const row = mistakes.get(k) ?? { key: k, n: 0, pnl: 0, wins: 0 };
        row.n += 1;
        row.pnl += t.net_pnl;
        if (t.net_pnl > 0) row.wins += 1;
        mistakes.set(k, row);
      }
    }
    return {
      net,
      winRate: view.length ? (wins.length / view.length) * 100 : 0,
      profitFactor: lost > 0 ? gross / lost : gross > 0 ? Infinity : 0,
      avgWin: wins.length ? gross / wins.length : 0,
      avgLoss: losses.length ? lost / losses.length : 0,
      expectancy: view.length ? net / view.length : 0,
      journaled: view.filter((t) => byTrade.has(t.id)).length,
      bySymbol: group((t) => t.symbol),
      bySetup: group((t) => byTrade.get(t.id)?.setup ?? null),
      bySession: group((t) => session(t.open_time)),
      byMistake: [...mistakes.values()].sort((a, b) => a.pnl - b.pnl),
    };
  }, [view, byTrade]);

  const calendar = useMemo(() => {
    const pnl = new Map<string, { pnl: number; n: number }>();
    for (const t of trades) {
      if (accountFilter !== "all" && t.account_id !== accountFilter) continue;
      const k = dayKey(t.close_time);
      const d = pnl.get(k) ?? { pnl: 0, n: 0 };
      d.pnl += t.net_pnl;
      d.n += 1;
      pnl.set(k, d);
    }
    const first = new Date(month);
    const offset = (first.getDay() + 6) % 7; // Monday first
    const days = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
    const cells: ({ day: number; key: string; pnl: number; n: number } | null)[] = Array.from({ length: offset }, () => null);
    for (let d = 1; d <= days; d++) {
      const key = new Date(first.getFullYear(), first.getMonth(), d).toLocaleDateString("en-CA");
      cells.push({ day: d, key, pnl: pnl.get(key)?.pnl ?? 0, n: pnl.get(key)?.n ?? 0 });
    }
    const monthPnl = cells.reduce((s, c) => s + (c?.pnl ?? 0), 0);
    return { cells, monthPnl };
  }, [trades, accountFilter, month]);

  const save = async () => {
    if (!editing || !userId) return;
    setSaving(true);
    setError(null);
    const e = editing.entry;
    const row = { ...e, user_id: userId, title: e.title?.trim() || null, notes: e.notes?.trim() || null, screenshot_url: e.screenshot_url?.trim() || null };
    const query = e.id
      ? supabase.from("journal_entries").update(row).eq("id", e.id).select().single()
      : e.trade_id
        ? supabase.from("journal_entries").upsert(row, { onConflict: "user_id,trade_id" }).select().single()
        : supabase.from("journal_entries").insert(row).select().single();
    const { data, error: err } = await query;
    setSaving(false);
    if (err || !data) return setError(err?.message || "Could not save the entry.");
    setEntries((prev) => [data as Entry, ...prev.filter((x) => x.id !== (data as Entry).id)]);
    setEditing(null);
  };

  const remove = async () => {
    if (!editing?.entry.id) return;
    setSaving(true);
    await supabase.from("journal_entries").delete().eq("id", editing.entry.id);
    setEntries((prev) => prev.filter((x) => x.id !== editing.entry.id));
    setSaving(false);
    setEditing(null);
  };

  const patch = (p: Partial<Entry>) => setEditing((cur) => (cur ? { ...cur, entry: { ...cur.entry, ...p } } : cur));
  const toggleIn = (key: "tags" | "mistakes", value: string) => {
    if (!editing) return;
    const list = editing.entry[key];
    patch({ [key]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] } as Partial<Entry>);
  };

  const notes = entries.filter((e) => !e.trade_id);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <PageTitle lead="Trading" fade="journal" lede="Every closed trade lands here on its own. Add the setup and what you would do differently, and the journal shows you where your results come from.">
        <button type="button" onClick={() => setEditing({ entry: blank() })} className={cn(btn.ink, btn.sm)}>
          <Plus className="h-4 w-4" /> Add a note
        </button>
      </PageTitle>

      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        <div className={segment.wrap}>
          {RANGES.map(([k, label]) => (
            <button key={k} type="button" onClick={() => setRange(k)} className={segment.item(range === k)}>
              {label}
            </button>
          ))}
        </div>
        <select value={accountFilter} onChange={(e) => setAccountFilter(e.target.value)} aria-label="Account" className={cn(field(), "h-10! w-auto! min-w-[200px] cursor-pointer rounded-full! text-[13.5px]!")}>
          <option value="all">All accounts</option>
          {accounts
            .filter((a) => a.terminal_account_id)
            .map((a) => (
              <option key={a.id} value={a.terminal_account_id as string}>
                {accountLabel(a.terminal_account_id as string)} · {a.id.slice(0, 8)}
              </option>
            ))}
        </select>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <Stat label="Net P&L" value={<span className={stats.net < 0 ? "text-red-400" : undefined}>{usd(stats.net)}</span>} highlight className="col-span-2 lg:col-span-1 xl:col-span-2" />
        <Stat label="Win rate" value={`${stats.winRate.toFixed(0)}%`} />
        <Stat label="Profit factor" value={Number.isFinite(stats.profitFactor) ? stats.profitFactor.toFixed(2) : "∞"} />
        <Stat label="Avg win / loss" value={<span className="text-[19px]">{usd(stats.avgWin)} / {usd(stats.avgLoss)}</span>} />
        <Stat label="Expectancy" value={<span className={cn("text-[21px]", tone(stats.expectancy))}>{usd(stats.expectancy)}</span>} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHead icon={BookOpenText} title="Trades" sub={`${view.length} closed · ${stats.journaled} journaled`} />
          {view.length === 0 ? (
            <Empty icon={NotebookPen} title="No closed trades in this view">
              Trades you close in TPP Terminal appear here within seconds.
            </Empty>
          ) : (
            <div className={cn(table.scroll, "max-h-[640px] overflow-y-auto")}>
              <table className="w-full min-w-[640px] border-collapse">
                <thead className="sticky top-0 z-10 backdrop-blur-md">
                  <tr className={table.headRow}>
                    {["Closed", "Symbol", "Side", "Lots", "P&L", "Setup", ""].map((h) => (
                      <th key={h} className={table.th}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {view.slice(0, 300).map((t) => {
                    const e = byTrade.get(t.id);
                    return (
                      <tr key={t.id} className={table.row}>
                        <td className={cn(table.td, "g-num text-[12.5px] whitespace-nowrap text-[var(--g-muted-ink)]")}>{new Date(t.close_time).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                        <td className={cn(table.td, "text-[13.5px] font-semibold text-[var(--g-ink)]")}>{t.symbol}</td>
                        <td className={table.td}>
                          <Chip tone={t.direction === "buy" ? "emerald" : "red"} className="uppercase">
                            {t.direction}
                          </Chip>
                        </td>
                        <td className={cn(table.td, "g-num text-[13px] text-[var(--g-ink)]")}>{t.volume.toFixed(2)}</td>
                        <td className={cn(table.td, "g-num text-[13.5px] font-semibold", tone(t.net_pnl))}>{usd(t.net_pnl)}</td>
                        <td className={cn(table.td, "text-[12.5px] text-[var(--g-muted-ink)]")}>
                          {e?.setup ?? "—"}
                          {e?.rating ? <span className="ml-1.5 text-amber-700">{"★".repeat(e.rating)}</span> : null}
                        </td>
                        <td className={cn(table.td, "text-right")}>
                          <button type="button" onClick={() => setEditing({ entry: e ?? blank(t), trade: t })} className="cursor-pointer rounded-full px-3 py-1.5 text-[12.5px] font-semibold text-[var(--g-emerald)] ring-1 ring-[var(--g-emerald)]/25 transition-colors hover:bg-[var(--g-emerald)]/10">
                            {e ? "Edit" : "Journal"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <div className="grid content-start gap-4">
          <Panel>
            <PanelHead as="h3" title={month.toLocaleDateString("en-GB", { month: "long", year: "numeric" })} sub={<span className={cn("g-num font-semibold", tone(calendar.monthPnl))}>{usd(calendar.monthPnl)}</span>}>
              <div className="flex gap-1">
                <button type="button" aria-label="Previous month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-black/[0.04] text-[var(--g-ink)] hover:bg-black/[0.08]">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button type="button" aria-label="Next month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-black/[0.04] text-[var(--g-ink)] hover:bg-black/[0.08]">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </PanelHead>
            <div className="p-4">
              <div className="grid grid-cols-7 gap-1 text-center text-[10.5px] font-medium text-[var(--g-muted-ink)]">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <span key={i}>{d}</span>
                ))}
              </div>
              <div className="mt-1.5 grid grid-cols-7 gap-1">
                {calendar.cells.map((c, i) =>
                  c ? (
                    <div key={c.key} title={c.n ? `${c.n} trades, ${usd(c.pnl)}` : undefined} className={cn("flex aspect-square flex-col items-center justify-center rounded-[10px] text-[11px]", c.n === 0 ? "bg-black/[0.03] text-[var(--g-muted-ink)]" : c.pnl >= 0 ? "bg-emerald-500/20 font-semibold text-emerald-700" : "bg-red-500/15 font-semibold text-red-600")}>
                      <span>{c.day}</span>
                      {c.n ? <span className="g-num text-[9px] leading-none opacity-80">{Math.abs(c.pnl) >= 1000 ? `${(c.pnl / 1000).toFixed(1)}k` : Math.round(c.pnl)}</span> : null}
                    </div>
                  ) : (
                    <span key={`b${i}`} />
                  ),
                )}
              </div>
            </div>
          </Panel>
          <Breakdown title="By setup" rows={stats.bySetup} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Breakdown title="By symbol" rows={stats.bySymbol} />
        <Breakdown title="By session (UTC)" rows={stats.bySession} />
        <Breakdown title="Cost of mistakes" rows={stats.byMistake} />
      </div>

      {notes.length > 0 && (
        <Panel className="mt-4">
          <PanelHead icon={NotebookPen} title="Notes" sub="Entries that are not tied to a trade" />
          <ul className="grid gap-2 p-4 sm:grid-cols-2 sm:p-5">
            {notes.slice(0, 12).map((n) => (
              <li key={n.id}>
                <button type="button" onClick={() => setEditing({ entry: n })} className="w-full cursor-pointer rounded-[18px] bg-white/55 p-4 text-left ring-1 ring-black/[0.06] transition-colors hover:bg-white/80">
                  <p className="text-[12px] text-[var(--g-muted-ink)]">{new Date(n.entry_date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</p>
                  <p className="mt-1 text-[14.5px] font-semibold text-[var(--g-ink)]">{n.title || "Untitled note"}</p>
                  {n.notes ? <p className="mt-1 line-clamp-2 text-[13px] text-[var(--g-muted-ink)]">{n.notes}</p> : null}
                </button>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      {editing && (
        <div className="fixed inset-0 z-[80] flex justify-end bg-[#0e1110]/40 backdrop-blur-sm" onClick={() => setEditing(null)}>
          <div role="dialog" aria-label="Journal entry" onClick={(e) => e.stopPropagation()} className="g-glass-light flex h-full w-full max-w-[480px] flex-col overflow-y-auto shadow-[-30px_0_80px_-30px_rgba(0,0,0,0.5)]">
            <div className="flex items-start justify-between gap-4 border-b border-black/[0.06] p-5 sm:p-6">
              <div className="min-w-0">
                <p className="text-[12px] font-medium tracking-[0.12em] text-[var(--g-muted-ink)] uppercase">{editing.trade ? "Trade review" : "Journal note"}</p>
                {editing.trade ? (
                  <p className="mt-1 text-[19px] font-semibold tracking-[-0.02em] text-[var(--g-ink)]">
                    {editing.trade.direction === "buy" ? "Buy" : "Sell"} {editing.trade.volume.toFixed(2)} {editing.trade.symbol} <span className={cn("g-num", tone(editing.trade.net_pnl))}>{usd(editing.trade.net_pnl)}</span>
                  </p>
                ) : (
                  <p className="mt-1 text-[19px] font-semibold tracking-[-0.02em] text-[var(--g-ink)]">{editing.entry.id ? "Edit note" : "New note"}</p>
                )}
                {editing.trade ? (
                  <p className="g-num mt-1 text-[12.5px] text-[var(--g-muted-ink)]">
                    {editing.trade.open_price} → {editing.trade.close_price} · {accountLabel(editing.trade.account_id)} · closed by {editing.trade.reason.replace("_", " ")}
                  </p>
                ) : null}
              </div>
              <button type="button" aria-label="Close" onClick={() => setEditing(null)} className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full bg-black/[0.05] text-[var(--g-ink)] hover:bg-black/[0.09]">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-5 p-5 sm:p-6">
              {!editing.trade && (
                <div className="grid grid-cols-[1fr_150px] gap-3">
                  <label>
                    <span className={fieldLabel}>Title</span>
                    <input value={editing.entry.title ?? ""} onChange={(e) => patch({ title: e.target.value })} className={field()} placeholder="Weekly review" />
                  </label>
                  <label>
                    <span className={fieldLabel}>Date</span>
                    <input type="date" value={editing.entry.entry_date} onChange={(e) => patch({ entry_date: e.target.value })} className={field()} />
                  </label>
                </div>
              )}

              {editing.trade && (
                <>
                  <div>
                    <span className={fieldLabel}>Setup</span>
                    <div className="flex flex-wrap gap-1.5">
                      {SETUPS.map((sName) => (
                        <button key={sName} type="button" aria-pressed={editing.entry.setup === sName} onClick={() => patch({ setup: editing.entry.setup === sName ? null : sName })} className={cn("h-9 cursor-pointer rounded-full px-3.5 text-[13px] font-medium ring-1 transition-colors", editing.entry.setup === sName ? "bg-[var(--g-ink)] text-white ring-transparent" : "bg-white/60 text-[var(--g-muted-ink)] ring-black/10 hover:text-[var(--g-ink)]")}>
                          {sName}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className={fieldLabel}>Execution</span>
                      <div className="flex gap-1" role="radiogroup" aria-label="Execution rating">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <button key={n} type="button" role="radio" aria-checked={editing.entry.rating === n} aria-label={`${n} of 5`} onClick={() => patch({ rating: editing.entry.rating === n ? null : n })} className="cursor-pointer p-0.5">
                            <Star className={cn("h-6 w-6", (editing.entry.rating ?? 0) >= n ? "fill-amber-400 text-amber-400" : "text-black/20")} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className={fieldLabel}>Followed the plan</span>
                      <div className={segment.wrap}>
                        {(
                          [
                            [true, "Yes"],
                            [false, "No"],
                          ] as const
                        ).map(([v, label]) => (
                          <button key={label} type="button" onClick={() => patch({ followed_plan: editing.entry.followed_plan === v ? null : v })} className={segment.item(editing.entry.followed_plan === v)}>
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className={fieldLabel}>State of mind</span>
                    <div className="flex flex-wrap gap-1.5">
                      {EMOTIONS.map((em) => (
                        <button key={em} type="button" aria-pressed={editing.entry.emotion === em} onClick={() => patch({ emotion: editing.entry.emotion === em ? null : em })} className={cn("h-9 cursor-pointer rounded-full px-3.5 text-[13px] font-medium ring-1 transition-colors", editing.entry.emotion === em ? "bg-[var(--g-ink)] text-white ring-transparent" : "bg-white/60 text-[var(--g-muted-ink)] ring-black/10 hover:text-[var(--g-ink)]")}>
                          {em}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className={fieldLabel}>Mistakes</span>
                    <div className="flex flex-wrap gap-1.5">
                      {MISTAKES.map((m) => {
                        const on = editing.entry.mistakes.includes(m);
                        return (
                          <button key={m} type="button" aria-pressed={on} onClick={() => toggleIn("mistakes", m)} className={cn("h-9 cursor-pointer rounded-full px-3.5 text-[13px] font-medium ring-1 transition-colors", on ? "bg-red-500/15 text-red-700 ring-red-500/30" : "bg-white/60 text-[var(--g-muted-ink)] ring-black/10 hover:text-[var(--g-ink)]")}>
                            {m}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              <label>
                <span className={fieldLabel}>{editing.trade ? "What happened, and what would you do differently?" : "Notes"}</span>
                <textarea value={editing.entry.notes ?? ""} onChange={(e) => patch({ notes: e.target.value })} rows={6} className={cn(field(), "h-auto! resize-y py-3 leading-relaxed")} />
              </label>

              <label>
                <span className={fieldLabel}>Chart screenshot link (optional)</span>
                <input type="url" value={editing.entry.screenshot_url ?? ""} onChange={(e) => patch({ screenshot_url: e.target.value })} placeholder="https://" className={field()} />
              </label>

              {error ? <p className="text-[13px] font-medium text-red-600">{error}</p> : null}

              <div className="flex items-center justify-between gap-3">
                {editing.entry.id ? (
                  <button type="button" onClick={() => void remove()} disabled={saving} className="cursor-pointer text-[13.5px] font-semibold text-red-600 hover:underline">
                    Delete entry
                  </button>
                ) : (
                  <span />
                )}
                <button type="button" onClick={() => void save()} disabled={saving} className={btn.lime}>
                  {saving ? "Saving…" : "Save entry"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
