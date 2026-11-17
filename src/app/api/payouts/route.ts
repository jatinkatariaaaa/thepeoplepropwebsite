import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getSessionUser } from "@/lib/api-auth";
import { checkPayout } from "@/lib/payouts";

const METHODS = new Set(["usdt_trc20", "usdt_erc20", "usdt_bep20", "bank_transfer"]);
const money = (n: number) => Math.round(n * 100) / 100;

/** Request a payout from a funded account. */
export async function POST(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const accountRef = String(body.accountId || "");
    const method = METHODS.has(body.paymentMethod) ? String(body.paymentMethod) : "usdt_trc20";
    const details = String(body.paymentDetails || body.cryptoAddress || "").trim().slice(0, 500);
    if (!accountRef || !details) return NextResponse.json({ error: "Choose an account and enter where the payout should be sent." }, { status: 400 });

    const check = await checkPayout(user.id, accountRef);
    if (check.blockers.length) return NextResponse.json({ error: check.blockers[0], blockers: check.blockers }, { status: 400 });

    // `amount` is the profit to take out of the account; empty means all of it.
    const requested = body.amount == null || body.amount === "" ? check.profit : Number(body.amount);
    if (!Number.isFinite(requested) || requested <= 0) return NextResponse.json({ error: "Enter a valid amount." }, { status: 400 });
    const gross = money(Math.min(requested, check.profit));
    const traderShare = money((gross * check.splitPct) / 100);
    if (traderShare < check.minPayout) {
      return NextResponse.json({ error: `The minimum payout is $${check.minPayout} after the ${check.splitPct}% split.` }, { status: 400 });
    }

    // Debit the account first; the function re-checks ownership, positions and profit under a row lock.
    const { error: debitError } = await supabaseAdmin.rpc("payout_debit", { p_terminal_account_id: check.terminalAccountId, p_user_id: user.id, p_amount: gross });
    if (debitError) return NextResponse.json({ error: debitError.message }, { status: 400 });

    const stipend = check.settings.stipendRelease === "with_payout" ? check.stipendBalance : 0;
    const total = money(traderShare + stipend + check.feeRefund);

    const { data: payout, error: insertError } = await supabaseAdmin
      .from("payouts")
      .insert({
        user_id: user.id,
        account_id: check.terminalAccountId,
        trading_account_id: check.accountId,
        amount: total,
        profit: gross,
        gross_profit: gross,
        profit_split: check.splitPct,
        trader_share: traderShare,
        stipend_amount: stipend,
        fee_refund_amount: check.feeRefund,
        sequence_no: check.sequenceNo,
        on_demand: check.onDemand,
        crypto_address: details,
        payment_method: method,
        payment_details: details,
        status: "pending",
      })
      .select()
      .single();

    if (insertError || !payout) {
      await supabaseAdmin.rpc("payout_credit", { p_terminal_account_id: check.terminalAccountId, p_amount: gross });
      throw insertError ?? new Error("Could not record the payout request.");
    }

    if (stipend > 0) {
      await supabaseAdmin.from("stipend_accruals").update({ status: "released", payout_id: payout.id, released_at: new Date().toISOString() }).eq("user_id", user.id).eq("status", "accrued");
    }

    await supabaseAdmin.from("admin_notifications").insert({
      type: "new_payout",
      severity: "info",
      title: "New payout request",
      message: `${user.email} requested $${total.toLocaleString("en-US")} (payout #${check.sequenceNo}${check.onDemand ? ", on demand" : ""}).`,
      entity_type: "payout",
      entity_id: payout.id,
      user_id: user.id,
    });

    return NextResponse.json({ success: true, payout });
  } catch (error) {
    console.error("Payout error:", error);
    return NextResponse.json({ error: (error as Error).message || "Internal server error" }, { status: 500 });
  }
}
