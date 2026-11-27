import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { requireRole } from "@/lib/admin-auth";
import { attachKycProfiles, kycDocumentIdPattern, kycReviewRoles, maxKycPageSize } from "@/lib/admin-kyc";
import { removeArchivedKycFiles } from "@/lib/kyc-storage-cleanup";

async function verifyAdmin(request: Request) {
  try {
    const admin = await requireRole(request, kycReviewRoles);
    return { user: admin.user };
  } catch (e) {
    const m = (e as Error).message;
    return { error: m, status: m === "Unauthorized" ? 401 : 403 };
  }
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
    const requestedLimit = Number(searchParams.get("limit") ?? 50);
    const offset = Number(searchParams.get("offset") ?? 0);
    if (!Number.isSafeInteger(requestedLimit) || requestedLimit < 1 || !Number.isSafeInteger(offset) || offset < 0 || offset > 2_147_483_647 - maxKycPageSize) {
      return NextResponse.json({ error: "Invalid pagination parameters" }, { status: 400 });
    }
    const limit = Math.min(requestedLimit, maxKycPageSize);

    let query = supabaseAdmin
      .from("kyc_documents")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq("status", status);
    if (type) query = query.eq("document_type", type);
    if (country) query = query.eq("country", country);

    const { data, error, count } = await query;

    if (error) throw error;

    // Filter by search client-side for display_name/email
    let filtered = await attachKycProfiles(data);
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter((d) =>
        (d.profiles?.display_name || "").toLowerCase().includes(s) ||
        (d.profiles?.email || "").toLowerCase().includes(s) ||
        (d.document_number || "").toLowerCase().includes(s)
      );
    }

    return NextResponse.json({ documents: filtered, count: count || filtered.length });
  } catch {
    console.error("Unable to load KYC requests for the admin API");
    return NextResponse.json({ error: "Could not load KYC requests" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await verifyAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const contentType = request.headers.get("content-type")?.split(";")[0].trim().toLowerCase();
  if (contentType !== "application/json") {
    return NextResponse.json({ error: "Send the KYC batch as JSON" }, { status: 415 });
  }

  const body = await request.json().catch(() => null);
  const ids = body?.documentIds;
  if (!Array.isArray(ids) || ids.length < 1 || ids.length > maxKycPageSize
      || !ids.every((id): id is string => typeof id === "string" && kycDocumentIdPattern.test(id))) {
    return NextResponse.json({ error: "Choose a valid batch of KYC requests" }, { status: 400 });
  }

  const documentIds = [...new Set(ids.map((id) => id.toLowerCase()))];
  const archiveConfirmed = body.archiveConfirmed === true;
  const { data, error } = await supabaseAdmin.rpc(archiveConfirmed ? "approve_kyc_batch_archived" : "approve_kyc_batch", {
    p_document_ids: documentIds,
    p_admin_id: auth.user.id,
    p_admin_email: auth.user.email ?? null,
  });

  if (error) {
    console.error("Unable to bulk approve KYC requests", error.code);
    return NextResponse.json({ error: "Could not approve the KYC requests. Refresh the queue before retrying." }, { status: 500 });
  }

  const approved = data ?? [];
  const cleanup = archiveConfirmed
    ? await removeArchivedKycFiles(approved.map((row: { id: string }) => row.id))
    : undefined;
  return NextResponse.json({ approved, skippedCount: documentIds.length - approved.length, cleanup });
}

export async function PATCH(request: Request) {
  const auth = await verifyAdmin(request);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const { documentId, status, rejectionReason, adminNotes, action, archiveConfirmed } = await request.json();

    if (!documentId || !status) {
      return NextResponse.json({ error: "Missing documentId or status" }, { status: 400 });
    }

    if (archiveConfirmed === true) {
      if (status !== "approved" || typeof documentId !== "string" || !kycDocumentIdPattern.test(documentId)
          || (adminNotes !== undefined && (typeof adminNotes !== "string" || adminNotes.length > 4_000))) {
        return NextResponse.json({ error: "Choose a valid KYC request to approve and remove its files" }, { status: 400 });
      }

      const { data, error } = await supabaseAdmin.rpc("approve_kyc_batch_archived", {
        p_document_ids: [documentId],
        p_admin_id: auth.user.id,
        p_admin_email: auth.user.email ?? null,
        p_admin_notes: adminNotes ?? null,
      });
      if (error) {
        console.error("Unable to approve archived KYC request", error.code);
        return NextResponse.json({ error: "Could not approve the request. Refresh the queue before retrying." }, { status: 500 });
      }
      const approved = data?.[0];
      if (!approved) {
        return NextResponse.json({ error: "This request is no longer eligible for approval with file removal. Refresh the queue." }, { status: 409 });
      }

      const cleanup = await removeArchivedKycFiles([approved.id]);
      return NextResponse.json({ success: true, cleanup });
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

    if (!["pending", "reupload_requested"].includes(doc.status)) {
      return NextResponse.json({ error: "This request has already been reviewed. Refresh the queue." }, { status: 409 });
    }

    const { data: changed, error } = await supabaseAdmin
      .from("kyc_documents")
      .update(updateData)
      .eq("id", documentId)
      .eq("status", doc.status)
      .select("id")
      .maybeSingle();

    if (error) throw error;
    if (!changed) {
      return NextResponse.json({ error: "This request changed during review. Refresh the queue." }, { status: 409 });
    }

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

    // The trader's profile follows the decision; payouts check profiles.kyc_status.
    const profileStatus = status === "approved" ? "approved" : ["rejected", "reupload_requested", "expired"].includes(status) ? "rejected" : "pending";
    await supabaseAdmin.from("profiles").update({ kyc_status: profileStatus }).eq("id", doc.user_id);
    await supabaseAdmin.from("user_notifications").insert({
      user_id: doc.user_id,
      type: "kyc",
      title: profileStatus === "approved" ? "Identity verified" : profileStatus === "rejected" ? "Identity check needs attention" : "Identity check updated",
      body: profileStatus === "approved" ? "Your identity is verified. Payouts can now be sent to you." : rejectionReason ? `Reason: ${rejectionReason}` : "Please check your documents in Settings.",
      link: "/dashboard/settings",
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
