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

function generateOrderId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let random = "";
  for (let i = 0; i < 8; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CONTEST-${random}`;
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

    // Fetch the user's contest entry
    const { data: entry, error: entryError } = await supabaseAdmin
      .from("contest_entries")
      .select("id, referral_code, referral_count, target, claimed")
      .eq("user_id", user.id)
      .maybeSingle();

    if (entryError) {
      console.error("Error fetching contest entry:", entryError);
      return NextResponse.json(
        { success: false, message: "Failed to fetch contest entry" },
        { status: 500 }
      );
    }

    if (!entry) {
      return NextResponse.json(
        { success: false, message: "Contest entry not found" },
        { status: 404 }
      );
    }

    if (entry.claimed) {
      return NextResponse.json(
        { success: false, message: "Already claimed" },
        { status: 400 }
      );
    }

    const requiredTarget = entry.target || 10;

    if (entry.referral_count < requiredTarget) {
      return NextResponse.json(
        {
          success: false,
          message: "Not enough referrals",
          current: entry.referral_count,
          target: requiredTarget,
        },
        { status: 400 }
      );
    }

    // Mark entry as claimed
    const { error: updateError } = await supabaseAdmin
      .from("contest_entries")
      .update({
        claimed: true,
        claimed_at: new Date().toISOString(),
      })
      .eq("id", entry.id);

    if (updateError) {
      console.error("Error updating contest entry:", updateError);
      return NextResponse.json(
        { success: false, message: "Failed to claim reward" },
        { status: 500 }
      );
    }

    // Create the reward purchase
    const orderId = generateOrderId();
    const userEmail = user.email || "";
    const fullName = userEmail.split("@")[0];

    const { error: purchaseError } = await supabaseAdmin
      .from("purchases")
      .insert({
        user_id: user.id,
        order_id: orderId,
        full_name: fullName,
        email: userEmail,
        program_key: "stellar-3step",
        account_size: "10k",
        price_amount: 0,
        payment_status: "completed",
        payment_method: "contest_reward",
      });

    if (purchaseError) {
      console.error("Error creating reward purchase:", purchaseError);

      // Rollback the claim if purchase fails
      await supabaseAdmin
        .from("contest_entries")
        .update({ claimed: false, claimed_at: null })
        .eq("id", entry.id);

      return NextResponse.json(
        { success: false, message: "Failed to create reward account. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Congratulations! Your free 10K account has been created.",
      order_id: orderId,
    });
  } catch (error) {
    console.error("Contest claim error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
