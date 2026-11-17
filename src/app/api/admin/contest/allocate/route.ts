import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireRole } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    try {
      await requireRole(request, ["super_admin", "marketing"]);
    } catch (e) {
      const msg = (e as Error).message;
      return NextResponse.json({ error: msg }, { status: msg === "Unauthorized" ? 401 : 403 });
    }

    const { entryId } = await request.json();
    if (!entryId) {
      return NextResponse.json({ error: "Missing entryId" }, { status: 400 });
    }

    // Fetch the contest entry
    const { data: entry, error: fetchError } = await supabaseAdmin
      .from("contest_entries")
      .select("*")
      .eq("id", entryId)
      .single();

    if (fetchError || !entry) {
      return NextResponse.json({ error: "Contest entry not found" }, { status: 404 });
    }

    if (entry.claimed) {
      return NextResponse.json({ error: "Already claimed" }, { status: 400 });
    }

    if (entry.referral_count < entry.target) {
      return NextResponse.json(
        { error: `User has ${entry.referral_count}/${entry.target} referrals. Not yet eligible.` },
        { status: 400 }
      );
    }

    // Mark as claimed
    const { error: updateError } = await supabaseAdmin
      .from("contest_entries")
      .update({
        claimed: true,
        claimed_at: new Date().toISOString(),
      })
      .eq("id", entryId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true, message: "Account allocated successfully" });
  } catch (error: any) {
    console.error("Contest allocate error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
