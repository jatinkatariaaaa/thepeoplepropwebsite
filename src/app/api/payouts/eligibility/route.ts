import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/api-auth";
import { checkPayout } from "@/lib/payouts";

/** What a trader can withdraw from an account right now, and what stands in the way. */
export async function GET(request: Request) {
  try {
    const user = await getSessionUser(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const accountId = new URL(request.url).searchParams.get("accountId");
    if (!accountId) return NextResponse.json({ error: "accountId is required" }, { status: 400 });
    const { settings: _settings, ...check } = await checkPayout(user.id, accountId);
    return NextResponse.json(check);
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 400 });
  }
}
