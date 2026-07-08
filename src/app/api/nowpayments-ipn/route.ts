import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import crypto from "crypto";
import { provisionTradingAccountForPurchase } from "@/lib/account-provisioning";
import { creditAffiliateCommission } from "@/lib/affiliate-commission";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-nowpayments-sig");
    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;

    // Verify IPN signature. If a secret is configured, a valid signature is required —
    // otherwise anyone could POST a fake "finished" payment and get a free account.
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

    if (payment_status !== "finished") {
      // Ignore intermediate states
      return NextResponse.json({ received: true });
    }

    // 1. Find pending purchase
    const { data: purchase, error: fetchError } = await supabaseAdmin
      .from("purchases")
      .select("*")
      .eq("order_id", order_id)
      .single();

    if (fetchError || !purchase) {
      console.error(`Purchase not found for IPN order_id: ${order_id}`);
      return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
    }

    if (purchase.payment_status !== "paid") {
      const { error: paidError } = await supabaseAdmin
        .from("purchases")
        .update({ payment_status: "paid" })
        .eq("id", purchase.id);

      if (paidError) throw paidError;
    }

    const provisioning = await provisionTradingAccountForPurchase(purchase);

    // 4. Track Affiliate Commission — only on first fulfillment so that
    // NOWPayments webhook retries never double-credit the affiliate.
    if (provisioning.created) {
      await creditAffiliateCommission(purchase);
    }

    return NextResponse.json({
      received: true,
      message: provisioning.created ? "Order fulfilled." : "Order already fulfilled.",
      account: provisioning.account,
    });
  } catch (error) {
    console.error("IPN Processing Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
