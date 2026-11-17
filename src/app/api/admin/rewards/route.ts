import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { logAudit, requireRole } from "@/lib/admin-auth";
import { getPerkSettings } from "@/lib/settings";

const fail = (error: unknown) => {
  const message = (error as Error).message || "Internal server error";
  return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500 });
};

/** Stipend ledger and the settings that drive it. */
export async function GET(request: Request) {
  try {
    await requireRole(request, ["super_admin", "finance"]);
    const [{ data: accruals }, settings, { data: live }] = await Promise.all([
      supabaseAdmin.from("stipend_accruals").select("*").order("created_at", { ascending: false }).limit(500),
      getPerkSettings(),
      supabaseAdmin.from("trading_accounts").select("starting_balance, phase_group_id, id").in("status", ["active", "funded"]),
    ]);
    const userIds = [...new Set((accruals ?? []).map((a) => a.user_id))];
    const { data: profiles } = userIds.length ? await supabaseAdmin.from("profiles").select("id, email, display_name").in("id", userIds) : { data: [] };
    const byId = new Map((profiles ?? []).map((p) => [p.id, p]));

    // One stipend per purchased account (phase group), not per phase.
    const groups = new Map<string, number>();
    for (const a of live ?? []) groups.set(a.phase_group_id || a.id, Number(a.starting_balance) || 0);
    const monthlyExposure = [...groups.values()].reduce((s, v) => s + v, 0) * (settings.stipendRatePct / 100);

    return NextResponse.json({
      accruals: (accruals ?? []).map((a) => ({ ...a, profile: byId.get(a.user_id) ?? null })),
      settings,
      activeAccounts: groups.size,
      monthlyExposure,
    });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireRole(request, ["super_admin", "finance"]);
    const { action, id } = await request.json();

    if (action === "run") {
      const { data, error } = await supabaseAdmin.rpc("run_daily_maintenance");
      if (error) throw error;
      await logAudit({ adminId: admin.user.id, adminEmail: admin.email, action: "stipend_run", entityType: "stipend", newValue: data, request });
      return NextResponse.json({ success: true, result: data });
    }

    if (action === "void" || action === "restore") {
      const from = action === "void" ? "accrued" : "void";
      const to = action === "void" ? "void" : "accrued";
      const { data, error } = await supabaseAdmin.from("stipend_accruals").update({ status: to }).eq("id", id).eq("status", from).select("id").maybeSingle();
      if (error) throw error;
      if (!data) return NextResponse.json({ error: "Only a stipend that is still in the balance can be changed." }, { status: 400 });
      await logAudit({ adminId: admin.user.id, adminEmail: admin.email, action: `stipend_${action}`, entityType: "stipend", entityId: id, request });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    return fail(error);
  }
}
