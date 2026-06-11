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

    const { affiliateId, amount } = await request.json();

    if (!affiliateId || !amount) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Process payout by deducting pending payout
    // In a real app we might create a payout history record too, but here we just decrement
    
    // Get current affiliate
    const { data: affiliate, error: fetchErr } = await supabaseAdmin
      .from("affiliates")
      .select("pending_payout")
      .eq("id", affiliateId)
      .single();
      
    if (fetchErr) throw fetchErr;
    
    const newPending = Math.max(0, Number(affiliate.pending_payout) - Number(amount));

    const { error: updateErr } = await supabaseAdmin
      .from("affiliates")
      .update({ pending_payout: newPending })
      .eq("id", affiliateId);

    if (updateErr) throw updateErr;

    return NextResponse.json({ success: true, newPending });
  } catch (error: any) {
    console.error("Admin affiliate payout error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
