import { supabaseAdmin } from "@/lib/supabase";
import AdminUsersClient from "./AdminUsersClient";

export const revalidate = 0;

export default async function AdminUsersPage() {
  const { data: users, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
      <div className="mb-8">
        <h1 className="mb-1 text-xl font-semibold tracking-tight text-ink sm:text-2xl">Registered Users</h1>
        <p className="text-[var(--ink-500)]">Manage all traders registered on the platform.</p>
      </div>

      <AdminUsersClient initialUsers={users || []} />
    </div>
  );
}
