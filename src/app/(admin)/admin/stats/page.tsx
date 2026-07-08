import { supabaseAdmin } from "@/lib/supabase";
import { AdminStatsClient } from "./AdminStatsClient";

export const revalidate = 0;

export default async function AdminStatsPage() {
  const { data: stats, error } = await supabaseAdmin
    .from("tpp_stats")
    .select("*")
    .order("key_name", { ascending: true });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
      <div className="mb-8">
        <h1 className="mb-1 text-xl font-semibold tracking-tight text-ink sm:text-2xl">Platform Statistics</h1>
        <p className="text-[var(--ink-500)]">Manage the live statistics shown on the landing page.</p>
      </div>

      <AdminStatsClient initialStats={stats || []} />
    </div>
  );
}
