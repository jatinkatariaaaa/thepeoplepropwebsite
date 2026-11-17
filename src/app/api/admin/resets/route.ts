import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { logAudit, requireRole } from "@/lib/admin-auth";
import { provisionNextPhase } from "@/lib/account-provisioning";

const fail = (error: unknown) => {
  const message = (error as Error).message || "Internal server error";
  return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500 });
};

/** Reset offers, and passed Access accounts waiting for their fee. */
export async function GET(request: Request) {
  try {
    await requireRole(request, ["super_admin", "support", "finance"]);
    const [{ data: resets }, { data: passed }] = await Promise.all([
      supabaseAdmin.from("account_resets").select("*").order("created_at", { ascending: false }).limit(300),
      supabaseAdmin.from("trading_accounts").select("id, user_id, login, starting_balance, program_key, activation_fee, activation_due_at, passed_at").eq("status", "passed").gt("activation_fee", 0).order("passed_at", { ascending: false }),
    ]);

    const passedIds = (passed ?? []).map((a) => a.id);
    const { data: next } = passedIds.length ? await supabaseAdmin.from("trading_accounts").select("previous_account_id").in("previous_account_id", passedIds) : { data: [] };
    const activated = new Set((next ?? []).map((n) => n.previous_account_id));
    const activations = (passed ?? []).filter((a) => !activated.has(a.id));

    const sourceIds = (resets ?? []).map((r) => r.source_account_id);
    const { data: sources } = sourceIds.length ? await supabaseAdmin.from("trading_accounts").select("id, login, starting_balance, program_key, phase").in("id", sourceIds) : { data: [] };
    const userIds = [...new Set([...(resets ?? []).map((r) => r.user_id), ...activations.map((a) => a.user_id)].filter(Boolean))];
    const { data: profiles } = userIds.length ? await supabaseAdmin.from("profiles").select("id, email, display_name").in("id", userIds) : { data: [] };
    const profileOf = new Map((profiles ?? []).map((p) => [p.id, p]));
    const sourceOf = new Map((sources ?? []).map((s) => [s.id, s]));

    return NextResponse.json({
      resets: (resets ?? []).map((r) => ({ ...r, profile: profileOf.get(r.user_id) ?? null, source: sourceOf.get(r.source_account_id) ?? null })),
      activations: activations.map((a) => ({ ...a, profile: profileOf.get(a.user_id) ?? null })),
    });
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireRole(request, ["super_admin", "support"]);
    const body = await request.json();
    const hours = Math.min(720, Math.max(1, Number(body.hours) || 72));
    const until = new Date(Date.now() + hours * 3600_000).toISOString();
    const audit = (action: string, entityId: string, newValue?: unknown) => logAudit({ adminId: admin.user.id, adminEmail: admin.email, action, entityType: "trading_account", entityId, newValue, request });

    switch (body.action) {
      // Offer a reset on any breached account, outside the automatic rules.
      case "grant": {
        const { data: account } = await supabaseAdmin.from("trading_accounts").select("id, user_id, status, phase_group_id").eq("id", String(body.accountId || "")).maybeSingle();
        if (!account) return NextResponse.json({ error: "Account not found." }, { status: 404 });
        if (account.status !== "breached") return NextResponse.json({ error: "Only a breached account can be reset." }, { status: 400 });
        const { error } = await supabaseAdmin
          .from("account_resets")
          .upsert({ user_id: account.user_id, source_account_id: account.id, phase_group_id: account.phase_group_id || account.id, kind: "admin", status: "eligible", eligible_until: until, note: String(body.note || "").slice(0, 300) || null, new_account_id: null, claimed_at: null }, { onConflict: "source_account_id" });
        if (error) throw error;
        await supabaseAdmin.from("user_notifications").insert({ user_id: account.user_id, type: "free_reset", title: "A free reset was added to your account", body: `Claim it within ${hours} hours.`, link: `/dashboard/account/${account.id}` });
        await audit("reset_granted", account.id, { hours });
        return NextResponse.json({ success: true });
      }
      case "void": {
        const { error } = await supabaseAdmin.from("account_resets").update({ status: "void" }).eq("id", body.id).eq("status", "eligible");
        if (error) throw error;
        await audit("reset_voided", String(body.id));
        return NextResponse.json({ success: true });
      }
      case "extend": {
        const { error } = await supabaseAdmin.from("account_resets").update({ status: "eligible", eligible_until: until }).eq("id", body.id).in("status", ["eligible", "expired"]);
        if (error) throw error;
        await audit("reset_extended", String(body.id), { hours });
        return NextResponse.json({ success: true });
      }
      // Reopen or lengthen the window to pay an Access fee.
      case "extend_activation": {
        const { error } = await supabaseAdmin.from("trading_accounts").update({ activation_due_at: until }).eq("id", body.accountId).eq("status", "passed");
        if (error) throw error;
        await audit("activation_extended", String(body.accountId), { hours });
        return NextResponse.json({ success: true });
      }
      // Issue the funded account without the fee (goodwill, or a fee settled outside the gateway).
      case "activate": {
        const { data: account } = await supabaseAdmin.from("trading_accounts").select("*").eq("id", String(body.accountId || "")).maybeSingle();
        if (!account || account.status !== "passed") return NextResponse.json({ error: "Account not found or not passed." }, { status: 400 });
        const result = await provisionNextPhase(account, { activationPaid: true });
        if (!result.account) return NextResponse.json({ error: result.reason || "The funded account could not be created." }, { status: 500 });
        await audit("activation_waived", account.id, { funded_account: result.account.id });
        return NextResponse.json({ success: true, account: result.account });
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    return fail(error);
  }
}
