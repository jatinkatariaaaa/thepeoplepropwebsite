import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAdminUser, logAudit } from "@/lib/admin-auth";

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
    const admin = await getAdminUser(request);
    const body = await request.json();
    const { id, payment_status, refund_reason } = body;

    if (!id || !payment_status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data: oldOrder } = await supabaseAdmin
      .from("purchases")
      .select("*")
      .eq("id", id)
      .single();

    const updateData: any = { payment_status };
    if (payment_status === "refunded") {
      // Keep track of who refunded it manually
      // We'll append it to notes or a new field if we had one. Let's just update the status.
    }

    const { data: order, error } = await supabaseAdmin
      .from("purchases")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    await logAudit({
      adminId: admin.user.id,
      adminEmail: admin.email,
      action: payment_status === "refunded" ? "refund_order" : "update_order_status",
      entityType: "purchases",
      entityId: id,
      oldValue: oldOrder,
      newValue: order,
      request
    });

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
