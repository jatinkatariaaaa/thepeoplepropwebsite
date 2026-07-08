"use client";

import { useState, useMemo } from "react";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Clock, CircleCheck as CheckCircle, Circle as XCircle, RotateCcw, Ban, Eye, CreditCard, Bitcoin, Banknote, DollarSign, Search, ListFilter as Filter, FileText, Check, TriangleAlert as AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface PaymentTxn {
  id: string;
  user_id: string;
  account_id: string | null;
  challenge_id: string | null;
  transaction_id: string | null;
  amount: number;
  currency: string;
  gateway: string;
  payment_method: string | null;
  status: string;
  metadata: any;
  refund_reason: string | null;
  refunded_at: string | null;
  refunded_by: string | null;
  invoice_url: string | null;
  created_at: string;
  updated_at: string;
  profiles: { id: string; email: string; display_name: string } | null;
}

interface PaymentsClientProps {
  initialTransactions: PaymentTxn[];
  statusCounts: Record<string, number>;
  gatewayTotals: Record<string, number>;
}

const statusConfig: Record<string, { label: string; icon: any; className: string }> = {
  pending: { label: "Pending", icon: Clock, className: "bg-[#fcf4d6] text-[#8e6a00]" },
  completed: { label: "Completed", icon: CheckCircle, className: "bg-[#a7f0ba] text-[#0e6027]" },
  failed: { label: "Failed", icon: XCircle, className: "bg-[#ffd7d9] text-[#a2191f]" },
  refunded: { label: "Refunded", icon: RotateCcw, className: "bg-[#e0e0e0] text-[#393939]" },
  cancelled: { label: "Cancelled", icon: Ban, className: "bg-slate-100 text-slate-600 border-slate-200" },
};

const gatewayConfig: Record<string, { label: string; icon: any; color: string }> = {
  stripe: { label: "Stripe", icon: CreditCard, color: "text-[#635BFF]" },
  crypto: { label: "Crypto", icon: Bitcoin, color: "text-amber-600" },
  manual: { label: "Manual", icon: Banknote, color: "text-[var(--ink-600)]" },
};

