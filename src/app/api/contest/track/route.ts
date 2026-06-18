import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referral_code, user_id, email } = body;

    if (!referral_code || !user_id || !email) {
      return NextResponse.json(
        { tracked: false, reason: "missing_fields" },
        { status: 400 }
      );
    }

    // Find the contest entry matching this referral code
    const { data: entry, error: entryError } = await supabaseAdmin
      .from("contest_entries")
      .select("id, user_id, referral_count")
      .eq("referral_code", referral_code)
      .maybeSingle();

    if (entryError) {
      console.error("Error fetching contest entry:", entryError);
      return NextResponse.json(
        { tracked: false, reason: "server_error" },
        { status: 500 }
      );
    }

    if (!entry) {
      return NextResponse.json({ tracked: false, reason: "invalid_code" });
    }

    // Prevent self-referral
    if (entry.user_id === user_id) {
      return NextResponse.json({ tracked: false, reason: "self_referral" });
    }

    // Check for duplicate referral
    const { data: existingReferral, error: dupError } = await supabaseAdmin
      .from("contest_referrals")
      .select("id")
      .eq("contest_entry_id", entry.id)
      .eq("referred_user_id", user_id)
      .maybeSingle();

    if (dupError) {
      console.error("Error checking duplicate referral:", dupError);
      return NextResponse.json(
        { tracked: false, reason: "server_error" },
        { status: 500 }
      );
    }

    if (existingReferral) {
      return NextResponse.json({ tracked: false, reason: "already_tracked" });
    }

    // Insert the referral record
    const { error: insertError } = await supabaseAdmin
      .from("contest_referrals")
      .insert({
        contest_entry_id: entry.id,
        referred_user_id: user_id,
        referred_email: email,
        signed_up_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("Error inserting referral:", insertError);
      return NextResponse.json(
        { tracked: false, reason: "server_error" },
        { status: 500 }
      );
    }

    // Increment referral count
    const newCount = (entry.referral_count || 0) + 1;

    const { error: updateError } = await supabaseAdmin
      .from("contest_entries")
      .update({ referral_count: newCount })
      .eq("id", entry.id);

    if (updateError) {
      console.error("Error updating referral count:", updateError);
      return NextResponse.json(
        { tracked: false, reason: "server_error" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      tracked: true,
      new_count: newCount,
    });
  } catch (error) {
    console.error("Contest track error:", error);
    return NextResponse.json(
      { tracked: false, reason: "server_error" },
      { status: 500 }
    );
  }
}
