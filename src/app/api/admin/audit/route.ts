import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireRole } from "@/lib/admin-auth";

export async function GET(request: Request) {
  try {
    // Only super_admin and finance can view audit logs usually, or maybe everyone depending on rules.
    // We'll restrict to super_admin for safety.
    await requireRole(request, ["super_admin"]);
    
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "";
    const entity_type = searchParams.get("entity_type") || "";
    const admin_email = searchParams.get("admin_email") || "";
    const search = searchParams.get("search") || "";
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from("audit_logs")
      .select("*", { count: "exact" });

    if (action) query = query.eq("action", action);
    if (entity_type) query = query.eq("entity_type", entity_type);
    if (admin_email) query = query.ilike("admin_email", `%${admin_email}%`);
    if (search) query = query.or(`action.ilike.%${search}%,entity_type.ilike.%${search}%,admin_email.ilike.%${search}%`);

    const { data: logs, count, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({ logs: logs || [], total: count || 0, page, limit });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
