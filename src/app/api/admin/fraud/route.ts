import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

    const { flagId, status, resolution, suspendUser } = await request.json();

    if (!flagId || !status || !["resolved", "dismissed", "reviewing"].includes(status)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { data: flag } = await supabaseAdmin
      .from("fraud_flags")
      .select("*")
      .eq("id", flagId)
      .single();

    if (!flag) {
      return NextResponse.json({ error: "Flag not found" }, { status: 404 });
    }

    const updateData: any = {
      status,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    };
    if (resolution !== undefined) updateData.resolution = resolution;

    const { error: updateError } = await supabaseAdmin
      .from("fraud_flags")
      .update(updateData)
      .eq("id", flagId);

    if (updateError) throw updateError;

    // Suspend user if requested
    if (suspendUser) {
      await supabaseAdmin
        .from("profiles")
        .update({ status: "suspended" })
        .eq("id", flag.user_id);
    }

    // Audit log
    await supabaseAdmin.from("audit_logs").insert({
      admin_id: user.id,
      admin_email: user.email,
      action: `fraud_${status}`,
      entity_type: "fraud_flag",
      entity_id: flagId,
      old_value: { status: flag.status },
      new_value: updateData,
      ip_address: request.headers.get("x-forwarded-for") || "",
      user_agent: request.headers.get("user-agent") || "",
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin fraud error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
