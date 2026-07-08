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

    const { payoutId, status, notes } = await request.json();

    if (!payoutId || !status || !["paid", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { data: payout } = await supabaseAdmin
      .from("payouts")
      .select("*")
      .eq("id", payoutId)
      .single();

    if (!payout || payout.status !== "pending") {
      return NextResponse.json({ error: "Payout not found or already processed" }, { status: 400 });
    }

    const updateData: any = {
      status,
      processed_at: new Date().toISOString(),
      processed_by: user.id,
    };
    if (notes !== undefined) updateData.notes = notes;

    if (status === "rejected") {
      const { data: account } = await supabaseAdmin
        .from("accounts")
        .select("balance, equity")
        .eq("id", payout.account_id)
        .single();

      if (account) {
        await supabaseAdmin
          .from("accounts")
          .update({
            balance: account.balance + payout.amount,
            equity: account.equity + payout.amount,
          })
          .eq("id", payout.account_id);
      }
    }

    const { error: updateError } = await supabaseAdmin
      .from("payouts")
      .update(updateData)
      .eq("id", payoutId);

    if (updateError) throw updateError;

    // Audit log
    await supabaseAdmin.from("audit_logs").insert({
      admin_id: user.id,
      admin_email: user.email,
      action: `payout_${status}`,
      entity_type: "payout",
      entity_id: payoutId,
      old_value: { status: payout.status },
      new_value: updateData,
      ip_address: request.headers.get("x-forwarded-for") || "",
      user_agent: request.headers.get("user-agent") || "",
    });

    // Create admin notification for new paid payout
    if (status === "paid") {
      await supabaseAdmin.from("admin_notifications").insert({
        type: "new_payout",
        severity: "info",
        title: "Payout Processed",
        message: `Payout of $${payout.amount} has been marked as paid`,
        entity_type: "payout",
        entity_id: payoutId,
        user_id: payout.user_id,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin payout update error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
