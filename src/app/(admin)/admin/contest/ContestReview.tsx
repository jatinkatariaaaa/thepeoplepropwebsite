"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "@/components/IntentLink";
import { Ban, CheckCircle2, ChevronRight, Clock, Gift, RotateCcw, Search, ShieldAlert, ShieldCheck, Users, X, XCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Chip, Empty, Meter, Notice, PageTitle, Panel, PanelHead, Spinner, Stat, btn, field, segment, table, type Tone } from "@/components/dashboard/glass";
import { CHECK_ADMIN_LABEL, networkLabel, type BoardRow, type SignupRow } from "@/lib/referral-link";

/*
 * Contest review: every referrer, how many of their sign-ups pass the checks (one per person,
 * device and connection), and the decisions an admin can make: approve or reject single sign-ups,
 * approve or decline a claim that waits for review, pause a reward account already given.
 */

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { cache: "no-store", ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((json as { error?: string; message?: string }).error || (json as { message?: string }).message || "Something went wrong");
  return json as T;
}

type Filter = "all" | "review" | "eligible" | "claimed" | "suspicious";
const FILTERS: { key: Filter; label: string }[] = [
  { key: "review", label: "Waiting review" },
  { key: "suspicious", label: "Suspicious" },
  { key: "eligible", label: "Can claim" },
  { key: "claimed", label: "Claimed" },
  { key: "all", label: "All" },
];

const when = (iso: string | null) => (iso ? new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—");
const span = (a: string | null, b: string | null) => {
  if (!a || !b) return "—";
  const m = Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000);
  return m < 60 ? `${m} min` : m < 2880 ? `${(m / 60).toFixed(1)} h` : `${Math.round(m / 1440)} days`;
};

/** Signs that the sign-ups were made by the referrer: same connection, few connections, nobody came back. */
function suspicion(r: BoardRow, target: number) {
  const notes: string[] = [];
  if (r.self_flags > 0) notes.push(`${r.self_flags} from the referrer's own IP or browser`);
  if (r.signups >= 5 && r.networks <= r.signups / 3) notes.push(`${r.signups} sign-ups from ${r.networks} IPs`);
  if (r.signups >= Math.min(10, target) && r.returned <= r.signups / 10) notes.push(`${r.returned} of ${r.signups} ever came back`);
  if (r.linked_referrers > 0) notes.push(`shares an IP with ${r.linked_referrers} other referrer${r.linked_referrers === 1 ? "" : "s"}`);
  return notes;
}

function status(r: BoardRow, target: number): { label: string; tone: Tone } {
  if (r.claimed) {
    const s = r.reward_account_status;
    return { label: s && s !== "active" ? `Claimed · ${s}` : "Claimed", tone: s === "suspended" || s === "breached" ? "neutral" : "emerald" };
  }
  if (r.claim_status === "held") return { label: "Waiting review", tone: "amber" };
  if (r.claim_status === "rejected") return { label: "Declined", tone: "red" };
  if (r.counted >= target) return { label: "Can claim", tone: "lime" };
  return { label: "In progress", tone: "neutral" };
}

