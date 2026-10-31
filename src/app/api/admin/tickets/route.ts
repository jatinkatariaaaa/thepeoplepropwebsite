import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAdminUser, logAudit } from "@/lib/admin-auth";

export async function GET(request: Request) {
  try {
    const admin = await getAdminUser(request);
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const priority = searchParams.get("priority") || "";
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from("support_tickets")
      .select(`
        *,
        user:profiles!support_tickets_user_id_fkey(display_name, email)
      `, { count: "exact" });

    if (status) query = query.eq("status", status);
    if (priority) query = query.eq("priority", priority);
    if (search) {
      query = query.or(`subject.ilike.%${search}%,user_email.ilike.%${search}%`);
    }

    const { data: tickets, count, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({ tickets: tickets || [], total: count || 0, page, limit });
  } catch (error: any) {
    if (error.message === "Unauthorized") return NextResponse.json({ error }, { status: 401 });
    if (error.message === "Forbidden") return NextResponse.json({ error }, { status: 403 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminUser(request);
    const body = await request.json();
    const { user_email, subject, priority = "medium" } = body;

    if (!user_email || !subject) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Try to find user by email
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .eq("email", user_email)
      .single();

    const newTicket = {
      user_id: profile?.id || null,
      user_email,
      subject,
      priority,
      status: "open",
    };

    const { data: ticket, error } = await supabaseAdmin
      .from("support_tickets")
      .insert(newTicket)
      .select()
      .single();

    if (error) throw error;

    await logAudit({
      adminId: admin.user.id,
      adminEmail: admin.email,
      action: "create_ticket",
      entityType: "support_ticket",
      entityId: ticket.id,
      newValue: ticket,
      request
    });

    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
