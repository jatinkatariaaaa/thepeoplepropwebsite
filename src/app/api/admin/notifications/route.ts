import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      (process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"),
      (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "public-anon-key-placeholder"),
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
