import { supabaseAdmin } from "@/lib/supabase";

export const revalidate = 0;

export default async function AdminPurchasesPage() {
  const [ { data: purchases }, { data: profiles } ] = await Promise.all([
    supabaseAdmin.from("purchases").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.from("profiles").select("id, email, display_name")
  ]);

  const profilesMap = (profiles || []).reduce((acc: any, p: any) => {
    acc[p.id] = p;
    return acc;
  }, {});

  const enrichedPurchases = (purchases || []).map(pur => ({
    ...pur,
    profiles: profilesMap[pur.user_id] || null
  }));

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
      <div className="mb-8">
        <h1 className="mb-1 text-xl font-semibold tracking-tight text-ink sm:text-2xl">Purchases</h1>
        <p className="text-[var(--ink-500)]">View all challenge purchases and crypto transactions.</p>
      </div>

      <div className="dash-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--dash-canvas)] border-b border-[var(--dash-hairline)] text-[13px] uppercase tracking-wider text-[var(--ink-500)]">
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Challenge</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--dash-hairline)]">
              {enrichedPurchases?.map((purchase) => (
                <tr key={purchase.id} className="hover:bg-[var(--dash-canvas)] transition-colors">
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
                    <span className={`inline-flex items-center px-2 py-1 rounded-none text-xs font-semibold ${
                      purchase.payment_status === 'paid' ? 'bg-[#a7f0ba] text-[#0e6027]' :
                      purchase.payment_status === 'failed' ? 'bg-[#ffd7d9] text-[#a2191f]' :
                      'bg-[#fcf4d6] text-[#8e6a00]'
                    }`}>
                      {purchase.payment_status || "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
              {(!enrichedPurchases || enrichedPurchases.length === 0) && (
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
