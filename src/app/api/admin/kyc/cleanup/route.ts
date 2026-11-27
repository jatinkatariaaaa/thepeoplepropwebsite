import { NextResponse } from "next/server";
import { requireRole } from "@/lib/admin-auth";
import { kycDocumentIdPattern, kycReviewRoles } from "@/lib/admin-kyc";
import { removeArchivedKycFiles } from "@/lib/kyc-storage-cleanup";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    await requireRole(request, kycReviewRoles);
  } catch (error) {
    const unauthorized = error instanceof Error && error.message === "Unauthorized";
    return NextResponse.json({ error: unauthorized ? "Unauthorized" : "Forbidden" }, { status: unauthorized ? 401 : 403 });
  }

  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    return NextResponse.json({ error: "Send the request ID as JSON" }, { status: 415 });
  }
  const body = await request.json().catch(() => null);
  const documentId = body?.documentId;
  if (typeof documentId !== "string" || !kycDocumentIdPattern.test(documentId)) {
    return NextResponse.json({ error: "Choose a valid KYC request" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin.from("kyc_documents")
    .select("id, storage_cleanup_completed_at")
    .eq("id", documentId)
    .eq("status", "approved")
    .not("storage_cleanup_requested_at", "is", null)
    .maybeSingle();
  if (error) {
    console.error("Unable to find archived KYC cleanup request", error.code);
    return NextResponse.json({ error: "Could not load the file removal request" }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "File removal was not confirmed for this request" }, { status: 404 });
  }

  const cleanup = data.storage_cleanup_completed_at
    ? [{ id: data.id, status: "removed" }]
    : await removeArchivedKycFiles([data.id]);
  return NextResponse.json({ cleanup });
}
