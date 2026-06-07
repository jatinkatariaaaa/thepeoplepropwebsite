import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { price_amount, price_currency, order_id, program_key, size } = body;

    if (!price_amount || !price_currency) {
      return NextResponse.json(
        { error: "Missing required fields: price_amount or price_currency" },
        { status: 400 }
      );
    }

    // Prepare the payload for NOWPayments
    const payload = {
      price_amount: parseFloat(price_amount),
      price_currency: price_currency,
      order_id: order_id || `ORDER-${Date.now()}`,
      order_description: `Challenge: ${program_key || "Standard"} - Size: ${size || "N/A"}`,
      success_url: "https://thepeopleprop.live/success",
      cancel_url: "https://thepeopleprop.live/cancel",
      ipn_callback_url: "https://thepeopleprop.live/api/webhook",
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
