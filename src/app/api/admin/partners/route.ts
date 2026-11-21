import { NextResponse } from "next/server";
import { logAudit, requireRole } from "@/lib/admin-auth";
import { isUuid } from "@/lib/certificates/types";
import { supabaseAdmin } from "@/lib/supabase";

class PartnerError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

async function findAffiliate(email: unknown) {
  if (typeof email !== "string") throw new PartnerError("Enter a valid affiliate email.");
  const address = email.trim().toLowerCase();
  if (!address) return null;
  if (address.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address)) {
    throw new PartnerError("Enter a valid affiliate email.");
  }
  const { data: profile, error: profileError } = await supabaseAdmin.from("profiles")
    .select("id").eq("email", address).maybeSingle();
  if (profileError) throw profileError;
  if (!profile) throw new PartnerError("No website account matches that email.");
  const { data: affiliate, error: affiliateError } = await supabaseAdmin.from("affiliates")
    .select("user_id").eq("user_id", profile.id).eq("status", "active").maybeSingle();
  if (affiliateError) throw affiliateError;
  if (!affiliate) throw new PartnerError("That website account needs an active affiliate profile.");
  return profile.id as string;
}

export async function POST(request: Request) {
  try {
    const admin = await requireRole(request, ["super_admin"]);
    if (!request.headers.get("content-type")?.startsWith("application/json")) {
      throw new PartnerError("Send a JSON request.", 415);
    }
    const body = await request.json().catch(() => null) as Record<string, unknown> | null;
    if (!body || typeof body !== "object") throw new PartnerError("Invalid request.");
    const audit = { adminId: admin.user.id, adminEmail: admin.email, request };

    if (body.action === "approve") {
      const displayName = typeof body.displayName === "string" ? body.displayName.trim() : "";
      if (displayName.length < 2 || displayName.length > 80 || /[\r\n\t]/.test(displayName)) {
        throw new PartnerError("Enter a collaborator name between 2 and 80 characters.");
      }
      if (typeof body.collaboratorId !== "string" || !isUuid(body.collaboratorId)) {
        throw new PartnerError("Invalid collaborator ID.");
      }
      const affiliateUserId = await findAffiliate(body.affiliateEmail);
      const { data, error } = await supabaseAdmin.from("partner_collaborators").upsert({
        id: body.collaboratorId,
        display_name: displayName,
        affiliate_user_id: affiliateUserId,
        approved_by: admin.user.id,
      }, { onConflict: "id", ignoreDuplicates: true }).select("id").maybeSingle();
      if (error?.code === "23505") throw new PartnerError("That affiliate is already linked to a collaborator.", 409);
      if (error) throw error;
      if (data) {
        await logAudit({ ...audit, action: "partner_approved", entityType: "partner_collaborator", entityId: data.id });
      }
      return NextResponse.json({ id: body.collaboratorId }, { status: data ? 201 : 200 });
    }

    const collaboratorId = typeof body.collaboratorId === "string" ? body.collaboratorId : "";
    if (!isUuid(collaboratorId)) throw new PartnerError("Invalid collaborator ID.");
    const { data: collaborator, error: lookupError } = await supabaseAdmin.from("partner_collaborators")
      .select("id").eq("id", collaboratorId).maybeSingle();
    if (lookupError) throw lookupError;
    if (!collaborator) throw new PartnerError("Collaborator not found.", 404);

    if (body.action === "set_affiliate") {
      const affiliateUserId = await findAffiliate(body.affiliateEmail);
      const { error } = await supabaseAdmin.from("partner_collaborators")
        .update({ affiliate_user_id: affiliateUserId }).eq("id", collaboratorId);
      if (error?.code === "23505") throw new PartnerError("That affiliate is already linked to a collaborator.", 409);
      if (error) throw error;
      await logAudit({ ...audit, action: "partner_affiliate_updated", entityType: "partner_collaborator", entityId: collaboratorId });
      return NextResponse.json({ id: collaboratorId });
    }

    if (body.action === "issue") {
      const { data, error } = await supabaseAdmin.from("partner_certificates")
        .insert({ collaborator_id: collaboratorId, issued_by: admin.user.id })
        .select("id").single();
      if (error?.code === "23505") throw new PartnerError("This collaborator already has an active certificate.", 409);
      if (error) throw error;
      await logAudit({ ...audit, action: "partner_certificate_issued", entityType: "partner_certificate", entityId: data.id, newValue: { collaboratorId } });
      return NextResponse.json({ id: data.id }, { status: 201 });
    }

    if (body.action === "revoke") {
      if (typeof body.certificateId !== "string" || !isUuid(body.certificateId)) throw new PartnerError("Invalid certificate ID.");
      const { data, error } = await supabaseAdmin.from("partner_certificates")
        .update({ revoked_at: new Date().toISOString(), revoked_by: admin.user.id })
        .eq("id", body.certificateId).eq("collaborator_id", collaboratorId).is("revoked_at", null)
        .select("id").maybeSingle();
      if (error) throw error;
      if (!data) throw new PartnerError("Active certificate not found.", 404);
      await logAudit({ ...audit, action: "partner_certificate_revoked", entityType: "partner_certificate", entityId: data.id });
      return NextResponse.json({ id: data.id });
    }

    throw new PartnerError("Unknown Partner Program action.");
  } catch (error) {
    if (error instanceof PartnerError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof Error && (error.message === "Unauthorized" || error.message === "Forbidden")) {
      return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 403 });
    }
    console.error("Partner Program request failed", error);
    return NextResponse.json({ error: "Partner Program is temporarily unavailable." }, { status: 500 });
  }
}
