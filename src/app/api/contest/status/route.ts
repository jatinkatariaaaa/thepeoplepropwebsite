import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

async function getUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"),
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "public-anon-key-placeholder"),
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

export async function GET() {
  try {
    const user = await getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      );
    }

    // Fetch the user's contest entry
    const { data: entry, error: entryError } = await supabaseAdmin
      .from("contest_entries")
      .select("id, referral_code, referral_count, target, claimed, claimed_at, created_at")
      .eq("user_id", user.id)
      .maybeSingle();

    if (entryError) {
      console.error("Error fetching contest entry:", entryError);
      return NextResponse.json(
        { success: false, message: "Failed to fetch contest status" },
        { status: 500 }
      );
    }

    if (!entry) {
      return NextResponse.json({ joined: false });
    }

    // Fetch referrals for this entry
    const { data: referrals, error: referralsError } = await supabaseAdmin
      .from("contest_referrals")
      .select("referred_email, signed_up_at")
      .eq("contest_entry_id", entry.id)
      .order("signed_up_at", { ascending: false });

    if (referralsError) {
      console.error("Error fetching referrals:", referralsError);
      return NextResponse.json(
        { success: false, message: "Failed to fetch referrals" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      joined: true,
      entry,
      referrals: referrals || [],
      link: `https://thepeopleprop.live/ref/contest/${entry.referral_code}`,
    });
  } catch (error) {
    console.error("Contest status error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
