import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import crypto from "crypto";
import { provisionTradingAccountForPurchase } from "@/lib/account-provisioning";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-nowpayments-sig");
    const ipnSecret = process.env.NOWPAYMENTS_IPN_SECRET;

    // Optional IPN Verification if secret exists
    if (ipnSecret && signature) {
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

    // 4. Track Affiliate Commission
    const { data: referral } = await supabaseAdmin
      .from("affiliate_referrals")
      .select("affiliate_id")
      .eq("referred_user_id", purchase.user_id)
      .single();

    if (referral?.affiliate_id) {
      const commission = purchase.price_amount * 0.10;

      const { data: affiliateData } = await supabaseAdmin
        .from("affiliates")
        .select("total_earnings, pending_payout")
        .eq("user_id", referral.affiliate_id)
        .single();

      if (affiliateData) {
        await supabaseAdmin
          .from("affiliates")
          .update({
            total_earnings: Number(affiliateData.total_earnings) + commission,
            pending_payout: Number(affiliateData.pending_payout) + commission
          })
          .eq("user_id", referral.affiliate_id);
      }
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
