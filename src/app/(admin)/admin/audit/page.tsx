"use client";

import { useState, useEffect } from "react";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Activity, Search, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useAdminRole } from "@/lib/admin-context";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { role: myRole } = useAdminRole();
  const isSuperAdmin = myRole === "super_admin";

  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchLogs = async () => {
    if (!isSuperAdmin) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("/api/admin/audit?limit=200");
      const data = await res.json();
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

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "admin_email",
      header: "Admin User",
      cell: ({ row }) => <span className="text-[13px] font-semibold text-[var(--ink-950)]">{row.original.admin_email}</span>,
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        const a = row.original.action;
        const color = a.includes("create") || a.includes("assign") ? "text-emerald-600 bg-emerald-50" : 
                      a.includes("delete") || a.includes("revoke") || a.includes("ban") ? "text-red-600 bg-red-50" : 
                      "text-blue-600 bg-blue-50";
        return (
          <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold uppercase ${color}`}>
            {a.replace(/_/g, " ")}
          </span>
        );
      },
    },
    {
      accessorKey: "entity_type",
      header: "Entity",
      cell: ({ row }) => (
        <div>
          <p className="text-[12px] font-bold text-[var(--ink-600)]">{row.original.entity_type}</p>
          <p className="text-[10px] text-[var(--ink-400)] font-mono truncate max-w-[150px]">{row.original.entity_id || "—"}</p>
        </div>
      ),
    },
    {
      accessorKey: "ip_address",
      header: "IP",
      cell: ({ row }) => <span className="text-[11px] font-mono text-[var(--ink-500)]">{row.original.ip_address || "—"}</span>,
    },
    {
      accessorKey: "created_at",
      header: "Timestamp",
      cell: ({ row }) => <span className="text-[12px] text-[var(--ink-600)]">{format(new Date(row.original.created_at), "MMM dd, HH:mm:ss")}</span>,
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
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--ink-950)] flex items-center gap-2">
          <Activity className="w-6 h-6" /> Audit Logs
        </h1>
        <p className="text-[var(--ink-500)] mt-1">Track all administrative actions performed within the system.</p>
      </div>

      {!isSuperAdmin ? (
        <div className="bg-red-50 border border-red-200 text-red-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center gap-3">
          <ShieldAlert className="w-12 h-12 text-red-400" />
          <div>
            <h2 className="font-bold text-lg mb-1">Access Restricted</h2>
            <p className="text-sm">Only Super Admins have permission to view the global audit logs for security reasons.</p>
          </div>
        </div>
      ) : (
        <>
          <AdminTable data={logs} columns={columns} loading={loading} />

          <AdminModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title="Action Details"
            size="lg"
          >
            {selectedLog && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-[var(--paper-2)] rounded-xl border border-[var(--border)]">
                  <div>
                    <p className="text-[10px] font-bold text-[var(--ink-400)] uppercase tracking-wider mb-1">Admin</p>
                    <p className="text-sm font-semibold truncate">{selectedLog.admin_email}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[var(--ink-400)] uppercase tracking-wider mb-1">Action</p>
                    <p className="text-sm font-semibold uppercase text-blue-600">{selectedLog.action.replace(/_/g, " ")}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[var(--ink-400)] uppercase tracking-wider mb-1">Entity</p>
                    <p className="text-sm font-semibold">{selectedLog.entity_type}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[var(--ink-400)] uppercase tracking-wider mb-1">Timestamp</p>
                    <p className="text-sm font-semibold">{format(new Date(selectedLog.created_at), "MMM dd, yyyy HH:mm")}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-[var(--ink-950)] mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span> Old Value
                    </h3>
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 overflow-x-auto">
                      <pre className="text-[11px] font-mono text-red-900">
                        {selectedLog.old_value ? JSON.stringify(selectedLog.old_value, null, 2) : "null"}
                      </pre>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--ink-950)] mb-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> New Value
                    </h3>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 overflow-x-auto">
                      <pre className="text-[11px] font-mono text-emerald-900">
                        {selectedLog.new_value ? JSON.stringify(selectedLog.new_value, null, 2) : "null"}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--border)]">
                  <p className="text-[11px] text-[var(--ink-400)] font-mono">ID: {selectedLog.id} | User Agent: {selectedLog.user_agent || "Unknown"}</p>
                </div>
              </div>
            )}
          </AdminModal>
        </>
      )}
    </div>
  );
}
