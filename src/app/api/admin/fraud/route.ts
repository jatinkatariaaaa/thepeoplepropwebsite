import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireRole } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    let user: { id: string; email?: string };
    try {
      user = (await requireRole(request, ["super_admin", "finance"])).user;
    } catch (e) {
      const m = (e as Error).message;
      return NextResponse.json({ error: m }, { status: m === "Unauthorized" ? 401 : 403 });
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
