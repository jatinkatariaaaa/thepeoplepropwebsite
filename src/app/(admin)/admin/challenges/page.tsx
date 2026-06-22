"use client";

import { useState, useEffect } from "react";
import { AdminTable } from "@/components/admin/AdminTable";
import { ColumnDef } from "@tanstack/react-table";
import { Target, Plus, Edit, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useAdminRole } from "@/lib/admin-context";

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const myRole = useAdminRole();

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/challenges");
      const data = await res.json();
      if (data.challenges) setChallenges(data.challenges);
    } catch (e) {
      toast.error("Failed to load challenges");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Challenge Name",
      cell: ({ row }) => <span className="font-bold text-[var(--ink-950)]">{row.original.name}</span>,
    },
    {
      accessorKey: "program_key",
      header: "Key",
      cell: ({ row }) => <span className="font-mono text-sm text-[var(--ink-500)]">{row.original.program_key}</span>,
    },
    {
      accessorKey: "account_size",
      header: "Size",
      cell: ({ row }) => <span className="font-bold text-emerald-600">${row.original.account_size?.toLocaleString()}</span>,
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => <span className="font-semibold text-[var(--ink-950)]">${row.original.price}</span>,
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${
          row.original.is_active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
        }`}>
          {row.original.is_active ? "Active" : "Draft"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <button
          className="p-1.5 text-[var(--ink-400)] hover:text-[var(--ink-950)] hover:bg-[var(--border)] rounded"
          onClick={() => toast.info("Editing coming soon")}
        >
          <Edit className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ink-950)] flex items-center gap-2">
            <Target className="w-6 h-6" /> Trading Challenges
          </h1>
          <p className="text-[var(--ink-500)] mt-1">Manage prop firm challenges, account sizes, and pricing.</p>
        </div>
        {(myRole === "super_admin" || myRole === "marketing") && (
          <button
            onClick={() => toast.info("Creating challenges coming soon")}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--ink-950)] text-white rounded-xl font-bold hover:bg-black transition-colors"
          >
            <Plus className="w-4 h-4" /> New Challenge
          </button>
        )}
      </div>

      {challenges.length === 0 && !loading ? (
        <div className="bg-[var(--paper-2)] border border-[var(--border)] p-12 rounded-2xl flex flex-col items-center text-center">
          <ShieldAlert className="w-12 h-12 text-[var(--ink-300)] mb-4" />
          <h2 className="text-xl font-bold text-[var(--ink-950)] mb-2">Table Not Configured</h2>
          <p className="text-[var(--ink-500)] max-w-md">
            The `tpp_challenges` table does not exist in your database yet. If you are managing programs through hardcoded files, you don't need this section right now.
          </p>
        </div>
      ) : (
        <AdminTable data={challenges} columns={columns} loading={loading} />
      )}
    </div>
  );
}
