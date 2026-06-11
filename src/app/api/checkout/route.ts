import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { programs, ProgramKey, AccountSize } from "@/data/programs";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized - No token" }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized - Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      programKey, 
      accountSize, 
      priceAmount, 
      fullName, 
      address, 
      country, 
      platform,
      promoCode
    } = body;

    // 1. Verify program and get rules
    const program = programs.find(p => p.key === programKey);
    if (!program) {
      return NextResponse.json({ error: "Invalid program" }, { status: 400 });
    }

    // Parse percentages from strings like "10%" or "8% + 5%"
    const maxDailyDrawdown = parseFloat(program.dailyDrawdown.replace("%", "")) / 100;
    const maxOverallDrawdown = parseFloat(program.maxDrawdown.replace("%", "")) / 100;
    const firstTargetStr = program.profitTarget.split("+")[0].replace("%", "").trim();
    const profitTarget = parseFloat(firstTargetStr) / 100;

    // Generate Order ID
    const orderId = `ORD-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // 2. Insert into purchases (Payment is assumed complete here for crypto integration flow)
    const { data: purchase, error: purchaseError } = await supabaseAdmin
      .from("purchases")
      .insert({
        user_id: user.id,
        order_id: orderId,
        full_name: fullName,
        email: user.email,
        country,
        address,
        program_key: programKey,
        account_size: accountSize,
        price_amount: priceAmount,
        payment_status: 'paid', // Assuming callback from crypto gateway
        payment_method: 'crypto',
        promo_code: promoCode
      })
      .select()
      .single();

    if (purchaseError) throw purchaseError;

    // 3. Generate Trading Account for the Terminal
    const loginId = Math.floor(100000 + Math.random() * 900000).toString();
    const password = Math.random().toString(36).substring(2, 12);

    const { error: accountError } = await supabaseAdmin
      .from("accounts") // This matches the terminal's 0001_profiles_accounts.sql
      .insert({
        user_id: user.id,
        label: `${program.shortLabel} $${accountSize.toLocaleString()}`,
        phase: program.phases === 0 ? 'funded' : 'challenge',
        program_key: programKey,
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

    if (accountError) throw accountError;

    // 4. Track Affiliate Commission
    // Check if the user was referred by someone
    const { data: referral } = await supabaseAdmin
      .from("affiliate_referrals")
      .select("affiliate_id")
      .eq("referred_user_id", user.id)
      .single();
      
    if (referral?.affiliate_id) {
      // 10% commission
      const commission = priceAmount * 0.10;
      
      // Insert earnings record
      await supabaseAdmin
        .from("affiliate_earnings")
        .insert({
          affiliate_id: referral.affiliate_id,
          purchase_id: purchase.id,
          amount: commission,
          status: 'pending'
        });
        
      // Update affiliate's pending payout and total earnings
      // We do a raw rpc call or just let a trigger handle it. 
      // Since we don't have an RPC, we read and update.
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
      success: true, 
      orderId,
      message: "Account created successfully and linked to terminal."
    });

  } catch (err: any) {
    console.error("Checkout Error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
