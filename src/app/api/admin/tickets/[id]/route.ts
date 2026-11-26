import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { logAudit, requireRole } from "@/lib/admin-auth";
import { DESK_ROLES, TICKET_COLUMNS, fail, loadTicket, markSeenByTeam } from "@/lib/support-desk";
import { isTicketPriority, isTicketStatus } from "@/lib/support";
import { isUuid } from "@/lib/certificates/types";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/admin/tickets/:id — the conversation and the trader. Opening it clears the team's unread mark. */
export async function GET(request: Request, { params }: Ctx) {
  try {
    await requireRole(request, DESK_ROLES);
    const { id } = await params;
    if (!isUuid(id)) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    const data = await loadTicket(id);
    if (!data) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    if (data.ticket.admin_unread) {
      await markSeenByTeam(id);
      data.ticket.admin_unread = false;
    }
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return fail(error, "Couldn't load the ticket");
  }
}

/** PATCH /api/admin/tickets/:id — { status?, priority? }. Resolving or closing tells the trader. */
export async function PATCH(request: Request, { params }: Ctx) {
  try {
    const admin = await requireRole(request, DESK_ROLES);
    const { id } = await params;
    if (!isUuid(id)) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    const body = (await request.json().catch(() => ({}))) as { status?: unknown; priority?: unknown };

    const update: Record<string, string> = {};
    if (body.status !== undefined) {
      if (!isTicketStatus(body.status)) return NextResponse.json({ error: "Unknown status" }, { status: 400 });
      update.status = body.status;
    }
    if (body.priority !== undefined) {
      if (!isTicketPriority(body.priority)) return NextResponse.json({ error: "Unknown priority" }, { status: 400 });
      update.priority = body.priority;
    }
    if (!Object.keys(update).length) return NextResponse.json({ error: "Nothing to change" }, { status: 400 });

    const { data: before } = await supabaseAdmin.from("support_tickets").select("status, priority").eq("id", id).maybeSingle();
    if (!before) return NextResponse.json({ error: "Ticket not found" }, { status: 404 });

    const { data: ticket, error } = await supabaseAdmin
      .from("support_tickets")
      .update({ ...update, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select(TICKET_COLUMNS)
      .single();
    if (error) throw error;

    await logAudit({ adminId: admin.user.id, adminEmail: admin.email, action: "update_ticket", entityType: "support_ticket", entityId: id, oldValue: before, newValue: update, request });
    return NextResponse.json({ ok: true, ticket });
  } catch (error) {
    return fail(error, "Couldn't update the ticket");
  }
}
