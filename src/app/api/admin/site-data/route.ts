import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin-auth";
import { refreshSiteData } from "@/lib/site-data";

/**
 * POST /api/admin/site-data
 * The admin screens that edit programs, fees, landing stats and platforms save straight to Supabase from
 * the browser, then call this so the public pages show the change at once instead of after the cache
 * period (lib/site-data).
 */
export async function POST(request: Request) {
  try {
    await getAdminUser(request);
  } catch (error) {
    const message = (error as Error).message;
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : 403 });
  }
  refreshSiteData();
  return NextResponse.json({ ok: true });
}
