import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function getAdmin() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll(); } } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: adminRole } = await supabaseAdmin
    .from("admin_roles").select("role").eq("user_id", user.id).single();
  const { data: profile } = await supabaseAdmin
    .from("profiles").select("is_admin").eq("id", user.id).single();

  if (!adminRole && !profile?.is_admin) return null;
  return { id: user.id, email: user.email || "", role: adminRole?.role || "super_admin" };
}

async function logAudit(adminId: string, adminEmail: string, action: string, entityType: string, entityId?: string, oldValue?: any, newValue?: any) {
  await supabaseAdmin.from("audit_logs").insert({
    admin_id: adminId,
    admin_email: adminEmail,
    action,
    entity_type: entityType,
    entity_id: entityId,
    old_value: oldValue ? JSON.parse(JSON.stringify(oldValue)) : null,
    new_value: newValue ? JSON.parse(JSON.stringify(newValue)) : null,
  });
}

/* GET — Paginated user list with search/filter */
export async function GET(request: Request) {
  try {
    const admin = await getAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const kyc = searchParams.get("kyc") || "";
    const role = searchParams.get("role") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact" });

    if (search) {
      query = query.or(`email.ilike.%${search}%,display_name.ilike.%${search}%`);
    }
    if (status) {
      query = query.eq("status", status);
    }
    if (kyc) {
      query = query.eq("kyc_status", kyc);
    }
    if (role === "admin") {
      query = query.eq("is_admin", true);
    } else if (role === "user") {
      query = query.eq("is_admin", false);
    }

    const { data: users, count, error } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    return NextResponse.json({ users: users || [], total: count || 0, page, limit });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/* PATCH — Update user (status, KYC, suspend/ban) */
export async function PATCH(request: Request) {
  try {
    const admin = await getAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { userId, action, reason } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: "Missing userId or action" }, { status: 400 });
    }

    // Get current user state for audit log
    const { data: oldUser } = await supabaseAdmin
      .from("profiles").select("*").eq("id", userId).single();

    let updateData: any = {};
    let auditAction = "";

    switch (action) {
      case "suspend":
        updateData = { status: "suspended", suspended_reason: reason || "Suspended by admin" };
        auditAction = "suspend_user";
        break;
      case "ban":
        updateData = { status: "banned", suspended_reason: reason || "Banned by admin" };
        auditAction = "ban_user";
        break;
      case "unsuspend":
        updateData = { status: "active", suspended_reason: null };
        auditAction = "unsuspend_user";
        break;
      case "verify_kyc":
        updateData = { kyc_status: "verified" };
        auditAction = "verify_kyc";
        break;
      case "reject_kyc":
        updateData = { kyc_status: "rejected" };
        auditAction = "reject_kyc";
        break;
      case "toggle_admin":
        updateData = { is_admin: !oldUser?.is_admin };
        auditAction = oldUser?.is_admin ? "remove_admin" : "make_admin";
        break;
      case "update_profile":
        const { display_name, email } = body;
        if (display_name !== undefined) updateData.display_name = display_name;
        if (email !== undefined) updateData.email = email;
        auditAction = "update_user";
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("profiles").update(updateData).eq("id", userId);

    if (error) throw error;

    // Audit log
    await logAudit(admin.id, admin.email, auditAction, "user", userId, oldUser, { ...oldUser, ...updateData });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
