import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { logAudit, requireRole } from "@/lib/admin-auth";
import { IssueError, issueCertificate, type IssueInput } from "@/lib/certificates/admin";
import { present } from "@/lib/certificates/present";
import type { CertificateRow } from "@/lib/certificates/types";

const fail = (error: unknown) => {
  if (error instanceof IssueError) return NextResponse.json({ error: error.message }, { status: 400 });
  const message = (error as Error).message || "Internal server error";
  return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500 });
};

const KINDS = ["phase_pass", "funded", "payout", "highest_payout", "award"];

/** Every certificate, newest first, with the trader's email. Filters: kind, status, q. */
export async function GET(request: Request) {
  try {
    await requireRole(request, ["super_admin", "finance", "support"]);
    const url = new URL(request.url);
    const kind = url.searchParams.get("kind");
    const status = url.searchParams.get("status");
    const q = (url.searchParams.get("q") || "").trim().replace(/[%,()]/g, "");

    let userIds: string[] | null = null;
    if (q.length >= 2) {
      const { data: people } = await supabaseAdmin.from("profiles").select("id").or(`email.ilike.%${q}%,display_name.ilike.%${q}%`).limit(50);
      userIds = (people ?? []).map((p) => p.id);
    }

    let query = supabaseAdmin.from("certificates").select("*").order("created_at", { ascending: false }).limit(300);
    if (kind && KINDS.includes(kind)) query = query.eq("kind", kind);
    if (status === "active" || status === "revoked") query = query.eq("status", status);
    if (q.length >= 2) {
      const byNumber = q.toUpperCase().startsWith("TPP-") ? q.toUpperCase() : null;
      query = byNumber ? query.eq("number", byNumber) : query.or(`trader_name.ilike.%${q}%${userIds?.length ? `,user_id.in.(${userIds.join(",")})` : ""}`);
    }
    const { data: rows, error } = await query;
    if (error) throw error;

    const ids = [...new Set((rows ?? []).map((r) => r.user_id))];
    const { data: profiles } = ids.length ? await supabaseAdmin.from("profiles").select("id, email").in("id", ids) : { data: [] };
    const emailOf = new Map((profiles ?? []).map((p) => [p.id, p.email]));

    const { data: counts } = await supabaseAdmin.from("certificates").select("kind, status");
    const tally: Record<string, number> = { total: 0, revoked: 0 };
    for (const c of counts ?? []) {
      if (c.status === "revoked") tally.revoked += 1;
      else {
        tally.total += 1;
        tally[c.kind] = (tally[c.kind] ?? 0) + 1;
      }
    }

    return NextResponse.json({
      certificates: ((rows ?? []) as CertificateRow[]).map((r) => ({ ...present(r), email: emailOf.get(r.user_id) ?? null, note: r.note, createdAt: r.created_at })),
      counts: tally,
    });
  } catch (error) {
    return fail(error);
  }
}

/** Issue a certificate. Body: IssueInput. */
export async function POST(request: Request) {
  try {
    const admin = await requireRole(request, ["super_admin", "finance"]);
    const body = (await request.json()) as IssueInput;
    const cert = await issueCertificate(body, admin.user.id);
    await logAudit({
      adminId: admin.user.id,
      adminEmail: admin.email,
      action: body.manualPayout ? "certificate_issued_with_manual_payout" : "certificate_issued",
      entityType: "certificate",
      entityId: cert.id,
      newValue: { kind: cert.kind, number: cert.number, userId: body.userId, amount: cert.amount, manualPayout: body.manualPayout ?? null },
      request,
    });
    return NextResponse.json({ certificate: cert });
  } catch (error) {
    return fail(error);
  }
}
