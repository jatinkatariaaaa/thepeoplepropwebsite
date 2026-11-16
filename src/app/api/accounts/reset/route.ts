import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSessionUser } from "@/lib/api-auth";
import { provisionReset } from "@/lib/account-provisioning";

/** Claim a free reset (24-hour rule or the Free Retry add-on) for a breached account. */
export async function POST(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { resetId } = await request.json();
    const { data: reset } = await supabaseAdmin.from("account_resets").select("*").eq("id", String(resetId || "")).eq("user_id", user.id).maybeSingle();
    if (!reset) return NextResponse.json({ error: "Reset offer not found." }, { status: 404 });
    if (reset.status === "claimed") return NextResponse.json({ error: "This reset has already been used." }, { status: 400 });
    if (reset.status !== "eligible") return NextResponse.json({ error: "This reset offer is no longer available." }, { status: 400 });
    if (reset.eligible_until && new Date(reset.eligible_until).getTime() < Date.now()) {
      await supabaseAdmin.from("account_resets").update({ status: "expired" }).eq("id", reset.id);
      return NextResponse.json({ error: "The claim window for this reset has closed." }, { status: 400 });
    }

    // Take the offer before creating anything, so two clicks cannot issue two accounts.
    const { data: taken } = await supabaseAdmin
      .from("account_resets")
      .update({ status: "claimed", claimed_at: new Date().toISOString() })
      .eq("id", reset.id)
      .eq("status", "eligible")
      .select("id")
      .maybeSingle();
    if (!taken) return NextResponse.json({ error: "This reset has already been used." }, { status: 400 });

    try {
      const result = await provisionReset(reset);
      await supabaseAdmin.from("account_resets").update({ new_account_id: result.account?.id ?? null }).eq("id", reset.id);
      return NextResponse.json({ success: true, account: result.account });
    } catch (err) {
      await supabaseAdmin.from("account_resets").update({ status: "eligible", claimed_at: null }).eq("id", reset.id);
      throw err;
    }
  } catch (error) {
    console.error("Reset error:", error);
    return NextResponse.json({ error: (error as Error).message || "Could not reset the account." }, { status: 500 });
  }
}
