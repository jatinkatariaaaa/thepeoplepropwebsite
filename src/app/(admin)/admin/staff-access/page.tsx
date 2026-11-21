import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase";
import type { StaffMember } from "@/lib/staff-access";
import { StaffAccessClient } from "./StaffAccessClient";

const pageSize = 25;

export default async function StaffAccessPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const owner = await getAdminUser().catch(() => null);
  if (owner?.role !== "super_admin") redirect("/dashboard");

  const requested = Number((await searchParams).page ?? 1);
  const page = Number.isSafeInteger(requested) && requested > 0 && requested <= 100000 ? requested : 1;
  const start = (page - 1) * pageSize;
  const { data, error } = await supabaseAdmin.from("staff_members")
    .select("user_id,rank,permissions,commission_bps,active,updated_at")
    .order("updated_at", { ascending: false }).order("user_id").range(start, start + pageSize);
  if (error) throw error;
  const rows = data.slice(0, pageSize);
  const profiles = new Map<string, { display_name: string | null; email: string | null }>();
  if (rows.length) {
    const people = await supabaseAdmin.from("profiles").select("id,display_name,email").in("id", rows.map(row => row.user_id));
    if (people.error) throw people.error;
    for (const person of people.data) profiles.set(person.id, person);
  }
  const members: StaffMember[] = rows.map(row => ({
    ...row,
    name: profiles.get(row.user_id)?.display_name ?? null,
    email: profiles.get(row.user_id)?.email ?? null,
  }));

  return <StaffAccessClient members={members} page={page} hasMore={data.length > pageSize} />;
}
