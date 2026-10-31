import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    // Verify the request is from an admin
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

    // Check admin role
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("admin_role")
      .eq("id", user.id)
      .single();

    if (!profile || !profile.admin_role) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
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
