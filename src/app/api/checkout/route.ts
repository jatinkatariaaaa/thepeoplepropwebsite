import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { programs } from "@/data/programs";
import { provisionTradingAccountForPurchase } from "@/lib/account-provisioning";

async function validateFreeCheckoutCoupon(code: unknown, programKey: string) {
  const couponCode = String(code || "").trim().toUpperCase();
  if (!couponCode) {
    return { valid: false, error: "A valid 100% coupon is required for free checkout" };
  }

  const { data: coupon, error } = await supabaseAdmin
    .from("tpp_coupons")
    .select("*")
    .eq("code", couponCode)
    .maybeSingle();

  if (error || !coupon || !coupon.is_active) {
    return { valid: false, error: "Invalid or inactive coupon" };
  }

  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < Date.now()) {
    return { valid: false, error: "Coupon has expired" };
  }

  if (coupon.max_uses != null && Number(coupon.current_uses || 0) >= Number(coupon.max_uses)) {
    return { valid: false, error: "Coupon usage limit reached" };
  }

  const scopedProgram = coupon.challenge_specific || coupon.challenge_key;
  if (scopedProgram && scopedProgram !== programKey) {
    return { valid: false, error: "Coupon is not valid for this program" };
  }

  const discountPct = Number(coupon.discount_pct || 0);
  if (!coupon.free_evaluation && discountPct < 100) {
    return { valid: false, error: "Coupon does not cover full checkout amount" };
  }

  return { valid: true, coupon };
}

export async function POST(request: Request) {
  try {
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
      promoCode
    } = body;
    const amount = Number(priceAmount);
    const size = Number(accountSize);

    if (!Number.isFinite(amount) || amount < 0) {
      return NextResponse.json({ error: "Invalid checkout amount" }, { status: 400 });
    }

    if (!Number.isFinite(size) || size <= 0) {
      return NextResponse.json({ error: "Invalid account size" }, { status: 400 });
    }

    // 1. Verify program and get rules
    const program = programs.find(p => p.key === programKey);
    if (!program) {
      return NextResponse.json({ error: "Invalid program" }, { status: 400 });
    }

    const freeCouponValidation = amount <= 0
      ? await validateFreeCheckoutCoupon(promoCode, programKey)
      : null;

    if (freeCouponValidation && !freeCouponValidation.valid) {
      return NextResponse.json({ error: freeCouponValidation.error }, { status: 400 });
    }

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
        account_size: size,
        price_amount: amount,
        payment_status: 'pending',
        payment_method: 'crypto',
        promo_code: promoCode
      })
      .select()
      .single();

    if (purchaseError) throw purchaseError;

    // 3. Bypass NOWPayments if amount is 0 (Free checkout)
    if (amount <= 0) {
      // Mark as paid
      const { error: paidError } = await supabaseAdmin
        .from("purchases")
        .update({ payment_status: "paid" })
        .eq("id", purchase.id);

      if (paidError) throw paidError;

      const provisioning = await provisionTradingAccountForPurchase({
        id: purchase.id,
        user_id: user.id,
        email: user.email,
        program_key: programKey,
        account_size: size,
      });

      if (freeCouponValidation?.coupon?.id) {
        await supabaseAdmin
          .from("tpp_coupons")
          .update({ current_uses: Number(freeCouponValidation.coupon.current_uses || 0) + 1 })
          .eq("id", freeCouponValidation.coupon.id);
      }
      
      return NextResponse.json({ 
        success: true, 
        orderId,
        account: provisioning.account,
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
      price_amount: amount,
      price_currency: "usd",
      order_id: orderId,
      order_description: `${program.shortLabel} $${size.toLocaleString()} Challenge`,
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
