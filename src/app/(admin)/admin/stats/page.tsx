import { supabaseAdmin } from "@/lib/supabase";
import { AdminStatsClient } from "./AdminStatsClient";

export const revalidate = 0;

export default async function AdminStatsPage() {
  const { data: stats, error } = await supabaseAdmin
    .from("tpp_stats")
    .select("*")
    .order("key_name", { ascending: true });

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-[var(--ink-950)] mb-2">Platform Statistics</h1>
        <p className="text-[var(--ink-500)]">Manage the live statistics shown on the landing page.</p>
      </div>

      <AdminStatsClient initialStats={stats || []} />
    </div>
  );
}
