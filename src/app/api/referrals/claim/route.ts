import { NextResponse } from "next/server";
import { claimReferralReward, getSessionUser } from "@/lib/referrals";

export const dynamic = "force-dynamic";

/** POST /api/referrals/claim — claim the free account once the verified sign-ups reach the target. */
export async function POST() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ ok: false, reason: "error", message: "Authentication required" }, { status: 401 });

  const result = await claimReferralReward(user.id);
  return NextResponse.json(result, { status: result.ok ? 200 : result.reason === "error" ? 500 : 400 });
}
