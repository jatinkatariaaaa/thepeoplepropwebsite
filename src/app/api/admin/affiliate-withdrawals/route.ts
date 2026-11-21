import { requireRole } from "@/lib/admin-auth";
import { isUuid } from "@/lib/certificates/types";
import { supabaseAdmin } from "@/lib/supabase";

const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
async function review(request: Request, write: boolean) {
  let admin;
  try { admin = await requireRole(request, ["finance"]); }
  catch (error) { return reply({ error: "Finance or owner access is required." }, error instanceof Error && error.message==="Unauthorized" ? 401 : 403); }
  if (!write) {
    const { data, error } = await supabaseAdmin.from("affiliate_payout_requests")
      .select("id,user_id,amount,destination,method,status,created_at").eq("status","pending").order("created_at").limit(100);
    return error ? reply({ error: "Could not load requests." },503) : reply({ requests:data });
  }
  if (!request.headers.get("content-type")?.startsWith("application/json")) return reply({error:"Send a JSON request."},415);
  const body = await request.json().catch(() => null);
  const note = typeof body?.note === "string" ? body.note.trim() : "";
  if (!isUuid(body?.id) || !["paid","rejected"].includes(body.status) || note.length<3 || note.length>250) {
    return reply({ error:"Enter a payment reference or rejection reason." },400);
  }
  const { error } = await supabaseAdmin.rpc("review_affiliate_withdrawal",{ p_id:body.id,p_admin:admin.user.id,p_status:body.status,p_note:note });
  if (!error) return reply({ success:true });
  if (error.code === "42501") return reply({error:"Another reviewer must handle this request."},403);
  if (error.code === "23505") return reply({error:"This payment reference was already used."},409);
  if (error.code === "P0002") return reply({error:"Request not found."},404);
  if (["23514","40001"].includes(error.code)) return reply({error:"The request or balance changed. Refresh before recording payment."},409);
  return reply({error:"Could not save the decision. Try again."},503);
}
export const GET = (request: Request) => review(request,false);
export const POST = (request: Request) => review(request,true);
