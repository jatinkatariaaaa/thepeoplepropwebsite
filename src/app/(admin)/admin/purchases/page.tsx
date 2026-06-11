import { supabaseAdmin } from "@/lib/supabase";

export const revalidate = 0;

export default async function AdminPurchasesPage() {
  const { data: purchases, error } = await supabaseAdmin
    .from("purchases")
    .select(`
      *,
      profiles (
        email,
        display_name
      )
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-[var(--ink-950)] mb-2">Purchases</h1>
        <p className="text-[var(--ink-500)]">View all challenge purchases and crypto transactions.</p>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--border)] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--paper-2)] border-b border-[var(--border)] text-[13px] uppercase tracking-wider text-[var(--ink-500)]">
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Challenge</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {purchases?.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-[var(--paper-2)] transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs text-[var(--ink-500)]">{purchase.order_id || purchase.id.substring(0, 8)}</span>
                  </td>
                  <td className="px-6 py-4 text-[var(--ink-500)] text-sm">
                    {new Date(purchase.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[13px] font-medium text-[var(--ink-950)]">{purchase.profiles?.email || purchase.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[14px] font-medium text-[var(--ink-950)] uppercase">{purchase.program_key?.replace("-", " ")}</div>
                    <div className="text-[11px] uppercase tracking-wider text-[var(--ink-500)] mt-0.5">${Number(purchase.account_size).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[14px] font-mono font-semibold">${Number(purchase.price_amount).toLocaleString()}</div>
                    <div className="text-[11px] uppercase tracking-wider text-[var(--ink-500)] mt-0.5">{purchase.payment_method}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${
                      purchase.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                      purchase.payment_status === 'failed' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {purchase.payment_status || "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
              {(!purchases || purchases.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-[var(--ink-500)]">
                    No purchases found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
