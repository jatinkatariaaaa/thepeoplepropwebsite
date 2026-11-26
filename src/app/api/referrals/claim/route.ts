import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { claimReferralReward, getSessionUser } from "@/lib/referrals";
import { DEVICE_COOKIE, readSignal, recordAccountSignal } from "@/lib/network-signal";

export const dynamic = "force-dynamic";

/**
 * POST /api/referrals/claim — claim the free account once enough sign-ups count.
 * The claimer's own connection is recorded first, so sign-ups made from it don't count.
 */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, reason: "error", message: "Authentication required" }, { status: 401 });

  await recordAccountSignal(user.id, readSignal(request.headers, (await cookies()).get(DEVICE_COOKIE)?.value));

  const result = await claimReferralReward(user.id);
  return NextResponse.json(result, { status: result.ok ? 200 : result.reason === "error" ? 500 : result.reason === "held" ? 202 : 400 });
}
