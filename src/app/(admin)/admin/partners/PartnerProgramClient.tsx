"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Award,
  Search,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  FileText,
  TrendingUp,
  Shield,
  DollarSign,
  Star,
  Calendar,
  User,
  Hash,
  Clipboard,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Certificate {
  id: string;
  number: string;
  kind: string;
  status: string;
  user_id: string;
  trader_name: string;
  account_id: string | null;
  trading_account_id: string | null;
  payout_id: string | null;
  program_key: string | null;
  account_size: number | null;
  phase_index: number | null;
  amount: number | null;
  period_label: string | null;
  title: string | null;
  statement: string | null;
  highlight_label: string | null;
  highlight_value: string | null;
  issued_at: string;
  source: string;
  issued_by: string | null;
  revoked_reason: string | null;
  revoked_at: string | null;
  note: string | null;
  is_test: boolean;
  user_email: string | null;
  user_display_name: string | null;
}

interface Profile {
  id: string;
  email: string;
  display_name: string | null;
}

interface Props {
  certificates: Certificate[];
  allProfiles: Profile[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const KIND_LABELS: Record<string, string> = {
  payout: "Payout",
  phase_pass: "Phase Pass",
  funded: "Funded",
  highest_payout: "Highest Payout",
  award: "Award",
};

const KIND_COLORS: Record<string, { bg: string; text: string }> = {
  payout: { bg: "bg-emerald-500/15", text: "text-emerald-400" },
  phase_pass: { bg: "bg-blue-500/15", text: "text-blue-400" },
  funded: { bg: "bg-purple-500/15", text: "text-purple-400" },
  highest_payout: { bg: "bg-amber-500/15", text: "text-amber-400" },
  award: { bg: "bg-pink-500/15", text: "text-pink-400" },
};

const PROGRAM_OPTIONS = [
  { value: "instant", label: "Instant" },
  { value: "1-step", label: "1-Step" },
  { value: "2-step", label: "2-Step" },
  { value: "3-step", label: "3-Step" },
  { value: "royal", label: "Royal" },
];

const ACCOUNT_SIZE_OPTIONS = [
  { value: 5000, label: "$5K" },
  { value: 10000, label: "$10K" },
  { value: 25000, label: "$25K" },
  { value: 50000, label: "$50K" },
  { value: 100000, label: "$100K" },
  { value: 200000, label: "$200K" },
];

const FILTER_TABS = [
  { value: "all", label: "All" },
  { value: "payout", label: "Payout" },
  { value: "phase_pass", label: "Phase Pass" },
  { value: "funded", label: "Funded" },
  { value: "award", label: "Award" },
  { value: "highest_payout", label: "Highest Payout" },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(val: number | null) {
  if (val == null) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(val);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function PartnerProgramClient({ certificates, allProfiles }: Props) {
  const router = useRouter();

  /* State */
  const [search, setSearch] = useState("");
  const [kindFilter, setKindFilter] = useState("all");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  /* Filtered list */
  const filtered = useMemo(() => {
    let list = certificates;
    if (kindFilter !== "all") {
      list = list.filter((c) => c.kind === kindFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.trader_name?.toLowerCase().includes(q) ||
          c.user_email?.toLowerCase().includes(q) ||
          c.number?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [certificates, kindFilter, search]);

  /* Stats */
  const totalCerts = certificates.length;
  const payoutCerts = certificates.filter((c) => c.kind === "payout").length;
  const phasePassCerts = certificates.filter(
    (c) => c.kind === "phase_pass"
  ).length;
  const fundedCerts = certificates.filter((c) => c.kind === "funded").length;

  return (
    <div className="min-h-screen p-6 md:p-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            className="text-3xl font-display font-bold tracking-tight"
            style={{ color: "var(--ink-950)" }}
          >
            Partner Program
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--ink-500)" }}>
            Manage and issue certificates for traders
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          icon={<FileText className="w-5 h-5" />}
          label="Total Certificates"
          value={totalCerts}
          color="var(--accent)"
        />
        <StatCard
          icon={<DollarSign className="w-5 h-5" />}
          label="Payout Certs"
          value={payoutCerts}
          color="#10b981"
        />
        <StatCard
          icon={<Shield className="w-5 h-5" />}
          label="Phase Pass Certs"
          value={phasePassCerts}
          color="#3b82f6"
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Funded Certs"
          value={fundedCerts}
          color="#a855f7"
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: "var(--ink-400)" }}
          />
          <input
            type="text"
            placeholder="Search by name, email, or cert number…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={cn(
              "w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-colors",
              "border focus:ring-2 focus:ring-[var(--accent)]/30"
            )}
            style={{
              background: "var(--paper-2)",
              borderColor: "var(--border)",
              color: "var(--ink-950)",
            }}
          />
        </div>

        {/* Filter Tabs */}
        <div
          className="flex items-center gap-1 p-1 rounded-xl"
          style={{ background: "var(--paper-2)" }}
        >
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setKindFilter(tab.value)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                kindFilter === tab.value
                  ? "shadow-sm"
                  : "hover:opacity-80"
              )}
              style={{
                background:
                  kindFilter === tab.value ? "var(--paper)" : "transparent",
                color:
                  kindFilter === tab.value
                    ? "var(--ink-950)"
                    : "var(--ink-500)",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Issue Button */}
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "var(--accent)" }}
        >
          <Plus className="w-4 h-4" />
          Issue Certificate
        </button>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl border overflow-hidden"
        style={{ borderColor: "var(--border)", background: "var(--paper)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: "var(--paper-2)" }}>
                {[
                  "",
                  "Cert Number",
                  "Trader Name",
                  "Email",
                  "Type",
                  "Program",
                  "Account Size",
                  "Amount",
                  "Status",
                  "Issued At",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--ink-500)" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-12 text-center text-sm"
                    style={{ color: "var(--ink-400)" }}
                  >
                    No certificates found
                  </td>
                </tr>
              )}
              {filtered.map((cert) => {
                const isExpanded = expandedRow === cert.id;
                const kindColor = KIND_COLORS[cert.kind] || {
                  bg: "bg-gray-500/15",
                  text: "text-gray-400",
                };
                return (
                  <TableRowGroup key={cert.id}>
                    <tr
                      className="border-t cursor-pointer transition-colors hover:opacity-90"
                      style={{ borderColor: "var(--border)" }}
                      onClick={() =>
                        setExpandedRow(isExpanded ? null : cert.id)
                      }
                    >
                      <td className="px-4 py-3">
                        {isExpanded ? (
                          <ChevronDown
                            className="w-4 h-4"
                            style={{ color: "var(--ink-400)" }}
                          />
                        ) : (
                          <ChevronRight
                            className="w-4 h-4"
                            style={{ color: "var(--ink-400)" }}
                          />
                        )}
                      </td>
                      <td
                        className="px-4 py-3 font-mono text-xs"
                        style={{ color: "var(--ink-950)" }}
                      >
                        {cert.number}
                      </td>
                      <td
                        className="px-4 py-3 font-medium"
                        style={{ color: "var(--ink-950)" }}
                      >
                        {cert.trader_name}
                      </td>
                      <td
                        className="px-4 py-3"
                        style={{ color: "var(--ink-500)" }}
                      >
                        {cert.user_email || "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                            kindColor.bg,
                            kindColor.text
                          )}
                        >
                          {KIND_LABELS[cert.kind] || cert.kind}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3"
                        style={{ color: "var(--ink-500)" }}
                      >
                        {cert.program_key || "—"}
                      </td>
                      <td
                        className="px-4 py-3"
                        style={{ color: "var(--ink-500)" }}
                      >
                        {cert.account_size
                          ? formatCurrency(cert.account_size)
                          : "—"}
                      </td>
                      <td
                        className="px-4 py-3 font-medium"
                        style={{ color: "var(--ink-950)" }}
                      >
                        {cert.amount ? formatCurrency(cert.amount) : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                            cert.status === "active"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-red-500/15 text-red-400"
                          )}
                        >
                          {cert.status === "active" ? "Active" : "Revoked"}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3 text-xs"
                        style={{ color: "var(--ink-500)" }}
                      >
                        {formatDate(cert.issued_at)}
                      </td>
                    </tr>

                    {/* Expanded details */}
                    {isExpanded && (
                      <tr
                        className="border-t"
                        style={{
                          borderColor: "var(--border)",
                          background: "var(--paper-2)",
                        }}
                      >
                        <td colSpan={10} className="px-6 py-5">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <DetailItem
                              label="Certificate ID"
                              value={cert.id}
                            />
                            <DetailItem label="User ID" value={cert.user_id} />
                            <DetailItem
                              label="Source"
                              value={cert.source}
                            />
                            <DetailItem
                              label="Phase Index"
                              value={
                                cert.phase_index != null
                                  ? `Phase ${cert.phase_index}`
                                  : "—"
                              }
                            />
                            <DetailItem
                              label="Period"
                              value={cert.period_label || "—"}
                            />
                            <DetailItem
                              label="Title"
                              value={cert.title || "—"}
                            />
                            <DetailItem
                              label="Highlight"
                              value={
                                cert.highlight_label && cert.highlight_value
                                  ? `${cert.highlight_label}: ${cert.highlight_value}`
                                  : "—"
                              }
                            />
                            <DetailItem
                              label="Is Test"
                              value={cert.is_test ? "Yes" : "No"}
                            />
                            <DetailItem
                              label="Issued By"
                              value={cert.issued_by || "—"}
                            />
                            {cert.statement && (
                              <div className="md:col-span-3">
                                <DetailItem
                                  label="Statement"
                                  value={cert.statement}
                                />
                              </div>
                            )}
                            {cert.note && (
                              <div className="md:col-span-3">
                                <DetailItem label="Note" value={cert.note} />
                              </div>
                            )}
                            {cert.revoked_at && (
                              <>
                                <DetailItem
                                  label="Revoked At"
                                  value={formatDate(cert.revoked_at)}
                                />
                                <DetailItem
                                  label="Revoked Reason"
                                  value={cert.revoked_reason || "—"}
                                />
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </TableRowGroup>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue Certificate Modal */}
      {modalOpen && (
        <IssueCertificateModal
          allProfiles={allProfiles}
          onClose={() => setModalOpen(false)}
          onSuccess={() => {
            setModalOpen(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function TableRowGroup({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className="rounded-2xl border p-5 flex items-center gap-4"
      style={{ borderColor: "var(--border)", background: "var(--paper)" }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ background: `${color}18`, color }}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium" style={{ color: "var(--ink-500)" }}>
          {label}
        </p>
        <p
          className="text-2xl font-display font-bold"
          style={{ color: "var(--ink-950)" }}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p
        className="text-xs font-medium mb-0.5"
        style={{ color: "var(--ink-400)" }}
      >
        {label}
      </p>
      <p
        className="text-sm break-all"
        style={{ color: "var(--ink-950)" }}
      >
        {value}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Issue Certificate Modal                                            */
/* ------------------------------------------------------------------ */

function IssueCertificateModal({
  allProfiles,
  onClose,
  onSuccess,
}: {
  allProfiles: Profile[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [userSearch, setUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [traderName, setTraderName] = useState("");
  const [kind, setKind] = useState("payout");
  const [programKey, setProgramKey] = useState("instant");
  const [accountSize, setAccountSize] = useState<number>(5000);
  const [amount, setAmount] = useState("");
  const [phaseIndex, setPhaseIndex] = useState("1");
  const [titleField, setTitleField] = useState("");
  const [statement, setStatement] = useState("");
  const [highlightLabel, setHighlightLabel] = useState("");
  const [highlightValue, setHighlightValue] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* Close dropdown on outside click */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filteredProfiles = useMemo(() => {
    if (!userSearch.trim()) return [];
    const q = userSearch.toLowerCase();
    return allProfiles
      .filter((p) => p.email.toLowerCase().includes(q))
      .slice(0, 8);
  }, [userSearch, allProfiles]);

  function selectProfile(p: Profile) {
    setSelectedUser(p);
    setUserSearch(p.email);
    setTraderName(p.display_name || p.email.split("@")[0]);
    setShowDropdown(false);
  }

  async function handleSubmit() {
    if (!selectedUser) {
      setError("Please select a user");
      return;
    }
    if (!traderName.trim()) {
      setError("Trader name is required");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const body: Record<string, any> = {
        user_id: selectedUser.id,
        trader_name: traderName.trim(),
        kind,
        program_key: programKey,
        account_size: accountSize,
      };

      if (kind === "payout" || kind === "highest_payout") {
        body.amount = amount ? parseFloat(amount) : null;
      }
      if (kind === "phase_pass") {
        body.phase_index = parseInt(phaseIndex);
      }
      if (kind === "award") {
        body.title = titleField.trim() || null;
      }
      if (statement.trim()) body.statement = statement.trim();
      if (highlightLabel.trim()) body.highlight_label = highlightLabel.trim();
      if (highlightValue.trim()) body.highlight_value = highlightValue.trim();
      if (note.trim()) body.note = note.trim();

      const res = await fetch("/api/admin/partners/issue-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to issue certificate");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border p-6 shadow-2xl"
        style={{
          background: "var(--paper)",
          borderColor: "var(--border)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{
                background: "var(--accent)",
                color: "white",
              }}
            >
              <Award className="w-5 h-5" />
            </div>
            <h2
              className="text-xl font-display font-bold"
              style={{ color: "var(--ink-950)" }}
            >
              Issue Certificate
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:opacity-80"
            style={{ color: "var(--ink-400)" }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* User Search */}
          <div ref={dropdownRef} className="relative">
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--ink-500)" }}
            >
              <User className="w-3.5 h-3.5 inline mr-1" />
              User
            </label>
            <input
              type="text"
              placeholder="Search by email…"
              value={userSearch}
              onChange={(e) => {
                setUserSearch(e.target.value);
                setShowDropdown(true);
                setSelectedUser(null);
              }}
              onFocus={() => setShowDropdown(true)}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition-colors focus:ring-2 focus:ring-[var(--accent)]/30"
              style={{
                background: "var(--paper-2)",
                borderColor: "var(--border)",
                color: "var(--ink-950)",
              }}
            />
            {showDropdown && filteredProfiles.length > 0 && (
              <div
                className="absolute z-10 w-full mt-1 rounded-xl border shadow-lg overflow-hidden max-h-48 overflow-y-auto"
                style={{
                  background: "var(--paper)",
                  borderColor: "var(--border)",
                }}
              >
                {filteredProfiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => selectProfile(p)}
                    className="w-full px-4 py-2.5 text-left text-sm transition-colors hover:opacity-80 flex items-center justify-between"
                    style={{
                      color: "var(--ink-950)",
                      borderBottom: "1px solid var(--border)",
                    }}
                  >
                    <span>{p.email}</span>
                    {p.display_name && (
                      <span
                        className="text-xs"
                        style={{ color: "var(--ink-400)" }}
                      >
                        {p.display_name}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Trader Name */}
          <FieldInput
            label="Trader Name"
            icon={<User className="w-3.5 h-3.5" />}
            value={traderName}
            onChange={setTraderName}
            placeholder="Trader display name"
          />

          {/* Certificate Type */}
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--ink-500)" }}
            >
              <Award className="w-3.5 h-3.5 inline mr-1" />
              Certificate Type
            </label>
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition-colors focus:ring-2 focus:ring-[var(--accent)]/30"
              style={{
                background: "var(--paper-2)",
                borderColor: "var(--border)",
                color: "var(--ink-950)",
              }}
            >
              <option value="payout">Payout</option>
              <option value="highest_payout">Highest Payout</option>
              <option value="phase_pass">Phase Pass</option>
              <option value="funded">Funded</option>
              <option value="award">Award</option>
            </select>
          </div>

          {/* Program */}
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--ink-500)" }}
            >
              <Star className="w-3.5 h-3.5 inline mr-1" />
              Program
            </label>
            <select
              value={programKey}
              onChange={(e) => setProgramKey(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition-colors focus:ring-2 focus:ring-[var(--accent)]/30"
              style={{
                background: "var(--paper-2)",
                borderColor: "var(--border)",
                color: "var(--ink-950)",
              }}
            >
              {PROGRAM_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Account Size */}
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--ink-500)" }}
            >
              <DollarSign className="w-3.5 h-3.5 inline mr-1" />
              Account Size
            </label>
            <select
              value={accountSize}
              onChange={(e) => setAccountSize(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition-colors focus:ring-2 focus:ring-[var(--accent)]/30"
              style={{
                background: "var(--paper-2)",
                borderColor: "var(--border)",
                color: "var(--ink-950)",
              }}
            >
              {ACCOUNT_SIZE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          {/* Amount (payout / highest_payout) */}
          {(kind === "payout" || kind === "highest_payout") && (
            <FieldInput
              label="Amount"
              icon={<DollarSign className="w-3.5 h-3.5" />}
              value={amount}
              onChange={setAmount}
              placeholder="e.g. 5000"
              type="number"
            />
          )}

          {/* Phase Index (phase_pass) */}
          {kind === "phase_pass" && (
            <div>
              <label
                className="block text-xs font-medium mb-1.5"
                style={{ color: "var(--ink-500)" }}
              >
                <Hash className="w-3.5 h-3.5 inline mr-1" />
                Phase Index
              </label>
              <select
                value={phaseIndex}
                onChange={(e) => setPhaseIndex(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition-colors focus:ring-2 focus:ring-[var(--accent)]/30"
                style={{
                  background: "var(--paper-2)",
                  borderColor: "var(--border)",
                  color: "var(--ink-950)",
                }}
              >
                <option value="1">Phase 1</option>
                <option value="2">Phase 2</option>
                <option value="3">Phase 3</option>
              </select>
            </div>
          )}

          {/* Title (award) */}
          {kind === "award" && (
            <FieldInput
              label="Title"
              icon={<Award className="w-3.5 h-3.5" />}
              value={titleField}
              onChange={setTitleField}
              placeholder="Award title"
            />
          )}

          {/* Statement */}
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--ink-500)" }}
            >
              <Clipboard className="w-3.5 h-3.5 inline mr-1" />
              Statement
            </label>
            <textarea
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder="Certificate statement…"
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition-colors resize-none focus:ring-2 focus:ring-[var(--accent)]/30"
              style={{
                background: "var(--paper-2)",
                borderColor: "var(--border)",
                color: "var(--ink-950)",
              }}
            />
          </div>

          {/* Highlight Label + Value */}
          <div className="grid grid-cols-2 gap-3">
            <FieldInput
              label="Highlight Label"
              value={highlightLabel}
              onChange={setHighlightLabel}
              placeholder="e.g. Total Profit"
            />
            <FieldInput
              label="Highlight Value"
              value={highlightValue}
              onChange={setHighlightValue}
              placeholder="e.g. $12,500"
            />
          </div>

          {/* Note */}
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: "var(--ink-500)" }}
            >
              Note
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Internal note (optional)…"
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition-colors resize-none focus:ring-2 focus:ring-[var(--accent)]/30"
              style={{
                background: "var(--paper-2)",
                borderColor: "var(--border)",
                color: "var(--ink-950)",
              }}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors hover:opacity-80"
              style={{
                borderColor: "var(--border)",
                color: "var(--ink-500)",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ background: "var(--accent)" }}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Issuing…
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Issue Certificate
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Reusable Field Input                                               */
/* ------------------------------------------------------------------ */

function FieldInput({
  label,
  icon,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  icon?: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div>
      <label
        className="block text-xs font-medium mb-1.5"
        style={{ color: "var(--ink-500)" }}
      >
        {icon && <span className="inline mr-1">{icon}</span>}
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none border transition-colors focus:ring-2 focus:ring-[var(--accent)]/30"
        style={{
          background: "var(--paper-2)",
          borderColor: "var(--border)",
          color: "var(--ink-950)",
        }}
      />
    </div>
  );
}
