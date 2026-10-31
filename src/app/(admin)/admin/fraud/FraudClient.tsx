"use client";

import { useState, useMemo } from "react";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ShieldAlert, ShieldCheck, Shield, Eye, TriangleAlert as AlertTriangle, OctagonAlert as AlertOctagon, CircleAlert as AlertCircle, Info, Search, ListFilter as Filter, UserX, StickyNote, Check, X, Ban, Users, Globe, FingerprintPattern as Fingerprint, Copy, Wifi, Link2, Flag } from "lucide-react";
import { toast } from "sonner";

interface FraudFlag {
  id: string;
  user_id: string;
  flag_type: string;
  severity: string;
  status: string;
  description: string;
  evidence: any;
  ip_address: string | null;
  device_fingerprint: string | null;
  related_user_ids: string[];
  reviewed_by: string | null;
  reviewed_at: string | null;
  resolution: string | null;
  created_at: string;
  profiles: { id: string; email: string; display_name: string } | null;
}

interface FraudClientProps {
  initialFlags: FraudFlag[];
  severityCounts: Record<string, number>;
  typeCounts: Record<string, number>;
}

const severityConfig: Record<string, { label: string; icon: any; className: string }> = {
  critical: { label: "Critical", icon: AlertOctagon, className: "bg-red-100 text-red-800 border-red-200" },
  high: { label: "High", icon: AlertTriangle, className: "bg-orange-100 text-orange-800 border-orange-200" },
  medium: { label: "Medium", icon: AlertCircle, className: "bg-amber-100 text-amber-800 border-amber-200" },
  low: { label: "Low", icon: Info, className: "bg-slate-100 text-slate-600 border-slate-200" },
};

