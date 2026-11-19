import { NextResponse } from "next/server";
import { requireRole } from "@/lib/admin-auth";
import { IssueError, certificateCandidates, searchTraders } from "@/lib/certificates/admin";

/** ?q= finds traders; ?userId= lists the trader's accounts and payouts for the issue form. */
export async function GET(request: Request) {
  try {
    await requireRole(request, ["super_admin", "finance"]);
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    if (userId) return NextResponse.json(await certificateCandidates(userId));
    return NextResponse.json({ traders: await searchTraders(url.searchParams.get("q") || "") });
  } catch (error) {
    if (error instanceof IssueError) return NextResponse.json({ error: error.message }, { status: 400 });
    const message = (error as Error).message || "Internal server error";
    return NextResponse.json({ error: message }, { status: message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500 });
  }
}
