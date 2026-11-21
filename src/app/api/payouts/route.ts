import { supabaseAdmin } from "@/lib/supabase";
import { getSessionUser } from "@/lib/api-auth";
import { payoutError } from "@/lib/payouts";

const METHODS = new Set(["usdt_trc20", "usdt_erc20", "usdt_bep20", "bank_transfer"]);

export async function POST(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => null);
  const details = body?.paymentDetails ?? body?.cryptoAddress;
  const method = body?.paymentMethod ?? "usdt_trc20";
  if (!body?.accountId || !METHODS.has(method) || typeof details !== "string" || !details.trim() || details.length > 500) {
    return Response.json({ error: "Choose an account, payment method and destination." }, { status: 400 });
  }
  const gross = body.amount == null || body.amount === "" ? null : Number(body.amount);
  if (gross !== null && (!Number.isFinite(gross) || gross <= 0)) return Response.json({ error: "Enter a valid amount." }, { status: 400 });
  const { data, error } = await supabaseAdmin.rpc("request_trader_payout", {
    p_user: user.id, p_account: body.accountId, p_gross: gross, p_method: method, p_details: details.trim(),
    p_request_key: body.requestKey ?? crypto.randomUUID(),
  });
  if (error) return payoutError(error);
  return Response.json({ success: true, payout: data });
}
