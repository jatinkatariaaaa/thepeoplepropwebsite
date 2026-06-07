import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { price_amount, price_currency, order_id, program_key, size, fullName, email, country, address } = body;

    if (!price_amount || !price_currency || !email || !fullName) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const uniqueOrderId = order_id || `TPP-${Date.now()}`;

    // Prepare the payload for NOWPayments
    const payload = {
      price_amount: parseFloat(price_amount),
      price_currency: price_currency,
      order_id: uniqueOrderId,
      order_description: `Challenge: ${program_key || "Standard"} - Size: ${size || "N/A"}`,
      success_url: "https://thepeopleprop.live/success",
      cancel_url: "https://thepeopleprop.live/cancel",
      ipn_callback_url: "https://thepeopleprop.live/api/webhook",
      customer_email: email
    };

    const apiKey = process.env.NOWPAYMENTS_API_KEY;

    if (!apiKey) {
      console.error("NOWPAYMENTS_API_KEY is not set in environment variables.");
      return NextResponse.json(
        { error: "Payment gateway configuration error." },
        { status: 500 }
      );
    }

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
      return NextResponse.json(
        { error: data.message || "Failed to create payment invoice." },
        { status: response.status }
      );
    }

    // Insert order record into Supabase
    const { error: dbError } = await supabase
      .from('orders')
      .insert([
        { 
          order_id: uniqueOrderId,
          full_name: fullName,
          email: email,
          country: country,
          address: address,
          program_key: program_key || "N/A",
          account_size: parseFloat(size) || 0,
          price_amount: parseFloat(price_amount),
          invoice_url: data.invoice_url
        }
      ]);

    if (dbError) {
      console.error("Supabase Insert Error:", dbError);
      // We don't fail the payment if DB insert fails, but it's logged.
    }

    return NextResponse.json({
      invoice_url: data.invoice_url,
      id: data.id,
      order_id: data.order_id,
    });
  } catch (error: any) {
    console.error("Internal API Error (/api/create-payment):", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
