"use client";

import { useState, useEffect } from "react";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Shield, Plus, Trash2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useAdminRole } from "@/lib/admin-context";

export default function AdminRolesPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const myRole = useAdminRole();
  const isSuperAdmin = myRole === "super_admin";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("support");

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/roles");
      const data = await res.json();
      if (data.admins) setAdmins(data.admins);
    } catch (e) {
      toast.error("Failed to load admins");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAssignRole = async () => {
    if (!newEmail) return toast.error("Please enter an email");
    
    try {
      const res = await fetch("/api/admin/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail, role: newRole }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      toast.success("Role assigned successfully");
      setIsModalOpen(false);
      setNewEmail("");
      fetchAdmins();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleRevoke = async (userId: string) => {
    if (!confirm("Are you sure you want to revoke admin access for this user?")) return;
    
    try {
      const res = await fetch(`/api/admin/roles?user_id=${userId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      toast.success("Admin access revoked");
      fetchAdmins();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "email",
      header: "Admin User",
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-[var(--ink-950)]">{row.original.display_name || "—"}</p>
          <p className="text-xs text-[var(--ink-400)]">{row.original.email}</p>
        </div>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const r = row.original.role;
        return (
          <div className="flex items-center gap-2">
            <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold uppercase ${
              r === "super_admin" ? "bg-[var(--ink-950)] text-white" :
              r === "finance" ? "bg-violet-100 text-violet-700" :
              r === "support" ? "bg-blue-100 text-blue-700" :
              r === "marketing" ? "bg-amber-100 text-amber-700" :
              "bg-gray-100 text-gray-700"
            }`}>
              {r.replace("_", " ")}
            </span>
            {row.original.is_legacy && (
              <span className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-bold" title="Needs migration to admin_roles table">Legacy</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "created_at",
      header: "Granted On",
      cell: ({ row }) => <span className="text-[13px]">{format(new Date(row.original.created_at), "MMM dd, yyyy")}</span>,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        isSuperAdmin ? (
          <button
            onClick={() => handleRevoke(row.original.user_id)}
            className="p-1.5 text-[var(--ink-400)] hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Revoke Access"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        ) : (
          <span className="text-[12px] text-[var(--ink-400)]">Read Only</span>
        )
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ink-950)] flex items-center gap-2">
            <Shield className="w-6 h-6" /> Admin Roles
          </h1>
          <p className="text-[var(--ink-500)] mt-1">Manage admin access and role-based permissions.</p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--ink-950)] text-white rounded-xl font-bold hover:bg-black transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Admin
          </button>
        )}
      </div>

      {!isSuperAdmin && (
        <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 mt-0.5 shrink-0" />
          <div>
            <p className="font-bold text-sm">Read-Only View</p>
            <p className="text-xs mt-1">Only Super Admins can assign or revoke admin roles. You are currently viewing as: <span className="font-bold uppercase">{myRole}</span>.</p>
          </div>
        </div>
      )}

      <AdminTable data={admins} columns={columns} loading={loading} />

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Assign Admin Role"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">User Email</label>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full border border-[var(--border)] rounded-xl p-2.5 outline-none focus:border-[var(--ink-950)]"
              placeholder="Existing user's email address"
            />
            <p className="text-[11px] text-[var(--ink-500)] mt-1">User must already have an account.</p>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Role</label>
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full border border-[var(--border)] rounded-xl p-2.5 outline-none focus:border-[var(--ink-950)] bg-white"
            >
              <option value="super_admin">Super Admin (Full Access)</option>
              <option value="finance">Finance (Orders, Reports, Dashboards)</option>
              <option value="support">Support (Tickets, Users, Orders)</option>
              <option value="marketing">Marketing (Coupons, CMS, Dashboards)</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-[var(--ink-500)] font-semibold">Cancel</button>
            <button onClick={handleAssignRole} className="px-4 py-2 bg-[var(--ink-950)] text-white rounded-xl font-bold">Assign Role</button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
