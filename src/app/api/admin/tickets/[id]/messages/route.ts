import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAdminUser, logAudit } from "@/lib/admin-auth";

export async function GET(request: Request, context: any) {
  try {
    await getAdminUser(request);
    
    // In Next.js 15+, params in API routes is a Promise
    const { id: ticket_id } = await Promise.resolve(context.params);

    const { data: messages, error } = await supabaseAdmin
      .from("ticket_messages")
      .select(`
        *,
        sender:profiles!ticket_messages_sender_id_fkey(display_name, email)
      `)
      .eq("ticket_id", ticket_id)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ messages: messages || [] });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, context: any) {
  try {
    const admin = await getAdminUser(request);
    const { id: ticket_id } = await Promise.resolve(context.params);
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Insert message
    const { data: newMessage, error } = await supabaseAdmin
      .from("ticket_messages")
      .insert({
        ticket_id,
        sender_id: admin.user.id,
        sender_role: "admin",
        message,
      })
      .select()
      .single();

    if (error) throw error;

    // Update ticket status to in_progress if it was open
    await supabaseAdmin
      .from("support_tickets")
      .update({ status: "in_progress", updated_at: new Date().toISOString() })
      .eq("id", ticket_id)
      .eq("status", "open");

    return NextResponse.json({ success: true, message: newMessage });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: any) {
  try {
    const admin = await getAdminUser(request);
    const { id: ticket_id } = await Promise.resolve(context.params);
    const body = await request.json();

    const { data: oldTicket } = await supabaseAdmin
      .from("support_tickets")
      .select("*")
      .eq("id", ticket_id)
      .single();

    const updateData: any = { updated_at: new Date().toISOString() };
    if (body.status !== undefined) updateData.status = body.status;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.assigned_to !== undefined) updateData.assigned_to = body.assigned_to;

    const { data: ticket, error } = await supabaseAdmin
      .from("support_tickets")
      .update(updateData)
      .eq("id", ticket_id)
      .select()
      .single();

    if (error) throw error;

    await logAudit({
      adminId: admin.user.id,
      adminEmail: admin.email,
      action: "update_ticket",
      entityType: "support_ticket",
      entityId: ticket_id,
      oldValue: oldTicket,
      newValue: ticket,
      request
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
