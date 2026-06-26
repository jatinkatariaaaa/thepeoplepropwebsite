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
    const { data: program } = await supabaseAdmin
      .from("tpp_programs")
      .select("*")
      .eq("key", purchase.program_key)
      .single();

    if (program && program.phase_1_rule_id) {
      // Fetch Rules
      const { data: rules } = await supabaseAdmin
        .from("trading_rules")
        .select("*")
        .eq("id", program.phase_1_rule_id)
        .single();

      // Fetch TPP Terminal Platform
      const { data: platform } = await supabaseAdmin
        .from("tpp_platforms")
        .select("*")
        .eq("name", "TPP TERMINAL")
        .eq("is_active", true)
        .single();

      if (rules && platform) {
        // Call the Terminal API Bridge
        const { createTradingAccount } = await import('@/lib/terminal-api');
        
        const terminalResult = await createTradingAccount({
          apiUrl: platform.api_url,
          apiKey: platform.api_key,
          userEmail: purchase.email || "user@example.com",
          userId: purchase.user_id,
          accountSize: purchase.account_size,
          rules: rules,
          programKey: purchase.program_key
        });

        if (terminalResult.success) {
          const { error: accountError } = await supabaseAdmin
            .from("trading_accounts")
            .insert({
              user_id: purchase.user_id,
              platform_id: platform.id,
              rule_id: rules.id,
              account_number: terminalResult.login,
              login: terminalResult.login,
              password: terminalResult.password,
              terminal_account_id: terminalResult.terminalAccountId || null,
              program_key: purchase.program_key,
              balance: purchase.account_size,
              starting_balance: purchase.account_size,
              equity: purchase.account_size,
              highest_equity: purchase.account_size,
              current_daily_drawdown: 0,
              current_max_drawdown: 0,
              status: "active",
              phase: "challenge"
            });

          if (accountError) {
            console.error("Account creation failed:", accountError);
          }
        } else {
           console.error("Terminal API refused account creation:", terminalResult.error);
        }
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
