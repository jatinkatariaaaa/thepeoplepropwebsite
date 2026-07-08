import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * Lightweight health check for uptime monitoring.
 * Verifies the app is up and that the database responds.
 */
export async function GET() {
  const checks: Record<string, "ok" | "error" | "unconfigured"> = {
    app: "ok",
    database: "unconfigured",
  };

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const { error } = await supabaseAdmin
        .from("profiles")
        .select("id", { head: true, count: "exact" })
        .limit(1);
      checks.database = error ? "error" : "ok";
    } catch {
      checks.database = "error";
    }
  }

  const healthy = checks.database !== "error";
  return NextResponse.json(
    { status: healthy ? "healthy" : "degraded", checks, timestamp: new Date().toISOString() },
    { status: healthy ? 200 : 503 }
  );
}
