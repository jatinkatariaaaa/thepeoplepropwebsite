import { supabaseAdmin } from "@/lib/supabase";
import { requireRole } from "@/lib/admin-auth";
import { payoutError } from "@/lib/payouts";

export async function POST(request: Request) {
  let admin;
  try {
    admin = await requireRole(request, ["super_admin", "finance"]);
  } catch (error) {
    const message = (error as Error).message;
    const status = message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
    return Response.json({ error: status === 500 ? "Unable to verify admin access." : message }, { status });
  }
  const body = await request.json().catch(() => null);
  if (!body?.payoutId || !["review", "paid", "rejected"].includes(body.status)) {
    return Response.json({ error: "Invalid payout action." }, { status: 400 });
  }
  const events: unknown = body.newsEvents;
  if (body.status === "review" && (body.calendarChecked !== true || !Array.isArray(events) || events.length > 1000 ||
    events.some((event) => typeof event !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?Z$/.test(event) || !Number.isFinite(Date.parse(event))))) {
    return Response.json({ error: "Confirm the calendar review and enter valid UTC release times." }, { status: 400 });
  }
  const { data, error } = await supabaseAdmin.rpc("process_trader_payout", {
    p_id: body.payoutId, p_admin: admin.user.id, p_action: body.status, p_notes: String(body.notes ?? "").slice(0, 2000),
    p_reference: body.txReference ?? null, p_source: body.newsSource ?? null, p_events: events ?? null,
    p_confirmed_amount: body.confirmedAmount ?? null,
  });
  if (error) return payoutError(error);
  return Response.json({ success: true, payout: data });
}
