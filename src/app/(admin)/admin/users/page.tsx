import { supabaseAdmin } from "@/lib/supabase";
import AdminUsersClient from "./AdminUsersClient";

export const revalidate = 0;

export default async function AdminUsersPage() {
  const { data: users, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-[var(--ink-950)] mb-2">Registered Users</h1>
        <p className="text-[var(--ink-500)]">Manage all traders registered on the platform.</p>
      </div>

      <AdminUsersClient initialUsers={users || []} />
    </div>
  );
}
