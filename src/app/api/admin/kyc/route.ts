import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function verifyAdmin(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"),
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "public-anon-key-placeholder"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized", status: 401 };

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return { error: "Forbidden", status: 403 };

  return { user };
}

export async function GET(request: Request) {
  const auth = await verifyAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const country = searchParams.get("country");
    const search = searchParams.get("search");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    let query = supabaseAdmin
      .from("kyc_documents")
      .select("*, profiles(id, email, display_name)", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq("status", status);
    if (type) query = query.eq("document_type", type);
    if (country) query = query.eq("country", country);

    const { data, error, count } = await query;

    if (error) throw error;

    // Filter by search client-side for display_name/email
    let filtered = data || [];
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter((d: any) =>
        (d.profiles?.display_name || "").toLowerCase().includes(s) ||
        (d.profiles?.email || "").toLowerCase().includes(s) ||
        (d.document_number || "").toLowerCase().includes(s)
      );
    }

    return NextResponse.json({ documents: filtered, count: count || filtered.length });
  } catch (error: any) {
    console.error("Admin KYC GET error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const auth = await verifyAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { documentId, status, rejectionReason, adminNotes, action } = await request.json();

    if (!documentId || !status) {
      return NextResponse.json({ error: "Missing documentId or status" }, { status: 400 });
    }

    const updateData: any = {
      status,
      reviewed_by: auth.user.id,
      reviewed_at: new Date().toISOString(),
    };

    if (rejectionReason !== undefined) updateData.rejection_reason = rejectionReason;
    if (adminNotes !== undefined) updateData.admin_notes = adminNotes;

    const { data: doc, error: fetchError } = await supabaseAdmin
      .from("kyc_documents")
      .select("*")
      .eq("id", documentId)
      .single();

    if (fetchError || !doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const { error } = await supabaseAdmin
      .from("kyc_documents")
      .update(updateData)
      .eq("id", documentId);

    if (error) throw error;

    // Log activity
    await supabaseAdmin.from("payment_activity_logs").insert({
      admin_id: auth.user.id,
      admin_email: auth.user.email,
      action: action || `kyc_${status}`,
      entity_type: "kyc_document",
      entity_id: documentId,
      old_value: { status: doc.status },
      new_value: updateData,
    });

    // Update KYC session status
    const { data: session } = await supabaseAdmin
      .from("kyc_verification_sessions")
      .select("*")
      .eq("user_id", doc.user_id)
      .single();

    if (session) {
      const allDocs = await supabaseAdmin
        .from("kyc_documents")
        .select("status")
        .eq("user_id", doc.user_id);

      const docs = allDocs.data || [];
      const allApproved = docs.length > 0 && docs.every((d: any) => d.status === "approved");
      const anyRejected = docs.some((d: any) => d.status === "rejected");

      let newStatus = "pending";
      if (allApproved) newStatus = "approved";
      else if (anyRejected) newStatus = "rejected";

      await supabaseAdmin
        .from("kyc_verification_sessions")
        .update({
          overall_status: newStatus,
          approved_at: allApproved ? new Date().toISOString() : null,
        })
        .eq("user_id", doc.user_id);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin KYC PATCH error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
