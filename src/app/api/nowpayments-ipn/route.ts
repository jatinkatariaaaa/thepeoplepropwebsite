import crypto from "crypto";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { provisionNextPhase, provisionTradingAccountForPurchase } from "@/lib/account-provisioning";
import { redeemCoupon } from "@/lib/checkout";

/**
 * NOWPayments callback. A payment is only accepted when it can be proven:
 *   - with NOWPAYMENTS_IPN_SECRET set, the HMAC signature must match;
 *   - without it, the payment is looked up at NOWPayments with our API key.
 * A request that passes neither check does nothing.
 */

/** NOWPayments signs the JSON body with its keys sorted, recursively. */
function sortKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === "object") {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, k) => {
        acc[k] = sortKeys((value as Record<string, unknown>)[k]);
        return acc;
      }, {});
  }
  return value;
}

function signatureValid(payload: unknown, signature: string | null, secret: string) {
  if (!signature) return false;
  const expected = crypto.createHmac("sha512", secret).update(JSON.stringify(sortKeys(payload))).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function confirmedByGateway(paymentId: unknown, orderId: string, status: string): Promise<{ ok: boolean; priceAmount?: number }> {
  const apiKey = process.env.NOWPAYMENTS_API_KEY || process.env.NOWPAYMENTS_KEY;
  if (!apiKey || !paymentId) return { ok: false };
  try {
    const res = await fetch(`https://api.nowpayments.io/v1/payment/${encodeURIComponent(String(paymentId))}`, { headers: { "x-api-key": apiKey }, cache: "no-store" });
    if (!res.ok) return { ok: false };
    const p = (await res.json()) as { payment_status?: string; order_id?: string; price_amount?: number };
    return { ok: p.payment_status === status && p.order_id === orderId, priceAmount: Number(p.price_amount) };
  } catch {
    return { ok: false };
  }
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const orderId = String(payload.order_id || "");
    if (!orderId) return NextResponse.json({ error: "Missing order_id" }, { status: 400 });
    const status = payload.payment_status;
    if (status !== "finished" && status !== "refunded") return NextResponse.json({ received: true });

    const secret = process.env.NOWPAYMENTS_IPN_SECRET;
    let paidAmount = Number(payload.price_amount);
    if (secret) {
      if (!signatureValid(payload, req.headers.get("x-nowpayments-sig"), secret)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    } else {
      const check = await confirmedByGateway(payload.payment_id, orderId, status);
      if (!check.ok) return NextResponse.json({ error: "Payment could not be verified" }, { status: 401 });
      paidAmount = Number(check.priceAmount);
    }

    const { data: purchase, error: lookupError } = await supabaseAdmin.from("purchases").select("*").eq("order_id", orderId).maybeSingle();
    if (lookupError) throw lookupError;
    if (!purchase) return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
    if (purchase.payment_status === "refunded") return NextResponse.json({ received: true });
    const paymentId = String(payload.payment_id ?? "");
    if (!paymentId) return NextResponse.json({ error: "Missing payment ID" }, { status: 400 });
    if (status === "refunded") {
      if (purchase.payment_id && purchase.payment_id !== paymentId) return NextResponse.json({ received: true });
      let refund = supabaseAdmin.from("purchases").update({ payment_status: "refunded", payment_id: paymentId }).eq("id", purchase.id);
      refund = purchase.payment_id == null ? refund.is("payment_id", null) : refund.eq("payment_id", purchase.payment_id);
      const { data: refunded, error } = await refund.select("id").maybeSingle();
      if (error) throw error;
      // If a payment arrived concurrently, re-read its ID on the gateway's next attempt.
      if (!refunded) return NextResponse.json({ error: "Payment changed. Retry refund." }, { status: 503 });
      return NextResponse.json({ received: true });
    }

    // The invoice must have been for at least what the order costs.
    if (!Number.isFinite(paidAmount) || Math.round(paidAmount * 100) < Math.round(Number(purchase.price_amount) * 100)) {
      const { error } = await supabaseAdmin.from("purchases").update({ payment_status: "underpaid", payment_id: paymentId })
        .eq("id", purchase.id).or("payment_status.is.null,payment_status.not.in.(paid,refunded)");
      if (error) throw error;
      return NextResponse.json({ error: "Amount does not match the order" }, { status: 400 });
    }

    let firstTime = false;
    if (purchase.payment_status !== "paid") {
      // Postgres settles the commission inside this same status transition.
      const { data: changed, error } = await supabaseAdmin
        .from("purchases")
        .update({ payment_status: "paid", paid_at: new Date().toISOString(), payment_id: paymentId })
        .eq("id", purchase.id).or("payment_status.is.null,payment_status.not.in.(paid,refunded)").select("id").maybeSingle();
      if (error) throw error;
      firstTime = Boolean(changed);
      if (!changed) {
        const { data: current, error: statusError } = await supabaseAdmin.from("purchases").select("payment_status").eq("id", purchase.id).single();
        if (statusError) throw statusError;
        if (current.payment_status !== "paid") return NextResponse.json({ received: true });
      }
    }

    let account: unknown = null;
    if (purchase.kind === "activation") {
      const { data: passed } = await supabaseAdmin.from("trading_accounts").select("*").eq("id", purchase.related_account_id).maybeSingle();
      if (passed) account = (await provisionNextPhase(passed, { activationPaid: true })).account;
    } else {
      account = (await provisionTradingAccountForPurchase(purchase)).account;
    }

    if (firstTime) await redeemCoupon(purchase.promo_code);

    return NextResponse.json({ received: true, account });
  } catch (error) {
    console.error("IPN processing error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
