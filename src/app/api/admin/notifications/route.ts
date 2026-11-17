import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireRole } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    let user: { id: string; email?: string };
    try {
      user = (await requireRole(request, ["super_admin", "finance", "support", "marketing"])).user;
    } catch (e) {
      const m = (e as Error).message;
      return NextResponse.json({ error: m }, { status: m === "Unauthorized" ? 401 : 403 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === "mark_read" && body.notificationId) {
      const { error } = await supabaseAdmin
        .from("admin_notifications")
        .update({ is_read: true, read_by: user.id, read_at: new Date().toISOString() })
        .eq("id", body.notificationId);

      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (action === "mark_all_read") {
      const { error } = await supabaseAdmin
        .from("admin_notifications")
        .update({ is_read: true, read_by: user.id, read_at: new Date().toISOString() })
        .eq("is_read", false);

      if (error) throw error;
      return NextResponse.json({ success: true, count: "all" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Admin notifications error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
