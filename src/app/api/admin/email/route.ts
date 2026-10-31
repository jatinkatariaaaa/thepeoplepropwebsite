import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAdminUser, logAudit } from "@/lib/admin-auth";

export async function GET(request: Request) {
  try {
    await getAdminUser(request);

    const [settingsRes, templatesRes] = await Promise.all([
      supabaseAdmin.from("email_settings").select("*").limit(1).single(),
      supabaseAdmin.from("email_templates").select("*").order("slug", { ascending: true }),
    ]);

    return NextResponse.json({
      settings: settingsRes.data || null,
      templates: templatesRes.data || [],
    });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const admin = await getAdminUser(request);
    const body = await request.json();
    
    // Check if updating settings or template
    if (body.type === "template") {
      const { slug, subject, body_html, is_active } = body;
      
      const { data: oldTemplate } = await supabaseAdmin.from("email_templates").select("*").eq("slug", slug).single();
      
      const { data: template, error } = await supabaseAdmin
        .from("email_templates")
        .update({ subject, body_html, is_active, updated_at: new Date().toISOString() })
        .eq("slug", slug)
        .select()
        .single();
        
      if (error) throw error;
      
      await logAudit({
        adminId: admin.user.id,
        adminEmail: admin.email,
        action: "update_email_template",
        entityType: "email_templates",
        entityId: slug,
        oldValue: oldTemplate,
        newValue: template,
        request
      });
      
      return NextResponse.json({ success: true, template });
    } 
    else if (body.type === "settings") {
      const { smtp_host, smtp_port, smtp_user, smtp_pass, from_email, from_name } = body;
      
      const { data: oldSettings } = await supabaseAdmin.from("email_settings").select("*").limit(1).single();
      
      const updateData = {
        smtp_host, smtp_port, smtp_user, smtp_pass, from_email, from_name,
        is_configured: !!(smtp_host && smtp_port && smtp_user && smtp_pass && from_email),
        updated_at: new Date().toISOString()
      };
      
      const { data: settings, error } = await supabaseAdmin
        .from("email_settings")
        .update(updateData)
        .eq("id", oldSettings?.id)
        .select()
        .single();
        
      if (error) throw error;
      
      await logAudit({
        adminId: admin.user.id,
        adminEmail: admin.email,
        action: "update_email_settings",
        entityType: "email_settings",
        entityId: settings.id,
        oldValue: oldSettings,
        newValue: settings,
        request
      });
      
      return NextResponse.json({ success: true, settings });
    }
    
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const admin = await getAdminUser(request);
    const { to_email } = await request.json();
    
    if (!to_email) return NextResponse.json({ error: "to_email required" }, { status: 400 });
    
    // In a real app, you would use nodemailer here with the settings from DB
    // For Phase 1, we just return success
    
    await logAudit({
      adminId: admin.user.id,
      adminEmail: admin.email,
      action: "send_test_email",
      entityType: "system",
      newValue: { to: to_email },
      request
    });
    
    return NextResponse.json({ success: true, message: "Test email simulated successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