export function ContestReview() {
  const [rows, setRows] = useState<BoardRow[]>([]);
  const [target, setTarget] = useState(20);
  const [reviewMode, setReviewMode] = useState<"auto" | "always">("auto");
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("review");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<BoardRow | null>(null);

  const firstLoad = useRef(true);
  const load = useCallback(async () => {
    try {
      const data = await api<{ rows: BoardRow[]; target: number; reviewMode: "auto" | "always" }>("/api/admin/contest");
      const fresh = data.rows.map((r) => ({ ...r, signups: Number(r.signups), counted: Number(r.counted), flagged: Number(r.flagged), self_flags: Number(r.self_flags), networks: Number(r.networks), returned: Number(r.returned), linked_referrers: Number(r.linked_referrers), confirmed: Number(r.confirmed), paid: Number(r.paid) }));
      setRows(fresh);
      setTarget(data.target);
      setReviewMode(data.reviewMode);
      setOpen((o) => (o ? (fresh.find((r) => r.user_id === o.user_id) ?? o) : o));
      // open on the view that has work in it
      if (firstLoad.current) {
        firstLoad.current = false;
        if (!fresh.some((r) => r.claim_status === "held" && !r.claimed)) setFilter(fresh.some((r) => r.claimed) ? "claimed" : "all");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't load the contest");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: rows.length, review: 0, eligible: 0, claimed: 0, suspicious: 0 };
    for (const r of rows) {
      if (r.claim_status === "held" && !r.claimed) c.review++;
      if (!r.claimed && r.claim_status !== "held" && r.counted >= target) c.eligible++;
      if (r.claimed) c.claimed++;
      if (suspicion(r, target).length) c.suspicious++;
    }
    return c;
  }, [rows, target]);

  const totals = useMemo(
    () => rows.reduce((t, r) => ({ signups: t.signups + r.signups, counted: t.counted + r.counted, flagged: t.flagged + r.flagged }), { signups: 0, counted: 0, flagged: 0 }),
    [rows],
  );

  const shown = rows.filter((r) => {
    const q = query.trim().toLowerCase();
    if (q && !`${r.email ?? ""} ${r.display_name ?? ""} ${r.code}`.toLowerCase().includes(q)) return false;
    if (filter === "review") return r.claim_status === "held" && !r.claimed;
    if (filter === "eligible") return !r.claimed && r.claim_status !== "held" && r.counted >= target;
    if (filter === "claimed") return r.claimed;
    if (filter === "suspicious") return suspicion(r, target).length > 0;
    return true;
  });

  const setMode = async (mode: "auto" | "always") => {
    try {
      await api("/api/admin/contest", { method: "PATCH", body: JSON.stringify({ reviewMode: mode }) });
      setReviewMode(mode);
      toast.success(mode === "always" ? "Every claim now waits for review" : "Clean claims are approved instantly");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save");
    }
  };

  return (
    <div className="mx-auto max-w-[1400px]">
      <PageTitle
        lead="Contest"
        fade="review"
        lede={`A sign-up counts when it comes from its own device and internet connection: not the referrer's, and not one an earlier sign-up used. ${target} sign-ups that count earn the free account.`}
      >
        <div className={segment.wrap} role="group" aria-label="Claims">
          <button type="button" className={segment.item(reviewMode === "auto")} onClick={() => void setMode("auto")} title="Claims where every sign-up passed are approved instantly; the rest wait for you">
            Auto-approve clean claims
          </button>
          <button type="button" className={segment.item(reviewMode === "always")} onClick={() => void setMode("always")} title="Every claim waits for an admin">
            Review every claim
          </button>
        </div>
      </PageTitle>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Referrers" value={String(rows.length)} />
        <Stat label="Sign-ups" value={String(totals.signups)} />
        <Stat label="Count" value={String(totals.counted)} />
        <Stat label="Don't count" value={String(totals.flagged)} />
        <Stat label="Waiting review" value={String(counts.review)} />
      </div>

      <Panel className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-black/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-1.5 overflow-x-auto [scrollbar-width:none]">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                aria-pressed={filter === f.key}
                onClick={() => setFilter(f.key)}
                className={cn(
                  "inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 text-[12.5px] font-semibold ring-1 transition-colors",
                  filter === f.key ? "bg-[var(--g-ink)] text-white ring-transparent" : "bg-white/60 text-[var(--g-muted-ink)] ring-black/10 hover:text-[var(--g-ink)]",
                )}
              >
                {f.label}
                <span className={cn("g-num rounded-full px-1.5 text-[11px]", filter === f.key ? "bg-white/15" : "bg-black/[0.05]")}>{counts[f.key]}</span>
              </button>
            ))}
          </div>
          <label className="relative block sm:w-72">
            <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-black/35" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search referrer" aria-label="Search referrers" className={cn(field(), "h-10! pl-10 text-[13.5px]")} />
          </label>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : shown.length === 0 ? (
          <Empty icon={Users} title="Nobody here">
            {filter === "review" ? "No claims are waiting for review." : "Try another view or search."}
          </Empty>
        ) : (
          <div className={table.scroll}>
            <table className="w-full min-w-[980px] text-[13.5px]">
              <thead>
                <tr className={table.headRow}>
                  <th className={table.th}>Referrer</th>
                  <th className={table.th}>Count / signed up</th>
                  <th className={table.th}>IPs</th>
                  <th className={table.th}>Came back</th>
                  <th className={table.th}>Made in</th>
                  <th className={table.th}>Warning signs</th>
                  <th className={table.th}>Status</th>
                  <th className={table.th} />
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => {
                  const s = status(r, target);
                  const signs = suspicion(r, target);
                  return (
                    <tr key={r.user_id} className={cn(table.row, "cursor-pointer")} onClick={() => setOpen(r)}>
                      <td className={table.td}>
                        <p className="max-w-[220px] truncate font-semibold text-[var(--g-ink)]">{r.display_name || r.email?.split("@")[0] || r.code}</p>
                        <p className="g-num max-w-[220px] truncate text-[12px] text-[var(--g-muted-ink)]">{r.email}</p>
                      </td>
                      <td className={table.td}>
                        <p className="g-num font-semibold text-[var(--g-ink)]">
                          {r.counted} <span className="font-normal text-[var(--g-muted-ink)]">/ {r.signups}</span>
                        </p>
                        <Meter value={Math.min(100, (r.counted / target) * 100)} className="mt-1.5 w-28" tone={r.counted >= target ? "lime" : "ink"} />
                      </td>
                      <td className={cn(table.td, "g-num")}>{r.networks}</td>
                      <td className={cn(table.td, "g-num")}>{r.returned}</td>
                      <td className={cn(table.td, "whitespace-nowrap text-[var(--g-muted-ink)]")}>{span(r.first_signup, r.last_signup)}</td>
                      <td className={cn(table.td, "max-w-[280px]")}>
                        {signs.length ? (
                          <span className="flex items-start gap-1.5 text-[12.5px] leading-snug text-amber-800">
                            <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                            {signs.join(" · ")}
                          </span>
                        ) : (
                          <span className="text-[12.5px] text-black/35">—</span>
                        )}
                      </td>
                      <td className={table.td}>
                        <Chip tone={s.tone}>{s.label}</Chip>
                      </td>
                      <td className={cn(table.td, "text-right")}>
                        <ChevronRight className="ml-auto h-4 w-4 text-black/30" />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {open ? <Review key={open.user_id} row={open} target={target} onClose={() => setOpen(null)} onChanged={() => void load()} /> : null}
    </div>
  );
}

function Review({ row, target, onClose, onChanged }: { row: BoardRow; target: number; onClose: () => void; onChanged: () => void }) {
  const [list, setList] = useState<SignupRow[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [note, setNote] = useState("");

  // the panel is keyed by referrer, so the list starts empty for each one
  useEffect(() => {
    let alive = true;
    api<{ signups: SignupRow[] }>(`/api/admin/contest/${row.user_id}`)
      .then((d) => alive && setList(d.signups))
      .catch((e) => toast.error(e instanceof Error ? e.message : "Couldn't load the sign-ups"));
    return () => {
      alive = false;
    };
  }, [row.user_id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const act = async (key: string, body: object, done?: string) => {
    if (busy) return;
    setBusy(key);
    try {
      const data = await api<{ signups?: SignupRow[]; message?: string }>(`/api/admin/contest/${row.user_id}`, { method: "POST", body: JSON.stringify(body) });
      if (data.signups) setList(data.signups);
      toast.success(data.message || done || "Saved");
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't save");
    } finally {
      setBusy(null);
    }
  };

  const signs = suspicion(row, target);
  const failing = (list ?? []).filter((s) => !s.counted && s.reason !== "unconfirmed").length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Referrer review">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default bg-[#0e1110]/30 backdrop-blur-[2px]" />
      <div className="relative flex h-full w-full max-w-[920px] flex-col overflow-hidden bg-[#f4f6f5] shadow-[0_0_60px_rgba(14,17,16,0.25)]">
        <div className="flex items-start gap-3 border-b border-black/[0.07] bg-white/70 px-5 py-4 backdrop-blur-md sm:px-6">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[17px] font-semibold text-[var(--g-ink)]">{row.display_name || row.email}</p>
            <p className="g-num truncate text-[12.5px] text-[var(--g-muted-ink)]">
              {row.email} · code {row.code}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="grid h-9 w-9 shrink-0 cursor-pointer place-items-center rounded-full bg-black/[0.05] text-[var(--g-ink)]">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 [scrollbar-width:thin]">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Count" value={`${row.counted} / ${target}`} />
            <Stat label="Signed up" value={String(row.signups)} />
            <Stat label="Different IPs" value={String(row.networks)} />
            <Stat label="Came back later" value={String(row.returned)} />
          </div>

          {signs.length ? (
            <Notice tone="amber" icon={ShieldAlert} className="mt-4">
              {signs.join(" · ")}
            </Notice>
          ) : null}

          {/* the claim */}
          <Panel className="mt-4 overflow-hidden">
            <PanelHead as="h3" title="Claim" icon={Gift} />
            <div className="p-5">
              {row.claimed ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[13.5px] text-[var(--g-ink)]">
                    Reward given {when(row.claimed_at)}. Account:{" "}
                    <span className="font-semibold capitalize">{row.reward_account_status || "not created yet"}</span>
                    {row.counted < target ? <span className="text-amber-800"> · only {row.counted} of {target} sign-ups count under the new checks</span> : null}
                  </p>
                  <div className="flex gap-2">
                    {row.reward_account ? (
                      <Link href={`/admin/trading/accounts?search=${encodeURIComponent(row.email ?? "")}`} className={cn(btn.light, btn.sm)}>
                        Open account
                      </Link>
                    ) : null}
                    {row.reward_account && !["suspended", "breached", "deleted"].includes(row.reward_account_status ?? "") ? (
                      <button
                        type="button"
                        disabled={Boolean(busy)}
                        onClick={() => {
                          if (confirm("Suspend this reward account? Trading stops and open positions close. You can re-enable it from Trading Accounts.")) void act("suspend", { action: "suspend_reward" });
                        }}
                        className={cn(btn.ink, btn.sm)}
                      >
                        <Ban className="h-4 w-4" /> {busy === "suspend" ? "Suspending…" : "Suspend reward account"}
                      </button>
                    ) : null}
                  </div>
                </div>
              ) : row.claim_status === "held" ? (
                <div className="space-y-3">
                  <p className="text-[13.5px] text-[var(--g-ink)]">
                    Claimed {when(row.claim_requested_at)} with {row.counted} sign-ups that count; it waits for you because {failing || "some"} failed the checks
                    {"."}
                  </p>
                  <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note for the trader if you decline (optional)" className={cn(field(), "h-10! text-[13.5px]")} />
                  <div className="flex flex-wrap gap-2">
                    <button type="button" disabled={Boolean(busy)} onClick={() => void act("approve", { action: "claim", decision: "approve" })} className={cn(btn.lime, btn.sm)}>
                      <CheckCircle2 className="h-4 w-4" /> {busy === "approve" ? "Creating account…" : "Approve and create account"}
                    </button>
                    <button type="button" disabled={Boolean(busy)} onClick={() => void act("reject", { action: "claim", decision: "reject", note })} className={cn(btn.light, btn.sm)}>
                      <XCircle className="h-4 w-4 text-red-600" /> Decline
                    </button>
                  </div>
                </div>
              ) : row.claim_status === "rejected" ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[13.5px] text-[var(--g-ink)]">The claim was declined. The trader can&apos;t claim again unless you reset it.</p>
                  <button type="button" disabled={Boolean(busy)} onClick={() => void act("reset", { action: "claim", decision: "reset" })} className={cn(btn.light, btn.sm)}>
                    <RotateCcw className="h-4 w-4" /> Let them claim again
                  </button>
                </div>
              ) : (
                <p className="text-[13.5px] text-[var(--g-muted-ink)]">
                  No claim yet. {row.counted >= target ? "They have enough sign-ups that count and can claim from their dashboard." : `${target - row.counted} more sign-ups need to count.`}
                </p>
              )}
            </div>
          </Panel>

          {/* the sign-ups */}
          <Panel className="mt-4 overflow-hidden">
            <PanelHead as="h3" title="Sign-ups" sub="IP is where the account signed up. Approving overrides the checks; rejecting never counts it." icon={ShieldCheck}>
              {list && failing > 0 ? (
                <button type="button" disabled={Boolean(busy)} onClick={() => void act("bulk", { action: "signups", decision: "reject", scope: "failing" }, "Rejected the failing sign-ups")} className={cn(btn.light, btn.sm)}>
                  <XCircle className="h-4 w-4 text-red-600" /> Reject all {failing} failing
                </button>
              ) : null}
            </PanelHead>
            {!list ? (
              <div className="flex justify-center py-12">
                <Spinner />
              </div>
            ) : list.length === 0 ? (
              <Empty icon={Users} title="No sign-ups" />
            ) : (
              <div className={table.scroll}>
                <table className="w-full min-w-[760px] text-[13px]">
                  <thead>
                    <tr className={table.headRow}>
                      <th className={table.th}>Account</th>
                      <th className={table.th}>Signed up</th>
                      <th className={table.th}>IP</th>
                      <th className={table.th}>Result</th>
                      <th className={table.th} />
                    </tr>
                  </thead>
                  <tbody>
                    {list.map((s) => {
                      const cameBack = s.last_sign_in_at && new Date(s.last_sign_in_at).getTime() > new Date(s.created_at).getTime() + 3600_000;
                      return (
                        <tr key={s.referred_user_id} className={table.row}>
                          <td className={cn(table.td, "py-3")}>
                            <p className="g-num max-w-[220px] truncate text-[var(--g-ink)]">{s.email}</p>
                            <p className="text-[11.5px] text-[var(--g-muted-ink)]">{cameBack ? "came back later" : "never came back"}</p>
                          </td>
                          <td className={cn(table.td, "py-3 whitespace-nowrap text-[var(--g-muted-ink)]")}>{when(s.created_at)}</td>
                          <td className={cn(table.td, "py-3")}>
                            <p className="g-num text-[var(--g-ink)]">
                              {s.ip || networkLabel(s.net)}
                              {s.country ? <span className="ml-1.5 text-[11px] text-[var(--g-muted-ink)]">{s.country}</span> : null}
                            </p>
                            {Number(s.net_signups) > 1 ? <p className="text-[11.5px] text-amber-800">{s.net_signups} sign-ups on this IP</p> : null}
                          </td>
                          <td className={cn(table.td, "py-3")}>
                            {s.counted ? (
                              <Chip tone="lime">
                                <CheckCircle2 className="h-3.5 w-3.5" /> {s.review === "approved" ? "Counts (approved)" : "Counts"}
                              </Chip>
                            ) : (
                              <Chip tone={s.reason === "rejected" ? "red" : "amber"}>
                                {s.reason === "unconfirmed" ? <Clock className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                                {s.reason ? CHECK_ADMIN_LABEL[s.reason] : "Doesn't count"}
                              </Chip>
                            )}
                          </td>
                          <td className={cn(table.td, "py-3")}>
                            <div className="flex justify-end gap-1.5">
                              {s.review ? (
                                <button type="button" disabled={Boolean(busy)} onClick={() => void act(`c-${s.referred_user_id}`, { action: "signup", referredUserId: s.referred_user_id, decision: "clear" })} className={cn(btn.light, "h-8! px-3! text-[12.5px]!")}>
                                  Undo
                                </button>
                              ) : (
                                <>
                                  {!s.counted ? (
                                    <button type="button" disabled={Boolean(busy)} onClick={() => void act(`a-${s.referred_user_id}`, { action: "signup", referredUserId: s.referred_user_id, decision: "approve" })} className={cn(btn.light, "h-8! px-3! text-[12.5px]!")}>
                                      Approve
                                    </button>
                                  ) : null}
                                  <button type="button" disabled={Boolean(busy)} onClick={() => void act(`r-${s.referred_user_id}`, { action: "signup", referredUserId: s.referred_user_id, decision: "reject" })} className={cn(btn.light, "h-8! px-3! text-[12.5px]!")}>
                                    Reject
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
