"use client";

import { useCallback, useState, useEffect, type FormEvent } from "react";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Ticket, Plus, Trash2, Power, PowerOff, X } from "lucide-react";
import { toast } from "sonner";
import { couponAccountKey, type CouponAccount, type CouponProgram } from "@/lib/coupon-eligibility";

type CouponRow = {
  id: string;
  code: string;
  discount_pct: number | null;
  current_uses: number | null;
  max_uses: number | null;
  expires_at: string | null;
  is_active: boolean;
  challenge_specific: string | null;
  challenge_key: string | null;
  eligible_accounts?: CouponAccount[] | null;
};

const sizeLabel = (size: number) => size >= 1000 ? `$${size / 1000}K` : `$${size}`;
const selectStyle = "w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm focus:outline-none focus:border-[var(--ink-950)]";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [programs, setPrograms] = useState<CouponProgram[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [appliesTo, setAppliesTo] = useState<"all" | "selected">("all");
  const [selectedProgramKey, setSelectedProgramKey] = useState("");
  const [selectedAccounts, setSelectedAccounts] = useState<CouponAccount[]>([]);
  const [creating, setCreating] = useState(false);

  const selectedProgram = programs.find((program) => program.key === selectedProgramKey);
  const programLabel = (key: string) => programs.find((program) => program.key === key)?.label ?? key;
  const accountLabel = (account: CouponAccount) => `${programLabel(account.programKey)} · ${sizeLabel(account.accountSize)}`;
  const selectedKeys = new Set(selectedAccounts.map(couponAccountKey));
  const hasValidScope = appliesTo === "all" || selectedAccounts.length > 0;

  function toggleAccount(account: CouponAccount) {
    const key = couponAccountKey(account);
    setSelectedAccounts((current) => current.some((item) => couponAccountKey(item) === key)
      ? current.filter((item) => couponAccountKey(item) !== key)
      : [...current, account]);
  }

  const fetchCoupons = useCallback((signal?: AbortSignal) => {
    return fetch("/api/admin/coupons", { signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to fetch coupons");
        const data = await response.json();
        setCoupons(data.coupons ?? []);
        setPrograms(data.programs ?? []);
      })
      .catch(() => { if (!signal?.aborted) toast.error("Failed to fetch coupons"); })
      .finally(() => { if (!signal?.aborted) setLoading(false); });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetchCoupons(controller.signal);
    return () => controller.abort();
  }, [fetchCoupons]);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (creating || !hasValidScope) return;
    setCreating(true);

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          discount_percentage: parseInt(discountPercent),
          max_uses: maxUses ? parseInt(maxUses) : null,
          expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
          eligible_accounts: appliesTo === "selected" ? selectedAccounts : null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create the coupon.");
      
      toast.success("Coupon created successfully");
      setIsModalOpen(false);
      setCode("");
      setDiscountPercent("");
      setMaxUses("");
      setExpiresAt("");
      setAppliesTo("all");
      setSelectedProgramKey("");
      setSelectedAccounts([]);
      fetchCoupons();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create the coupon.");
    } finally {
      setCreating(false);
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
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update the coupon.");
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
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete the coupon.");
    }
  };

  const columns: ColumnDef<CouponRow>[] = [
    {
      accessorKey: "code",
      header: "Code",
      cell: ({ row }) => (
        <span className="font-mono text-[14px] font-bold text-[var(--ink-950)]">{row.original.code}</span>
      ),
    },
    {
      accessorKey: "discount_pct",
      header: "Discount",
      cell: ({ row }) => <span className="font-bold text-emerald-600">{row.original.discount_pct ?? 0}% OFF</span>,
    },
    {
      id: "scope",
      header: "Applies to",
      cell: ({ row }) => {
        const coupon = row.original;
        const legacyProgram = coupon.challenge_specific || coupon.challenge_key;
        const accounts = coupon.eligible_accounts;
        if (accounts && accounts.length > 1) {
          return (
            <details className="text-[12px]">
              <summary className="cursor-pointer font-medium">{accounts.length} selected accounts</summary>
              <ul className="mt-1 space-y-1">
                {accounts.map((account) => <li key={couponAccountKey(account)}>{accountLabel(account)}</li>)}
              </ul>
            </details>
          );
        }
        return (
          <span className="text-[12px] font-medium">
            {accounts?.[0] ? accountLabel(accounts[0]) : legacyProgram ? `${programLabel(legacyProgram)} · All sizes` : "All accounts"}
          </span>
        );
      },
    },
    {
      accessorKey: "current_uses",
      header: "Usage",
      cell: ({ row }) => {
        const uses = row.original.current_uses ?? 0;
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
        onClose={() => { if (!creating) setIsModalOpen(false); }}
        title="Create Discount Coupon"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="coupon-code" className="block text-sm font-semibold mb-1">Coupon Code</label>
              <input
                id="coupon-code"
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full border border-[var(--border)] rounded-xl p-2.5 outline-none focus:border-[var(--ink-950)] font-mono uppercase"
                placeholder="SUMMER20"
              />
            </div>
            <div>
              <label htmlFor="coupon-discount" className="block text-sm font-semibold mb-1">Discount %</label>
              <input
                id="coupon-discount"
                type="number"
                required
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
              <label htmlFor="coupon-uses" className="block text-sm font-semibold mb-1">Max Uses (Optional)</label>
              <input
                id="coupon-uses"
                type="number"
                min="1"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                className="w-full border border-[var(--border)] rounded-xl p-2.5 outline-none focus:border-[var(--ink-950)]"
                placeholder="Unlimited"
              />
            </div>
            <div>
              <label htmlFor="coupon-expiry" className="block text-sm font-semibold mb-1">Expiry Date (Optional)</label>
              <input
                id="coupon-expiry"
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full border border-[var(--border)] rounded-xl p-2.5 outline-none focus:border-[var(--ink-950)] bg-white"
              />
            </div>
          </div>
          <div>
            <label htmlFor="coupon-scope" className="block text-sm font-semibold mb-1">Applies to</label>
            <select
              id="coupon-scope"
              value={appliesTo}
              onChange={(event) => setAppliesTo(event.target.value === "selected" ? "selected" : "all")}
              className={selectStyle}
            >
              <option value="all">All accounts</option>
              <option value="selected">Selected accounts</option>
            </select>
          </div>
          {appliesTo === "selected" && (
            <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--paper-2)] p-3">
              <div>
                <label htmlFor="coupon-program" className="block text-sm font-semibold mb-1">Program</label>
                <select
                  id="coupon-program"
                  value={selectedProgramKey}
                  onChange={(event) => setSelectedProgramKey(event.target.value)}
                  className={selectStyle}
                  disabled={!programs.length}
                >
                  <option value="">{programs.length ? "Choose a program" : "No programs available"}</option>
                  {programs.map((program) => <option key={program.key} value={program.key}>{program.label}</option>)}
                </select>
              </div>
              {selectedProgram && (
                <fieldset>
                  <legend className="mb-1.5 text-sm font-semibold">Account sizes</legend>
                  <div className="flex flex-wrap gap-2">
                    {selectedProgram.accountSizes.map((accountSize) => {
                      const account = { programKey: selectedProgram.key, accountSize };
                      return (
                        <label key={accountSize} className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm font-medium has-checked:border-emerald-500 has-checked:bg-emerald-50">
                          <input
                            type="checkbox"
                            checked={selectedKeys.has(couponAccountKey(account))}
                            onChange={() => toggleAccount(account)}
                            className="size-4 accent-emerald-700"
                          />
                          {sizeLabel(accountSize)}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              )}
              {selectedAccounts.length > 0 && (
                <ul aria-label="Selected accounts" className="flex flex-wrap gap-2 border-t border-[var(--border)] pt-2.5">
                  {selectedAccounts.map((account) => (
                    <li key={couponAccountKey(account)}>
                      <button
                        type="button"
                        className="flex items-center gap-1.5 rounded-lg bg-white px-2 py-1.5 text-xs font-medium hover:bg-emerald-50"
                        aria-label={`Remove ${accountLabel(account)}`}
                        onClick={() => toggleAccount(account)}
                      >
                        {accountLabel(account)} <X aria-hidden="true" className="size-3" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" disabled={creating} onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-[var(--ink-500)] font-semibold">Cancel</button>
            <button type="submit" disabled={creating || !hasValidScope} className="px-4 py-2 bg-[var(--ink-950)] text-white rounded-xl font-bold disabled:opacity-50">
              {creating ? "Creating…" : "Create Coupon"}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
