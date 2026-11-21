import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("tpp_platforms")
    .select("name, extra_fee_pct")
    .eq("is_active", true)
    .order("created_at");

  if (error) {
    console.error("Could not load public trading platforms", error.code);
    return NextResponse.json({ error: "Platform catalogue unavailable." }, { status: 503 });
  }

  return NextResponse.json({ platforms: data }, { headers: { "Cache-Control": "public, s-maxage=60" } });
}
