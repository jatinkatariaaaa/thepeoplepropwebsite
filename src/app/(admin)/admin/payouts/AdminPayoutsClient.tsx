"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Clock, CircleCheck as CheckCircle, Circle as XCircle, DollarSign, Wallet, Eye, TriangleAlert as AlertTriangle, Search, TrendingUp, StickyNote, CreditCard, Building2, Banknote } from "lucide-react";
import { toast } from "sonner";

interface Payout {
  id: string;
  user_id: string;
  account_id: string;
  amount: number;
  crypto_address: string;
  status: string;
  created_at: string;
  profit: number;
  profit_split: number;
  notes: string | null;
  payment_method: string;
  payment_details: string | null;
  processed_at: string | null;
  processed_by: string | null;
  profiles: { id: string; email: string; display_name: string } | null;
  accounts: { id: string; label: string; balance: number; equity: number; starting_balance: number } | null;
}

interface AdminPayoutsClientProps {
  initialPayouts: Payout[];
  statusCounts: Record<string, number>;
  totalPendingAmount: number;
  totalPaidAmount: number;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-amber-50 text-amber-700 border-amber-200" },
  paid: { label: "Paid", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected: { label: "Rejected", className: "bg-red-50 text-red-700 border-red-200" },
};

export function AdminPayoutsClient({ initialPayouts, statusCounts, totalPendingAmount, totalPaidAmount }: AdminPayoutsClientProps) {
  const router = useRouter();
  const [payouts, setPayouts] = useState<Payout[]>(initialPayouts);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [adminNotes, setAdminNotes] = useState("");

  const filteredPayouts = useMemo(() => {
    return payouts.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (searchQuery) {
        const s = searchQuery.toLowerCase();
        const name = (p.profiles?.display_name || "").toLowerCase();
        const email = (p.profiles?.email || "").toLowerCase();
        const addr = (p.crypto_address || "").toLowerCase();
        const details = (p.payment_details || "").toLowerCase();
        return name.includes(s) || email.includes(s) || addr.includes(s) || details.includes(s);
      }
      return true;
    });
  }, [payouts, statusFilter, searchQuery]);

  const handleAction = async () => {
    if (!selectedPayout || !actionType) return;

    const status = actionType === "approve" ? "paid" : "rejected";
    setLoading(selectedPayout.id);
    try {
      const res = await fetch("/api/admin/payouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payoutId: selectedPayout.id, status, notes: adminNotes || undefined }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");

      toast.success(`Payout ${status === "paid" ? "approved and marked as paid" : "rejected"}`);
      setPayouts((prev) =>
        prev.map((p) =>
          p.id === selectedPayout.id
            ? { ...p, status, notes: adminNotes || p.notes, processed_at: new Date().toISOString() }
            : p
        )
      );
      setIsActionModalOpen(false);
      setAdminNotes("");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(null);
    }
  };

  const openViewModal = (payout: Payout) => {
    setSelectedPayout(payout);
    setIsViewModalOpen(true);
  };

  const openActionModal = (payout: Payout, action: "approve" | "reject") => {
    setSelectedPayout(payout);
    setActionType(action);
    setAdminNotes(payout.notes || "");
    setIsActionModalOpen(true);
  };

  const columns: ColumnDef<Payout>[] = [
    {
      accessorKey: "profiles",
      header: "Trader",
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-[var(--ink-950)]">{row.original.profiles?.display_name || "—"}</p>
          <p className="text-xs text-[var(--ink-400)]">{row.original.profiles?.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "accounts",
      header: "Account",
      cell: ({ row }) => (
        <div>
          <p className="font-mono text-xs text-[var(--ink-600)]">{row.original.accounts?.label || row.original.account_id.substring(0, 8)}</p>
          <p className="text-xs text-[var(--ink-400)]">${Number(row.original.accounts?.balance || 0).toLocaleString()}</p>
        </div>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <DollarSign className="w-3.5 h-3.5 text-[var(--ink-400)]" />
          <span className="font-semibold text-[var(--ink-950)]">{Number(row.original.amount).toLocaleString()}</span>
        </div>
      ),
    },
    {
      accessorKey: "profit",
      header: "Profit / Split",
      cell: ({ row }) => (
        <div className="text-xs">
          <p className="text-[var(--ink-600)]">${Number(row.original.profit).toLocaleString()} profit</p>
          <p className="text-[var(--ink-400)]">{row.original.profit_split}% split</p>
        </div>
      ),
    },
    {
      accessorKey: "payment_method",
      header: "Payment",
      cell: ({ row }) => {
        const p = row.original;
        const method = p.payment_method || "crypto";
        const display = p.payment_details || p.crypto_address || "—";
        const Icon = method === "bank" ? Building2 : method === "wise" ? Banknote : Wallet;
        const methodLabel = method === "bank" ? "Bank" : method === "wise" ? "Wise" : "Crypto";
        return (
          <div>
            <div className="flex items-center gap-1 mb-0.5">
              <Icon className="w-3 h-3 text-[var(--ink-400)]" />
              <span className="text-[10px] font-medium text-[var(--ink-500)] uppercase tracking-wider">{methodLabel}</span>
            </div>
            <span className="font-mono text-xs truncate max-w-[130px] block" title={display}>
              {display}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const config = statusConfig[row.original.status] || statusConfig.pending;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}>
            {row.original.status === "pending" && <Clock className="w-3 h-3" />}
            {row.original.status === "paid" && <CheckCircle className="w-3 h-3" />}
            {row.original.status === "rejected" && <XCircle className="w-3 h-3" />}
            {config.label}
          </span>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Date",
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
        const p = row.original;
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={() => openViewModal(p)}
              className="p-1.5 text-[var(--ink-400)] hover:text-[var(--ink-950)] hover:bg-[var(--border)] rounded-lg transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            {p.status === "pending" && (
              <>
                <button
                  onClick={() => openActionModal(p, "approve")}
                  disabled={loading === p.id}
                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Approve & Pay"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openActionModal(p, "reject")}
                  disabled={loading === p.id}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  title="Reject"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </>
            )}
            {p.notes && (
              <span className="p-1.5 text-amber-500" title="Has notes">
                <StickyNote className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { key: "pending", label: "Pending", count: statusCounts.pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50", amount: totalPendingAmount },
          { key: "paid", label: "Paid", count: statusCounts.paid, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", amount: totalPaidAmount },
          { key: "rejected", label: "Rejected", count: statusCounts.rejected, icon: XCircle, color: "text-red-600", bg: "bg-red-50", amount: 0 },
          { key: "total", label: "Total Volume", count: payouts.length, icon: TrendingUp, color: "text-[var(--ink-700)]", bg: "bg-[var(--paper-2)]", amount: totalPaidAmount + totalPendingAmount },
        ].map((stat) => {
          const Icon = stat.icon;
          const isActive = statusFilter === stat.key;
          return (
            <button
              key={stat.key}
              onClick={() => setStatusFilter(isActive ? "all" : stat.key)}
              className={`p-4 rounded-2xl border transition-all text-left ${
                isActive
                  ? "border-[var(--ink-950)] bg-[var(--ink-950)] text-white shadow-md"
                  : "border-[var(--border)] bg-white hover:border-[var(--ink-300)]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${isActive ? "text-white" : stat.color}`} />
                <span className={`text-2xl font-bold ${isActive ? "text-white" : "text-[var(--ink-950)]"}`}>
                  {stat.count}
                </span>
              </div>
              <p className={`text-xs font-medium ${isActive ? "text-white/70" : "text-[var(--ink-500)]"}`}>
                {stat.label}
              </p>
              {stat.amount > 0 && (
                <p className={`text-xs mt-1 ${isActive ? "text-white/50" : "text-[var(--ink-400)]"}`}>
                  ${stat.amount.toLocaleString()}
                </p>
              )}
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
            placeholder="Search by trader, email, or wallet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ink-950)]/10 focus:border-[var(--ink-950)] transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <AdminTable data={filteredPayouts} columns={columns} pageSize={15} />

      {/* View Modal */}
      <AdminModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Payout Details"
        size="lg"
      >
        {selectedPayout && (
          <div className="space-y-5">
            {/* User */}
            <div className="flex items-start gap-4 p-4 bg-[var(--paper-2)] rounded-xl">
              <div className="w-10 h-10 rounded-full bg-[var(--ink-950)] flex items-center justify-center text-white font-bold">
                {(selectedPayout.profiles?.display_name || "?").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-[var(--ink-950)]">{selectedPayout.profiles?.display_name || "Unknown"}</p>
                <p className="text-sm text-[var(--ink-500)]">{selectedPayout.profiles?.email}</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-[var(--paper-2)] rounded-xl">
                <p className="text-[10px] text-[var(--ink-400)] uppercase tracking-wider font-medium mb-1">Amount</p>
                <p className="font-semibold text-[var(--ink-950)] text-lg">${Number(selectedPayout.amount).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-[var(--paper-2)] rounded-xl">
                <p className="text-[10px] text-[var(--ink-400)] uppercase tracking-wider font-medium mb-1">Status</p>
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${
                  statusConfig[selectedPayout.status]?.className || statusConfig.pending.className
                }`}>
                  {statusConfig[selectedPayout.status]?.label}
                </span>
              </div>
              <div className="p-3 bg-[var(--paper-2)] rounded-xl">
                <p className="text-[10px] text-[var(--ink-400)] uppercase tracking-wider font-medium mb-1">Profit</p>
                <p className="font-semibold text-[var(--ink-950)]">${Number(selectedPayout.profit).toLocaleString()}</p>
              </div>
              <div className="p-3 bg-[var(--paper-2)] rounded-xl">
                <p className="text-[10px] text-[var(--ink-400)] uppercase tracking-wider font-medium mb-1">Profit Split</p>
                <p className="font-semibold text-[var(--ink-950)]">{selectedPayout.profit_split}%</p>
              </div>
              <div className="p-3 bg-[var(--paper-2)] rounded-xl">
                <p className="text-[10px] text-[var(--ink-400)] uppercase tracking-wider font-medium mb-1">Payment Method</p>
                <p className="font-semibold text-[var(--ink-950)] capitalize">{selectedPayout.payment_method || "crypto"}</p>
              </div>
              <div className="p-3 bg-[var(--paper-2)] rounded-xl">
                <p className="text-[10px] text-[var(--ink-400)] uppercase tracking-wider font-medium mb-1">Crypto Address</p>
                <p className="font-mono text-xs text-[var(--ink-700)] break-all">{selectedPayout.crypto_address || "—"}</p>
              </div>
              {selectedPayout.payment_details && (
                <div className="p-3 bg-[var(--paper-2)] rounded-xl col-span-2">
                  <p className="text-[10px] text-[var(--ink-400)] uppercase tracking-wider font-medium mb-1">Payment Details</p>
                  <p className="text-sm text-[var(--ink-700)] break-all whitespace-pre-wrap">{selectedPayout.payment_details}</p>
                </div>
              )}
              <div className="p-3 bg-[var(--paper-2)] rounded-xl">
                <p className="text-[10px] text-[var(--ink-400)] uppercase tracking-wider font-medium mb-1">Requested</p>
                <p className="font-semibold text-[var(--ink-950)]">{format(new Date(selectedPayout.created_at), "MMM dd, yyyy HH:mm")}</p>
              </div>
              {selectedPayout.processed_at && (
                <div className="p-3 bg-[var(--paper-2)] rounded-xl">
                  <p className="text-[10px] text-[var(--ink-400)] uppercase tracking-wider font-medium mb-1">Processed</p>
                  <p className="font-semibold text-[var(--ink-950)]">{format(new Date(selectedPayout.processed_at), "MMM dd, yyyy HH:mm")}</p>
                </div>
              )}
            </div>

            {/* Account Info */}
            {selectedPayout.accounts && (
              <div className="p-4 bg-[var(--paper-2)] rounded-xl">
                <p className="text-[10px] text-[var(--ink-400)] uppercase tracking-wider font-medium mb-2">Trading Account</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-[var(--ink-500)]">Label</p>
                    <p className="font-semibold text-sm">{selectedPayout.accounts.label}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--ink-500)]">Balance</p>
                    <p className="font-semibold text-sm">${Number(selectedPayout.accounts.balance).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[var(--ink-500)]">Equity</p>
                    <p className="font-semibold text-sm">${Number(selectedPayout.accounts.equity).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            {selectedPayout.notes && (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <p className="text-[10px] text-amber-600 uppercase tracking-wider font-medium mb-1">Admin Notes</p>
                <p className="text-sm text-amber-800">{selectedPayout.notes}</p>
              </div>
            )}

            {/* Actions */}
            {selectedPayout.status === "pending" && (
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setIsViewModalOpen(false); openActionModal(selectedPayout, "approve"); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
                >
                  <CheckCircle className="w-4 h-4" /> Approve & Pay
                </button>
                <button
                  onClick={() => { setIsViewModalOpen(false); openActionModal(selectedPayout, "reject"); }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            )}
          </div>
        )}
      </AdminModal>

      {/* Action Modal */}
      <AdminModal
        isOpen={isActionModalOpen}
        onClose={() => { setIsActionModalOpen(false); setAdminNotes(""); }}
        title={actionType === "approve" ? "Approve Payout" : "Reject Payout"}
        description={selectedPayout ? `${Number(selectedPayout.amount).toLocaleString()} via ${selectedPayout.payment_method || "crypto"}${selectedPayout.payment_details ? " — " + selectedPayout.payment_details.substring(0, 30) + "..." : selectedPayout.crypto_address ? " — " + selectedPayout.crypto_address.substring(0, 20) + "..." : ""}` : ""}
      >
        {selectedPayout && (
          <div className="space-y-4">
            {actionType === "approve" ? (
              <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800">Confirm Approval</p>
                  <p className="text-sm text-emerald-700 mt-1">This will mark the payout as paid. Ensure the crypto transfer has been completed before confirming.</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-red-800">Confirm Rejection</p>
                  <p className="text-sm text-red-700 mt-1">This will reject the payout and refund the amount back to the trader&apos;s account balance.</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-[var(--ink-950)] mb-1">Admin Notes</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full border border-[var(--border)] rounded-xl p-3 text-sm outline-none focus:border-[var(--ink-950)] transition-colors"
                rows={3}
                placeholder="Add internal notes (optional)..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => { setIsActionModalOpen(false); setAdminNotes(""); }}
                className="px-4 py-2 font-semibold text-[var(--ink-600)] hover:bg-[var(--border)] rounded-full transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAction}
                disabled={loading === selectedPayout.id}
                className={`px-4 py-2 font-bold text-white rounded-full transition-colors disabled:opacity-50 ${
                  actionType === "approve" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {loading === selectedPayout.id ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
