"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { format } from "date-fns";
import { ShieldAlert, Edit, Ban, PlayCircle, Search, Shield } from "lucide-react";
import { toast } from "sonner";

export type AdminUser = {
  id: string;
  email: string | null;
  phone_number?: string | null;
  display_name: string | null;
  status: string | null;
  is_admin: boolean | null;
  kyc_status: string | null;
  created_at: string;
};

export default function AdminUsersClient({
  users,
  total,
  page,
  pageSize,
  search,
  sorting,
  loadFailed,
}: {
  users: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
  search: string;
  sorting: SortingState;
  loadFailed: boolean;
}) {
  const router = useRouter();
  const [loading, startTransition] = useTransition();
  const pagination = { pageIndex: page - 1, pageSize };

  // Modal states
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<"suspend" | "ban" | "unsuspend" | "verify_kyc" | "reject_kyc" | "">("");
  const [actionReason, setActionReason] = useState("");

  function openPage(nextPage: number, nextSearch = search, nextSorting = sorting) {
    const params = new URLSearchParams();
    if (nextPage > 1) params.set("page", String(nextPage));
    if (nextSearch) params.set("search", nextSearch);
    const [sort] = nextSorting;
    if (sort) {
      params.set("sort", sort.id);
      params.set("direction", sort.desc ? "desc" : "asc");
    }
    startTransition(() => router.push(params.size ? `/admin/users?${params}` : "/admin/users", { scroll: false }));
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = new FormData(event.currentTarget).get("search");
    openPage(1, typeof term === "string" ? term.trim() : "");
  }

  const handleAction = async () => {
    if (!selectedUser) return;
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
      if (!res.ok) throw new Error(data.error || "Failed to update user");
      
      toast.success(`User successfully ${actionType}ed`);
      setIsActionModalOpen(false);
      setActionReason("");
      startTransition(() => router.refresh());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update user");
    }
  };

  const columns: ColumnDef<AdminUser>[] = [
    {
      accessorKey: "email",
      header: "User",
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-[var(--ink-950)]">{row.original.display_name || "—"}</p>
          <p className="text-xs text-[var(--ink-400)]">{row.original.email}</p>
          {row.original.phone_number && (
            <p className="mt-0.5 text-xs tabular-nums text-[var(--ink-600)]">{row.original.phone_number}</p>
          )}
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
      accessorKey: "kyc_status",
      header: "KYC",
      cell: ({ row }) => {
        const kyc = row.original.kyc_status || "none";
        return (
          <span className={`inline-flex px-2 py-1 rounded-full text-[11px] font-bold uppercase ${
            kyc === "approved" || kyc === "verified" ? "bg-emerald-50 text-emerald-700" :
            kyc === "pending" ? "bg-amber-50 text-amber-700" :
            kyc === "rejected" ? "bg-red-50 text-red-700" :
            "bg-[var(--ink-100)] text-[var(--ink-600)]"
          }`}>
            {kyc}
          </span>
        );
      },
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
    <>
      <form onSubmit={submitSearch} className="mb-4 flex flex-wrap items-center gap-2" role="search" aria-label="Registered users">
        <div className="relative min-w-0 grow sm:max-w-sm">
          <Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-400)]" />
          <input
            key={search}
            type="search"
            name="search"
            aria-label="Search by name or email"
            placeholder="Search by name or email"
            maxLength={256}
            defaultValue={search}
            className="w-full rounded-xl border border-[var(--border)] bg-white py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[var(--ink-950)]"
          />
        </div>
        <button type="submit" disabled={loading} className="rounded-xl bg-[var(--ink-950)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          Search
        </button>
        {search && (
          <button type="button" disabled={loading} onClick={() => openPage(1, "")} className="px-2 py-2 text-sm font-semibold text-[var(--ink-600)] hover:underline disabled:opacity-50">
            Clear search
          </button>
        )}
      </form>

      {loadFailed ? (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl border border-[var(--border)] bg-white p-4 text-sm">
          <p>Couldn’t load registered users.</p>
          <button type="button" onClick={() => startTransition(() => router.refresh())} disabled={loading} className="font-semibold underline">
            {loading ? "Retrying…" : "Try again"}
          </button>
        </div>
      ) : (
        <AdminTable
          data={users}
          columns={columns}
          searchable={false}
          loading={loading}
          serverControls={{
            total,
            pagination,
            sorting,
            onPaginationChange: (update) => {
              const next = typeof update === "function" ? update(pagination) : update;
              openPage(next.pageIndex + 1);
            },
            onSortingChange: (update) => {
              const next = typeof update === "function" ? update(sorting) : update;
              openPage(1, search, next);
            },
          }}
        />
      )}

      {/* Action Modal (Suspend/Ban/KYC) */}
      <AdminModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        title={`${
          actionType === "ban" ? "Ban" : 
          actionType === "suspend" ? "Suspend" : 
          actionType === "unsuspend" ? "Unsuspend" : 
          actionType === "verify_kyc" ? "Verify KYC for" :
          actionType === "reject_kyc" ? "Reject KYC for" : ""
        } User`}
        description={selectedUser?.email ?? undefined}
      >
        <div className="space-y-4">
          {actionType !== "unsuspend" && actionType !== "verify_kyc" && (
            <div>
              <label className="block text-sm font-semibold text-[var(--ink-950)] mb-1">Reason (Optional)</label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="w-full border border-[var(--border)] rounded-xl p-3 text-sm outline-none focus:border-[var(--ink-950)]"
                rows={3}
                placeholder={`Reason for this action...`}
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
                actionType === "ban" || actionType === "reject_kyc" ? "bg-red-600 hover:bg-red-700" :
                actionType === "suspend" ? "bg-amber-600 hover:bg-amber-700" :
                actionType === "verify_kyc" ? "bg-emerald-600 hover:bg-emerald-700" :
                "bg-[var(--ink-950)] hover:bg-black"
              }`}
            >
              Confirm
            </button>
          </div>
        </div>
      </AdminModal>
    </>
  );
}
