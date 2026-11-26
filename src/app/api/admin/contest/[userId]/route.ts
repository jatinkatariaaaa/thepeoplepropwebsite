import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { logAudit, requireRole } from "@/lib/admin-auth";
import { fail } from "@/lib/support-desk";
import { reviewReferralClaim, type ClaimDecision } from "@/lib/referrals";
import { AccountActionError, suspendAccount } from "@/lib/account-admin";
import { isUuid } from "@/lib/certificates/types";
import type { SignupRow } from "@/lib/referral-link";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ userId: string }> };

async function signups(userId: string) {
  const { data, error } = await supabaseAdmin.rpc("referral_signup_list", { p_affiliate: userId });
  if (error) throw error;
  return (data ?? []) as SignupRow[];
}

/** GET /api/admin/contest/:userId — every sign-up through this referrer's link, with its checks. */
export async function GET(request: Request, { params }: Ctx) {
  try {
    await requireRole(request, []);
    const { userId } = await params;
    if (!isUuid(userId)) return NextResponse.json({ error: "Unknown referrer" }, { status: 404 });
    return NextResponse.json({ signups: await signups(userId) }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return fail(error, "Couldn't load the sign-ups");
  }
}

type Body =
  | { action: "signup"; referredUserId: string; decision: "approve" | "reject" | "clear"; note?: string }
  | { action: "signups"; decision: "approve" | "reject" | "clear"; scope: "failing" | "all"; note?: string }
  | { action: "claim"; decision: ClaimDecision; note?: string }
  | { action: "suspend_reward"; reason?: string };

/**
 * POST /api/admin/contest/:userId — decisions on this referrer:
 *   signup         approve / reject / clear one sign-up
 *   signups        the same for all failing (or all) sign-ups
 *   claim          approve (creates the account) / reject / reset a claim
 *   suspend_reward freeze the free account already given (reversible from Trading Accounts)
 */
export async function POST(request: Request, { params }: Ctx) {
  try {
    const admin = await requireRole(request, []);
    const { userId } = await params;
    if (!isUuid(userId)) return NextResponse.json({ error: "Unknown referrer" }, { status: 404 });
    const body = (await request.json().catch(() => ({}))) as Body;

    if (body.action === "signup" || body.action === "signups") {
      if (!["approve", "reject", "clear"].includes(body.decision)) return NextResponse.json({ error: "Unknown decision" }, { status: 400 });
      const rows = await signups(userId);
      const targets =
        body.action === "signup"
          ? rows.filter((r) => r.referred_user_id === body.referredUserId)
          : rows.filter((r) => body.scope === "all" || (!r.counted && r.reason !== "unconfirmed"));
      if (!targets.length) return NextResponse.json({ error: "No sign-ups to change" }, { status: 400 });
      for (const r of targets) {
        const { error } = await supabaseAdmin.rpc("review_referral_signup", {
          p_referred: r.referred_user_id,
          p_admin: admin.user.id,
          p_decision: body.decision,
          p_note: body.note ?? null,
        });
        if (error) throw error;
      }
      await logAudit({
        adminId: admin.user.id,
        adminEmail: admin.email,
        action: `contest_signup_${body.decision}`,
        entityType: "referral_signups",
        entityId: userId,
        newValue: { count: targets.length, referred: targets.map((t) => t.referred_user_id).slice(0, 100) },
        request,
      });
      return NextResponse.json({ ok: true, changed: targets.length, signups: await signups(userId) });
    }

    if (body.action === "claim") {
      if (!["approve", "reject", "reset"].includes(body.decision)) return NextResponse.json({ error: "Unknown decision" }, { status: 400 });
      const result = await reviewReferralClaim(userId, admin.user.id, body.decision, body.note);
      await logAudit({ adminId: admin.user.id, adminEmail: admin.email, action: `contest_claim_${body.decision}`, entityType: "contest_entries", entityId: userId, newValue: { note: body.note ?? null, result }, request });
      return NextResponse.json(result, { status: result.ok ? 200 : 400 });
    }

    if (body.action === "suspend_reward") {
      const { data: purchases } = await supabaseAdmin.from("purchases").select("id").eq("user_id", userId).eq("payment_method", "referral_reward");
      const purchaseIds = (purchases ?? []).map((p) => p.id);
      const { data: account } = purchaseIds.length
        ? await supabaseAdmin.from("trading_accounts").select("*").in("purchase_id", purchaseIds).order("created_at", { ascending: false }).limit(1).maybeSingle()
        : { data: null };
      if (!account) return NextResponse.json({ error: "This referrer has no reward account" }, { status: 404 });
      if (["suspended", "breached", "deleted"].includes(account.status)) return NextResponse.json({ error: `The account is already ${account.status}` }, { status: 400 });
      const reason = body.reason?.trim() || "Contest reward under review: the referral sign-ups failed our checks";
      await suspendAccount(account, reason);
      await supabaseAdmin.from("user_notifications").insert({
        user_id: userId,
        type: "contest_reward",
        title: "Contest account paused",
        body: "Your contest reward account is paused while we review your sign-ups. Contact support if you have questions.",
        link: "/dashboard/support?new=1",
      });
      await logAudit({ adminId: admin.user.id, adminEmail: admin.email, action: "contest_reward_suspended", entityType: "trading_accounts", entityId: account.id, oldValue: { status: account.status }, newValue: { status: "suspended", reason }, request });
      return NextResponse.json({ ok: true, message: "Reward account suspended. Re-enable it from Trading Accounts if needed.", accountId: account.id });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    if (error instanceof AccountActionError) return NextResponse.json({ error: error.message }, { status: error.status });
    return fail(error, "Couldn't save the decision");
  }
}
