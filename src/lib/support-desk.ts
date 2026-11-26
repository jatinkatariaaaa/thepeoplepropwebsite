import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import type { DeskUser, TicketMessage, TicketRow } from "@/lib/support";

/** Server side of the admin Support desk. */

/** Support tickets are worked by support and marketing staff (super admins always pass). */
export const DESK_ROLES = ["support", "marketing"];

export const TICKET_COLUMNS =
  "id, user_id, user_email, subject, status, priority, created_at, updated_at, last_message_at, last_sender, user_unread, admin_unread";

/** requireRole throws plain errors; turn the auth ones into the right status codes. */
export function authError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (message === "Forbidden") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return null;
}

export const fail = (error: unknown, fallback: string) =>
  authError(error) ?? NextResponse.json({ error: error instanceof Error && error.message ? error.message : fallback }, { status: 500 });

const fullName = (p: { display_name?: string | null; first_name?: string | null; last_name?: string | null } | null | undefined) =>
  p ? p.display_name?.trim() || [p.first_name, p.last_name].filter(Boolean).join(" ").trim() || null : null;

/** A ticket with its whole conversation and the trader behind it. */
export async function loadTicket(id: string) {
  const { data: ticket, error } = await supabaseAdmin.from("support_tickets").select(TICKET_COLUMNS).eq("id", id).maybeSingle();
  if (error) throw error;
  if (!ticket) return null;
  const t = ticket as TicketRow;

  const [messages, profile, accounts, tickets] = await Promise.all([
    supabaseAdmin.from("ticket_messages").select("id, sender_id, sender_role, message, created_at").eq("ticket_id", id).order("created_at", { ascending: true }),
    t.user_id
      ? supabaseAdmin.from("profiles").select("id, email, display_name, first_name, last_name, kyc_status, status, created_at").eq("id", t.user_id).maybeSingle()
      : Promise.resolve({ data: null }),
    t.user_id ? supabaseAdmin.from("trading_accounts").select("id", { count: "exact", head: true }).eq("user_id", t.user_id) : Promise.resolve({ count: 0 }),
    t.user_id ? supabaseAdmin.from("support_tickets").select("id", { count: "exact", head: true }).eq("user_id", t.user_id) : Promise.resolve({ count: 0 }),
  ]);
  if (messages.error) throw messages.error;

  // first names of the team members who answered, so the thread can say who replied
  const adminIds = [...new Set((messages.data ?? []).filter((m) => m.sender_role === "admin" && m.sender_id).map((m) => m.sender_id as string))];
  const { data: staff } = adminIds.length
    ? await supabaseAdmin.from("profiles").select("id, display_name, first_name, last_name").in("id", adminIds)
    : { data: [] as { id: string; display_name: string | null; first_name: string | null; last_name: string | null }[] };
  const staffName = new Map((staff ?? []).map((s) => [s.id, s.first_name?.trim() || fullName(s)?.split(" ")[0] || null]));

  const thread: TicketMessage[] = (messages.data ?? []).map((m) => ({
    id: m.id,
    sender_role: m.sender_role,
    message: m.message,
    created_at: m.created_at,
    sender_name: m.sender_role === "admin" && m.sender_id ? (staffName.get(m.sender_id) ?? null) : null,
  }));

  const p = profile.data as { id: string; email: string | null; display_name: string | null; first_name: string | null; last_name: string | null; kyc_status: string | null; status: string | null; created_at: string | null } | null;
  const user: DeskUser | null = t.user_id
    ? {
        id: t.user_id,
        name: fullName(p),
        email: p?.email ?? t.user_email,
        joined: p?.created_at ?? null,
        kyc: p?.kyc_status ?? null,
        status: p?.status ?? null,
        accounts: accounts.count ?? 0,
        tickets: tickets.count ?? 0,
      }
    : null;

  return { ticket: t, messages: thread, user };
}

/** The admin opened the ticket: clear its "new message" mark for the team. */
export async function markSeenByTeam(id: string) {
  await supabaseAdmin.from("support_tickets").update({ admin_seen_at: new Date().toISOString() }).eq("id", id).eq("admin_unread", true);
}
