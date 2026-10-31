import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

async function getUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, { ...options });
          });
        },
      },
    }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

function generateReferralCode(email: string): string {
  const prefix = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase();
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let suffix = "";
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}${suffix}`;
}

export async function POST() {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user already has a contest entry
    const { data: existingEntry, error: fetchError } = await supabaseAdmin
      .from("contest_entries")
      .select("id, referral_code, referral_count, target, claimed")
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching contest entry:", fetchError);
      return NextResponse.json(
        { success: false, message: "Failed to check contest status" },
        { status: 500 }
      );
    }

    if (existingEntry) {
      return NextResponse.json({
        success: true,
        entry: existingEntry,
        link: `https://thepeopleprop.live/ref/contest/${existingEntry.referral_code}`,
      });
    }

    // Generate a unique referral code
    const userEmail = user.email || "USER";
    let referralCode = generateReferralCode(userEmail);
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const { data: codeExists } = await supabaseAdmin
        .from("contest_entries")
        .select("id")
        .eq("referral_code", referralCode)
        .maybeSingle();

      if (!codeExists) break;

      referralCode = generateReferralCode(userEmail);
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { success: false, message: "Failed to generate unique referral code. Please try again." },
        { status: 500 }
      );
    }

    // Insert new contest entry
    const { data: newEntry, error: insertError } = await supabaseAdmin
      .from("contest_entries")
      .insert({
        user_id: user.id,
        referral_code: referralCode,
        referral_count: 0,
        target: 10,
        claimed: false,
      })
      .select("id, referral_code, referral_count, target, claimed")
      .single();

    if (insertError) {
      console.error("Error creating contest entry:", insertError);
      return NextResponse.json(
        { success: false, message: "Failed to join the contest" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      entry: newEntry,
      link: `https://thepeopleprop.live/ref/contest/${newEntry.referral_code}`,
    });
  } catch (error) {
    console.error("Contest join error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
