"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/Button";
import { Plus, Edit2, Ticket, Percent, RotateCcw, X } from "lucide-react";

export default function CouponsAdminPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  const [formData, setFormData] = useState({
    code: "",
    discount_pct: 0,
    extra_refund_pct: 0,
    free_evaluation: false,
    max_uses: 1000,
    is_active: true
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
    setLoading(true);
    const { data, error } = await supabase
      .from("tpp_coupons")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      setCoupons(data);
    }
    setLoading(false);
  }

  function openNewModal() {
    setEditingCoupon(null);
    setFormData({
      code: "",
      discount_pct: 0,
      extra_refund_pct: 0,
      free_evaluation: false,
      max_uses: 1000,
      is_active: true
    });
    setIsModalOpen(true);
  }

  function openEditModal(coupon: any) {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discount_pct: coupon.discount_pct,
      extra_refund_pct: coupon.extra_refund_pct,
      free_evaluation: coupon.free_evaluation,
      max_uses: coupon.max_uses,
      is_active: coupon.is_active
    });
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (editingCoupon) {
      const { error } = await supabase
        .from("tpp_coupons")
        .update(formData)
        .eq("id", editingCoupon.id);
      if (!error) {
        setIsModalOpen(false);
        fetchCoupons();
      } else {
        alert("Error updating coupon: " + error.message);
      }
    } else {
      const { error } = await supabase
        .from("tpp_coupons")
        .insert([formData]);
      if (!error) {
        setIsModalOpen(false);
        fetchCoupons();
      } else {
        alert("Error creating coupon: " + error.message);
      }
    }
  }

  if (loading && coupons.length === 0) return <div className="p-10 animate-pulse bg-[var(--paper)] rounded-xl h-40" />;

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative">
      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-bold">{editingCoupon ? "Edit Coupon" : "Create Coupon"}</h2>
              <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Coupon Code</label>
                <input required type="text" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} className="w-full border rounded-lg p-2 uppercase" placeholder="e.g. SUMMER50" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Discount %</label>
                  <input required type="number" min="0" max="100" value={formData.discount_pct} onChange={e => setFormData({...formData, discount_pct: Number(e.target.value)})} className="w-full border rounded-lg p-2" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Extra Refund %</label>
                  <input required type="number" min="0" max="100" value={formData.extra_refund_pct} onChange={e => setFormData({...formData, extra_refund_pct: Number(e.target.value)})} className="w-full border rounded-lg p-2" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Max Uses</label>
                  <input required type="number" min="1" value={formData.max_uses} onChange={e => setFormData({...formData, max_uses: Number(e.target.value)})} className="w-full border rounded-lg p-2" />
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input type="checkbox" checked={formData.free_evaluation} onChange={e => setFormData({...formData, free_evaluation: e.target.checked})} id="free_eval" />
                  <label htmlFor="free_eval" className="text-sm font-semibold">Free Evaluation?</label>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} id="is_active" />
                <label htmlFor="is_active" className="text-sm font-semibold text-green-700">Coupon is Active</label>
              </div>
              <div className="pt-4 flex justify-end gap-2 border-t mt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-[#bcff2e] text-black">Save Coupon</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ink-950)]">Coupons & Promos</h1>
          <p className="text-[var(--ink-500)] text-sm">Create and manage discount codes and special features</p>
        </div>
        <Button onClick={openNewModal} className="flex items-center gap-2 bg-[#bcff2e] text-[#0a0a0a] hover:bg-[#a5e622]">
          <Plus className="w-4 h-4" /> Create Coupon
        </Button>
      </div>

      <div className="bg-white border border-[var(--border)] rounded-[20px] shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[600px]">
          <thead className="bg-[var(--paper-2)] text-[var(--ink-500)] font-medium">
            <tr>
              <th className="px-6 py-4">Code</th>
              <th className="px-6 py-4">Discount</th>
              <th className="px-6 py-4">Special Perks</th>
              <th className="px-6 py-4">Uses</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-bold text-[var(--ink-950)] flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-[var(--accent)]" />
                  {coupon.code}
                </td>
                <td className="px-6 py-4 font-medium text-green-600">
                  {coupon.discount_pct}% OFF
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {coupon.extra_refund_pct > 0 && (
                      <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider">
                        <RotateCcw className="w-3 h-3" /> +{coupon.extra_refund_pct}% Refund
                      </span>
                    )}
                    {coupon.free_evaluation && (
                      <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider">
                        Free Eval
                      </span>
                    )}
                    {!coupon.free_evaluation && coupon.extra_refund_pct === 0 && (
                      <span className="text-[var(--ink-400)] text-xs">—</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-[var(--ink-500)]">
                  {coupon.current_uses} / {coupon.max_uses}
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${coupon.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {coupon.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => openEditModal(coupon)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-[var(--ink-500)]">
                  No coupons found. Click "Create Coupon" to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
