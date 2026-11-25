import { getSessionUser } from "@/lib/api-auth";
import { deskResponse } from "@/lib/partner-desk-server";
import { supabaseAdmin } from "@/lib/supabase";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const idPattern = /^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i;
const fail = (error: string, status: number) => deskResponse({ error }, status);

async function saveLink(request: Request, editing: boolean) {
  const user = await getSessionUser(request);
  if (!user) return fail("Sign in to manage links.", 401);

  const member = await supabaseAdmin.from("staff_members").select("permissions,commission_bps")
    .eq("user_id", user.id).eq("active", true).maybeSingle();
  if (member.error) return fail("Could not verify your permissions. Please try again.", 503);
  if (!member.data?.permissions.includes("manage_links")) return fail("Link management is unavailable.", 403);
  if (!request.headers.get("content-type")?.startsWith("application/json")) return fail("Send a JSON request.", 415);
  const body = await request.json().catch(() => null);
  if (!body || !Number.isInteger(body.shareBps) || body.shareBps < 0 || body.shareBps > member.data.commission_bps) {
    return fail("The share must be between zero and your allocated commission rate.", 400);
  }

  let promoterId: string;
  if (editing) {
    if (typeof body.id !== "string" || !idPattern.test(body.id) || typeof body.active !== "boolean") {
      return fail("Select a valid link and status.", 400);
    }
    const { data, error } = await supabaseAdmin.from("partner_links").select("promoter_id")
      .eq("id", body.id).eq("partner_id", user.id).not("promoter_id", "is", null).maybeSingle();
    if (error) return fail("Could not load the link. Please try again.", 503);
    if (!data) return fail("Link not found.", 404);
    promoterId = data.promoter_id;
  } else {
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (email.length > 254 || !emailPattern.test(email)) return fail("Enter the email on the promoter’s website account.", 400);
    const { data, error } = await supabaseAdmin.rpc("partner_account_id", { p_email: email });
    if (error) return fail("Could not look up the account. Please try again.", 503);
    if (!data) return fail("No website account matches that email.", 404);
    if (data === user.id) return fail("Choose a different account as the promoter.", 400);
    promoterId = data;
  }

  const { data: code, error } = await supabaseAdmin.rpc("set_partner_link", {
    p_partner_id: user.id, p_promoter_id: promoterId,
    p_promoter_bps: body.shareBps, p_active: editing ? body.active : true, p_create_only: !editing,
  });
  if (!error) return deskResponse({ code });
  if (error.code === "42501") return fail("Link management is unavailable.", 403);
  if (error.code === "23505") return fail("This promoter already has a link. Edit the existing link.", 409);
  if (["22023", "23514", "23503", "P0001"].includes(error.code)) {
    return fail("The account or allocation changed. Refresh your desk and check the share.", 409);
  }
  return fail("Could not save the link. Please try again.", 503);
}

export const POST = (request: Request) => saveLink(request, false);
export const PATCH = (request: Request) => saveLink(request, true);
