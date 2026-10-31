"use client";

import { useState, useMemo } from "react";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Bell, BellDot, CircleCheck as CheckCircle, TriangleAlert as AlertTriangle, OctagonAlert as AlertOctagon, Info, DollarSign, ShieldCheck, UserPlus, CreditCard, Circle as XCircle, Eye, Check, Search, ListFilter as Filter, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface AdminNotification {
  id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  entity_type: string | null;
  entity_id: string | null;
  user_id: string | null;
  is_read: boolean;
  read_by: string | null;
  read_at: string | null;
  created_at: string;
  profiles: { id: string; email: string; display_name: string } | null;
}

interface NotificationsClientProps {
  initialNotifications: AdminNotification[];
  unreadCount: number;
  typeCounts: Record<string, number>;
}

const severityConfig: Record<string, { icon: any; className: string }> = {
  critical: { icon: AlertOctagon, className: "bg-red-100 text-red-800 border-red-200" },
  warning: { icon: AlertTriangle, className: "bg-amber-100 text-amber-800 border-amber-200" },
  info: { icon: Info, className: "bg-sky-100 text-sky-800 border-sky-200" },
};

const typeConfig: Record<string, { label: string; icon: any }> = {
  new_payout: { label: "New Payout", icon: DollarSign },
  fraud_alert: { label: "Fraud Alert", icon: AlertTriangle },
  affiliate_registration: { label: "Affiliate Registration", icon: UserPlus },
  payment_failure: { label: "Payment Failure", icon: CreditCard },
  kyc_submission: { label: "KYC Submission", icon: ShieldCheck },
  user_suspension: { label: "User Suspension", icon: XCircle },
  system_alert: { label: "System Alert", icon: Info },
};

