import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireRole } from "@/lib/admin-auth";

export async function POST(request: Request) {
  try {
    let user: { id: string; email?: string };
    try {
      user = (await requireRole(request, ["super_admin", "support"])).user;
    } catch (e) {
      const m = (e as Error).message;
      return NextResponse.json({ error: m }, { status: m === "Unauthorized" ? 401 : 403 });
    }

    const { accountId, status, phase } = await request.json();

    if (!accountId || !status) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Update the account
    const updateData: any = { status };
    if (phase) {
      updateData.phase = phase;
    }

    const { error } = await supabaseAdmin
      .from("accounts")
      .update(updateData)
      .eq("id", accountId);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin account update error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
