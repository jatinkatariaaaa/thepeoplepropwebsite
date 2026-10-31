import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    
    // IPN payload will contain: payment_id, invoice_id, payment_status, pay_amount, order_id, etc.
    console.log("Received NOWPayments Webhook IPN:", payload);

    const { payment_status, order_id, invoice_id } = payload;

    if (payment_status === "finished") {
      // Transaction is fully confirmed.
      // TODO: Implement order fulfillment logic here (e.g., update DB, send email, issue account credentials)
      console.log(`Payment confirmed for Order ID: ${order_id}. Ready for fulfillment.`);
    } else if (payment_status === "failed" || payment_status === "expired") {
      // Handle failed or expired payment
      console.log(`Payment failed/expired for Order ID: ${order_id}.`);
    } else {
      // Other statuses: waiting, confirming, sending, partially_paid
      console.log(`Payment status for Order ID: ${order_id} is ${payment_status}.`);
    }

    // ALWAYS return 200 OK so NOWPayments knows the webhook was received successfully.
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