export function PaymentsClient({ initialTransactions, statusCounts, gatewayTotals }: PaymentsClientProps) {
  const [transactions, setTransactions] = useState<PaymentTxn[]>(initialTransactions);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [gatewayFilter, setGatewayFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const [selectedTxn, setSelectedTxn] = useState<PaymentTxn | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"verify" | "refund" | "cancel" | null>(null);
  const [refundReason, setRefundReason] = useState("");

  const filteredTxns = useMemo(() => {
    return transactions.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (gatewayFilter !== "all" && t.gateway !== gatewayFilter) return false;
      if (searchQuery) {
        const s = searchQuery.toLowerCase();
        const name = (t.profiles?.display_name || "").toLowerCase();
        const email = (t.profiles?.email || "").toLowerCase();
        const txnId = (t.transaction_id || "").toLowerCase();
        return name.includes(s) || email.includes(s) || txnId.includes(s);
      }
      return true;
    });
  }, [transactions, statusFilter, gatewayFilter, searchQuery]);

  const totalVolume = Object.values(gatewayTotals).reduce((a, b) => a + b, 0);

  const handleAction = async () => {
    if (!selectedTxn || !actionType) return;

    setLoading(selectedTxn.id);
    try {
      const res = await fetch("/api/admin/payments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: selectedTxn.id,
          action: actionType,
          refundReason: actionType === "refund" ? refundReason : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");

      toast.success(`Transaction ${actionType}ed successfully`);
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === selectedTxn.id ? { ...t, ...data.transaction } : t
        )
      );
      setIsActionModalOpen(false);
      setRefundReason("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(null);
    }
  };

  const openViewModal = (txn: PaymentTxn) => {
    setSelectedTxn(txn);
    setIsViewModalOpen(true);
  };

  const openActionModal = (txn: PaymentTxn, action: "verify" | "refund" | "cancel") => {
    setSelectedTxn(txn);
    setActionType(action);
    setRefundReason(txn.refund_reason || "");
    setIsActionModalOpen(true);
  };

  const columns: ColumnDef<PaymentTxn>[] = [
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
      accessorKey: "transaction_id",
      header: "Transaction ID",
      cell: ({ row }) => (
        <div className="font-mono text-xs text-[var(--ink-600)]">
          {row.original.transaction_id || row.original.id.substring(0, 12)}
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <DollarSign className="w-3.5 h-3.5 text-[var(--ink-400)]" />
          <span className="font-semibold text-[var(--ink-950)]">
            {Number(row.original.amount).toLocaleString()} {row.original.currency}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "gateway",
      header: "Gateway",
      cell: ({ row }) => {
        const config = gatewayConfig[row.original.gateway] || gatewayConfig.manual;
        const Icon = config.icon;
        return (
          <div className="flex items-center gap-1.5">
            <Icon className={`w-4 h-4 ${config.color}`} />
            <span className="text-sm font-medium">{config.label}</span>
          </div>
        );
      },
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
      header: "Date",
      cell: ({ row }) => (
        <span className="text-sm text-[var(--ink-500)]">
          {format(new Date(row.original.created_at), "MMM dd, yyyy")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const txn = row.original;
        return (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => openViewModal(txn)}
              className="rounded-none p-1.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            {txn.status === "pending" && (
              <>
                <button
                  onClick={() => openActionModal(txn, "verify")}
                  disabled={loading === txn.id}
                  className="p-1.5 text-[var(--dash-positive)] hover:bg-emerald-50 rounded-none transition-colors disabled:opacity-50"
                  title="Verify"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openActionModal(txn, "cancel")}
                  disabled={loading === txn.id}
                  className="p-1.5 text-slate-500 hover:bg-slate-50 rounded-none transition-colors disabled:opacity-50"
                  title="Cancel"
                >
                  <Ban className="w-4 h-4" />
                </button>
              </>
            )}
            {txn.status === "completed" && (
              <button
                onClick={() => openActionModal(txn, "refund")}
                disabled={loading === txn.id}
                className="p-1.5 text-violet-600 hover:bg-violet-50 rounded-none transition-colors disabled:opacity-50"
                title="Refund"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
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
          { key: "completed", label: "Completed", icon: CheckCircle, color: "text-[var(--dash-positive)]", bg: "bg-emerald-50" },
          { key: "failed", label: "Failed", icon: XCircle, color: "text-[var(--dash-negative)]", bg: "bg-red-50" },
          { key: "refunded", label: "Refunded", icon: RotateCcw, color: "text-violet-600", bg: "bg-violet-50" },
          { key: "cancelled", label: "Cancelled", icon: Ban, color: "text-slate-500", bg: "bg-slate-50" },
        ].map((stat) => {
          const Icon = stat.icon;
          const count = statusCounts[stat.key] || 0;
          const isActive = statusFilter === stat.key;
          return (
            <button
              key={stat.key}
              onClick={() => setStatusFilter(isActive ? "all" : stat.key)}
              className={`p-4 rounded-none border transition-all text-left ${
                isActive
                  ? "border-[var(--carbon-blue)] bg-[var(--carbon-blue)] text-white"
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

      {/* Revenue Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { key: "stripe", label: "Stripe Revenue", icon: CreditCard, color: "bg-[#635BFF]/10 text-[#635BFF]" },
          { key: "crypto", label: "Crypto Revenue", icon: Bitcoin, color: "bg-amber-50 text-amber-600" },
          { key: "manual", label: "Manual Revenue", icon: Banknote, color: "bg-slate-50 text-slate-600" },
        ].map((g) => {
          const Icon = g.icon;
          const amount = gatewayTotals[g.key] || 0;
          return (
            <div key={g.key} className="dash-card p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-none ${g.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-sm font-medium text-[var(--ink-600)]">{g.label}</p>
              </div>
              <p className="text-2xl font-bold text-[var(--ink-950)]">${amount.toLocaleString()}</p>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-400)]" />
          <input
            type="text"
            placeholder="Search by name, email, or transaction ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-[var(--dash-hairline)] rounded-none text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ink-950)]/10 focus:border-[var(--ink-950)] transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[var(--ink-400)]" />
          <select
            value={gatewayFilter}
            onChange={(e) => setGatewayFilter(e.target.value)}
            className="px-3 py-2.5 bg-white border border-[var(--dash-hairline)] rounded-none text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ink-950)]/10"
          >
            <option value="all">All Gateways</option>
            <option value="stripe">Stripe</option>
            <option value="crypto">Crypto</option>
            <option value="manual">Manual</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <AdminTable data={filteredTxns} columns={columns} pageSize={15} />

      {/* View Transaction Modal */}
      <AdminModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Transaction Details"
        size="lg"
      >
        {selectedTxn && (
          <div className="space-y-6">
            {/* User Info */}
            <div className="flex items-start gap-4 rounded-none border border-[var(--dash-hairline)] bg-[var(--dash-canvas)] p-4">
              <div className="w-10 h-10 rounded-full bg-[var(--ink-950)] flex items-center justify-center text-white font-bold">
                {(selectedTxn.profiles?.display_name || "?").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-[var(--ink-950)]">{selectedTxn.profiles?.display_name || "Unknown"}</p>
                <p className="text-sm text-[var(--ink-500)]">{selectedTxn.profiles?.email}</p>
              </div>
            </div>

            {/* Transaction Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-none border border-[var(--dash-hairline)] bg-[var(--dash-canvas)] p-3">
                <p className="dash-overline mb-1">Amount</p>
                <p className="font-semibold text-[var(--ink-950)] text-lg">${Number(selectedTxn.amount).toLocaleString()} {selectedTxn.currency}</p>
              </div>
              <div className="rounded-none border border-[var(--dash-hairline)] bg-[var(--dash-canvas)] p-3">
                <p className="dash-overline mb-1">Status</p>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${
                  statusConfig[selectedTxn.status]?.className || statusConfig.pending.className
                }`}>
                  {(() => {
                    const Icon = statusConfig[selectedTxn.status]?.icon || Clock;
                    return <Icon className="w-3 h-3" />;
                  })()}
                  {statusConfig[selectedTxn.status]?.label || selectedTxn.status}
                </span>
              </div>
              <div className="rounded-none border border-[var(--dash-hairline)] bg-[var(--dash-canvas)] p-3">
                <p className="dash-overline mb-1">Gateway</p>
                <div className="flex items-center gap-1.5">
                  {(() => {
                    const config = gatewayConfig[selectedTxn.gateway] || gatewayConfig.manual;
                    const Icon = config.icon;
                    return <Icon className={`w-4 h-4 ${config.color}`} />;
                  })()}
                  <span className="font-semibold text-[var(--ink-950)] capitalize">{selectedTxn.gateway}</span>
                </div>
              </div>
              <div className="rounded-none border border-[var(--dash-hairline)] bg-[var(--dash-canvas)] p-3">
                <p className="dash-overline mb-1">Payment Method</p>
                <p className="font-semibold text-[var(--ink-950)] capitalize">{selectedTxn.payment_method || "—"}</p>
              </div>
              <div className="rounded-none border border-[var(--dash-hairline)] bg-[var(--dash-canvas)] p-3">
                <p className="dash-overline mb-1">Transaction ID</p>
                <p className="font-semibold text-[var(--ink-950)] font-mono text-xs">{selectedTxn.transaction_id || selectedTxn.id}</p>
              </div>
              <div className="rounded-none border border-[var(--dash-hairline)] bg-[var(--dash-canvas)] p-3">
                <p className="dash-overline mb-1">Date</p>
                <p className="font-semibold text-[var(--ink-950)]">{format(new Date(selectedTxn.created_at), "MMM dd, yyyy HH:mm")}</p>
              </div>
            </div>

            {/* Metadata */}
            {selectedTxn.metadata && Object.keys(selectedTxn.metadata).length > 0 && (
              <div className="rounded-none border border-[var(--dash-hairline)] bg-[var(--dash-canvas)] p-4">
                <p className="text-xs text-[var(--ink-400)] uppercase tracking-wider font-medium mb-2">Gateway Metadata</p>
                <pre className="text-xs text-[var(--ink-600)] overflow-auto max-h-32 bg-white p-2 rounded-none border border-[var(--dash-hairline)]">
                  {JSON.stringify(selectedTxn.metadata, null, 2)}
                </pre>
              </div>
            )}

            {/* Refund Info */}
            {selectedTxn.refund_reason && (
              <div className="p-4 bg-violet-50 rounded-none border border-violet-100">
                <p className="text-xs text-violet-600 uppercase tracking-wider font-medium mb-1">Refund Reason</p>
                <p className="text-sm text-violet-700">{selectedTxn.refund_reason}</p>
                {selectedTxn.refunded_at && (
                  <p className="text-xs text-violet-500 mt-1">Refunded on {format(new Date(selectedTxn.refunded_at), "MMM dd, yyyy")}</p>
                )}
              </div>
            )}

            {/* Invoice */}
            {selectedTxn.invoice_url && (
              <a
                href={selectedTxn.invoice_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 w-fit carbon-btn-primary"
              >
                <FileText className="w-4 h-4" />
                View Invoice
              </a>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              {selectedTxn.status === "pending" && (
                <>
                  <button
                    onClick={() => { setIsViewModalOpen(false); openActionModal(selectedTxn, "verify"); }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-semibold rounded-none hover:bg-emerald-700 transition-colors"
                  >
                    <Check className="w-4 h-4" /> Verify
                  </button>
                  <button
                    onClick={() => { setIsViewModalOpen(false); openActionModal(selectedTxn, "cancel"); }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-600 text-white font-semibold rounded-none hover:bg-slate-700 transition-colors"
                  >
                    <Ban className="w-4 h-4" /> Cancel
                  </button>
                </>
              )}
              {selectedTxn.status === "completed" && (
                <button
                  onClick={() => { setIsViewModalOpen(false); openActionModal(selectedTxn, "refund"); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 text-white font-semibold rounded-none hover:bg-violet-700 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" /> Refund
                </button>
              )}
            </div>
          </div>
        )}
      </AdminModal>

      {/* Action Modal */}
      <AdminModal
        isOpen={isActionModalOpen}
        onClose={() => { setIsActionModalOpen(false); setRefundReason(""); }}
        title={
          actionType === "verify" ? "Verify Transaction" :
          actionType === "refund" ? "Refund Transaction" :
          "Cancel Transaction"
        }
        description={selectedTxn ? `Amount: $${Number(selectedTxn.amount).toLocaleString()} ${selectedTxn.currency}` : ""}
      >
        {selectedTxn && (
          <div className="space-y-4">
            {actionType === "refund" && (
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Refund Reason</label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full border border-[var(--dash-hairline)] rounded-none p-3 text-sm outline-none focus:border-[var(--ink-950)] transition-colors"
                  rows={3}
                  placeholder="Reason for refund..."
                  required
                />
              </div>
            )}
            {actionType === "cancel" && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-none border border-amber-100">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Confirm Cancellation</p>
                  <p className="text-sm text-amber-700 mt-1">This will cancel the pending transaction. The user will not be charged.</p>
                </div>
              </div>
            )}
            {actionType === "verify" && (
              <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-none border border-emerald-100">
                <CheckCircle className="w-5 h-5 text-[var(--dash-positive)] mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800">Confirm Verification</p>
                  <p className="text-sm text-emerald-700 mt-1">This will mark the transaction as completed and grant access to the purchased challenge.</p>
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => { setIsActionModalOpen(false); setRefundReason(""); }}
                className="rounded-none px-4 py-2 text-[13px] font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={loading === selectedTxn.id || (actionType === "refund" && !refundReason)}
                className={`px-4 py-2 font-bold text-white rounded-full transition-colors disabled:opacity-50 ${
                  actionType === "verify" ? "bg-emerald-600 hover:bg-emerald-700" :
                  actionType === "refund" ? "bg-violet-600 hover:bg-violet-700" :
                  "bg-slate-600 hover:bg-slate-700"
                }`}
              >
                {loading === selectedTxn.id ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
