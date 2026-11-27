import { NextResponse } from "next/server";
import { refreshSidebarFlags } from "@/lib/sidebar-flags";
import { supabaseAdmin } from "@/lib/supabase";
import { getAdminUser, requireRole, logAudit } from "@/lib/admin-auth";

export async function GET(request: Request) {
  try {
    await getAdminUser(request);

    // One kind of admin: every admin has a row in admin_roles, and triggers keep profiles.is_admin
    // in step with it (supabase/migrations/20261123130916_unify_admin_access.sql).
    const { data: adminRoles, error: rolesError } = await supabaseAdmin
      .from("admin_roles")
      .select("id, user_id, role, created_at")
      .order("created_at", { ascending: true });
    if (rolesError) throw rolesError;

    const roleUserIds = adminRoles?.map(r => r.user_id) || [];
    const profilesMap: Record<string, { email: string | null; display_name: string | null }> = {};
    if (roleUserIds.length > 0) {
      const { data: roleProfiles } = await supabaseAdmin
        .from("profiles")
        .select("id, email, display_name")
        .in("id", roleUserIds);
      roleProfiles?.forEach(p => { profilesMap[p.id] = p; });
    }

    const admins = (adminRoles || []).map(ar => ({
      id: ar.id,
      user_id: ar.user_id,
      role: ar.role,
      created_at: ar.created_at,
      email: profilesMap[ar.user_id]?.email,
      display_name: profilesMap[ar.user_id]?.display_name,
    }));

    // Belt and braces: anyone the admin check would still let in through profiles.is_admin alone
    // (only possible if the triggers were bypassed) is listed too, as the super admin they are.
    const { data: flagged } = await supabaseAdmin
      .from("profiles")
      .select("id, email, display_name, created_at")
      .eq("is_admin", true);
    for (const u of flagged || []) {
      if (roleUserIds.includes(u.id)) continue;
      admins.push({ id: `profile-${u.id}`, user_id: u.id, role: "super_admin", created_at: u.created_at, email: u.email, display_name: u.display_name });
    }

    return NextResponse.json({ admins });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireRole(request, ["super_admin"]);
    const body = await request.json();
    const { email, role } = body;
    
    if (!email || !role) {
      return NextResponse.json({ error: "Email and role are required" }, { status: 400 });
    }
    
    // Find user by email
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, email")
      .eq("email", email)
      .single();
      
    if (!profile) {
      return NextResponse.json({ error: "User not found with that email" }, { status: 404 });
    }
    
    // Check if role exists
    const { data: existingRole } = await supabaseAdmin
      .from("admin_roles")
      .select("*")
      .eq("user_id", profile.id)
      .maybeSingle();
      
    let result;
    
    if (existingRole) {
      // Update
      const { data, error } = await supabaseAdmin
        .from("admin_roles")
        .update({ role })
        .eq("user_id", profile.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      // Insert
      const { data, error } = await supabaseAdmin
        .from("admin_roles")
        .insert({ user_id: profile.id, role })
        .select()
        .single();
      if (error) throw error;
      result = data;
      
      // profiles.is_admin follows by trigger; set here too so older checks agree even before it runs.
      await supabaseAdmin.from("profiles").update({ is_admin: true }).eq("id", profile.id);
    }
    
    await logAudit({
      adminId: admin.user.id,
      adminEmail: admin.email,
      action: existingRole ? "update_admin_role" : "assign_admin_role",
      entityType: "admin_roles",
      entityId: result.id,
      oldValue: existingRole,
      newValue: result,
      request
    });
    
    refreshSidebarFlags();
    return NextResponse.json({ success: true, admin: result });
  } catch (error: any) {
    if (error.message === "Forbidden") return NextResponse.json({ error: "Only Super Admins can manage roles" }, { status: 403 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const admin = await requireRole(request, ["super_admin"]);
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get("user_id");
    
    if (!user_id) return NextResponse.json({ error: "user_id required" }, { status: 400 });
    
    if (user_id === admin.user.id) {
      return NextResponse.json({ error: "You cannot remove your own admin access" }, { status: 400 });
    }
    
    const { data: existingRole } = await supabaseAdmin
      .from("admin_roles")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();
      
    if (existingRole) {
      await supabaseAdmin.from("admin_roles").delete().eq("user_id", user_id);
    }
    
    // Always set profile to false
    await supabaseAdmin.from("profiles").update({ is_admin: false }).eq("id", user_id);
    
    await logAudit({
      adminId: admin.user.id,
      adminEmail: admin.email,
      action: "revoke_admin_role",
      entityType: "admin_roles",
      entityId: user_id,
      oldValue: existingRole,
      request
    });
    
    refreshSidebarFlags();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Forbidden") return NextResponse.json({ error: "Only Super Admins can manage roles" }, { status: 403 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
