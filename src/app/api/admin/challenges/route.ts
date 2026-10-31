import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAdminUser, logAudit } from "@/lib/admin-auth";

export async function GET(request: Request) {
  try {
    await getAdminUser(request);

    // Assuming we have a challenges table (we didn't explicitly create one in the SQL, but there is programs/challenges usually)
    // Or we manage pricing keys. I'll mock a challenges list or if the user has a table for it.
    // For now, I'll return an empty array if the table doesn't exist to prevent crashes.
    const { data: challenges, error } = await supabaseAdmin
      .from("tpp_challenges")
      .select("*")
      .order("created_at", { ascending: false });

    if (error && error.code !== '42P01') throw error; // ignore undefined table for now

    return NextResponse.json({ challenges: challenges || [] });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminUser(request);
    const body = await request.json();
    
    const { data: challenge, error } = await supabaseAdmin
      .from("tpp_challenges")
      .insert({ ...body })
      .select()
      .single();

    if (error) {
      if (error.code === '42P01') {
        return NextResponse.json({ error: "tpp_challenges table does not exist. Please run migration." }, { status: 400 });
      }
      throw error;
    }

    await logAudit({
      adminId: admin.user.id,
      adminEmail: admin.email,
      action: "create_challenge",
      entityType: "tpp_challenges",
      entityId: challenge.id,
      newValue: challenge,
      request
    });

    return NextResponse.json({ success: true, challenge });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
