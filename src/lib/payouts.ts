import { supabaseAdmin } from "@/lib/supabase";

export function payoutError(error: { code?: string; message: string }) {
  const status = error.code === "P0002" ? 404 : error.code === "42501" ? 403
    : error.code === "23505" ? 409 : ["23514", "22P02", "22007"].includes(error.code ?? "") ? 400 : 500;
  if (status === 500) console.error("Payout database error", error);
  return Response.json({ error: status === 500 ? "Could not process the payout. Please retry." : error.message }, { status });
}

export async function checkPayout(userId: string, accountRef: string) {
  return supabaseAdmin.rpc("trader_payout_quote", { p_user: userId, p_account: accountRef });
}
