"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import Image from "next/image";
import { Award, BadgeCheck, Ban, CircleDollarSign, Download, ExternalLink, Eye, FileBadge, Link2, Medal, Pencil, Plus, RotateCcw, Search, Trophy, X, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { certificateImagePath, certificateTitle, KIND_LABEL, type Certificate, type CertificateKind } from "@/lib/certificates/types";
import { Chip, Empty, Notice, PageTitle, Panel, PanelHead, SelectChevron, Spinner, Stat, btn, field, fieldLabel, segment, selectField, table } from "@/components/dashboard/glass";
import { programs } from "@/data/programs";

type Row = Certificate & { email: string | null; note: string | null; createdAt: string };
type Trader = { id: string; email: string | null; name: string | null };
type Candidates = {
  isStaff: boolean;
  accounts: { id: string; source: "dashboard" | "terminal"; label: string; phase: string; status: string; funded: boolean; passed: boolean; passedOn: string | null; phaseCertificate: { id: string; number: string } | null; fundedCertificate: { id: string; number: string } | null }[];
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
  accountSource: "dashboard" as "dashboard" | "terminal",
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
  test: false,
  testProgram: "2-step",
  testSize: "100000",
  testPhase: "1",
  testAmount: "",
  testPeriod: "",
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
                                <span className="g-num">{r.number}</span> · {r.isTest ? <span className="font-bold text-amber-700">TEST</span> : r.source === "admin" ? "by admin" : "auto"}
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
    if (f.test && cands?.isStaff) {
      return {
        ...common,
        test: true,
        issuedAt: f.issuedAt || undefined,
        title: f.title,
        statement: f.statement,
        highlightLabel: f.highlightLabel,
        highlightValue: f.highlightValue,
        testDetails: { programKey: f.testProgram || undefined, accountSize: Number(f.testSize) || undefined, phaseIndex: Number(f.testPhase), amount: Number(f.testAmount) || undefined, periodLabel: f.testPeriod || undefined },
      };
    }
    switch (kind) {
      case "phase_pass":
      case "funded":
        return f.accountSource === "terminal" ? { ...common, accountId: f.accountId } : { ...common, tradingAccountId: f.accountId };
      case "payout":
        return f.payoutMode === "outside"
          ? { ...common, manualPayout: { accountId: f.manualAccountId, amount: Number(f.manualAmount), method: f.manualMethod, reference: f.manualReference, paidAt: f.manualDate } }
          : { ...common, payoutId: f.payoutId };
      case "highest_payout":
        return { ...common, payoutId: f.payoutId, periodType: f.periodType };
      case "award":
        return { ...common, tradingAccountId: f.accountId || null, title: f.title, statement: f.statement, highlightLabel: f.highlightLabel, highlightValue: f.highlightValue, issuedAt: f.issuedAt || undefined };
    }
  }, [trader, kind, f, cands?.isStaff]);

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
                  onClick={() => { setKind(k.key); setF((v) => ({ ...EMPTY_FORM, traderName: v.traderName, note: v.note, test: v.test, testProgram: v.testProgram, testSize: v.testSize })); setPreviewUrl(null); }}
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
            {cands.isStaff ? (
              <label className={cn("flex cursor-pointer items-start gap-3 rounded-[16px] px-4 py-3 ring-1", f.test ? "bg-amber-400/15 ring-amber-500/40" : "bg-black/[0.03] ring-black/[0.06]")}>
                <input type="checkbox" checked={f.test} onChange={(e) => { set({ test: e.target.checked }); setPreviewUrl(null); }} className="mt-1 h-4 w-4 accent-[var(--g-ink)]" />
                <span>
                  <span className="block text-[13.5px] font-semibold text-[var(--g-ink)]">Test certificate</span>
                  <span className="block text-[12.5px] leading-snug text-[var(--g-muted-ink)]">Staff account: any details, for trying designs and the dashboard. It carries a TEST mark and its verification page says it is a test.</span>
                </span>
              </label>
            ) : null}

            {f.test && cands.isStaff ? (
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className={fieldLabel}>Program</span>
                    <span className="relative block">
                      <select value={f.testProgram} onChange={(e) => set({ testProgram: e.target.value })} className={cn(field(), selectField)}>
                        <option value="">None</option>
                        {programs.map((p) => (
                          <option key={p.key} value={p.key}>
                            {p.label}
                          </option>
                        ))}
                      </select>
                      <SelectChevron />
                    </span>
                  </label>
                  <label>
                    <span className={fieldLabel}>Account size (USD)</span>
                    <input type="number" min={0} step={1000} value={f.testSize} onChange={(e) => set({ testSize: e.target.value })} className={cn(field(), "g-num")} />
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {kind === "phase_pass" ? (
                    <label className="block">
                      <span className={fieldLabel}>Phase</span>
                      <span className="relative block">
                        <select value={f.testPhase} onChange={(e) => set({ testPhase: e.target.value })} className={cn(field(), selectField)}>
                          <option value="1">Phase 1</option>
                          <option value="2">Phase 2</option>
                          <option value="3">Phase 3</option>
                        </select>
                        <SelectChevron />
                      </span>
                    </label>
                  ) : kind === "payout" || kind === "highest_payout" ? (
                    <label>
                      <span className={fieldLabel}>Amount (USD)</span>
                      <input type="number" min={0} step="0.01" value={f.testAmount} onChange={(e) => set({ testAmount: e.target.value })} className={cn(field(), "g-num")} />
                    </label>
                  ) : (
                    <span />
                  )}
                  <label>
                    <span className={fieldLabel}>Date</span>
                    <input type="date" value={f.issuedAt} onChange={(e) => set({ issuedAt: e.target.value })} className={field()} />
                  </label>
                </div>
                {kind === "highest_payout" ? (
                  <label>
                    <span className={fieldLabel}>Period</span>
                    <input value={f.testPeriod} onChange={(e) => set({ testPeriod: e.target.value })} maxLength={30} placeholder="October 2026" className={field()} />
                  </label>
                ) : null}
              </div>
            ) : null}

            {!f.test && (kind === "phase_pass" || kind === "funded") ? (
              <AccountPicker
                kind={kind}
                accounts={accounts.filter((a) => (kind === "funded" ? a.funded : !a.funded))}
                value={f.accountId}
                onPick={(a) => set({ accountId: a.id, accountSource: a.source })}
              />
            ) : null}

            {!f.test && kind === "payout" ? (
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

            {!f.test && kind === "highest_payout" ? (
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
                {f.test ? null : (
                <div className="grid grid-cols-2 gap-3">
                  <label className="block">
                    <span className={fieldLabel}>Account (optional)</span>
                    <span className="relative block">
                    <select value={f.accountId} onChange={(e) => set({ accountId: e.target.value })} className={cn(field(), selectField)}>
                      <option value="">None</option>
                      {accounts
                        .filter((a) => a.source === "dashboard")
                        .map((a) => (
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
                )}
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

/**
 * Every phase (or funded account) the trader has, with why it can or can't be certified:
 * passed and not yet certified → pick it; already certified → open that certificate;
 * not passed → pass it in Trading Accounts, which issues the certificate by itself.
 */
function AccountPicker({ kind, accounts, value, onPick }: { kind: "phase_pass" | "funded"; accounts: Candidates["accounts"]; value: string; onPick: (a: Candidates["accounts"][number]) => void }) {
  if (accounts.length === 0) {
    return (
      <div>
        <span className={fieldLabel}>{kind === "funded" ? "Funded account" : "Phase"}</span>
        <p className="rounded-[16px] bg-black/[0.03] px-4 py-3 text-[13px] text-[var(--g-muted-ink)]">{kind === "funded" ? "This trader has no funded account yet." : "This trader has no evaluation phase yet."}</p>
      </div>
    );
  }
  const STATUS: Record<string, string> = { active: "In progress", breached: "Breached", passed: "Passed", funded: "Funded", suspended: "Paused" };
  return (
    <div>
      <span className={fieldLabel}>{kind === "funded" ? "Funded account" : "Phase"}</span>
      <ul className="grid gap-2">
        {accounts.map((a) => {
          const existing = kind === "funded" ? a.fundedCertificate : a.phaseCertificate;
          const eligible = kind === "funded" ? a.funded : a.passed;
          const selectable = eligible && !existing;
          const on = value === a.id;
          return (
            <li key={`${a.source}-${a.id}`}>
              <div
                role={selectable ? "button" : undefined}
                tabIndex={selectable ? 0 : undefined}
                onClick={() => selectable && onPick(a)}
                onKeyDown={(e) => selectable && (e.key === "Enter" || e.key === " ") && (e.preventDefault(), onPick(a))}
                className={cn(
                  "flex items-start gap-3 rounded-[16px] px-4 py-3 ring-1 transition-colors",
                  selectable ? "cursor-pointer" : "cursor-default",
                  on ? "bg-[var(--g-ink)] text-white ring-[var(--g-ink)]" : selectable ? "bg-white/70 ring-black/[0.08] hover:bg-white" : "bg-black/[0.025] ring-black/[0.05]",
                )}
              >
                <span className={cn("mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full ring-2", on ? "ring-[var(--g-lime)]" : selectable ? "ring-black/25" : "ring-black/10")}>
                  {on ? <span className="h-2 w-2 rounded-full bg-[var(--g-lime)]" /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block truncate text-[13.5px] font-semibold", on ? "text-white" : selectable ? "text-[var(--g-ink)]" : "text-[var(--g-muted-ink)]")}>
                    {a.phase} · {a.label}
                  </span>
                  <span className={cn("mt-0.5 block text-[12px]", on ? "text-white/65" : "text-[var(--g-muted-ink)]")}>
                    {existing ? (
                      <>
                        Certificate {existing.number} already issued.{" "}
                        <a href={`/verify/${existing.id}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="font-semibold text-[var(--g-emerald)] hover:underline">
                          View it
                        </a>{" "}
                        · revoke it first to issue a new one.
                      </>
                    ) : eligible ? (
                      kind === "funded" ? "Funded account, ready to certify." : `Passed${a.passedOn ? ` on ${a.passedOn}` : ""}, ready to certify.`
                    ) : a.status === "breached" ? (
                      "Breached before passing, so there is nothing to certify."
                    ) : (
                      <>
                        Not passed yet.{" "}
                        {a.source === "dashboard" ? (
                          <a href={`/admin/trading/accounts/${a.id}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="font-semibold text-[var(--g-emerald)] hover:underline">
                            Mark it passed in Trading Accounts
                          </a>
                        ) : (
                          "Mark it passed in Trading Accounts"
                        )}{" "}
                        and the certificate is issued automatically.
                      </>
                    )}
                  </span>
                </span>
                <Chip tone={existing ? "emerald" : eligible ? "lime" : a.status === "breached" ? "red" : "neutral"} className="shrink-0">
                  {existing ? "Issued" : STATUS[a.status] ?? a.status}
                </Chip>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
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
              {row.isTest ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={async () => {
                    if (!window.confirm(`Delete test certificate ${row.number}?`)) return;
                    setBusy(true);
                    const res = await fetch(`/api/admin/certificates/${row.id}`, { method: "DELETE" });
                    const data = await res.json();
                    setBusy(false);
                    if (!res.ok) return toast.error(data.error || "Could not delete it");
                    toast.success("Test certificate deleted");
                    onChanged();
                  }}
                  className={cn(btn.light, btn.sm, "text-red-700!")}
                >
                  <Ban className="h-4 w-4" /> Delete test certificate
                </button>
              ) : row.status === "active" ? (
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
