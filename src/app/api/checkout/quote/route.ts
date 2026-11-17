import { NextResponse } from "next/server";
import { CheckoutError, quoteOrder } from "@/lib/checkout";

/** Prices an order (and validates a promo code) without creating anything. */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { quote, platformName } = await quoteOrder({
      programKey: String(body.programKey || ""),
      accountSize: Number(body.accountSize),
      addOns: Array.isArray(body.addOns) ? body.addOns : [],
      platform: body.platform ?? null,
      promoCode: body.promoCode ?? null,
    });
    return NextResponse.json({ quote, platform: platformName });
  } catch (err) {
    if (err instanceof CheckoutError) return NextResponse.json({ error: err.message }, { status: err.status });
    console.error("Quote error:", err);
    return NextResponse.json({ error: "Could not price this order." }, { status: 500 });
  }
}
