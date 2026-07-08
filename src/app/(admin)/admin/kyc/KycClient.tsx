"use client";

import { useState, useMemo } from "react";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Clock, CircleCheck as CheckCircle, Circle as XCircle, CircleAlert as AlertCircle, RefreshCw, Eye, FileText, MapPin, User, MessageSquare, Check, X, Upload, Shield, ShieldCheck, ShieldAlert, Search, ListFilter as Filter } from "lucide-react";
import { toast } from "sonner";

interface KycDoc {
  id: string;
  user_id: string;
  document_type: string;
  document_number: string | null;
  country: string | null;
  front_image_url: string | null;
  back_image_url: string | null;
  selfie_image_url: string | null;
  status: string;
  rejection_reason: string | null;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  profiles: { id: string; email: string; display_name: string } | null;
}

interface KycClientProps {
  initialDocuments: KycDoc[];
  statusCounts: Record<string, number>;
}

const statusConfig: Record<string, { label: string; icon: any; className: string }> = {
  pending: { label: "Pending", icon: Clock, className: "border-[#FDE68A] bg-amber-50 text-amber-700" },
  approved: { label: "Approved", icon: CheckCircle, className: "border-[#A7F3D0] bg-success-50 text-success-700" },
  rejected: { label: "Rejected", icon: XCircle, className: "border-[#FECDD3] bg-rose-50 text-rose-700" },
  expired: { label: "Expired", icon: AlertCircle, className: "bg-slate-100 text-slate-600 border-slate-200" },
  reupload_requested: { label: "Re-upload", icon: RefreshCw, className: "bg-sky-50 text-sky-700 border-sky-200" },
};

const docTypeLabels: Record<string, string> = {
  passport: "Passport",
  national_id: "National ID",
  driving_license: "Driving License",
  address_proof: "Address Proof",
  selfie: "Selfie",
};

