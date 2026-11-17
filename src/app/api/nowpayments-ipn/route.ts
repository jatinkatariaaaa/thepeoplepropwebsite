import crypto from "crypto";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { provisionNextPhase, provisionTradingAccountForPurchase } from "@/lib/account-provisioning";
import { creditAffiliate, redeemCoupon } from "@/lib/checkout";
import { getPerkSettings } from "@/lib/settings";

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

async function confirmedByGateway(paymentId: unknown, orderId: string): Promise<{ ok: boolean; priceAmount?: number }> {
  const apiKey = process.env.NOWPAYMENTS_API_KEY || process.env.NOWPAYMENTS_KEY;
  if (!apiKey || !paymentId) return { ok: false };
  try {
    const res = await fetch(`https://api.nowpayments.io/v1/payment/${encodeURIComponent(String(paymentId))}`, { headers: { "x-api-key": apiKey }, cache: "no-store" });
    if (!res.ok) return { ok: false };
    const p = (await res.json()) as { payment_status?: string; order_id?: string; price_amount?: number };
    return { ok: p.payment_status === "finished" && p.order_id === orderId, priceAmount: Number(p.price_amount) };
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
    if (payload.payment_status !== "finished") return NextResponse.json({ received: true });

    const secret = process.env.NOWPAYMENTS_IPN_SECRET;
    let paidAmount = Number(payload.price_amount);
    if (secret) {
      if (!signatureValid(payload, req.headers.get("x-nowpayments-sig"), secret)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    } else {
      const check = await confirmedByGateway(payload.payment_id, orderId);
      if (!check.ok) return NextResponse.json({ error: "Payment could not be verified" }, { status: 401 });
      paidAmount = Number(check.priceAmount);
    }

    const { data: purchase } = await supabaseAdmin.from("purchases").select("*").eq("order_id", orderId).maybeSingle();
    if (!purchase) return NextResponse.json({ error: "Purchase not found" }, { status: 404 });

    // The invoice must have been for at least what the order costs.
    if (Number.isFinite(paidAmount) && paidAmount + 0.01 < Number(purchase.price_amount)) {
      await supabaseAdmin.from("purchases").update({ payment_status: "underpaid", payment_id: String(payload.payment_id ?? "") }).eq("id", purchase.id);
      return NextResponse.json({ error: "Amount does not match the order" }, { status: 400 });
    }

    const firstTime = purchase.payment_status !== "paid";
    if (firstTime) {
      await supabaseAdmin
        .from("purchases")
        .update({ payment_status: "paid", paid_at: new Date().toISOString(), payment_id: String(payload.payment_id ?? "") })
        .eq("id", purchase.id);
    }

    let account: unknown = null;
    if (purchase.kind === "activation") {
      const { data: passed } = await supabaseAdmin.from("trading_accounts").select("*").eq("id", purchase.related_account_id).maybeSingle();
      if (passed) account = (await provisionNextPhase(passed, { activationPaid: true })).account;
    } else {
      account = (await provisionTradingAccountForPurchase(purchase)).account;
    }

    if (firstTime) {
      await redeemCoupon(purchase.promo_code);
      const settings = await getPerkSettings();
      await creditAffiliate(purchase, settings.affiliateCommissionPct);
    }

    return NextResponse.json({ received: true, account });
  } catch (error) {
    console.error("IPN processing error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
