import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export async function GET() {
  const { data, error } = await supabaseAdmin.rpc("public_payout_summary").maybeSingle<{
    paid_count: number;
    paid_total: number;
    highest_paid: number;
  }>();

  if (error || !data) {
    console.error("Could not load the recorded payout summary", error?.code);
    return NextResponse.json({ stats: [] }, { status: 503 });
  }

  const stats = Number(data.paid_count) > 0 ? [
    { key_name: "payout_count", label: "Payouts with transfer references", value: Number(data.paid_count).toLocaleString("en-US") },
    { key_name: "total_payouts", label: "Recorded payouts", value: usd.format(Number(data.paid_total)) },
    { key_name: "highest_payout", label: "Largest recorded payout", value: usd.format(Number(data.highest_paid)) },
  ] : [];
  return NextResponse.json({ stats }, { headers: { "Cache-Control": "public, s-maxage=60" } });
}
