import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function verifyAdmin(request: Request) {
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
  if (!user) return { error: "Unauthorized", status: 401 };

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return { error: "Forbidden", status: 403 };

  return { user };
}

export async function GET(request: Request) {
  const auth = await verifyAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const gateway = searchParams.get("gateway");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabaseAdmin
      .from("payment_transactions")
      .select("*, profiles(id, email, display_name)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq("status", status);
    if (gateway) query = query.eq("gateway", gateway);

    const { data, error, count } = await query;

    if (error) throw error;

    let filtered = data || [];
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter((t: any) =>
        (t.profiles?.display_name || "").toLowerCase().includes(s) ||
        (t.profiles?.email || "").toLowerCase().includes(s) ||
        (t.transaction_id || "").toLowerCase().includes(s)
      );
    }

    return NextResponse.json({ transactions: filtered, count: count || filtered.length });
  } catch (error: any) {
    console.error("Admin payments GET error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await verifyAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { transactionId, action, refundReason } = await request.json();

    if (!transactionId || !action) {
      return NextResponse.json({ error: "Missing transactionId or action" }, { status: 400 });
    }

    const { data: txn, error: fetchError } = await supabaseAdmin
      .from("payment_transactions")
      .select("*")
      .eq("id", transactionId)
      .single();

    if (fetchError || !txn) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    let updateData: any = {};

    if (action === "refund") {
      if (txn.status !== "completed") {
        return NextResponse.json({ error: "Can only refund completed transactions" }, { status: 400 });
      }
      updateData = {
        status: "refunded",
        refund_reason: refundReason || "Admin refund",
        refunded_at: new Date().toISOString(),
        refunded_by: auth.user.id,
      };
    } else if (action === "cancel") {
      if (txn.status !== "pending") {
        return NextResponse.json({ error: "Can only cancel pending transactions" }, { status: 400 });
      }
      updateData = { status: "cancelled" };
    } else if (action === "verify") {
      if (txn.status !== "pending") {
        return NextResponse.json({ error: "Can only verify pending transactions" }, { status: 400 });
      }
      updateData = { status: "completed" };
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("payment_transactions")
      .update(updateData)
      .eq("id", transactionId);

    if (error) throw error;

    // Log activity
    await supabaseAdmin.from("payment_activity_logs").insert({
      admin_id: auth.user.id,
      admin_email: auth.user.email,
      action: `payment_${action}`,
      entity_type: "transaction",
      entity_id: transactionId,
      old_value: { status: txn.status },
      new_value: updateData,
    });

    return NextResponse.json({ success: true, transaction: { ...txn, ...updateData } });
  } catch (error: any) {
    console.error("Admin payments PATCH error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
