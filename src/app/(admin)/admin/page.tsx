import { supabaseAdmin } from "@/lib/supabase";
import { Users, Briefcase, CreditCard, Activity } from "lucide-react";

export const revalidate = 0; // Disable caching for admin

export default async function AdminDashboardPage() {
  const [
    { count: usersCount },
    { count: activeAccountsCount },
    { count: fundedAccountsCount },
    { data: purchases }
  ] = await Promise.all([
    supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("accounts").select("*", { count: "exact", head: true }).in("status", ["active", "passed"]),
    supabaseAdmin.from("accounts").select("*", { count: "exact", head: true }).eq("status", "funded"),
    supabaseAdmin.from("purchases").select("price_amount").eq("payment_status", "paid")
  ]);

  const totalRevenue = purchases?.reduce((sum, p) => sum + Number(p.price_amount), 0) || 0;

  const stats = [
    { label: "Total Users", value: usersCount || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active Challenges", value: activeAccountsCount || 0, icon: Activity, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Funded Traders", value: fundedAccountsCount || 0, icon: Briefcase, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Total Revenue", value: `$${totalRevenue.toLocaleString()}`, icon: CreditCard, color: "text-purple-600", bg: "bg-purple-50" },
  ];

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-[var(--ink-950)] mb-2">Admin Dashboard</h1>
        <p className="text-[var(--ink-500)]">Overview of platform metrics and performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl p-6 border border-[var(--border)] shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-[13px] font-medium text-[var(--ink-500)]">{stat.label}</p>
                <p className="text-2xl font-bold text-[var(--ink-950)] mt-0.5">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
