import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/supabase";
import { provisionTradingAccountForPurchase } from "@/lib/account-provisioning";
import { creditAffiliateCommission } from "@/lib/affiliate-commission";

/**
 * NOWPayments IPN webhook.
 * Mirrors /api/nowpayments-ipn: verifies the HMAC signature, marks the
 * purchase as paid, and provisions the trading account (idempotent —
 * provisionTradingAccountForPurchase returns the existing account if the
 * purchase was already fulfilled, so NOWPayments retries are safe).
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-nowpayments-sig");
    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;

    // Verify IPN signature. If a secret is configured, a valid signature is required.
    if (ipnSecret) {
      if (!signature) {
        console.error("NOWPayments IPN signature missing");
        return NextResponse.json({ error: "Missing signature" }, { status: 400 });
      }
      const hmac = crypto.createHmac("sha512", ipnSecret);
      hmac.update(rawBody);
      const calculatedSignature = hmac.digest("hex");
      if (signature !== calculatedSignature) {
        console.error("NOWPayments Signature Mismatch");
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
      }
    }

    const payload = JSON.parse(rawBody);
    const { payment_status, order_id } = payload;

    if (payment_status === "failed" || payment_status === "expired") {
      // Mark the purchase failed so the user/admin can see it.
      await supabaseAdmin
        .from("purchases")
        .update({ payment_status: "failed" })
        .eq("order_id", order_id)
        .neq("payment_status", "paid");
      return NextResponse.json({ received: true });
    }

    if (payment_status !== "finished") {
      // Intermediate states: waiting, confirming, sending, partially_paid
      return NextResponse.json({ received: true });
    }

    // 1. Find the purchase for this order
    const { data: purchase, error: fetchError } = await supabaseAdmin
      .from("purchases")
      .select("*")
      .eq("order_id", order_id)
      .single();

    if (fetchError || !purchase) {
      console.error(`Purchase not found for webhook order_id: ${order_id}`);
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
    }

    // 2. Mark as paid (no-op when already paid)
    if (purchase.payment_status !== "paid") {
      const { error: paidError } = await supabaseAdmin
        .from("purchases")
        .update({ payment_status: "paid" })
        .eq("id", purchase.id);
      if (paidError) throw paidError;
    }

    // 3. Provision challenge/trading account (idempotent by purchase_id)
    const provisioning = await provisionTradingAccountForPurchase(purchase);

    // 4. Credit affiliate commission only on first fulfillment (idempotent)
    if (provisioning.created) {
      await creditAffiliateCommission(purchase);
    }

    return NextResponse.json({
      received: true,
      message: provisioning.created ? "Order fulfilled." : "Order already fulfilled.",
      account: provisioning.account,
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
