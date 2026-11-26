import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { logAudit, requireRole } from "@/lib/admin-auth";
import { DESK_ROLES, TICKET_COLUMNS, fail } from "@/lib/support-desk";
import { DESK_VIEWS, MAX_MESSAGE, MAX_SUBJECT, isDeskView, isTicketPriority, type DeskTicket, type DeskView, type TicketRow } from "@/lib/support";

export const dynamic = "force-dynamic";

const PAGE = 30;

type Query = ReturnType<typeof base>;
const base = (count = false) => supabaseAdmin.from("support_tickets").select(TICKET_COLUMNS, count ? { count: "exact", head: true } : { count: "exact" });

function scope(q: Query, view: DeskView): Query {
  switch (view) {
    case "needs_reply":
      return q.eq("last_sender", "user").in("status", ["open", "in_progress"]);
    case "waiting":
      return q.eq("last_sender", "admin").in("status", ["open", "in_progress"]);
    case "active":
      return q.in("status", ["open", "in_progress"]);
    case "resolved":
      return q.eq("status", "resolved");
    case "closed":
      return q.eq("status", "closed");
    default:
      return q;
  }
}

/** GET /api/admin/tickets?view=needs_reply&q=&page=1 — the inbox, with a count for every view. */
export async function GET(request: Request) {
  try {
    await requireRole(request, DESK_ROLES);
    const { searchParams } = new URL(request.url);
    const viewParam = searchParams.get("view");
    const view: DeskView = isDeskView(viewParam) ? viewParam : "needs_reply";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    // PostgREST filter syntax uses , ( ) * : as operators, so keep the search to plain text
    const search = (searchParams.get("q") || "").replace(/[%,()*:\\"']/g, " ").trim().slice(0, 80);

    let list = scope(base(), view);
    if (search) list = list.or(`subject.ilike.%${search}%,user_email.ilike.%${search}%`);
    list =
      view === "needs_reply"
        ? list.order("last_message_at", { ascending: true, nullsFirst: false }) // longest waiting first
        : list.order("last_message_at", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false });

    const [listed, ...counted] = await Promise.all([
      list.range((page - 1) * PAGE, page * PAGE - 1),
      ...DESK_VIEWS.map((d) => scope(base(true), d.key)),
    ]);
    if (listed.error) throw listed.error;

    const rows = (listed.data ?? []) as TicketRow[];
    const ids = rows.map((t) => t.id);
    const userIds = [...new Set(rows.map((t) => t.user_id).filter((v): v is string => Boolean(v)))];

    const [profiles, messages] = await Promise.all([
      userIds.length
        ? supabaseAdmin.from("profiles").select("id, display_name, first_name, last_name").in("id", userIds)
        : Promise.resolve({ data: [] as { id: string; display_name: string | null; first_name: string | null; last_name: string | null }[] }),
      ids.length
        ? supabaseAdmin.from("ticket_messages").select("ticket_id, message, created_at").in("ticket_id", ids).order("created_at", { ascending: false }).limit(ids.length * 8)
        : Promise.resolve({ data: [] as { ticket_id: string; message: string; created_at: string }[] }),
    ]);

    const nameOf = new Map(
      (profiles.data ?? []).map((p) => [p.id, p.display_name?.trim() || [p.first_name, p.last_name].filter(Boolean).join(" ").trim() || null]),
    );
    const previewOf = new Map<string, string>();
    for (const m of messages.data ?? []) if (!previewOf.has(m.ticket_id)) previewOf.set(m.ticket_id, m.message.slice(0, 160));

    const tickets: DeskTicket[] = rows.map((t) => ({
      ...t,
      user_name: t.user_id ? (nameOf.get(t.user_id) ?? null) : null,
      preview: previewOf.get(t.id) ?? null,
    }));

    const counts = Object.fromEntries(DESK_VIEWS.map((d, i) => [d.key, counted[i].count ?? 0])) as Record<DeskView, number>;
    return NextResponse.json({ tickets, total: listed.count ?? tickets.length, page, pageSize: PAGE, counts });
  } catch (error) {
    return fail(error, "Couldn't load tickets");
  }
}

/**
 * POST /api/admin/tickets — start a conversation with a trader: { email, subject, message, priority? }.
 * The message lands in their Support page and their notification bell.
 */
export async function POST(request: Request) {
  try {
    const admin = await requireRole(request, DESK_ROLES);
    const body = (await request.json().catch(() => ({}))) as { email?: string; subject?: string; message?: string; priority?: string };
    const email = (body.email || "").trim().toLowerCase();
    const subject = (body.subject || "").trim().slice(0, MAX_SUBJECT);
    const message = (body.message || "").trim().slice(0, MAX_MESSAGE);
    const priority = isTicketPriority(body.priority) ? body.priority : "medium";
    if (!email || subject.length < 3 || message.length < 2) {
      return NextResponse.json({ error: "Add the trader's email, a subject and a message." }, { status: 400 });
    }

    const { data: profile } = await supabaseAdmin.from("profiles").select("id, email").ilike("email", email).limit(1).maybeSingle();
    if (!profile) return NextResponse.json({ error: "No account uses that email." }, { status: 404 });

    const { data: ticket, error } = await supabaseAdmin
      .from("support_tickets")
      .insert({ user_id: profile.id, user_email: profile.email ?? email, subject, priority, status: "in_progress" })
      .select("id")
      .single();
    if (error || !ticket) throw error ?? new Error("Couldn't open the ticket");

    const { error: msgError } = await supabaseAdmin
      .from("ticket_messages")
      .insert({ ticket_id: ticket.id, sender_id: admin.user.id, sender_role: "admin", message });
    if (msgError) throw msgError;

    await logAudit({ adminId: admin.user.id, adminEmail: admin.email, action: "create_ticket", entityType: "support_ticket", entityId: ticket.id, newValue: { email, subject, priority }, request });
    return NextResponse.json({ ok: true, id: ticket.id });
  } catch (error) {
    return fail(error, "Couldn't open the ticket");
  }
}
