import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { programs, ProgramKey, AccountSize } from "@/data/programs";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    // 4. Track Affiliate if affiliate_code cookie exists
    const affiliateCode = cookieStore.get("ref")?.value;
    if (affiliateCode) {
      // Find affiliate user
      const { data: affiliateUser } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("affiliate_code", affiliateCode)
        .single();
        
      if (affiliateUser) {
        // 15% commission
        const commission = priceAmount * 0.15;
        await supabaseAdmin
          .from("affiliate_earnings")
          .insert({
            affiliate_id: affiliateUser.id,
            referred_user_id: user.id,
            purchase_id: purchase.id,
            amount: commission,
            status: 'pending'
          });
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
