import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAdminUser, logAudit } from "@/lib/admin-auth";

export async function GET(request: Request) {
  try {
    await getAdminUser(request);

    const { data: pages, error } = await supabaseAdmin
      .from("cms_content")
      .select("*")
      .order("page_key", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ pages: pages || [] });
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
    const { page_key, title, content, meta_title, meta_description, is_published } = body;

    if (!page_key) {
      return NextResponse.json({ error: "Missing page_key" }, { status: 400 });
    }

    // Get old data for audit
    const { data: oldPage } = await supabaseAdmin
      .from("cms_content")
      .select("*")
      .eq("page_key", page_key)
      .single();

    const updateData: any = {
      updated_by: admin.user.id,
      updated_at: new Date().toISOString(),
    };

    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (meta_title !== undefined) updateData.meta_title = meta_title;
    if (meta_description !== undefined) updateData.meta_description = meta_description;
    if (is_published !== undefined) updateData.is_published = is_published;

    const { data: page, error } = await supabaseAdmin
      .from("cms_content")
      .update(updateData)
      .eq("page_key", page_key)
      .select()
      .single();

    if (error) throw error;

    await logAudit({
      adminId: admin.user.id,
      adminEmail: admin.email,
      action: "update_cms",
      entityType: "cms_content",
      entityId: page_key,
      oldValue: oldPage,
      newValue: page,
      request
    });

    return NextResponse.json({ success: true, page });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