const statusConfig: Record<string, { label: string; className: string }> = {
  open: { label: "Open", className: "bg-red-50 text-red-700 border-red-200" },
  reviewing: { label: "Reviewing", className: "bg-amber-50 text-amber-700 border-amber-200" },
  resolved: { label: "Resolved", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  dismissed: { label: "Dismissed", className: "bg-slate-100 text-slate-600 border-slate-200" },
};

const typeConfig: Record<string, { label: string; icon: any }> = {
  duplicate_account: { label: "Duplicate Account", icon: Copy },
  same_ip: { label: "Same IP", icon: Wifi },
  vpn: { label: "VPN Detected", icon: Globe },
  device_fingerprint: { label: "Device Fingerprint", icon: Fingerprint },
  multiple_accounts: { label: "Multiple Accounts", icon: Users },
  referral_abuse: { label: "Referral Abuse", icon: Link2 },
  suspicious_activity: { label: "Suspicious Activity", icon: Flag },
  chargeback: { label: "Chargeback", icon: AlertTriangle },
};

export function FraudClient({ initialFlags, severityCounts, typeCounts }: FraudClientProps) {
  const [flags, setFlags] = useState<FraudFlag[]>(initialFlags);
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const [selectedFlag, setSelectedFlag] = useState<FraudFlag | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"resolve" | "dismiss" | "suspend" | null>(null);
  const [resolution, setResolution] = useState("");

  const filteredFlags = useMemo(() => {
    return flags.filter((f) => {
      if (severityFilter !== "all" && f.severity !== severityFilter) return false;
      if (statusFilter !== "all" && f.status !== statusFilter) return false;
      if (typeFilter !== "all" && f.flag_type !== typeFilter) return false;
      if (searchQuery) {
        const s = searchQuery.toLowerCase();
        const name = (f.profiles?.display_name || "").toLowerCase();
        const email = (f.profiles?.email || "").toLowerCase();
        return name.includes(s) || email.includes(s) || f.description.toLowerCase().includes(s);
      }
      return true;
    });
  }, [flags, severityFilter, statusFilter, typeFilter, searchQuery]);

  const handleAction = async () => {
    if (!selectedFlag || !actionType) return;

    const newStatus = actionType === "resolve" ? "resolved" : actionType === "dismiss" ? "dismissed" : selectedFlag.status;
    setLoading(selectedFlag.id);
    try {
      const body: any = {
        flagId: selectedFlag.id,
        status: newStatus,
        resolution: resolution || undefined,
      };

      if (actionType === "suspend") {
        body.suspendUser = true;
      }

      const res = await fetch("/api/admin/fraud", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");

      toast.success(`Flag ${actionType === "suspend" ? "resolved & user suspended" : newStatus}`);
      setFlags((prev) =>
        prev.map((f) =>
          f.id === selectedFlag.id
            ? { ...f, status: newStatus, resolution: resolution || f.resolution, reviewed_at: new Date().toISOString() }
            : f
        )
      );
      setIsActionModalOpen(false);
      setResolution("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(null);
    }
  };

  const openViewModal = (flag: FraudFlag) => {
    setSelectedFlag(flag);
    setIsViewModalOpen(true);
  };

  const openActionModal = (flag: FraudFlag, action: "resolve" | "dismiss" | "suspend") => {
    setSelectedFlag(flag);
    setActionType(action);
    setResolution(flag.resolution || "");
    setIsActionModalOpen(true);
  };

  const columns: ColumnDef<FraudFlag>[] = [
    {
      accessorKey: "profiles",
      header: "User",
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-[var(--ink-950)]">{row.original.profiles?.display_name || "—"}</p>
          <p className="text-xs text-[var(--ink-400)]">{row.original.profiles?.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "flag_type",
      header: "Type",
      cell: ({ row }) => {
        const config = typeConfig[row.original.flag_type] || typeConfig.suspicious_activity;
        const Icon = config.icon;
        return (
          <div className="flex items-center gap-1.5">
            <Icon className="w-4 h-4 text-[var(--ink-400)]" />
            <span className="text-sm font-medium">{config.label}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "severity",
      header: "Severity",
      cell: ({ row }) => {
        const config = severityConfig[row.original.severity] || severityConfig.low;
        const Icon = config.icon;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}>
            <Icon className="w-3 h-3" />
            {config.label}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const config = statusConfig[row.original.status] || statusConfig.open;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Flagged",
      cell: ({ row }) => (
        <span className="text-sm text-[var(--ink-500)] whitespace-nowrap">
          {format(new Date(row.original.created_at), "MMM dd, yyyy")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const flag = row.original;
        const isOpen = flag.status === "open" || flag.status === "reviewing";
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={() => openViewModal(flag)}
              className="p-1.5 text-[var(--ink-400)] hover:text-[var(--ink-950)] hover:bg-[var(--border)] rounded-lg transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            {isOpen && (
              <>
                <button
                  onClick={() => openActionModal(flag, "resolve")}
                  disabled={loading === flag.id}
                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Resolve"
                >
                  <ShieldCheck className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openActionModal(flag, "dismiss")}
                  disabled={loading === flag.id}
                  className="p-1.5 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openActionModal(flag, "suspend")}
                  disabled={loading === flag.id}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Suspend User"
                >
                  <UserX className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Severity Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { key: "critical", label: "Critical", icon: AlertOctagon, color: "text-red-600", bg: "bg-red-50" },
          { key: "high", label: "High", icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-50" },
          { key: "medium", label: "Medium", icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50" },
          { key: "low", label: "Low", icon: Info, color: "text-slate-500", bg: "bg-slate-50" },
        ].map((sev) => {
          const Icon = sev.icon;
          const count = severityCounts[sev.key] || 0;
          const isActive = severityFilter === sev.key;
          return (
            <button
              key={sev.key}
              onClick={() => setSeverityFilter(isActive ? "all" : sev.key)}
              className={`p-4 rounded-2xl border transition-all text-left ${
                isActive
                  ? "border-[var(--ink-950)] bg-[var(--ink-950)] text-white shadow-md"
                  : "border-[var(--border)] bg-white hover:border-[var(--ink-300)]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${isActive ? "text-white" : sev.color}`} />
                <span className={`text-2xl font-bold ${isActive ? "text-white" : "text-[var(--ink-950)]"}`}>
                  {count}
                </span>
              </div>
              <p className={`text-xs font-medium ${isActive ? "text-white/70" : "text-[var(--ink-500)]"}`}>
                {sev.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* Open Alerts Banner */}
      {(severityCounts.critical > 0 || severityCounts.high > 0) && (
        <div className="flex items-start gap-3 p-4 bg-red-50 rounded-2xl border border-red-100">
          <ShieldAlert className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              {severityCounts.critical + severityCounts.high} high-severity alerts require attention
            </p>
            <p className="text-xs text-red-600 mt-1">Review and resolve critical fraud flags immediately.</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-400)]" />
          <input
            type="text"
            placeholder="Search by user or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ink-950)]/10 focus:border-[var(--ink-950)] transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--ink-400)]" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-white border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ink-950)]/10"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="reviewing">Reviewing</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2.5 bg-white border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ink-950)]/10"
          >
            <option value="all">All Types</option>
            {Object.entries(typeConfig).map(([key, config]) => (
              <option key={key} value={key}>{config.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <AdminTable data={filteredFlags} columns={columns} pageSize={15} />

      {/* View Modal */}
      <AdminModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Fraud Flag Details"
        size="lg"
      >
        {selectedFlag && (
          <div className="space-y-5">
            <div className="flex items-start gap-4 p-4 bg-[var(--paper-2)] rounded-xl">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">
                {(selectedFlag.profiles?.display_name || "?").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-[var(--ink-950)]">{selectedFlag.profiles?.display_name || "Unknown"}</p>
                <p className="text-sm text-[var(--ink-500)]">{selectedFlag.profiles?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-[var(--paper-2)] rounded-xl">
                <p className="text-[10px] text-[var(--ink-400)] uppercase tracking-wider font-medium mb-1">Type</p>
                <div className="flex items-center gap-1.5">
                  {(() => {
                    const config = typeConfig[selectedFlag.flag_type] || typeConfig.suspicious_activity;
                    const Icon = config.icon;
                    return <Icon className="w-4 h-4 text-[var(--ink-400)]" />;
                  })()}
                  <span className="font-semibold text-[var(--ink-950)]">{typeConfig[selectedFlag.flag_type]?.label || selectedFlag.flag_type}</span>
                </div>
              </div>
              <div className="p-3 bg-[var(--paper-2)] rounded-xl">
                <p className="text-[10px] text-[var(--ink-400)] uppercase tracking-wider font-medium mb-1">Severity</p>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${
                  severityConfig[selectedFlag.severity]?.className || severityConfig.low.className
                }`}>
                  {(() => {
                    const Icon = severityConfig[selectedFlag.severity]?.icon || Info;
                    return <Icon className="w-3 h-3" />;
                  })()}
                  {severityConfig[selectedFlag.severity]?.label}
                </span>
              </div>
              <div className="p-3 bg-[var(--paper-2)] rounded-xl">
                <p className="text-[10px] text-[var(--ink-400)] uppercase tracking-wider font-medium mb-1">IP Address</p>
                <p className="font-mono text-sm text-[var(--ink-700)]">{selectedFlag.ip_address || "—"}</p>
              </div>
              <div className="p-3 bg-[var(--paper-2)] rounded-xl">
                <p className="text-[10px] text-[var(--ink-400)] uppercase tracking-wider font-medium mb-1">Device Fingerprint</p>
                <p className="font-mono text-xs text-[var(--ink-700)] truncate">{selectedFlag.device_fingerprint || "—"}</p>
              </div>
              <div className="p-3 bg-[var(--paper-2)] rounded-xl col-span-2">
                <p className="text-[10px] text-[var(--ink-400)] uppercase tracking-wider font-medium mb-1">Flagged</p>
                <p className="font-semibold text-[var(--ink-950)]">{format(new Date(selectedFlag.created_at), "MMM dd, yyyy HH:mm")}</p>
              </div>
            </div>

            <div className="p-4 bg-[var(--paper-2)] rounded-xl">
              <p className="text-[10px] text-[var(--ink-400)] uppercase tracking-wider font-medium mb-1">Description</p>
              <p className="text-sm text-[var(--ink-800)]">{selectedFlag.description}</p>
            </div>

            {selectedFlag.evidence && Object.keys(selectedFlag.evidence).length > 0 && (
              <div className="p-4 bg-[var(--paper-2)] rounded-xl">
                <p className="text-[10px] text-[var(--ink-400)] uppercase tracking-wider font-medium mb-2">Evidence</p>
                <pre className="text-xs text-[var(--ink-600)] overflow-auto max-h-40 bg-white p-2 rounded-lg border border-[var(--border)]">
                  {JSON.stringify(selectedFlag.evidence, null, 2)}
                </pre>
              </div>
            )}

            {selectedFlag.related_user_ids && selectedFlag.related_user_ids.length > 0 && (
              <div className="p-4 bg-[var(--paper-2)] rounded-xl">
                <p className="text-[10px] text-[var(--ink-400)] uppercase tracking-wider font-medium mb-2">Related Users</p>
                <div className="flex flex-wrap gap-2">
                  {selectedFlag.related_user_ids.map((id) => (
                    <span key={id} className="px-2 py-1 bg-white border border-[var(--border)] rounded-lg text-xs font-mono text-[var(--ink-600)]">
                      {id.substring(0, 8)}...
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedFlag.resolution && (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-[10px] text-emerald-600 uppercase tracking-wider font-medium mb-1">Resolution</p>
                <p className="text-sm text-emerald-800">{selectedFlag.resolution}</p>
                {selectedFlag.reviewed_at && (
                  <p className="text-xs text-emerald-500 mt-1">Resolved {format(new Date(selectedFlag.reviewed_at), "MMM dd, yyyy")}</p>
                )}
              </div>
            )}

            {(selectedFlag.status === "open" || selectedFlag.status === "reviewing") && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setIsViewModalOpen(false); openActionModal(selectedFlag, "resolve"); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" /> Resolve
                </button>
                <button
                  onClick={() => { setIsViewModalOpen(false); openActionModal(selectedFlag, "dismiss"); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-600 text-white font-semibold rounded-xl hover:bg-slate-700 transition-colors"
                >
                  <X className="w-4 h-4" /> Dismiss
                </button>
                <button
                  onClick={() => { setIsViewModalOpen(false); openActionModal(selectedFlag, "suspend"); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
                >
                  <UserX className="w-4 h-4" /> Suspend User
                </button>
              </div>
            )}
          </div>
        )}
      </AdminModal>

      {/* Action Modal */}
      <AdminModal
        isOpen={isActionModalOpen}
        onClose={() => { setIsActionModalOpen(false); setResolution(""); }}
        title={
          actionType === "resolve" ? "Resolve Flag" :
          actionType === "dismiss" ? "Dismiss Flag" :
          "Suspend User & Resolve"
        }
        description={selectedFlag ? `Flag: ${typeConfig[selectedFlag.flag_type]?.label || selectedFlag.flag_type}` : ""}
      >
        {selectedFlag && (
          <div className="space-y-4">
            {actionType === "suspend" && (
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-800">Suspend User Account</p>
                  <p className="text-sm text-red-700 mt-1">This will suspend the user&apos;s account and resolve the fraud flag. The user will be unable to access their account until reinstated.</p>
                </div>
              </div>
            )}
            {actionType === "resolve" && (
              <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <ShieldCheck className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800">Resolve Flag</p>
                  <p className="text-sm text-emerald-700 mt-1">Mark this fraud flag as resolved after investigation.</p>
                </div>
              </div>
            )}
            {actionType === "dismiss" && (
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <X className="w-5 h-5 text-slate-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-slate-800">Dismiss Flag</p>
                  <p className="text-sm text-slate-700 mt-1">Dismiss this flag if it was raised in error or is no longer relevant.</p>
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm font-semibold text-[var(--ink-950)] mb-1">Resolution Notes</label>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                className="w-full border border-[var(--border)] rounded-xl p-3 text-sm outline-none focus:border-[var(--ink-950)] transition-colors"
                rows={3}
                placeholder="Describe the resolution or reason for dismissal..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => { setIsActionModalOpen(false); setResolution(""); }}
                className="px-4 py-2 font-semibold text-[var(--ink-600)] hover:bg-[var(--border)] rounded-full transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={loading === selectedFlag.id || (actionType === "resolve" && !resolution)}
                className={`px-4 py-2 font-bold text-white rounded-full transition-colors disabled:opacity-50 ${
                  actionType === "resolve" ? "bg-emerald-600 hover:bg-emerald-700" :
                  actionType === "dismiss" ? "bg-slate-600 hover:bg-slate-700" :
                  "bg-red-600 hover:bg-red-700"
                }`}
              >
                {loading === selectedFlag.id ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
