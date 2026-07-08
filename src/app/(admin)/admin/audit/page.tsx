"use client";

import { useState, useEffect } from "react";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Activity, Search, ShieldAlert, ListFilter as Filter, X, RefreshCw, User, MousePointer, Globe, Clock, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useAdminRole } from "@/lib/admin-context";

type ModuleFilter = "all" | "users" | "purchases" | "payouts" | "trading" | "settings" | "kyc" | "coupons" | "cms" | "tickets";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { role: myRole } = useAdminRole();
  const isSuperAdmin = myRole === "super_admin";

  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filters
  const [actionFilter, setActionFilter] = useState("");
  const [moduleFilter, setModuleFilter] = useState<ModuleFilter>("all");
  const [adminEmail, setAdminEmail] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const fetchLogs = async () => {
    if (!isSuperAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (actionFilter) params.set("action", actionFilter);
      if (moduleFilter !== "all") params.set("entity_type", moduleFilter);
      if (adminEmail) params.set("admin_email", adminEmail);
      if (searchQuery) params.set("search", searchQuery);
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);
      params.set("limit", "200");

      const res = await fetch(`/api/admin/audit?${params.toString()}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (data.logs) setLogs(data.logs);
    } catch (e) {
      toast.error("Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [isSuperAdmin]);

  const clearFilters = () => {
    setActionFilter("");
    setModuleFilter("all");
    setAdminEmail("");
    setSearchQuery("");
    setFromDate("");
    setToDate("");
    fetchLogs();
  };

  const getActionColor = (action: string) => {
    if (action.includes("create") || action.includes("assign") || action.includes("approve")) return "text-[var(--dash-positive)] bg-emerald-50";
    if (action.includes("delete") || action.includes("revoke") || action.includes("ban") || action.includes("reject")) return "text-[var(--dash-negative)] bg-red-50";
    if (action.includes("update") || action.includes("edit") || action.includes("modify")) return "text-amber-600 bg-amber-50";
    return "text-blue-600 bg-blue-50";
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "admin_email",
      header: "Admin",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[var(--dash-canvas)] border border-[var(--dash-hairline)] flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-[var(--ink-500)]" />
          </div>
          <span className="text-[13px] font-semibold text-[var(--ink-950)]">{row.original.admin_email}</span>
        </div>
      ),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        const a = row.original.action;
        return (
          <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold uppercase ${getActionColor(a)}`}>
            {a.replace(/_/g, " ")}
          </span>
        );
      },
    },
    {
      accessorKey: "entity_type",
      header: "Module",
      cell: ({ row }) => (
        <div className="flex items-center gap-1.5">
          <MousePointer className="w-3.5 h-3.5 text-[var(--ink-400)]" />
          <span className="text-[12px] font-bold text-[var(--ink-600)] capitalize">{row.original.entity_type}</span>
        </div>
      ),
    },
    {
      accessorKey: "entity_id",
      header: "Entity ID",
      cell: ({ row }) => (
        <span className="text-[10px] text-[var(--ink-400)] font-mono truncate max-w-[120px] block">{row.original.entity_id || "—"}</span>
      ),
    },
    {
      accessorKey: "ip_address",
      header: "IP / Browser",
      cell: ({ row }) => (
        <div>
          <div className="flex items-center gap-1">
            <Globe className="w-3 h-3 text-[var(--ink-400)]" />
            <span className="text-[11px] font-mono text-[var(--ink-500)]">{row.original.ip_address || "—"}</span>
          </div>
          <span className="text-[9px] text-[var(--ink-300)] truncate max-w-[150px] block">{row.original.user_agent ? row.original.user_agent.split(" ")[0] : "—"}</span>
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Timestamp",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-[var(--ink-400)]" />
          <span className="text-[12px] text-[var(--ink-600)]">{format(new Date(row.original.created_at), "MMM dd, HH:mm:ss")}</span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Details",
      cell: ({ row }) => (
        <button
          onClick={() => { setSelectedLog(row.original); setIsModalOpen(true); }}
          className="text-[12px] font-bold text-[var(--ink-950)] hover:underline"
        >
          View Diff
        </button>
      ),
    },
  ];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out pb-12">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-ink">
          <Activity className="w-6 h-6" /> Activity Logs
        </h1>
        <p className="text-[var(--ink-500)] mt-1">Track all administrative actions, module changes, and system activity.</p>
      </div>

      {!isSuperAdmin ? (
        <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-none flex flex-col items-center justify-center text-center gap-3">
          <ShieldAlert className="w-12 h-12 text-red-400" />
          <div>
            <h2 className="font-bold text-lg mb-1">Access Restricted</h2>
            <p className="text-sm">Only Super Admins have permission to view the global activity logs for security reasons.</p>
          </div>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="dash-card p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-400)]" />
                  <input
                    type="text"
                    placeholder="Search actions, modules..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && fetchLogs()}
                    className="pl-9 pr-4 py-2 border border-[var(--dash-hairline)] rounded-none text-sm outline-none focus:ring-2 focus:ring-[var(--ink-950)] w-64"
                  />
                </div>
                <select
                  value={moduleFilter}
                  onChange={(e) => setModuleFilter(e.target.value as ModuleFilter)}
                  className="px-3 py-2 border border-[var(--dash-hairline)] rounded-none text-sm outline-none bg-white"
                >
                  <option value="all">All Modules</option>
                  <option value="users">Users</option>
                  <option value="purchases">Purchases</option>
                  <option value="payouts">Payouts</option>
                  <option value="trading">Trading</option>
                  <option value="settings">Settings</option>
                  <option value="kyc">KYC</option>
                  <option value="coupons">Coupons</option>
                  <option value="cms">CMS</option>
                  <option value="tickets">Tickets</option>
                </select>
                <input
                  type="text"
                  placeholder="Admin email..."
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchLogs()}
                  className="px-3 py-2 border border-[var(--dash-hairline)] rounded-none text-sm outline-none w-48"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-[var(--ink-500)] hover:text-[var(--ink-950)] rounded-none hover:bg-[var(--dash-canvas)] transition-colors"
                >
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-[var(--ink-500)] hover:text-[var(--ink-950)] rounded-none hover:bg-[var(--dash-canvas)] transition-colors"
                >
                  <Filter className="w-3.5 h-3.5" /> Filters
                </button>
                <button
                  onClick={fetchLogs}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-2 carbon-btn-primary disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-[var(--dash-hairline)] flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--ink-500)]">From:</span>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="border border-[var(--dash-hairline)] rounded-none px-2 py-1.5 text-sm outline-none bg-white"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--ink-500)]">To:</span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="border border-[var(--dash-hairline)] rounded-none px-2 py-1.5 text-sm outline-none bg-white"
                  />
                </div>
                <input
                  type="text"
                  placeholder="Action name..."
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="border border-[var(--dash-hairline)] rounded-none px-2 py-1.5 text-sm outline-none w-40"
                />
              </div>
            )}
          </div>

          <AdminTable data={logs} columns={columns} loading={loading} pageSize={15} />

          <AdminModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Action Details"
            size="lg"
          >
            {selectedLog && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-none border border-[var(--dash-hairline)] bg-[var(--dash-canvas)] p-4 border border-[var(--dash-hairline)]">
                  <div>
                    <p className="dash-overline mb-1 text-[10px]">Admin</p>
                    <p className="text-sm font-semibold truncate">{selectedLog.admin_email}</p>
                  </div>
                  <div>
                    <p className="dash-overline mb-1 text-[10px]">Action</p>
                    <p className="text-sm font-semibold uppercase text-blue-600">{selectedLog.action.replace(/_/g, " ")}</p>
                  </div>
                  <div>
                    <p className="dash-overline mb-1 text-[10px]">Module</p>
                    <p className="text-sm font-semibold capitalize">{selectedLog.entity_type}</p>
                  </div>
                  <div>
                    <p className="dash-overline mb-1 text-[10px]">Timestamp</p>
                    <p className="text-sm font-semibold">{format(new Date(selectedLog.created_at), "MMM dd, yyyy HH:mm")}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--ink-950)] mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span> Old Value
                    </h3>
                    <div className="bg-red-50 border border-red-100 rounded-none p-4 overflow-x-auto">
                      <pre className="text-[11px] font-mono text-red-900">
                        {selectedLog.old_value ? JSON.stringify(selectedLog.old_value, null, 2) : "null"}
                      </pre>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--ink-950)] mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> New Value
                    </h3>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-none p-4 overflow-x-auto">
                      <pre className="text-[11px] font-mono text-emerald-900">
                        {selectedLog.new_value ? JSON.stringify(selectedLog.new_value, null, 2) : "null"}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--dash-hairline)] grid grid-cols-2 gap-4">
                  <div>
                    <p className="dash-overline mb-1 text-[10px]">IP Address</p>
                    <p className="text-sm font-mono text-[var(--ink-600)]">{selectedLog.ip_address || "—"}</p>
                  </div>
                  <div>
                    <p className="dash-overline mb-1 text-[10px]">Browser</p>
                    <p className="text-sm text-[var(--ink-600)] truncate">{selectedLog.user_agent || "—"}</p>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-[11px] text-[var(--ink-400)] font-mono">ID: {selectedLog.id}</p>
                </div>
              </div>
            )}
          </AdminModal>
        </>
      )}
    </div>
  );
}
