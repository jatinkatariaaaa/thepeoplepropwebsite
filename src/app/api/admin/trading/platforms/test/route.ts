import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireRole } from "@/lib/admin-auth";
import { pingTerminal } from "@/lib/terminal-api";

export async function POST(req: Request) {
  try {
    const { platformId } = await req.json();

    if (!platformId) {
      return NextResponse.json({ error: "Platform ID is required" }, { status: 400 });
    }

    try {
      await requireRole(req, ["super_admin"]);
    } catch (e) {
      const m = (e as Error).message;
      return NextResponse.json({ error: m }, { status: m === "Unauthorized" ? 401 : 403 });
    }

    // Fetch the platform details (the API key is readable only server-side)
    const { data: platform, error: platformError } = await supabaseAdmin
      .from("tpp_platforms")
      .select("api_url, api_key")
      .eq("id", platformId)
      .single();

    if (platformError || !platform) {
      return NextResponse.json({ error: "Platform not found or database error" }, { status: 404 });
    }

    if (!platform.api_url || !platform.api_key) {
      return NextResponse.json({ error: "Platform API URL or Key is missing" }, { status: 400 });
    }

    // Ping the terminal
    const result = await pingTerminal(platform.api_url, platform.api_key);

    return NextResponse.json(result);

  } catch (error: any) {
    return NextResponse.json(
      { error: "Internal Server Error", details: error.message },
      { status: 500 }
    );
  }
}
