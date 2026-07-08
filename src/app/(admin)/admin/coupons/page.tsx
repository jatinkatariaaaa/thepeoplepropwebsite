"use client";

import { useState, useEffect } from "react";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Ticket, Plus, Trash2, Power, PowerOff } from "lucide-react";
import { toast } from "sonner";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [challengeSpecific, setChallengeSpecific] = useState("");

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      if (data.coupons) setCoupons(data.coupons);
    } catch (error) {
      toast.error("Failed to fetch coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreate = async () => {
    if (!code || !discountPercent) return toast.error("Code and discount are required");
    
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          discount_percentage: parseInt(discountPercent),
          max_uses: maxUses ? parseInt(maxUses) : null,
          expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
          challenge_specific: challengeSpecific || null
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      toast.success("Coupon created successfully");
      setIsModalOpen(false);
      setCode("");
      setDiscountPercent("");
      setMaxUses("");
      setExpiresAt("");
      setChallengeSpecific("");
      fetchCoupons();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: !currentStatus }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success(currentStatus ? "Coupon deactivated" : "Coupon activated");
      fetchCoupons();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this coupon permanently?")) return;
    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success("Coupon deleted");
      fetchCoupons();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => (
        <span className="font-mono text-[14px] font-bold text-[var(--ink-950)]">{row.original.code}</span>
      ),
    },
    {
      accessorKey: "discount_percentage",
      header: "Discount",
      cell: ({ row }) => <span className="font-bold text-emerald-600">{row.original.discount_percentage}% OFF</span>,
    },
    {
      accessorKey: "uses",
      header: "Usage",
      cell: ({ row }) => {
        const uses = row.original.uses;
        const max = row.original.max_uses;
        return (
          <div className="text-[12px]">
            <span className="font-bold text-[var(--ink-950)]">{uses}</span>
            {max ? <span className="text-[var(--ink-400)]"> / {max}</span> : <span className="text-[var(--ink-400)]"> (Unlimited)</span>}
          </div>
        );
      },
    },
    {
      accessorKey: "expires_at",
      header: "Expiry",
      cell: ({ row }) => {
        const exp = row.original.expires_at;
        if (!exp) return <span className="text-[12px] text-[var(--ink-400)]">Never</span>;
        
        const isExpired = new Date(exp) < new Date();
        return (
          <span className={`text-[12px] font-semibold ${isExpired ? "text-red-600" : "text-[var(--ink-600)]"}`}>
            {format(new Date(exp), "MMM dd, yyyy")} {isExpired && "(Expired)"}
          </span>
        );
      },
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => {
        const active = row.original.is_active;
        return (
          <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${
            active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
          }`}>
            {active ? "Active" : "Disabled"}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <button
            onClick={() => handleToggleActive(row.original.id, row.original.is_active)}
            className={`p-1.5 rounded transition-colors ${
              row.original.is_active 
                ? "text-[var(--ink-400)] hover:text-amber-600 hover:bg-amber-50" 
                : "text-[var(--ink-400)] hover:text-emerald-600 hover:bg-emerald-50"
            }`}
            title={row.original.is_active ? "Deactivate" : "Activate"}
          >
            {row.original.is_active ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
          </button>
          <button
            onClick={() => handleDelete(row.original.id)}
            className="p-1.5 text-[var(--ink-400)] hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ink-950)] flex items-center gap-2">
            <Ticket className="w-6 h-6" /> Discount Coupons
          </h1>
          <p className="text-[var(--ink-500)] mt-1">Create and manage promotional codes for challenges.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--ink-950)] text-white rounded-xl font-bold hover:bg-black transition-colors"
        >
          <Plus className="w-4 h-4" /> New Coupon
        </button>
      </div>

      <AdminTable data={coupons} columns={columns} loading={loading} />

      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Discount Coupon"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Coupon Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full border border-[var(--border)] rounded-xl p-2.5 outline-none focus:border-[var(--ink-950)] font-mono uppercase"
                placeholder="SUMMER20"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Discount %</label>
              <input
                type="number"
                min="1"
                max="100"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                className="w-full border border-[var(--border)] rounded-xl p-2.5 outline-none focus:border-[var(--ink-950)]"
                placeholder="20"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Max Uses (Optional)</label>
              <input
                type="number"
                min="1"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                className="w-full border border-[var(--border)] rounded-xl p-2.5 outline-none focus:border-[var(--ink-950)]"
                placeholder="Unlimited"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Expiry Date (Optional)</label>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full border border-[var(--border)] rounded-xl p-2.5 outline-none focus:border-[var(--ink-950)] bg-white"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Restrict to Challenge (Optional)</label>
            <input
              type="text"
              value={challengeSpecific}
              onChange={(e) => setChallengeSpecific(e.target.value)}
              className="w-full border border-[var(--border)] rounded-xl p-2.5 outline-none focus:border-[var(--ink-950)]"
              placeholder="e.g. standard_100k (Leave empty for all)"
            />
            <p className="text-[11px] text-[var(--ink-500)] mt-1">If specified, coupon will only work for this specific program key.</p>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-[var(--ink-500)] font-semibold">Cancel</button>
            <button onClick={handleCreate} className="px-4 py-2 bg-[var(--ink-950)] text-white rounded-xl font-bold">Create Coupon</button>
          </div>
        </div>
      </AdminModal>
    </div>
  );
}
