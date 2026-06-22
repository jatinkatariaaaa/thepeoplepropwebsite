"use client";

import { useState, useEffect } from "react";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ShieldAlert, ShieldCheck, MoreVertical, Edit, Ban, PlayCircle, Shield } from "lucide-react";
import { toast } from "sonner";

export default function AdminUsersClient() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"suspend" | "ban" | "unsuspend" | "">("");
  const [actionReason, setActionReason] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users?limit=100");
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAction = async () => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          action: actionType,
          reason: actionReason,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      toast.success(`User successfully ${actionType}ed`);
      setIsActionModalOpen(false);
      setActionReason("");
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "email",
      header: "User",
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-[var(--ink-950)]">{row.original.display_name || "—"}</p>
          <p className="text-xs text-[var(--ink-400)]">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.original.status || "active";
        return (
          <span className={`inline-flex px-2 py-1 rounded-full text-[11px] font-bold uppercase ${
            s === "active" ? "bg-emerald-50 text-emerald-700" :
            s === "suspended" ? "bg-amber-50 text-amber-700" :
            "bg-red-50 text-red-700"
          }`}>
            {s}
          </span>
        );
      },
    },
    {
      accessorKey: "is_admin",
      header: "Role",
      cell: ({ row }) => (
        row.original.is_admin ? (
          <span className="inline-flex items-center gap-1 bg-[var(--ink-950)] text-white px-2 py-1 rounded-full text-[11px] font-bold uppercase">
            <Shield className="w-3 h-3" /> Admin
          </span>
        ) : (
          <span className="text-[12px] text-[var(--ink-400)] font-medium">User</span>
        )
      ),
    },
    {
      accessorKey: "created_at",
      header: "Joined",
      cell: ({ row }) => <span className="text-[13px]">{format(new Date(row.original.created_at), "MMM dd, yyyy")}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setSelectedUser(user); setIsEditModalOpen(true); }}
              className="p-1.5 text-[var(--ink-400)] hover:text-[var(--ink-950)] hover:bg-[var(--border)] rounded"
            >
              <Edit className="w-4 h-4" />
            </button>
            {user.status === "active" ? (
              <button
                onClick={() => { setSelectedUser(user); setActionType("suspend"); setIsActionModalOpen(true); }}
                className="p-1.5 text-[var(--ink-400)] hover:text-amber-600 hover:bg-amber-50 rounded"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => { setSelectedUser(user); setActionType("unsuspend"); setIsActionModalOpen(true); }}
                className="p-1.5 text-[var(--ink-400)] hover:text-emerald-600 hover:bg-emerald-50 rounded"
              >
                <PlayCircle className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={() => { setSelectedUser(user); setActionType("ban"); setIsActionModalOpen(true); }}
              className="p-1.5 text-[var(--ink-400)] hover:text-red-600 hover:bg-red-50 rounded"
            >
              <Ban className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--ink-950)]">Users Management</h1>
        <p className="text-[var(--ink-500)]">Manage all registered users, suspend or ban accounts.</p>
      </div>

      <AdminTable data={users} columns={columns} loading={loading} />

      {/* Action Modal (Suspend/Ban) */}
      <AdminModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        title={`${actionType === "ban" ? "Ban" : actionType === "suspend" ? "Suspend" : "Unsuspend"} User`}
        description={selectedUser?.email}
      >
        <div className="space-y-4">
          {actionType !== "unsuspend" && (
            <div>
              <label className="block text-sm font-semibold text-[var(--ink-950)] mb-1">Reason (Optional)</label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="w-full border border-[var(--border)] rounded-xl p-3 text-sm outline-none focus:border-[var(--ink-950)]"
                rows={3}
                placeholder={`Reason for ${actionType}ing this user...`}
              />
            </div>
          )}
          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={() => setIsActionModalOpen(false)}
              className="px-4 py-2 font-semibold text-[var(--ink-600)] hover:bg-[var(--border)] rounded-full transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAction}
              className={`px-4 py-2 font-bold text-white rounded-full transition-colors ${
                actionType === "ban" ? "bg-red-600 hover:bg-red-700" :
                actionType === "suspend" ? "bg-amber-600 hover:bg-amber-700" :
                "bg-[var(--ink-950)] hover:bg-black"
              }`}
            >
              Confirm
            </button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
