import { getSessionUser } from "@/lib/api-auth";
import { supabaseAdmin } from "@/lib/supabase";
import { isUuid } from "@/lib/certificates/types";

const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "private, no-store" } });

export async function GET(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return reply({ error: "Sign in to view your commission." }, 401);
  const access = await supabaseAdmin.rpc("affiliate_withdrawal_access", { p_user: user.id });
  if (access.error) return reply({ error: "Could not load commission access." }, 503);
  if (!access.data) return reply({ error: "Commission access is unavailable." }, 403);
  const [account, history] = await Promise.all([
    supabaseAdmin.from("affiliates").select("pending_payout,status").eq("user_id", user.id).single(),
    supabaseAdmin.from("affiliate_payout_requests").select("id,amount,method,status,created_at,payment_reference,rejection_reason")
      .eq("user_id", user.id).order("created_at", { ascending: false }).limit(50),
  ]);
  if (account.error || history.error) return reply({ error: "Could not load your commission withdrawals." }, 503);
  return reply({ available: Number(account.data.pending_payout), active: ["active","approved"].includes(account.data.status), requests: history.data });
}

export async function POST(request: Request) {
  const user = await getSessionUser(request);
  if (!user) return reply({ error: "Sign in to request a withdrawal." }, 401);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return reply({ error: "Send a JSON request." }, 415);
  const body = await request.json().catch(() => null);
  const destination = typeof body?.destination === "string" ? body.destination.trim() : "";
  if (!isUuid(body?.id) || typeof body.amount !== "string" || !/^\d{1,12}(?:\.\d{1,2})?$/.test(body.amount) || !destination || destination.length>80) {
    return reply({ error: "Enter a positive dollar amount and a valid wallet address." }, 400);
  }
  const { error } = await supabaseAdmin.rpc("request_affiliate_withdrawal", {
    p_id: body.id, p_user: user.id, p_amount: body.amount, p_method: body.method, p_destination: destination,
  });
  if (!error) return reply({ success: true });
  if (error.code === "23505") return reply({ error: "You already have a pending withdrawal. Refresh to see it." }, 409);
  if (error.code === "23514") return reply({ error: "Check your available balance, network and wallet address." }, 400);
  if (error.code === "42501") return reply({ error: "Commission withdrawals are unavailable for this account." }, 403);
  return reply({ error: "Could not save your request. Try again." }, 503);
}
