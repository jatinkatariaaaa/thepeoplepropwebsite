import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { provisionNextPhase } from "@/lib/account-provisioning";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

// The Terminal worker owns valuation, fills and drawdown. This route retries
// confirmed phase completions, and repairs explicit legacy account links.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin.rpc("repair_verified_terminal_links");
  if (error) {
    console.error("Verified Terminal link repair failed", error.code);
    return NextResponse.json({ error: "Account reconciliation unavailable." }, { status: 503 });
  }

  const { data: passed, error: passesError } = await supabaseAdmin.rpc("terminal_passes_to_reconcile");
  if (passesError) {
    console.error("Could not select Terminal transitions", passesError.code);
    return NextResponse.json({ error: "Phase reconciliation unavailable." }, { status: 503 });
  }

  const results = await Promise.allSettled((passed ?? []).map((account: Parameters<typeof provisionNextPhase>[0]) => provisionNextPhase(account)));
  const failed = results.filter((result) => result.status === "rejected");
  for (const result of failed) console.error("Terminal phase reconciliation failed", result.reason);
  return NextResponse.json({ repairedLinks: data, examined: results.length, failed: failed.length }, { status: failed.length ? 503 : 200 });
}
