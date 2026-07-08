"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import {
  CheckCircle,
  XCircle,
  DollarSign,
  Users,
  MousePointerClick,
  TrendingUp,
  Eye,
  Edit3,
  Ban,
  Check,
  Search,
  Wallet,
  UserPlus,
  Link2,
  Percent,
  Clock,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

interface Affiliate {
  user_id: string;
  referral_code: string;
  total_earnings: number;
  pending_payout: number;
  total_referrals: number;
  link_clicks: number;
  created_at: string;
  updated_at: string;
  status: string;
  commission_rate: number;
  approved_at: string | null;
  approved_by: string | null;
  profiles: { id: string; email: string; display_name: string; affiliate_code: string } | null;
  referral_list: any[];
}

interface AffiliatesClientProps {
  initialAffiliates: Affiliate[];
  statusCounts: Record<string, number>;
  totalEarnings: number;
  totalPending: number;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  pending: { label: "Pending", className: "bg-amber-50 text-amber-700 border-amber-200" },
  suspended: { label: "Suspended", className: "bg-red-50 text-red-700 border-red-200" },
};

export function AffiliatesClient({ initialAffiliates, statusCounts, totalEarnings, totalPending }: AffiliatesClientProps) {
  const router = useRouter();
  const [affiliates, setAffiliates] = useState<Affiliate[]>(initialAffiliates);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [commissionRate, setCommissionRate] = useState(10);
  const [payoutAmount, setPayoutAmount] = useState(0);

  const filteredAffiliates = useMemo(() => {
    return affiliates.filter((a) => {
      if (statusFilter !== "all" && a.status !== statusFilter) return false;
      if (searchQuery) {
        const s = searchQuery.toLowerCase();
        const name = (a.profiles?.display_name || "").toLowerCase();
        const email = (a.profiles?.email || "").toLowerCase();
        const code = (a.referral_code || "").toLowerCase();
        return name.includes(s) || email.includes(s) || code.includes(s);
      }
      return true;
    });
  }, [affiliates, statusFilter, searchQuery]);

  const handleStatusChange = async (affiliate: Affiliate, newStatus: string) => {
    setLoading(affiliate.user_id);
    try {
      const res = await fetch("/api/admin/affiliates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: affiliate.user_id, action: "status", status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");

      toast.success(`Affiliate ${newStatus === "active" ? "approved" : newStatus === "suspended" ? "suspended" : "updated"}`);
      setAffiliates((prev) =>
        prev.map((a) => (a.user_id === affiliate.user_id ? { ...a, status: newStatus } : a))
      );
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(null);
    }
  };

  const handleCommissionUpdate = async () => {
    if (!selectedAffiliate) return;
    setLoading(selectedAffiliate.user_id);
    try {
      const res = await fetch("/api/admin/affiliates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedAffiliate.user_id, action: "commission", commissionRate }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update");

      toast.success("Commission rate updated");
      setAffiliates((prev) =>
        prev.map((a) => (a.user_id === selectedAffiliate.user_id ? { ...a, commission_rate: commissionRate } : a))
      );
      setIsEditModalOpen(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(null);
    }
  };

  const handlePayout = async () => {
    if (!selectedAffiliate || payoutAmount <= 0) return;
    setLoading(selectedAffiliate.user_id);
    try {
      const res = await fetch("/api/admin/affiliates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedAffiliate.user_id, action: "payout", amount: payoutAmount }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process");

      toast.success(`Payout of $${payoutAmount} processed`);
      setAffiliates((prev) =>
        prev.map((a) =>
          a.user_id === selectedAffiliate.user_id
            ? { ...a, pending_payout: Math.max(0, a.pending_payout - payoutAmount) }
            : a
        )
      );
      setIsPayoutModalOpen(false);
      setPayoutAmount(0);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(null);
    }
  };

  const openViewModal = (aff: Affiliate) => {
    setSelectedAffiliate(aff);
    setIsViewModalOpen(true);
  };

  const openEditModal = (aff: Affiliate) => {
    setSelectedAffiliate(aff);
    setCommissionRate(aff.commission_rate || 10);
    setIsEditModalOpen(true);
  };

  const openPayoutModal = (aff: Affiliate) => {
    setSelectedAffiliate(aff);
    setPayoutAmount(Math.min(aff.pending_payout, aff.pending_payout));
    setIsPayoutModalOpen(true);
  };

  const columns: ColumnDef<Affiliate>[] = [
    {
      accessorKey: "profiles",
      header: "Affiliate",
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-[var(--ink-950)]">{row.original.profiles?.display_name || "—"}</p>
          <p className="text-xs text-[var(--ink-400)]">{row.original.profiles?.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "referral_code",
      header: "Code",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <Link2 className="w-3.5 h-3.5 text-[var(--ink-400)]" />
          <span className="font-mono text-xs text-[var(--ink-600)]">{row.original.referral_code}</span>
        </div>
      ),
    },
    {
      accessorKey: "total_referrals",
      header: "Referrals",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-[var(--ink-400)]" />
          <span className="font-semibold text-[var(--ink-950)]">{row.original.total_referrals}</span>
        </div>
      ),
    },
    {
      accessorKey: "link_clicks",
      header: "Clicks",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <MousePointerClick className="w-3.5 h-3.5 text-[var(--ink-400)]" />
          <span className="font-semibold text-[var(--ink-950)]">{row.original.link_clicks.toLocaleString()}</span>
        </div>
      ),
    },
    {
      accessorKey: "total_earnings",
      header: "Earnings",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
          <span className="font-semibold text-emerald-600">${Number(row.original.total_earnings).toLocaleString()}</span>
        </div>
      ),
    },
    {
      accessorKey: "pending_payout",
      header: "Pending",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Wallet className="w-3.5 h-3.5 text-amber-500" />
          <span className={`font-semibold ${row.original.pending_payout > 0 ? "text-amber-600" : "text-[var(--ink-500)]"}`}>
            ${Number(row.original.pending_payout).toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "commission_rate",
      header: "Rate",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Percent className="w-3.5 h-3.5 text-[var(--ink-400)]" />
          <span className="font-semibold text-[var(--ink-950)]">{row.original.commission_rate || 10}%</span>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const config = statusConfig[row.original.status] || statusConfig.pending;
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}>
            {row.original.status === "active" && <CheckCircle className="w-3 h-3" />}
            {row.original.status === "pending" && <Clock className="w-3 h-3" />}
            {row.original.status === "suspended" && <AlertCircle className="w-3 h-3" />}
            {config.label}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const aff = row.original;
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={() => openViewModal(aff)}
              className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => openEditModal(aff)}
              className="rounded-lg p-1.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink"
              title="Edit Commission"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            {aff.status === "pending" && (
              <button
                onClick={() => handleStatusChange(aff, "active")}
                disabled={loading === aff.user_id}
                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                title="Approve"
              >
                <Check className="w-4 h-4" />
              </button>
            )}
            {aff.status === "active" && (
              <button
                onClick={() => handleStatusChange(aff, "suspended")}
                disabled={loading === aff.user_id}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                title="Suspend"
              >
                <Ban className="w-4 h-4" />
              </button>
            )}
            {aff.pending_payout > 0 && (
              <button
                onClick={() => openPayoutModal(aff)}
                disabled={loading === aff.user_id}
                className="p-1.5 text-violet-600 hover:bg-violet-50 rounded-lg transition-colors disabled:opacity-50"
                title="Payout"
              >
                <DollarSign className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { key: "active", label: "Active", count: statusCounts.active, icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50" },
          { key: "pending", label: "Pending", count: statusCounts.pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
          { key: "suspended", label: "Suspended", count: statusCounts.suspended, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
          { key: "earnings", label: "Total Earnings", count: affiliates.length, icon: TrendingUp, color: "text-[var(--ink-700)]", bg: "bg-[var(--dash-canvas)]", amount: totalEarnings },
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
                  : "border-[var(--dash-hairline)] bg-white hover:border-[var(--ink-300)]"
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
              {stat.amount !== undefined && (
                <p className={`text-xs mt-1 ${isActive ? "text-white/50" : "text-[var(--ink-400)]"}`}>
                  ${stat.amount.toLocaleString()}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Pending Payout Banner */}
      {totalPending > 0 && (
        <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
          <Wallet className="w-5 h-5 text-amber-600" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">${totalPending.toLocaleString()} in pending payouts</p>
            <p className="text-xs text-amber-600">Review and process affiliate payouts</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-400)]" />
        <input
          type="text"
          placeholder="Search by name, email, or referral code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-[var(--dash-hairline)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ink-950)]/10 focus:border-[var(--ink-950)] transition-all"
        />
      </div>

      {/* Table */}
      <AdminTable data={filteredAffiliates} columns={columns} pageSize={15} />

      {/* View Modal */}
      <AdminModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Affiliate Details"
        size="lg"
      >
        {selectedAffiliate && (
          <div className="space-y-5">
            <div className="flex items-start gap-4 rounded-[8px] border border-[var(--dash-hairline)] bg-[var(--dash-canvas)] p-4">
              <div className="w-10 h-10 rounded-full bg-[var(--ink-950)] flex items-center justify-center text-white font-bold">
                {(selectedAffiliate.profiles?.display_name || "?").charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-[var(--ink-950)]">{selectedAffiliate.profiles?.display_name || "Unknown"}</p>
                <p className="text-sm text-[var(--ink-500)]">{selectedAffiliate.profiles?.email}</p>
                <p className="text-xs text-[var(--ink-400)] mt-1">Code: {selectedAffiliate.referral_code}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-[8px] border border-[var(--dash-hairline)] bg-[var(--dash-canvas)] p-3">
                <p className="dash-overline mb-1 text-[10px]">Total Referrals</p>
                <p className="font-semibold text-[var(--ink-950)]">{selectedAffiliate.total_referrals}</p>
              </div>
              <div className="rounded-[8px] border border-[var(--dash-hairline)] bg-[var(--dash-canvas)] p-3">
                <p className="dash-overline mb-1 text-[10px]">Link Clicks</p>
                <p className="font-semibold text-[var(--ink-950)]">{selectedAffiliate.link_clicks.toLocaleString()}</p>
              </div>
              <div className="rounded-[8px] border border-[var(--dash-hairline)] bg-[var(--dash-canvas)] p-3">
                <p className="dash-overline mb-1 text-[10px]">Commission Rate</p>
                <p className="font-semibold text-[var(--ink-950)]">{selectedAffiliate.commission_rate || 10}%</p>
              </div>
              <div className="rounded-[8px] border border-[var(--dash-hairline)] bg-[var(--dash-canvas)] p-3">
                <p className="dash-overline mb-1 text-[10px]">Total Earnings</p>
                <p className="font-semibold text-emerald-600">${Number(selectedAffiliate.total_earnings).toLocaleString()}</p>
              </div>
              <div className="rounded-[8px] border border-[var(--dash-hairline)] bg-[var(--dash-canvas)] p-3">
                <p className="dash-overline mb-1 text-[10px]">Pending Payout</p>
                <p className="font-semibold text-amber-600">${Number(selectedAffiliate.pending_payout).toLocaleString()}</p>
              </div>
              <div className="rounded-[8px] border border-[var(--dash-hairline)] bg-[var(--dash-canvas)] p-3">
                <p className="dash-overline mb-1 text-[10px]">Status</p>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                  statusConfig[selectedAffiliate.status]?.className || statusConfig.pending.className
                }`}>
                  {statusConfig[selectedAffiliate.status]?.label}
                </span>
              </div>
            </div>

            {/* Referrals */}
            {selectedAffiliate.referral_list.length > 0 && (
              <div>
                <p className="text-sm font-bold text-[var(--ink-950)] mb-3">Recent Referrals</p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {selectedAffiliate.referral_list.map((ref: any) => (
                    <div key={ref.id} className="flex items-center justify-between rounded-[8px] border border-[var(--dash-hairline)] bg-[var(--dash-canvas)] p-3">
                      <div>
                        <p className="text-sm font-medium text-[var(--ink-950)]">{ref.referred_email || "User"}</p>
                        <p className="text-xs text-[var(--ink-400)]">{format(new Date(ref.created_at), "MMM dd, yyyy")}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-emerald-600">${Number(ref.commission_earned || 0).toLocaleString()}</p>
                        <p className="text-xs text-[var(--ink-400)]">{ref.status}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedAffiliate.pending_payout > 0 && (
              <button
                onClick={() => { setIsViewModalOpen(false); openPayoutModal(selectedAffiliate); }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-violet-600 text-white font-semibold rounded-xl hover:bg-violet-700 transition-colors"
              >
                <DollarSign className="w-4 h-4" /> Process Payout (${selectedAffiliate.pending_payout.toLocaleString()})
              </button>
            )}
          </div>
        )}
      </AdminModal>

      {/* Edit Commission Modal */}
      <AdminModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Commission Rate"
        description={selectedAffiliate ? `For ${selectedAffiliate.profiles?.display_name}` : ""}
      >
        {selectedAffiliate && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Commission Rate (%)</label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-400)]" />
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-[var(--dash-hairline)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ink-950)]/10 focus:border-[var(--ink-950)] transition-all"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-lg px-4 py-2 text-[13px] font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink"
              >
                Cancel
              </button>
              <button
                onClick={handleCommissionUpdate}
                disabled={loading === selectedAffiliate.user_id}
                className="px-4 py-2 font-bold text-white bg-[var(--ink-950)] rounded-full hover:bg-black transition-colors disabled:opacity-50"
              >
                {loading === selectedAffiliate.user_id ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}
      </AdminModal>

      {/* Payout Modal */}
      <AdminModal
        isOpen={isPayoutModalOpen}
        onClose={() => { setIsPayoutModalOpen(false); setPayoutAmount(0); }}
        title="Process Affiliate Payout"
        description={selectedAffiliate ? `Available: $${Number(selectedAffiliate.pending_payout).toLocaleString()}` : ""}
      >
        {selectedAffiliate && (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Payout Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-400)]" />
                <input
                  type="number"
                  min={0.01}
                  max={selectedAffiliate.pending_payout}
                  step={0.01}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(Math.min(parseFloat(e.target.value) || 0, selectedAffiliate.pending_payout))}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-[var(--dash-hairline)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ink-950)]/10 focus:border-[var(--ink-950)] transition-all"
                />
              </div>
              <p className="text-xs text-[var(--ink-400)] mt-1">Max: ${selectedAffiliate.pending_payout.toLocaleString()}</p>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => { setIsPayoutModalOpen(false); setPayoutAmount(0); }}
                className="rounded-lg px-4 py-2 text-[13px] font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink"
              >
                Cancel
              </button>
              <button
                onClick={handlePayout}
                disabled={loading === selectedAffiliate.user_id || payoutAmount <= 0}
                className="px-4 py-2 font-bold text-white bg-violet-600 rounded-full hover:bg-violet-700 transition-colors disabled:opacity-50"
              >
                {loading === selectedAffiliate.user_id ? "Processing..." : "Process Payout"}
              </button>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
