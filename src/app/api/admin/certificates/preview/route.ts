import { NextResponse } from "next/server";
import { requireRole } from "@/lib/admin-auth";
import { IssueError, buildDraft, draftCertificate, type IssueInput } from "@/lib/certificates/admin";
import { renderCertificate } from "@/lib/certificates/render";

/** PNG of a certificate before it is issued, stamped PREVIEW. Same checks as issuing. */
export async function POST(request: Request) {
  try {
    await requireRole(request, ["super_admin", "finance"]);
    const { draft } = await buildDraft((await request.json()) as IssueInput);
    return await renderCertificate(draftCertificate(draft), { preview: true });
  } catch (error) {
    if (error instanceof IssueError) return NextResponse.json({ error: error.message }, { status: 400 });
    const message = (error as Error).message || "Internal server error";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500 });
  }
}
