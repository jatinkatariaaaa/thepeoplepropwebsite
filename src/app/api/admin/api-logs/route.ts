import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireRole } from "@/lib/admin-auth";

export async function GET(request: Request) {
  try {
    await requireRole(request, ["super_admin", "finance"]);

    const { searchParams } = new URL(request.url);
    const api_type = searchParams.get("api_type") || "";
    const method = searchParams.get("method") || "";
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";
    const from = searchParams.get("from") || "";
    const to = searchParams.get("to") || "";

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "25");
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from("api_logs")
      .select("*", { count: "exact" });

    if (api_type) query = query.eq("api_type", api_type);
    if (method) query = query.eq("method", method);
    if (search) query = query.ilike("endpoint", `%${search}%`);
    if (from) query = query.gte("created_at", from);
    if (to) query = query.lte("created_at", to);

    if (status) {
      if (status === "2xx") query = query.gte("status_code", 200).lt("status_code", 300);
      else if (status === "3xx") query = query.gte("status_code", 300).lt("status_code", 400);
      else if (status === "4xx") query = query.gte("status_code", 400).lt("status_code", 500);
      else if (status === "5xx") query = query.gte("status_code", 500).lt("status_code", 600);
    }

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
