import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import crypto from "crypto";
import { programs } from "@/data/programs";

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

    if (purchase.payment_status === "paid") {
      // Already processed
      return NextResponse.json({ received: true });
    }

    // 2. Mark as paid
    await supabaseAdmin
      .from("purchases")
      .update({ payment_status: "paid" })
      .eq("id", purchase.id);

    // 3. Create Terminal Account
    const program = programs.find((p: any) => p.key === purchase.program_key);
    if (program) {
      const maxDailyDrawdown = parseFloat(program.dailyDrawdown.replace("%", "")) / 100;
      const maxOverallDrawdown = parseFloat(program.maxDrawdown.replace("%", "")) / 100;
      const firstTargetStr = program.profitTarget.split("+")[0].replace("%", "").trim();
      const profitTarget = parseFloat(firstTargetStr) / 100;
      const accountSize = purchase.account_size;

      const { error: accountError } = await supabaseAdmin
        .from("accounts")
        .insert({
          user_id: purchase.user_id,
          label: `${program.shortLabel} $${accountSize.toLocaleString()}`,
          phase: program.phases === 0 ? 'funded' : 'challenge',
          program_key: purchase.program_key,
          status: 'active',
          starting_balance: accountSize,
          balance: accountSize,
          equity: accountSize,
          daily_start_balance: accountSize,
          highest_equity: accountSize,
          max_daily_drawdown: maxDailyDrawdown || 0.05,
          max_overall_drawdown: maxOverallDrawdown || 0.10,
          profit_target: profitTarget || 0.08
        });

      if (accountError) {
        console.error("Account creation failed:", accountError);
      }
    }

    // 4. Track Affiliate Commission
    const { data: referral } = await supabaseAdmin
      .from("affiliate_referrals")
      .select("affiliate_id")
      .eq("referred_user_id", purchase.user_id)
      .single();

    if (referral?.affiliate_id) {
      const commission = purchase.price_amount * 0.10;
      await supabaseAdmin
        .from("affiliate_earnings")
        .insert({
          affiliate_id: referral.affiliate_id,
          purchase_id: purchase.id,
          amount: commission,
          status: 'pending'
        });

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

    return NextResponse.json({ received: true, message: "Order fulfilled." });
  } catch (error) {
    console.error("IPN Processing Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
