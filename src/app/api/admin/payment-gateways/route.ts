import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireRole } from "@/lib/admin-auth";

async function verifyAdmin(request: Request) {
  try {
    const admin = await requireRole(request, ["super_admin", "finance"]);
    return { user: admin.user };
  } catch (e) {
    const m = (e as Error).message;
    return { error: m, status: m === "Unauthorized" ? 401 : 403 };
  }
}

export async function GET(request: Request) {
  const auth = await verifyAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("payment_gateway_settings")
      .select("*")
      .order("gateway", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ gateways: data || [] });
  } catch (error: any) {
    console.error("Admin gateways GET error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await verifyAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { gatewayId, ...updates } = await request.json();

    if (!gatewayId) {
      return NextResponse.json({ error: "Missing gatewayId" }, { status: 400 });
    }

    // Don't allow updating the gateway name
    delete updates.gateway;
    delete updates.id;
    delete updates.created_at;

    const { data: oldGateway, error: fetchError } = await supabaseAdmin
      .from("payment_gateway_settings")
      .select("*")
      .eq("id", gatewayId)
      .single();

    if (fetchError || !oldGateway) {
      return NextResponse.json({ error: "Gateway not found" }, { status: 404 });
    }

    const { error } = await supabaseAdmin
      .from("payment_gateway_settings")
      .update(updates)
      .eq("id", gatewayId);

    if (error) throw error;

    // Log activity
    await supabaseAdmin.from("payment_activity_logs").insert({
      admin_id: auth.user.id,
      admin_email: auth.user.email,
      action: "update_gateway_settings",
      entity_type: "gateway_setting",
      entity_id: gatewayId,
      old_value: oldGateway,
      new_value: updates,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin gateways PATCH error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
