import { supabaseAdmin } from "@/lib/supabase";
import AdminUsersClient from "./AdminUsersClient";

export const revalidate = 0;

export default async function AdminUsersPage() {
  const { data: users, error } = await supabaseAdmin
    .from("profiles")
    .select("id, email, display_name, status, is_admin, kyc_status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-[var(--ink-950)] mb-2">Registered Users</h1>
        <p className="text-[var(--ink-500)]">Manage all traders registered on the platform.</p>
      </div>

      <AdminUsersClient initialUsers={users || []} initialLoadFailed={Boolean(error)} />
    </div>
  );
}
