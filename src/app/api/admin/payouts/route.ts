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

    // Verify admin
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { payoutId, status } = await request.json();

    if (!payoutId || !status || !["paid", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Fetch the payout to see if we need to refund
    const { data: payout } = await supabaseAdmin
      .from("payouts")
      .select("*")
      .eq("id", payoutId)
      .single();

    if (!payout || payout.status !== "pending") {
      return NextResponse.json({ error: "Payout not found or already processed" }, { status: 400 });
    }

    if (status === "rejected") {
      // Refund the account
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
            equity: account.equity + payout.amount
          })
          .eq("id", payout.account_id);
      }
    }

    // Update payout status
    const { error: updateError } = await supabaseAdmin
      .from("payouts")
      .update({ status })
      .eq("id", payoutId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin payout update error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
