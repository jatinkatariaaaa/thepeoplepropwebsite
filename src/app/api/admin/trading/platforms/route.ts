import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAdminUser } from "@/lib/admin-auth";

// GET /api/admin/trading/platforms
// Lightweight read used to populate dropdowns. Uses supabaseAdmin to avoid
// RLS join limitations on the client.
export async function GET(request: Request) {
  try {
    await getAdminUser(request);

    const { data, error } = await supabaseAdmin
      .from("tpp_platforms")
      .select("id, name, server_name, is_active")
      .order("created_at", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ platforms: data || [] });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === "Unauthorized" ? 401 : 403 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
