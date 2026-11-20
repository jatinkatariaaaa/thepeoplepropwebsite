import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAdminUser, logAudit, requireRole } from "@/lib/admin-auth";

export async function GET(request: Request) {
  try {
    await getAdminUser(request);
    
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const program = searchParams.get("program") || "";
    
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from("purchases")
      .select(`
        *,
        user:profiles!purchases_user_id_fkey(display_name, email)
      `, { count: "exact" });

    if (status) query = query.eq("payment_status", status);
    if (program) query = query.ilike("program_key", `%${program}%`);
    if (search) {
      query = query.or(`order_id.ilike.%${search}%,user_email.ilike.%${search}%`);
    }

    const { data: orders, count, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({ orders: orders || [], total: count || 0, page, limit });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await requireRole(request, ["finance"]);
    const body = await request.json().catch(() => null);
    const { id, payment_status } = body ?? {};

    if (!id || !payment_status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: oldOrder, error: lookupError } = await supabaseAdmin
      .from("purchases")
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (lookupError) throw lookupError;
    if (!oldOrder) return NextResponse.json({ error: "Order not found." }, { status: 404 });

    if (payment_status !== "refunded") {
      return NextResponse.json({ error: "Only manual refunds are supported here." }, { status: 400 });
    }
    if (oldOrder.payment_status === "refunded") return NextResponse.json({ success: true, order: oldOrder });
    if (oldOrder.payment_status !== "paid") return NextResponse.json({ error: "Only paid orders can be refunded." }, { status: 409 });

    const { data: order, error } = await supabaseAdmin
      .from("purchases")
      .update({ payment_status: "refunded" })
      .eq("id", id)
      .eq("payment_status", "paid")
      .select()
      .maybeSingle();

    if (error) throw error;
    if (!order) return NextResponse.json({ error: "The order changed. Refresh to check its status." }, { status: 409 });

    await logAudit({
      adminId: admin.user.id,
      adminEmail: admin.email,
      action: "refund_order",
      entityType: "purchases",
      entityId: id,
      oldValue: oldOrder,
      newValue: order,
      request
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
    if (error instanceof Error && error.message === "Forbidden") return NextResponse.json({ error: "Finance or owner access is required." }, { status: 403 });
    console.error("Manual order refund failed", error);
    return NextResponse.json({ error: "Could not mark the order refunded." }, { status: 500 });
  }
}
