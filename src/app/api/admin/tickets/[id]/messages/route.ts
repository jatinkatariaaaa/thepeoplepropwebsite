import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { logAudit, requireRole } from "@/lib/admin-auth";
import { DESK_ROLES, fail, loadTicket } from "@/lib/support-desk";
import { MAX_MESSAGE, isTicketStatus } from "@/lib/support";
import { isUuid } from "@/lib/certificates/types";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/**
 * POST /api/admin/tickets/:id/messages — reply to the trader: { message, status? }.
 * The reply appears on their Support page and in their notification bell; `status` lets the
 * desk send and resolve in one go.
 */
export async function POST(request: Request, { params }: Ctx) {
  try {
    const admin = await requireRole(request, DESK_ROLES);
    const { id } = await params;
    if (!isUuid(id)) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    const body = (await request.json().catch(() => ({}))) as { message?: string; status?: unknown };
    const message = (body.message || "").trim().slice(0, MAX_MESSAGE);
    if (!message) return NextResponse.json({ error: "Write a reply first" }, { status: 400 });
    if (body.status !== undefined && !isTicketStatus(body.status)) return NextResponse.json({ error: "Unknown status" }, { status: 400 });

    const { data: exists } = await supabaseAdmin.from("support_tickets").select("id").eq("id", id).maybeSingle();
    if (!exists) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

    const { error } = await supabaseAdmin.from("ticket_messages").insert({ ticket_id: id, sender_id: admin.user.id, sender_role: "admin", message });
    if (error) throw error;

    if (body.status !== undefined) {
      const { error: statusError } = await supabaseAdmin.from("support_tickets").update({ status: body.status, updated_at: new Date().toISOString() }).eq("id", id);
      if (statusError) throw statusError;
      await logAudit({ adminId: admin.user.id, adminEmail: admin.email, action: "update_ticket", entityType: "support_ticket", entityId: id, newValue: { status: body.status }, request });
    }

    return NextResponse.json({ ok: true, ...(await loadTicket(id)) });
  } catch (error) {
    return fail(error, "Couldn't send the reply");
  }
}
