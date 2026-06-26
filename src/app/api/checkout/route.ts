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

    // 2. Insert into purchases as pending
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
        payment_status: 'pending',
        payment_method: 'crypto',
        promo_code: promoCode
      })
      .select()
      .single();

    if (purchaseError) throw purchaseError;

    // 3. Bypass NOWPayments if amount is 0 (Free checkout)
    if (priceAmount <= 0) {
      // Mark as paid
      await supabaseAdmin.from("purchases").update({ payment_status: "paid" }).eq("id", purchase.id);
      
      const { data: dbProgram } = await supabaseAdmin.from("tpp_programs").select("*").eq("key", programKey).single();
      if (dbProgram && dbProgram.phase_1_rule_id) {
        const { data: rules } = await supabaseAdmin.from("trading_rules").select("*").eq("id", dbProgram.phase_1_rule_id).single();
        const { data: platformData } = await supabaseAdmin.from("tpp_platforms").select("*").eq("is_active", true).limit(1).single();
        
        if (rules && platformData) {
          const { createTradingAccount } = await import('@/lib/terminal-api');
          const terminalResult = await createTradingAccount({
            apiUrl: platformData.api_url,
            apiKey: platformData.api_key,
            userEmail: user.email || "user@example.com",
            userId: user.id,
            accountSize: accountSize,
            rules: rules
          });
          
          if (terminalResult.success) {
            await supabaseAdmin.from("trading_accounts").insert({
              user_id: user.id,
              platform_id: platformData.id,
              rule_id: rules.id,
              login: terminalResult.login,
              password: terminalResult.password,
              balance: accountSize,
              starting_balance: accountSize,
              equity: accountSize,
              phase: "Phase 1",
              status: "active",
              label: `${program.shortLabel} $${accountSize.toLocaleString()}`
            });
          }
        }
      }
      
      return NextResponse.json({ 
        success: true, 
        orderId,
        invoice_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://thepeopleprop.live"}/dashboard?success=true`,
        message: "Free challenge provisioned successfully."
      });
    }

    // 4. Create NOWPayments Invoice
    const apiKey = process.env.NOWPAYMENTS_API_KEY || process.env.NOWPAYMENTS_KEY;
    if (!apiKey) {
      throw new Error("NOWPAYMENTS_API_KEY is missing from environment variables.");
    }

    const payload = {
      price_amount: priceAmount,
      price_currency: "usd",
      order_id: orderId,
      order_description: `${program.shortLabel} $${accountSize.toLocaleString()} Challenge`,
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://thepeopleprop.live"}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://thepeopleprop.live"}/dashboard?canceled=true`,
      ipn_callback_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://thepeopleprop.live"}/api/nowpayments-ipn`,
      customer_email: user.email
    };

    const response = await fetch("https://api.nowpayments.io/v1/invoice", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("NOWPayments API Error:", data);
      throw new Error(data.message || "Failed to create payment invoice.");
    }

    // Return the invoice URL to the frontend for redirection
    return NextResponse.json({ 
      success: true, 
      orderId,
      invoice_url: data.invoice_url,
      message: "Invoice created. Redirecting to payment gateway..."
    });

  } catch (err: any) {
    console.error("Checkout Error:", err);
    return NextResponse.json({ error: err.message || "Internal Server Error" }, { status: 500 });
  }
}
