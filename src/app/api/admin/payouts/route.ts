import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { logAudit, requireRole } from "@/lib/admin-auth";

/**
 * Approve (mark paid) or reject a payout request.
 *   paid:     stipends attached to it become paid, a fee refund is recorded on the purchase.
 *   rejected: the withdrawn profit goes back to the account and the stipends back to the balance.
 */
export async function POST(request: Request) {
  try {
    const admin = await requireRole(request, ["super_admin", "finance"]);
    const { payoutId, status, notes, txReference } = await request.json();
    if (!payoutId || !["paid", "rejected"].includes(status)) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

    const { data: payout } = await supabaseAdmin.from("payouts").select("*").eq("id", payoutId).maybeSingle();
    if (!payout || payout.status !== "pending") return NextResponse.json({ error: "Payout not found or already processed" }, { status: 400 });

    if (status === "paid") {
      const { data: profile } = await supabaseAdmin.from("profiles").select("kyc_status").eq("id", payout.user_id).maybeSingle();
      if (profile?.kyc_status !== "approved") {
        return NextResponse.json({ error: "This trader's KYC is not approved yet. Approve it under Compliance → KYC before paying." }, { status: 400 });
      }
    }

    const now = new Date().toISOString();
    const update: Record<string, unknown> = { status, processed_at: now, processed_by: admin.user.id };
    if (notes !== undefined) update.notes = notes;
    if (txReference) update.tx_reference = String(txReference).slice(0, 200);
    if (status === "rejected") update.rejected_reason = notes || null;

    // Claim the row first so two admins cannot process the same request.
    const { data: claimed, error: updateError } = await supabaseAdmin.from("payouts").update(update).eq("id", payoutId).eq("status", "pending").select("id").maybeSingle();
    if (updateError) throw updateError;
    if (!claimed) return NextResponse.json({ error: "Payout was already processed" }, { status: 409 });

    if (status === "rejected") {
      // Older rows stored the withdrawn amount in `amount`; newer ones keep it in gross_profit.
      const giveBack = Number(payout.gross_profit ?? payout.amount) || 0;
      if (giveBack > 0) await supabaseAdmin.rpc("payout_credit", { p_terminal_account_id: payout.account_id, p_amount: giveBack });
      await supabaseAdmin.from("stipend_accruals").update({ status: "accrued", payout_id: null, released_at: null }).eq("payout_id", payoutId).eq("status", "released");
    } else {
      await supabaseAdmin.from("stipend_accruals").update({ status: "paid", paid_at: now }).eq("payout_id", payoutId).eq("status", "released");
      if (Number(payout.fee_refund_amount) > 0 && payout.trading_account_id) {
        const { data: acct } = await supabaseAdmin.from("trading_accounts").select("id, phase_group_id").eq("id", payout.trading_account_id).maybeSingle();
        const groupId = acct?.phase_group_id || acct?.id;
        if (groupId) {
          const { data: root } = await supabaseAdmin.from("trading_accounts").select("purchase_id").eq("id", groupId).maybeSingle();
          if (root?.purchase_id) {
            await supabaseAdmin
              .from("purchases")
              .update({ refund_status: "refunded", refund_amount: payout.fee_refund_amount, refund_reason: "Refunded with first payout" })
              .eq("id", root.purchase_id);
          }
        }
      }
    }

    const paidText = `Your payout of $${Number(payout.amount).toLocaleString("en-US")} has been sent.`;
    const declinedText = `Your payout request was declined${notes ? `: ${notes}` : "."} The amount is back in your account.`;
    await supabaseAdmin.from("user_notifications").insert({
      user_id: payout.user_id,
      type: status === "paid" ? "payout_paid" : "payout_rejected",
      title: status === "paid" ? "Payout sent" : "Payout declined",
      body: status === "paid" ? paidText : declinedText,
      link: "/dashboard/payouts",
    });

    await logAudit({ adminId: admin.user.id, adminEmail: admin.email, action: `payout_${status}`, entityType: "payout", entityId: payoutId, oldValue: { status: payout.status }, newValue: update, request });
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = (error as Error).message || "Internal server error";
    const code = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    if (code === 500) console.error("Admin payout update error:", error);
    return NextResponse.json({ error: message }, { status: code });
  }
}