export function KycClient({ initialDocuments, statusCounts }: KycClientProps) {
  const [documents, setDocuments] = useState<KycDoc[]>(initialDocuments);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  // Modal states
  const [selectedDoc, setSelectedDoc] = useState<KycDoc | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | "reupload" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNotes, setAdminNotes] = useState("");

  const filteredDocs = useMemo(() => {
    return documents.filter((d) => {
      if (statusFilter !== "all" && d.status !== statusFilter) return false;
      if (typeFilter !== "all" && d.document_type !== typeFilter) return false;
      if (searchQuery) {
        const s = searchQuery.toLowerCase();
        const name = (d.profiles?.display_name || "").toLowerCase();
        const email = (d.profiles?.email || "").toLowerCase();
        const docNum = (d.document_number || "").toLowerCase();
        return name.includes(s) || email.includes(s) || docNum.includes(s);
      }
      return true;
    });
  }, [documents, statusFilter, typeFilter, searchQuery]);

  const handleAction = async () => {
    if (!selectedDoc || !actionType) return;

    const newStatus =
      actionType === "approve" ? "approved" :
      actionType === "reject" ? "rejected" :
      "reupload_requested";

    setLoading(selectedDoc.id);
    try {
      const res = await fetch("/api/admin/kyc", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId: selectedDoc.id,
          status: newStatus,
          rejectionReason: actionType === "reject" ? rejectionReason : undefined,
          adminNotes: adminNotes || undefined,
          action: actionType,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");

      toast.success(`Document ${newStatus.replace("_", " ")}`);
      setDocuments((prev) =>
        prev.map((d) =>
          d.id === selectedDoc.id
            ? {
                ...d,
                status: newStatus,
                rejection_reason: actionType === "reject" ? rejectionReason : d.rejection_reason,
                admin_notes: adminNotes || d.admin_notes,
                reviewed_at: new Date().toISOString(),
              }
            : d
        )
      );
      setIsActionModalOpen(false);
      setRejectionReason("");
      setAdminNotes("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(null);
    }
  };

  const openViewModal = (doc: KycDoc) => {
    setSelectedDoc(doc);
    setIsViewModalOpen(true);
  };

  const openActionModal = (doc: KycDoc, action: "approve" | "reject" | "reupload") => {
    setSelectedDoc(doc);
    setActionType(action);
    setRejectionReason(doc.rejection_reason || "");
    setAdminNotes(doc.admin_notes || "");
    setIsActionModalOpen(true);
  };

  const columns: ColumnDef<KycDoc>[] = [
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
      accessorKey: "document_type",
      header: "Document",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-[var(--ink-400)]" />
          <span className="text-sm font-medium">{docTypeLabels[row.original.document_type] || row.original.document_type}</span>
        </div>
      ),
    },
    {
      accessorKey: "country",
      header: "Country",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[var(--ink-400)]" />
          <span className="text-sm">{row.original.country || "—"}</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const config = statusConfig[row.original.status] || statusConfig.pending;
        const Icon = config.icon;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}>
            <Icon className="w-3.5 h-3.5" />
            {config.label}
          </span>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Submitted",
      cell: ({ row }) => (
        <span className="text-sm text-[var(--ink-500)]">
          {format(new Date(row.original.created_at), "MMM dd, yyyy HH:mm")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const doc = row.original;
        const isPending = doc.status === "pending" || doc.status === "reupload_requested";
        return (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => openViewModal(doc)}
              className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            {isPending && (
              <>
                <button
                  onClick={() => openActionModal(doc, "approve")}
                  disabled={loading === doc.id}
                  className="p-1.5 text-[var(--dash-positive)] hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Approve"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openActionModal(doc, "reject")}
                  disabled={loading === doc.id}
                  className="p-1.5 text-[var(--dash-negative)] hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Reject"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openActionModal(doc, "reupload")}
                  disabled={loading === doc.id}
                  className="p-1.5 text-sky-600 hover:bg-sky-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Request Re-upload"
                >
                  <Upload className="w-4 h-4" />
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
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { key: "pending", label: "Pending", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { key: "approved", label: "Approved", icon: CheckCircle, color: "text-[var(--dash-positive)]", bg: "bg-emerald-50" },
          { key: "rejected", label: "Rejected", icon: XCircle, color: "text-[var(--dash-negative)]", bg: "bg-red-50" },
          { key: "expired", label: "Expired", icon: AlertCircle, color: "text-slate-500", bg: "bg-slate-50" },
          { key: "reupload_requested", label: "Re-upload", icon: RefreshCw, color: "text-sky-600", bg: "bg-sky-50" },
        ].map((stat) => {
          const Icon = stat.icon;
          const count = statusCounts[stat.key] || 0;
          const isActive = statusFilter === stat.key;
          return (
            <button
              key={stat.key}
              onClick={() => setStatusFilter(isActive ? "all" : stat.key)}
              className={`p-4 rounded-2xl border transition-all text-left ${
                isActive
                  ? "border-[var(--ink-950)] bg-[var(--ink-950)] text-white shadow-md"
                  : "border-[var(--dash-hairline)] bg-white hover:border-[var(--ink-300)]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${isActive ? "text-white" : stat.color}`} />
                <span className={`text-2xl font-bold ${isActive ? "text-white" : "text-[var(--ink-950)]"}`}>
                  {count}
                </span>
              </div>
              <p className={`text-xs font-medium ${isActive ? "text-white/70" : "text-[var(--ink-500)]"}`}>
                {stat.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-400)]" />
          <input
            type="text"
            placeholder="Search by name, email, or document number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-[var(--dash-hairline)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ink-950)]/10 focus:border-[var(--ink-950)] transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--ink-400)]" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2.5 bg-white border border-[var(--dash-hairline)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ink-950)]/10"
          >
            <option value="all">All Types</option>
            <option value="passport">Passport</option>
            <option value="national_id">National ID</option>
            <option value="driving_license">Driving License</option>
            <option value="address_proof">Address Proof</option>
            <option value="selfie">Selfie</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <AdminTable data={filteredDocs} columns={columns} pageSize={15} />

      {/* View Document Modal */}
      <AdminModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="KYC Document Details"
        size="lg"
      >
        {selectedDoc && (
          <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-start gap-4 rounded-[8px] border border-[var(--dash-hairline)] bg-[var(--dash-canvas)] p-4">
              <div className="w-10 h-10 rounded-full bg-[var(--ink-950)] flex items-center justify-center text-white font-bold">
                {(selectedDoc.profiles?.display_name || "?").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-[var(--ink-950)]">{selectedDoc.profiles?.display_name || "Unknown"}</p>
                <p className="text-sm text-[var(--ink-500)]">{selectedDoc.profiles?.email}</p>
                <p className="text-xs text-[var(--ink-400)] mt-1">User ID: {selectedDoc.user_id}</p>
              </div>
            </div>

            {/* Document Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[8px] border border-[var(--dash-hairline)] bg-[var(--dash-canvas)] p-3">
                <p className="dash-overline mb-1">Document Type</p>
                <p className="font-semibold text-[var(--ink-950)]">{docTypeLabels[selectedDoc.document_type]}</p>
              </div>
              <div className="rounded-[8px] border border-[var(--dash-hairline)] bg-[var(--dash-canvas)] p-3">
                <p className="dash-overline mb-1">Status</p>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${
                  statusConfig[selectedDoc.status]?.className || statusConfig.pending.className
                }`}>
                  {(statusConfig[selectedDoc.status]?.icon && (() => {
                    const Icon = statusConfig[selectedDoc.status].icon;
                    return <Icon className="w-3 h-3" />;
                  })())}
                  {statusConfig[selectedDoc.status]?.label || selectedDoc.status}
                </span>
              </div>
              <div className="rounded-[8px] border border-[var(--dash-hairline)] bg-[var(--dash-canvas)] p-3">
                <p className="dash-overline mb-1">Country</p>
                <p className="font-semibold text-[var(--ink-950)]">{selectedDoc.country || "—"}</p>
              </div>
              <div className="rounded-[8px] border border-[var(--dash-hairline)] bg-[var(--dash-canvas)] p-3">
                <p className="dash-overline mb-1">Document Number</p>
                <p className="font-semibold text-[var(--ink-950)] font-mono">{selectedDoc.document_number || "—"}</p>
              </div>
              <div className="rounded-[8px] border border-[var(--dash-hairline)] bg-[var(--dash-canvas)] p-3">
                <p className="dash-overline mb-1">Submitted</p>
                <p className="font-semibold text-[var(--ink-950)]">{format(new Date(selectedDoc.created_at), "MMM dd, yyyy HH:mm")}</p>
              </div>
              <div className="rounded-[8px] border border-[var(--dash-hairline)] bg-[var(--dash-canvas)] p-3">
                <p className="dash-overline mb-1">Expires</p>
                <p className="font-semibold text-[var(--ink-950)]">{selectedDoc.expires_at ? format(new Date(selectedDoc.expires_at), "MMM dd, yyyy") : "—"}</p>
              </div>
            </div>

            {/* No Images Required */}

            {/* Admin Notes */}
            {selectedDoc.admin_notes && (
              <div className="rounded-[8px] border border-[var(--dash-hairline)] bg-[var(--dash-canvas)] p-4">
                <p className="dash-overline mb-1">Admin Notes</p>
                <p className="text-sm text-[var(--ink-700)]">{selectedDoc.admin_notes}</p>
              </div>
            )}

            {/* Rejection Reason */}
            {selectedDoc.rejection_reason && (
              <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                <p className="text-xs text-[var(--dash-negative)] uppercase tracking-wider font-medium mb-1">Rejection Reason</p>
                <p className="text-sm text-red-700">{selectedDoc.rejection_reason}</p>
              </div>
            )}

            {/* Actions */}
            {(selectedDoc.status === "pending" || selectedDoc.status === "reupload_requested") && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setIsViewModalOpen(false); openActionModal(selectedDoc, "approve"); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  <Check className="w-4 h-4" /> Approve
                </button>
                <button
                  onClick={() => { setIsViewModalOpen(false); openActionModal(selectedDoc, "reject"); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
                >
                  <X className="w-4 h-4" /> Reject
                </button>
                <button
                  onClick={() => { setIsViewModalOpen(false); openActionModal(selectedDoc, "reupload"); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 text-white font-semibold rounded-xl hover:bg-sky-700 transition-colors"
                >
                  <Upload className="w-4 h-4" /> Re-upload
                </button>
              </div>
            )}
          </div>
        )}
      </AdminModal>

      {/* Action Modal */}
      <AdminModal
        isOpen={isActionModalOpen}
        onClose={() => { setIsActionModalOpen(false); setRejectionReason(""); setAdminNotes(""); }}
        title={
          actionType === "approve" ? "Approve Document" :
          actionType === "reject" ? "Reject Document" :
          "Request Re-upload"
        }
        description={selectedDoc ? `${docTypeLabels[selectedDoc.document_type]} for ${selectedDoc.profiles?.display_name}` : ""}
      >
        {selectedDoc && (
          <div className="space-y-4">
            {actionType === "reject" && (
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Rejection Reason</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full border border-[var(--dash-hairline)] rounded-xl p-3 text-sm outline-none focus:border-[var(--ink-950)] transition-colors"
                  rows={3}
                  placeholder="Explain why this document was rejected..."
                  required
                />
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Admin Notes (Internal)</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full border border-[var(--dash-hairline)] rounded-xl p-3 text-sm outline-none focus:border-[var(--ink-950)] transition-colors"
                rows={2}
                placeholder="Add internal notes (not visible to user)..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => { setIsActionModalOpen(false); setRejectionReason(""); setAdminNotes(""); }}
                className="rounded-lg px-4 py-2 text-[13px] font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={loading === selectedDoc.id || (actionType === "reject" && !rejectionReason)}
                className={`px-4 py-2 font-bold text-white rounded-full transition-colors disabled:opacity-50 ${
                  actionType === "approve" ? "bg-emerald-600 hover:bg-emerald-700" :
                  actionType === "reject" ? "bg-red-600 hover:bg-red-700" :
                  "bg-sky-600 hover:bg-sky-700"
                }`}
              >
                {loading === selectedDoc.id ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
