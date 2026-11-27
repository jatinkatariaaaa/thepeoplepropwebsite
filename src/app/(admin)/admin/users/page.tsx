import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase";
import AdminUsersClient, { type AdminUser } from "./AdminUsersClient";

export const revalidate = 0;

const pageSize = 25;
const sortableColumns = ["email", "status", "is_admin", "kyc_status", "created_at"];

export default async function AdminUsersPage({ searchParams }: PageProps<"/admin/users">) {
  const admin = await getAdminUser().catch(() => null);
  if (!admin) redirect("/admin");
  const canSeePhoneNumbers = ["super_admin", "finance", "support"].includes(admin.role);

  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search.trim().slice(0, 256) : "";
  const requestedPage = Number(params.page ?? 1);
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 && requestedPage <= 100_000
    ? requestedPage
    : 1;
  const sortColumn = sortableColumns.find((column) => column === params.sort);
  const sorting = sortColumn ? [{ id: sortColumn, desc: params.direction === "desc" }] : [];
  const offset = (page - 1) * pageSize;
  const fields = "id, email, display_name, status, is_admin, kyc_status, created_at";

  let query = supabaseAdmin
    .from("profiles")
    .select(canSeePhoneNumbers ? `${fields}, phone_number` : fields, { count: "exact" });

  if (search) {
    // Quote the filter value for PostgREST and escape SQL LIKE metacharacters.
    const pattern = JSON.stringify(`%${search.replace(/[\\%_]/g, "\\$&")}%`);
    query = query.or(`email.ilike.${pattern},display_name.ilike.${pattern}`);
  }

  const { data: users, count, error } = await query
    .order(sortColumn ?? "created_at", { ascending: sortColumn ? params.direction !== "desc" : false })
    .order("id", { ascending: false })
    .range(offset, offset + pageSize - 1)
    .overrideTypes<AdminUser[], { merge: false }>();

  // A bookmarked page can disappear if records are removed or its URL is edited.
  if (page > 1 && (error?.code === "PGRST103" || (count !== null && offset >= count))) {
    const firstPage = new URLSearchParams();
    if (search) firstPage.set("search", search);
    if (sortColumn) {
      firstPage.set("sort", sortColumn);
      firstPage.set("direction", params.direction === "desc" ? "desc" : "asc");
    }
    redirect(firstPage.size ? `/admin/users?${firstPage}` : "/admin/users");
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-[var(--ink-950)] mb-2">Registered Users</h1>
        <p className="text-[var(--ink-500)]">Manage all traders registered on the platform.</p>
      </div>

      <AdminUsersClient
        users={users ?? []}
        total={count ?? 0}
        page={page}
        pageSize={pageSize}
        search={search}
        sorting={sorting}
        loadFailed={Boolean(error)}
      />
    </div>
  );
}
