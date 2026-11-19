import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { logAudit, requireRole } from "@/lib/admin-auth";
import { isUuid } from "@/lib/certificates/types";

const fail = (error: unknown) => {
  const message = (error as Error).message || "Internal server error";
  return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500 });
};

/** Revoke, restore, or correct the printed name. Body: { action: "revoke", reason } | { action: "restore" } | { action: "rename", traderName }. */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireRole(request, ["super_admin", "finance"]);
    const { id } = await params;
    if (!isUuid(id)) return NextResponse.json({ error: "Certificate not found." }, { status: 404 });
    const body = await request.json();
    const { data: before } = await supabaseAdmin.from("certificates").select("*").eq("id", id).maybeSingle();
    if (!before) return NextResponse.json({ error: "Certificate not found." }, { status: 404 });

    let patch: Record<string, unknown>;
    if (body.action === "revoke") {
      const reason = String(body.reason || "").trim().slice(0, 200);
      if (reason.length < 3) return NextResponse.json({ error: "Say why it is being revoked; the reason shows on the verification page." }, { status: 400 });
      patch = { status: "revoked", revoked_reason: reason, revoked_at: new Date().toISOString() };
    } else if (body.action === "restore") {
      if (before.kind === "payout" && before.payout_id) {
        const { data: p } = await supabaseAdmin.from("payouts").select("status").eq("id", before.payout_id).maybeSingle();
        if (p?.status !== "paid") return NextResponse.json({ error: "The payout behind this certificate is no longer paid." }, { status: 400 });
      }
      patch = { status: "active", revoked_reason: null, revoked_at: null };
    } else if (body.action === "rename") {
      const name = String(body.traderName || "").trim().slice(0, 80);
      if (name.length < 2) return NextResponse.json({ error: "Enter the name to print." }, { status: 400 });
      patch = { trader_name: name };
    } else {
      return NextResponse.json({ error: "Unknown action." }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.from("certificates").update(patch).eq("id", id).select("id, status, trader_name").single();
    if (error) {
      const message = error.code === "23505" ? "Another live certificate already covers this record. Revoke that one first." : error.message;
      return NextResponse.json({ error: message }, { status: 400 });
    }
    await logAudit({ adminId: admin.user.id, adminEmail: admin.email, action: `certificate_${body.action}`, entityType: "certificate", entityId: id, oldValue: { status: before.status, trader_name: before.trader_name }, newValue: patch, request });
    return NextResponse.json({ certificate: data });
  } catch (error) {
    return fail(error);
  }
}

/** Delete a test certificate. Real certificates are never deleted, only revoked. */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireRole(request, ["super_admin", "finance"]);
    const { id } = await params;
    if (!isUuid(id)) return NextResponse.json({ error: "Certificate not found." }, { status: 404 });
    const { data: cert } = await supabaseAdmin.from("certificates").select("id, number, is_test").eq("id", id).maybeSingle();
    if (!cert) return NextResponse.json({ error: "Certificate not found." }, { status: 404 });
    if (!cert.is_test) return NextResponse.json({ error: "Only test certificates can be deleted. Revoke a real one instead." }, { status: 400 });
    const { error } = await supabaseAdmin.from("certificates").delete().eq("id", id).eq("is_test", true);
    if (error) throw error;
    await logAudit({ adminId: admin.user.id, adminEmail: admin.email, action: "certificate_test_deleted", entityType: "certificate", entityId: id, oldValue: { number: cert.number }, request });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return fail(error);
  }
}
