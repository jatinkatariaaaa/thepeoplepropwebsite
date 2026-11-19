"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import { Award, BadgeCheck, Ban, CircleDollarSign, Download, ExternalLink, Eye, FileBadge, Link2, Medal, Pencil, Plus, RotateCcw, Search, Trophy, X, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { certificateImagePath, certificateTitle, KIND_LABEL, type Certificate, type CertificateKind } from "@/lib/certificates/types";
import { Chip, Empty, Notice, PageTitle, Panel, PanelHead, SelectChevron, Spinner, Stat, btn, field, fieldLabel, segment, selectField, table } from "@/components/dashboard/glass";

type Row = Certificate & { email: string | null; note: string | null; createdAt: string };
type Trader = { id: string; email: string | null; name: string | null };
type Candidates = {
  accounts: { id: string; label: string; phase: string; status: string; funded: boolean; passed: boolean; passedOn: string | null; phaseCertificate: string | null; fundedCertificate: string | null }[];
  terminalAccounts: { id: string; label: string; status: string }[];
  payouts: { id: string; amount: number; status: string; paidOn: string; method: string | null; reference: string | null; payoutCertificate: string | null; highestCertificate: string | null }[];
};

const ICON: Record<CertificateKind, LucideIcon> = { phase_pass: BadgeCheck, funded: Award, payout: CircleDollarSign, highest_payout: Trophy, award: Medal };
const KINDS: { key: CertificateKind; label: string; hint: string }[] = [
  { key: "phase_pass", label: "Phase passed", hint: "A passed evaluation phase" },
  { key: "funded", label: "Funded", hint: "A funded account" },
  { key: "payout", label: "Payout", hint: "A paid payout" },
  { key: "highest_payout", label: "Highest payout", hint: "Largest payout of a month or year" },
  { key: "award", label: "Award", hint: "Your own title and wording" },
];
const usd = (n: number) => `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function detail(c: Certificate) {
  if (c.kind === "payout" || c.kind === "highest_payout") return [c.amount, c.kind === "highest_payout" ? c.period : c.accountSize].filter(Boolean).join(" · ");
  if (c.kind === "award") return [c.highlightValue, c.program].filter(Boolean).join(" · ") || "—";
  return [c.accountSize, c.phase ?? c.program].filter(Boolean).join(" · ");
}

const EMPTY_FORM = {
  accountId: "",
  payoutId: "",
  periodType: "month" as "month" | "year",
  title: "",
  statement: "",
  highlightLabel: "",
  highlightValue: "",
  issuedAt: "",
  traderName: "",
  note: "",
  payoutMode: "dashboard" as "dashboard" | "outside",
  manualAccountId: "",
  manualAmount: "",
  manualMethod: "Bank transfer",
  manualReference: "",
  manualDate: "",
};

export default function AdminCertificatesPage() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [kind, setKind] = useState<CertificateKind | "all">("all");
  const [status, setStatus] = useState<"active" | "revoked" | "all">("active");
  const [query, setQuery] = useState("");
  const [viewing, setViewing] = useState<Row | null>(null);

  const load = useCallback(async () => {
    const params = new URLSearchParams();
    if (kind !== "all") params.set("kind", kind);
    if (status !== "all") params.set("status", status);
    if (query.trim().length >= 2) params.set("q", query.trim());
    const res = await fetch(`/api/admin/certificates?${params}`, { cache: "no-store" });
    const data = await res.json();
    if (res.ok) {
      setRows(data.certificates);
      setCounts(data.counts);
    } else toast.error(data.error || "Could not load certificates");
    setLoading(false);
  }, [kind, status, query]);

  useEffect(() => {
    const t = setTimeout(() => void load(), query ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, query]);

  return (
    <div className="mx-auto max-w-7xl">
      <PageTitle
        lead="Certificates"
        fade="issued and verified"
        lede="Issued automatically when a phase is passed, an account is funded or a payout is paid. Issue, correct or revoke one here; every certificate has a public verification page behind its QR code."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Stat label="Live certificates" value={String(counts.total ?? 0)} icon={FileBadge} highlight />
        <Stat label="Phases passed" value={String(counts.phase_pass ?? 0)} />
        <Stat label="Funded" value={String(counts.funded ?? 0)} />
        <Stat label="Payouts" value={String(counts.payout ?? 0)} />
        <Stat label="Awards" value={String((counts.highest_payout ?? 0) + (counts.award ?? 0))} />
        <Stat label="Revoked" value={String(counts.revoked ?? 0)} />
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]">
        <Panel>
          <PanelHead icon={FileBadge} title="All certificates" sub={loading ? "Loading…" : `${rows.length} shown`} />
          <div className="flex flex-wrap items-center gap-3 px-5 pb-4">
            <div className={cn(segment.wrap, "flex-wrap")}>
              {(["all", "phase_pass", "funded", "payout", "highest_payout", "award"] as const).map((k) => (
                <button key={k} type="button" onClick={() => setKind(k)} className={cn(segment.item(kind === k), "px-3 text-[12.5px]")}>
                  {k === "all" ? "All" : KINDS.find((x) => x.key === k)?.label}
                </button>
              ))}
            </div>
            <div className="relative">
              <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={cn(field(), selectField, "h-10 w-[130px] text-[13.5px]")}>
                <option value="active">Live</option>
                <option value="revoked">Revoked</option>
                <option value="all">All</option>
              </select>
              <SelectChevron />
            </div>
            <label className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-black/35" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, email or TPP-number" className={cn(field(), "h-10 pl-10 text-[13.5px]")} />
            </label>
          </div>

          {loading ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : rows.length === 0 ? (
            <Empty icon={FileBadge} title="No certificates match">
              Change the filters, or issue one from the panel on the right.
            </Empty>
          ) : (
            <div className={table.scroll}>
              <table className="w-full min-w-[640px] border-collapse">
                <thead>
                  <tr className={table.headRow}>
                    {["Certificate", "Trader", "Detail", "Date", "Status"].map((h) => (
                      <th key={h} className={table.th}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const Icon = ICON[r.kind];
                    return (
                      <tr key={r.id} className={cn(table.row, "cursor-pointer")} onClick={() => setViewing(r)}>
                        <td className={table.td}>
                          <div className="flex items-center gap-3">
                            <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-[12px]", r.kind === "highest_payout" || r.kind === "award" ? "bg-[var(--g-ink)] text-[var(--g-lime)]" : "bg-[var(--g-emerald)]/10 text-[var(--g-emerald)]")}>
                              <Icon className="h-4 w-4" />
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-[13.5px] font-semibold text-[var(--g-ink)]">{certificateTitle(r)}</span>
                              <span className="block text-[12px] text-[var(--g-muted-ink)]">
                                <span className="g-num">{r.number}</span> · {r.source === "admin" ? "by admin" : "auto"}
                              </span>
                            </span>
                          </div>
                        </td>
                        <td className={cn(table.td, "max-w-[200px]")}>
                          <span className="block truncate text-[13.5px] text-[var(--g-ink)]">{r.traderName}</span>
                          <span className="block truncate text-[12px] text-[var(--g-muted-ink)]">{r.email ?? "—"}</span>
                        </td>
                        <td className={cn(table.td, "g-num text-[13px] whitespace-nowrap text-[var(--g-ink)]")}>{detail(r) || "—"}</td>
                        <td className={cn(table.td, "text-[12.5px] text-[var(--g-muted-ink)]")}>{r.issuedOn}</td>
                        <td className={table.td}>
                          <Chip tone={r.status === "active" ? "emerald" : "red"}>{r.status === "active" ? "Live" : "Revoked"}</Chip>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <IssuePanel onIssued={(c) => { void load(); toast.success(`Issued ${c.number}`); }} />
      </div>

      {viewing ? <Viewer row={viewing} onClose={() => setViewing(null)} onChanged={() => { setViewing(null); void load(); }} /> : null}
    </div>
  );
}

/** Issue form: trader → type → the record behind it → preview → issue. */
function IssuePanel({ onIssued }: { onIssued: (c: Certificate) => void }) {
  const [search, setSearch] = useState("");
  const [traders, setTraders] = useState<Trader[]>([]);
  const [trader, setTrader] = useState<Trader | null>(null);
  const [cands, setCands] = useState<Candidates | null>(null);
  const [kind, setKind] = useState<CertificateKind>("payout");
  const [f, setF] = useState(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const set = (patch: Partial<typeof EMPTY_FORM>) => setF((v) => ({ ...v, ...patch }));

  useEffect(() => {
    if (trader || search.trim().length < 2) return setTraders([]);
    const t = setTimeout(async () => {
      const res = await fetch(`/api/admin/certificates/candidates?q=${encodeURIComponent(search.trim())}`);
      const data = await res.json();
      if (res.ok) setTraders(data.traders);
    }, 250);
    return () => clearTimeout(t);
  }, [search, trader]);

  useEffect(() => {
    if (!trader) return setCands(null);
    void (async () => {
      const res = await fetch(`/api/admin/certificates/candidates?userId=${trader.id}`);
      const data = await res.json();
      if (res.ok) setCands(data);
      else toast.error(data.error || "Could not load the trader's records");
    })();
  }, [trader]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const payload = useMemo(() => {
    if (!trader) return null;
    const common = { kind, userId: trader.id, traderName: f.traderName || undefined, note: f.note || undefined };
    switch (kind) {
      case "phase_pass":
      case "funded":
        return { ...common, tradingAccountId: f.accountId };
      case "payout":
        return f.payoutMode === "outside"
          ? { ...common, manualPayout: { accountId: f.manualAccountId, amount: Number(f.manualAmount), method: f.manualMethod, reference: f.manualReference, paidAt: f.manualDate } }
          : { ...common, payoutId: f.payoutId };
      case "highest_payout":
        return { ...common, payoutId: f.payoutId, periodType: f.periodType };
      case "award":
        return { ...common, tradingAccountId: f.accountId || null, title: f.title, statement: f.statement, highlightLabel: f.highlightLabel, highlightValue: f.highlightValue, issuedAt: f.issuedAt || undefined };
    }
  }, [trader, kind, f]);

  const preview = async () => {
    if (!payload) return;
    setBusy(true);
    const res = await fetch("/api/admin/certificates/preview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return toast.error(data.error || "Could not build the preview");
    }
    setPreviewUrl(URL.createObjectURL(await res.blob()));
  };

  const issue = async (e: FormEvent) => {
    e.preventDefault();
    if (!payload) return;
    if (kind === "payout" && f.payoutMode === "outside" && !window.confirm(`Record a ${usd(Number(f.manualAmount) || 0)} payout to ${trader?.email ?? "this trader"} as already paid, and issue its certificate?`)) return;
    setBusy(true);
    const res = await fetch("/api/admin/certificates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return toast.error(data.error || "Could not issue the certificate");
    onIssued(data.certificate);
    setF(EMPTY_FORM);
    setPreviewUrl(null);
    if (trader) setTrader({ ...trader });
  };

  const accounts = cands?.accounts ?? [];
  const paid = (cands?.payouts ?? []).filter((p) => p.status === "paid");

  return (
    <Panel className="xl:sticky xl:top-6">
      <PanelHead as="h3" icon={Plus} title="Issue a certificate" sub="Tied to the record it certifies" />
      <form onSubmit={issue} className="grid gap-4 p-5">
        <div>
          <span className={fieldLabel}>Trader</span>
          {trader ? (
            <div className="flex items-center justify-between gap-3 rounded-[16px] bg-black/[0.035] px-4 py-3">
              <span className="min-w-0">
                <span className="block truncate text-[14px] font-semibold text-[var(--g-ink)]">{trader.name ?? trader.email}</span>
                <span className="block truncate text-[12.5px] text-[var(--g-muted-ink)]">{trader.email}</span>
              </span>
              <button type="button" onClick={() => { setTrader(null); setSearch(""); setF(EMPTY_FORM); setPreviewUrl(null); }} className="cursor-pointer text-[12.5px] font-semibold text-[var(--g-emerald)] hover:underline">
                Change
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-black/35" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by email or name" className={cn(field(), "pl-11")} />
              {traders.length ? (
                <ul className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-[16px] bg-white shadow-[0_24px_48px_-24px_rgba(14,17,16,0.45)] ring-1 ring-black/10">
                  {traders.map((t) => (
                    <li key={t.id}>
                      <button type="button" onClick={() => { setTrader(t); setTraders([]); }} className="block w-full cursor-pointer px-4 py-2.5 text-left hover:bg-black/[0.035]">
                        <span className="block truncate text-[13.5px] font-semibold text-[var(--g-ink)]">{t.name ?? t.email}</span>
                        <span className="block truncate text-[12px] text-[var(--g-muted-ink)]">{t.email}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}
        </div>

        <div>
          <span className={fieldLabel}>Type</span>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {KINDS.map((k) => {
              const Icon = ICON[k.key];
              const on = kind === k.key;
              return (
                <button
                  key={k.key}
                  type="button"
                  onClick={() => { setKind(k.key); setF((v) => ({ ...EMPTY_FORM, traderName: v.traderName, note: v.note })); setPreviewUrl(null); }}
                  className={cn("flex cursor-pointer flex-col items-start gap-1.5 rounded-[16px] p-3 text-left ring-1 transition-all", on ? "bg-[var(--g-ink)] text-white ring-[var(--g-ink)]" : "bg-white/60 text-[var(--g-ink)] ring-black/[0.08] hover:bg-white")}
                >
                  <Icon className={cn("h-4 w-4", on ? "text-[var(--g-lime)]" : "text-[var(--g-emerald)]")} />
                  <span className="text-[13px] font-semibold">{k.label}</span>
                  <span className={cn("text-[11.5px] leading-snug", on ? "text-white/60" : "text-[var(--g-muted-ink)]")}>{k.hint}</span>
                </button>
              );
            })}
          </div>
        </div>

        {!trader ? (
          <p className="rounded-[16px] bg-black/[0.03] px-4 py-3 text-[13px] text-[var(--g-muted-ink)]">Pick a trader to see their accounts and payouts.</p>
        ) : !cands ? (
          <div className="flex justify-center py-6">
            <Spinner className="h-6 w-6" />
          </div>
        ) : (
          <>
            {kind === "phase_pass" || kind === "funded" ? (
              <label className="block">
                <span className={fieldLabel}>{kind === "funded" ? "Funded account" : "Passed phase"}</span>
                <span className="relative block">
                <select value={f.accountId} onChange={(e) => set({ accountId: e.target.value })} className={cn(field(), selectField)}>
                  <option value="">Choose…</option>
                  {accounts
                    .filter((a) => (kind === "funded" ? a.funded : a.passed))
                    .map((a) => {
                      const has = kind === "funded" ? a.fundedCertificate : a.phaseCertificate;
                      return (
                        <option key={a.id} value={a.id} disabled={Boolean(has)}>
                          {a.label} · {a.phase}
                          {a.passedOn ? ` · passed ${a.passedOn}` : ""}
                          {has ? ` · has ${has}` : ""}
                        </option>
                      );
                    })}
                </select>
                <SelectChevron />
                </span>
                {accounts.filter((a) => (kind === "funded" ? a.funded : a.passed)).length === 0 ? (
                  <span className="mt-2 block text-[12.5px] text-[var(--g-muted-ink)]">{kind === "funded" ? "This trader has no funded account." : "No passed phase yet. Mark a phase passed in Trading Accounts and its certificate is issued automatically."}</span>
                ) : null}
              </label>
            ) : null}

            {kind === "payout" ? (
              <div className="grid gap-3">
                <div className={segment.wrap}>
                  <button type="button" onClick={() => set({ payoutMode: "dashboard" })} className={segment.item(f.payoutMode === "dashboard")}>
                    Paid in the dashboard
                  </button>
                  <button type="button" onClick={() => set({ payoutMode: "outside" })} className={segment.item(f.payoutMode === "outside")}>
                    Paid outside
                  </button>
                </div>
                {f.payoutMode === "dashboard" ? (
                  <label className="block">
                    <span className={fieldLabel}>Paid payout</span>
                    <span className="relative block">
                    <select value={f.payoutId} onChange={(e) => set({ payoutId: e.target.value })} className={cn(field(), selectField)}>
                      <option value="">Choose…</option>
                      {paid.map((p) => (
                        <option key={p.id} value={p.id} disabled={Boolean(p.payoutCertificate)}>
                          {usd(p.amount)} · {p.paidOn}
                          {p.payoutCertificate ? ` · has ${p.payoutCertificate}` : ""}
                        </option>
                      ))}
                    </select>
                    <SelectChevron />
                    </span>
                    <span className="mt-2 block text-[12.5px] text-[var(--g-muted-ink)]">Paid payouts get their certificate automatically. Use this for one that was revoked, or that was paid before certificates existed.</span>
                  </label>
                ) : (
                  <div className="grid gap-3">
                    <Notice tone="amber">This records a payout you already sent by bank or crypto as a paid payout in the trader&apos;s history, then issues its certificate. It does not move any balance.</Notice>
                    <label className="block">
                      <span className={fieldLabel}>Account it was paid from</span>
                      <span className="relative block">
                      <select value={f.manualAccountId} onChange={(e) => set({ manualAccountId: e.target.value })} className={cn(field(), selectField)}>
                        <option value="">Choose…</option>
                        {(cands.terminalAccounts ?? []).map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.label} · {a.status}
                          </option>
                        ))}
                      </select>
                      <SelectChevron />
                      </span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label>
                        <span className={fieldLabel}>Amount paid (USD)</span>
                        <input type="number" min={0} step="0.01" value={f.manualAmount} onChange={(e) => set({ manualAmount: e.target.value })} className={cn(field(), "g-num")} />
                      </label>
                      <label>
                        <span className={fieldLabel}>Paid on</span>
                        <input type="date" value={f.manualDate} onChange={(e) => set({ manualDate: e.target.value })} className={field()} />
                      </label>
                    </div>
                    <div className="grid grid-cols-[1fr_1.3fr] gap-3">
                      <label className="block">
                        <span className={fieldLabel}>Method</span>
                        <span className="relative block">
                        <select value={f.manualMethod} onChange={(e) => set({ manualMethod: e.target.value })} className={cn(field(), selectField)}>
                          {["Bank transfer", "USDT TRC20", "USDT ERC20", "USDT BEP20", "Other"].map((m) => (
                            <option key={m}>{m}</option>
                          ))}
                        </select>
                        <SelectChevron />
                        </span>
                      </label>
                      <label>
                        <span className={fieldLabel}>Transfer reference</span>
                        <input value={f.manualReference} onChange={(e) => set({ manualReference: e.target.value })} placeholder="Tx hash or bank ref" className={cn(field(), "text-[14px]")} />
                      </label>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {kind === "highest_payout" ? (
              <div className="grid gap-3">
                <label className="block">
                  <span className={fieldLabel}>Payout to award</span>
                  <span className="relative block">
                  <select value={f.payoutId} onChange={(e) => set({ payoutId: e.target.value })} className={cn(field(), selectField)}>
                    <option value="">Choose…</option>
                    {paid.map((p) => (
                      <option key={p.id} value={p.id} disabled={Boolean(p.highestCertificate)}>
                        {usd(p.amount)} · {p.paidOn}
                        {p.highestCertificate ? ` · has ${p.highestCertificate}` : ""}
                      </option>
                    ))}
                  </select>
                  <SelectChevron />
                  </span>
                </label>
                <div>
                  <span className={fieldLabel}>Largest payout of the</span>
                  <div className={segment.wrap}>
                    <button type="button" onClick={() => set({ periodType: "month" })} className={segment.item(f.periodType === "month")}>
                      Month
                    </button>
                    <button type="button" onClick={() => set({ periodType: "year" })} className={segment.item(f.periodType === "year")}>
                      Year
                    </button>
                  </div>
                  <span className="mt-2 block text-[12.5px] text-[var(--g-muted-ink)]">It is only issued when no larger payout was paid in that period, and only once per period.</span>
                </div>
              </div>
            ) : null}

            {kind === "award" ? (
              <div className="grid gap-3">
                <label>
                  <span className={fieldLabel}>Title</span>
                  <input value={f.title} onChange={(e) => set({ title: e.target.value })} maxLength={60} placeholder="Trader of the Month" className={field()} />
                </label>
                <label>
                  <span className={fieldLabel}>Sentence under the name</span>
                  <textarea value={f.statement} onChange={(e) => set({ statement: e.target.value })} maxLength={220} rows={3} placeholder="for the most consistent performance across all funded accounts in October 2026." className={cn(field(), "h-auto py-3 text-[14px]")} />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label>
                    <span className={fieldLabel}>Highlight label (optional)</span>
                    <input value={f.highlightLabel} onChange={(e) => set({ highlightLabel: e.target.value })} maxLength={24} placeholder="Return" className={field()} />
                  </label>
                  <label>
                    <span className={fieldLabel}>Highlight value</span>
                    <input value={f.highlightValue} onChange={(e) => set({ highlightValue: e.target.value })} maxLength={24} placeholder="+18.4%" className={field()} />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className={fieldLabel}>Account (optional)</span>
                    <span className="relative block">
                    <select value={f.accountId} onChange={(e) => set({ accountId: e.target.value })} className={cn(field(), selectField)}>
                      <option value="">None</option>
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.label} · {a.phase}
                        </option>
                      ))}
                    </select>
                    <SelectChevron />
                    </span>
                  </label>
                  <label>
                    <span className={fieldLabel}>Date</span>
                    <input type="date" value={f.issuedAt} onChange={(e) => set({ issuedAt: e.target.value })} className={field()} />
                  </label>
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className={fieldLabel}>Printed name (optional)</span>
                <input value={f.traderName} onChange={(e) => set({ traderName: e.target.value })} maxLength={80} placeholder={trader.name ?? "From the profile"} className={field()} />
              </label>
              <label>
                <span className={fieldLabel}>Internal note</span>
                <input value={f.note} onChange={(e) => set({ note: e.target.value })} maxLength={300} className={field()} />
              </label>
            </div>

            {previewUrl ? (
              <div className="overflow-hidden rounded-[18px] bg-[#0b0f0e] ring-1 ring-black/10">
                {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
                <img src={previewUrl} alt="Certificate preview" className="block w-full" />
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => void preview()} disabled={busy} className={cn(btn.light, btn.sm)}>
                <Eye className="h-4 w-4" /> Preview
              </button>
              <button type="submit" disabled={busy} className={cn(btn.ink, btn.sm, "flex-1")}>
                {busy ? "Working…" : "Issue certificate"}
              </button>
            </div>
          </>
        )}
      </form>
    </Panel>
  );
}

/** One certificate: the artwork, its link, and the corrections an admin can make. */
function Viewer({ row, onClose, onChanged }: { row: Row; onClose: () => void; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"view" | "revoke" | "rename">("view");
  const [reason, setReason] = useState("");
  const [name, setName] = useState(row.traderName);
  const verify = `/verify/${row.id}`;

  const patch = async (body: Record<string, unknown>, done: string) => {
    setBusy(true);
    const res = await fetch(`/api/admin/certificates/${row.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) return toast.error(data.error || "That did not work");
    toast.success(done);
    onChanged();
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true" aria-label={certificateTitle(row)}>
      <div className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-[28px] bg-[#f4f6f5] p-3 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="relative aspect-[1.6] w-full overflow-hidden rounded-[20px] bg-[#0b0f0e]">
          <Image src={`${certificateImagePath(row.id)}?v=${row.status}-${row.traderName.length}`} alt={certificateTitle(row)} fill className="object-contain" unoptimized />
          <button type="button" onClick={onClose} aria-label="Close" className="absolute top-3 right-3 grid h-9 w-9 cursor-pointer place-items-center rounded-full bg-black/50 text-white hover:bg-black/70">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-4 p-4">
          <div className="min-w-0">
            <h3 className="text-[18px] font-semibold tracking-[-0.02em] text-[var(--g-ink)]">
              {certificateTitle(row)} · <span className="g-num">{row.number}</span>
            </h3>
            <p className="mt-1 text-[13px] text-[var(--g-muted-ink)]">
              {row.traderName} · {row.email ?? "—"} · {KIND_LABEL[row.kind]} · {row.source === "admin" ? "issued by an admin" : "issued automatically"}
            </p>
            {row.status === "revoked" ? <p className="mt-1 text-[13px] font-medium text-red-700">Revoked: {row.revokedReason}</p> : null}
            {row.note ? <p className="mt-1 text-[12.5px] text-[var(--g-muted-ink)]">Note: {row.note}</p> : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => void navigator.clipboard.writeText(`${window.location.origin}${verify}`).then(() => toast.success("Link copied"))} className={cn(btn.light, btn.sm)}>
              <Link2 className="h-4 w-4" /> Copy link
            </button>
            <a href={verify} target="_blank" rel="noreferrer" className={cn(btn.light, btn.sm)}>
              <ExternalLink className="h-4 w-4" /> Verify page
            </a>
            <a href={certificateImagePath(row.id)} download={`TPP_${row.number}.png`} className={cn(btn.light, btn.sm)}>
              <Download className="h-4 w-4" /> PNG
            </a>
          </div>
        </div>

        <div className="grid gap-3 px-4 pb-4">
          {mode === "view" ? (
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setMode("rename")} className={cn(btn.light, btn.sm)}>
                <Pencil className="h-4 w-4" /> Correct the name
              </button>
              {row.status === "active" ? (
                <button type="button" onClick={() => setMode("revoke")} className={cn(btn.light, btn.sm, "text-red-700!")}>
                  <Ban className="h-4 w-4" /> Revoke
                </button>
              ) : (
                <button type="button" disabled={busy} onClick={() => void patch({ action: "restore" }, "Certificate restored")} className={cn(btn.light, btn.sm)}>
                  <RotateCcw className="h-4 w-4" /> Restore
                </button>
              )}
            </div>
          ) : mode === "revoke" ? (
            <form
              className="flex flex-wrap items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void patch({ action: "revoke", reason }, "Certificate revoked");
              }}
            >
              <label className="min-w-[240px] flex-1">
                <span className={fieldLabel}>Reason (shown on the verification page)</span>
                <input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={200} placeholder="Issued in error" className={field()} autoFocus />
              </label>
              <button type="submit" disabled={busy} className={cn(btn.ink, btn.sm, "bg-red-600!")}>
                Revoke
              </button>
              <button type="button" onClick={() => setMode("view")} className={cn(btn.light, btn.sm)}>
                Cancel
              </button>
            </form>
          ) : (
            <form
              className="flex flex-wrap items-end gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void patch({ action: "rename", traderName: name }, "Name corrected");
              }}
            >
              <label className="min-w-[240px] flex-1">
                <span className={fieldLabel}>Name printed on the certificate</span>
                <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} className={field()} autoFocus />
              </label>
              <button type="submit" disabled={busy} className={cn(btn.ink, btn.sm)}>
                Save
              </button>
              <button type="button" onClick={() => setMode("view")} className={cn(btn.light, btn.sm)}>
                Cancel
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
