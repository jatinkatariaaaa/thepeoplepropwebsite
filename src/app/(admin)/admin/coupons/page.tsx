"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/Button";
import { Plus, Edit2, Ticket, Percent, RotateCcw } from "lucide-react";

export default function CouponsAdminPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="p-10 animate-pulse bg-[var(--paper)] rounded-xl h-40" />;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ink-950)]">Coupons & Promos</h1>
          <p className="text-[var(--ink-500)] text-sm">Create and manage discount codes and special features</p>
        </div>
        <Button className="flex items-center gap-2 bg-[#bcff2e] text-[#0a0a0a] hover:bg-[#a5e622]">
          <Plus className="w-4 h-4" /> Create Coupon
        </Button>
      </div>

      <div className="bg-white border border-[var(--border)] rounded-[20px] shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
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
                  <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
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
