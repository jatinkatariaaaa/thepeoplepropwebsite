import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAdminUser, logAudit } from "@/lib/admin-auth";

export async function GET(request: Request) {
  try {
    await getAdminUser(request);

    const { data: settings, error } = await supabaseAdmin
      .from("admin_settings")
      .select("*");

    if (error) throw error;

    // Convert array of key-value rows to an object grouped by category
    const groupedSettings: Record<string, Record<string, string>> = {};
    
    settings?.forEach(setting => {
      if (!groupedSettings[setting.category]) {
        groupedSettings[setting.category] = {};
      }
      groupedSettings[setting.category][setting.key] = setting.value;
    });

    return NextResponse.json({ settings: groupedSettings, raw: settings || [] });
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
    const { updates } = body; // Array of { category, key, value }

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json({ error: "Missing or invalid updates array" }, { status: 400 });
    }

    // Get current settings for audit
    const keysToUpdate = updates.map(u => u.key);
    const { data: oldSettings } = await supabaseAdmin
      .from("admin_settings")
      .select("*")
      .in("key", keysToUpdate);

    // Upsert all settings
    const { data: newSettings, error } = await supabaseAdmin
      .from("admin_settings")
      .upsert(updates, { onConflict: "key" })
      .select();

    if (error) throw error;

    await logAudit({
      adminId: admin.user.id,
      adminEmail: admin.email,
      action: "update_settings",
      entityType: "admin_settings",
      oldValue: oldSettings,
      newValue: newSettings,
      request
    });

    return NextResponse.json({ success: true, settings: newSettings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