export function NotificationsClient({ initialNotifications, unreadCount, typeCounts }: NotificationsClientProps) {
  const [notifications, setNotifications] = useState<AdminNotification[]>(initialNotifications);
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [readFilter, setReadFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState<string | null>(null);

  const [selectedNotif, setSelectedNotif] = useState<AdminNotification | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (severityFilter !== "all" && n.severity !== severityFilter) return false;
      if (typeFilter !== "all" && n.type !== typeFilter) return false;
      if (readFilter !== "all") {
        if (readFilter === "unread" && n.is_read) return false;
        if (readFilter === "read" && !n.is_read) return false;
      }
      if (searchQuery) {
        const s = searchQuery.toLowerCase();
        return n.title.toLowerCase().includes(s) || n.message.toLowerCase().includes(s);
      }
      return true;
    });
  }, [notifications, severityFilter, typeFilter, readFilter, searchQuery]);

  const handleMarkRead = async (notif: AdminNotification) => {
    if (notif.is_read) return;
    setLoading(notif.id);
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: notif.id, action: "mark_read" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n))
      );
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(null);
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id);
    if (unreadIds.length === 0) return;

    setLoading("all");
    try {
      const res = await fetch("/api/admin/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_all_read" }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");

      setNotifications((prev) =>
        prev.map((n) => (n.is_read ? n : { ...n, is_read: true, read_at: new Date().toISOString() }))
      );
      toast.success("All notifications marked as read");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(null);
    }
  };

  const openViewModal = (notif: AdminNotification) => {
    setSelectedNotif(notif);
    setIsViewModalOpen(true);
    if (!notif.is_read) handleMarkRead(notif);
  };

  const columns: ColumnDef<AdminNotification>[] = [
    {
      id: "icon",
      header: "",
      cell: ({ row }) => {
        const config = typeConfig[row.original.type] || typeConfig.system_alert;
        const Icon = config.icon;
        const sev = severityConfig[row.original.severity] || severityConfig.info;
        return (
          <div className={`p-2 rounded-lg ${sev.className.split(" ")[0]}`}>
            <Icon className={`w-4 h-4 ${sev.className.split(" ")[1]}`} />
          </div>
        );
      },
    },
    {
      accessorKey: "title",
      header: "Notification",
      cell: ({ row }) => (
        <div>
          <div className="flex items-center gap-2">
            <p className={`font-semibold text-sm ${row.original.is_read ? "text-[var(--ink-600)]" : "text-[var(--ink-950)]"}`}>
              {row.original.title}
            </p>
            {!row.original.is_read && (
              <span className="w-2 h-2 rounded-full bg-sky-500" />
            )}
          </div>
          <p className={`text-xs mt-0.5 ${row.original.is_read ? "text-[var(--ink-400)]" : "text-[var(--ink-600)]"}`}>
            {row.original.message}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const config = typeConfig[row.original.type] || typeConfig.system_alert;
        return (
          <span className="text-xs font-medium text-[var(--ink-500)]">{config.label}</span>
        );
      },
    },
    {
      accessorKey: "severity",
      header: "Severity",
      cell: ({ row }) => {
        const config = severityConfig[row.original.severity] || severityConfig.info;
        const Icon = config.icon;
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${config.className}`}>
            <Icon className="w-3 h-3" />
            {row.original.severity}
          </span>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => (
        <span className="text-xs text-[var(--ink-500)] whitespace-nowrap">
          {format(new Date(row.original.created_at), "MMM dd, HH:mm")}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const n = row.original;
        return (
          <div className="flex items-center gap-1">
            <button
              onClick={() => openViewModal(n)}
              className="p-1.5 text-[var(--ink-400)] hover:text-[var(--ink-950)] hover:bg-[var(--border)] rounded-lg transition-colors"
              title="View"
            >
              <Eye className="w-4 h-4" />
            </button>
            {!n.is_read && (
              <button
                onClick={(e) => { e.stopPropagation(); handleMarkRead(n); }}
                disabled={loading === n.id}
                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                title="Mark as Read"
              >
                <Check className="w-4 h-4" />
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
          { key: "unread", label: "Unread", count: unreadCount, icon: BellDot, color: "text-sky-600", bg: "bg-sky-50" },
          { key: "critical", label: "Critical", count: notifications.filter((n) => n.severity === "critical").length, icon: AlertOctagon, color: "text-red-600", bg: "bg-red-50" },
          { key: "warning", label: "Warnings", count: notifications.filter((n) => n.severity === "warning").length, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
          { key: "total", label: "Total", count: notifications.length, icon: Bell, color: "text-[var(--ink-700)]", bg: "bg-[var(--paper-2)]" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.key} className="p-4 rounded-2xl border border-[var(--border)] bg-white">
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-2xl font-bold text-[var(--ink-950)]">{stat.count}</span>
              </div>
              <p className="text-xs font-medium text-[var(--ink-500)]">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-400)]" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ink-950)]/10 focus:border-[var(--ink-950)] transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[var(--ink-400)]" />
            <select
              value={readFilter}
              onChange={(e) => setReadFilter(e.target.value)}
              className="px-3 py-2.5 bg-white border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ink-950)]/10"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
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
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={loading === "all"}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--ink-950)] text-white rounded-xl font-semibold hover:bg-black transition-colors disabled:opacity-50 text-sm"
          >
            <Check className="w-4 h-4" />
            {loading === "all" ? "Processing..." : "Mark All Read"}
          </button>
        )}
      </div>

      {/* Table */}
      <AdminTable data={filteredNotifications} columns={columns} pageSize={15} />

      {/* View Modal */}
      <AdminModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={selectedNotif?.title || "Notification"}
        size="md"
      >
        {selectedNotif && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {(() => {
                const config = typeConfig[selectedNotif.type] || typeConfig.system_alert;
                const Icon = config.icon;
                const sev = severityConfig[selectedNotif.severity] || severityConfig.info;
                return (
                  <div className={`p-3 rounded-xl ${sev.className.split(" ")[0]}`}>
                    <Icon className={`w-6 h-6 ${sev.className.split(" ")[1]}`} />
                  </div>
                );
              })()}
              <div>
                <p className="text-sm font-semibold text-[var(--ink-950)]">{typeConfig[selectedNotif.type]?.label || selectedNotif.type}</p>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                  severityConfig[selectedNotif.severity]?.className
                }`}>
                  {selectedNotif.severity}
                </span>
              </div>
            </div>

            <div className="p-4 bg-[var(--paper-2)] rounded-xl">
              <p className="text-sm text-[var(--ink-800)]">{selectedNotif.message}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-[var(--ink-400)]">Entity</p>
                <p className="font-medium text-[var(--ink-950)]">{selectedNotif.entity_type || "—"} / {selectedNotif.entity_id?.substring(0, 8) || "—"}</p>
              </div>
              <div>
                <p className="text-[var(--ink-400)]">User</p>
                <p className="font-medium text-[var(--ink-950)]">{selectedNotif.profiles?.display_name || "—"}</p>
              </div>
              <div>
                <p className="text-[var(--ink-400)]">Created</p>
                <p className="font-medium text-[var(--ink-950)]">{format(new Date(selectedNotif.created_at), "MMM dd, yyyy HH:mm")}</p>
              </div>
              <div>
                <p className="text-[var(--ink-400)]">Status</p>
                <p className="font-medium text-[var(--ink-950)]">{selectedNotif.is_read ? "Read" : "Unread"}</p>
              </div>
            </div>
          </div>
        )}
      </AdminModal>
    </div>
  );
}
