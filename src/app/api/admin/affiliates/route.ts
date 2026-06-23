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

    const body = await request.json();
    const { userId, action } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const { data: affiliate } = await supabaseAdmin
      .from("affiliates")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!affiliate) {
      return NextResponse.json({ error: "Affiliate not found" }, { status: 404 });
    }

    let result: any = {};

    if (action === "status") {
      const { status } = body;
      if (!["active", "pending", "suspended"].includes(status)) {
        return NextResponse.json({ error: "Invalid status" }, { status: 400 });
      }

      const updateData: any = { status };
      if (status === "active") {
        updateData.approved_at = new Date().toISOString();
        updateData.approved_by = user.id;
      }

      const { error } = await supabaseAdmin
        .from("affiliates")
        .update(updateData)
        .eq("user_id", userId);

      if (error) throw error;
      result = { success: true, status };

      // Notification
      if (status === "active") {
        await supabaseAdmin.from("admin_notifications").insert({
          type: "affiliate_registration",
          severity: "info",
          title: "Affiliate Approved",
          message: `Affiliate ${affiliate.referral_code} has been approved`,
          entity_type: "affiliate",
          entity_id: userId,
          user_id: userId,
        });
      }
    } else if (action === "commission") {
      const { commissionRate } = body;
      if (commissionRate === undefined || commissionRate < 0 || commissionRate > 100) {
        return NextResponse.json({ error: "Invalid commission rate" }, { status: 400 });
      }

      const { error } = await supabaseAdmin
        .from("affiliates")
        .update({ commission_rate: commissionRate })
        .eq("user_id", userId);

      if (error) throw error;
      result = { success: true, commissionRate };
    } else if (action === "payout") {
      const { amount } = body;
      if (!amount || amount <= 0) {
        return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
      }

      const newPending = Math.max(0, Number(affiliate.pending_payout) - Number(amount));

      const { error } = await supabaseAdmin
        .from("affiliates")
        .update({ pending_payout: newPending })
        .eq("user_id", userId);

      if (error) throw error;
      result = { success: true, newPending };
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Audit log
    await supabaseAdmin.from("audit_logs").insert({
      admin_id: user.id,
      admin_email: user.email,
      action: `affiliate_${action}`,
      entity_type: "affiliate",
      entity_id: userId,
      old_value: { status: affiliate.status, commission_rate: affiliate.commission_rate, pending_payout: affiliate.pending_payout },
      new_value: result,
      ip_address: request.headers.get("x-forwarded-for") || "",
      user_agent: request.headers.get("user-agent") || "",
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Admin affiliate error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
