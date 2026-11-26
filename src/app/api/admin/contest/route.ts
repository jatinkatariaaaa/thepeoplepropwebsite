import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { logAudit, requireRole } from "@/lib/admin-auth";
import { fail } from "@/lib/support-desk";

export const dynamic = "force-dynamic";

/** GET /api/admin/contest — every referrer with how many sign-ups count, and the claim review setting. */
export async function GET(request: Request) {
  try {
    await requireRole(request, []);
    const [board, settings] = await Promise.all([
      supabaseAdmin.rpc("referral_board"),
      supabaseAdmin.from("admin_settings").select("key, value").in("key", ["referral_reward_target", "referral_claim_review"]),
    ]);
    if (board.error) throw board.error;
    const setting = (key: string) => settings.data?.find((s) => s.key === key)?.value;
    const target = Number(setting("referral_reward_target")) > 0 ? Number(setting("referral_reward_target")) : 20;
    const reviewMode = setting("referral_claim_review") === "always" ? "always" : "auto";
    return NextResponse.json({ rows: board.data ?? [], target, reviewMode }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return fail(error, "Couldn't load the contest");
  }
}

/** PATCH /api/admin/contest — { reviewMode: "auto" | "always" }. */
export async function PATCH(request: Request) {
  try {
    const admin = await requireRole(request, []);
    const body = (await request.json().catch(() => ({}))) as { reviewMode?: string };
    if (body.reviewMode !== "auto" && body.reviewMode !== "always") return NextResponse.json({ error: "reviewMode must be auto or always" }, { status: 400 });
    const { error } = await supabaseAdmin
      .from("admin_settings")
      .upsert({ key: "referral_claim_review", value: body.reviewMode, category: "trading" }, { onConflict: "key" });
    if (error) throw error;
    await logAudit({ adminId: admin.user.id, adminEmail: admin.email, action: "contest_review_mode", entityType: "admin_settings", entityId: "referral_claim_review", newValue: { reviewMode: body.reviewMode }, request });
    return NextResponse.json({ ok: true, reviewMode: body.reviewMode });
  } catch (error) {
    return fail(error, "Couldn't save the setting");
  }
}
