import { NextResponse, after } from "next/server";
import { cookies, headers } from "next/headers";
import { getReferralSummary, getSessionUser } from "@/lib/referrals";
import { DEVICE_COOKIE, readSignal, recordAccountSignal } from "@/lib/network-signal";

export const dynamic = "force-dynamic";

/** GET /api/referrals — the signed-in user's link, contest progress and affiliate numbers. */
export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  // The contest compares friends' sign-ups with the connections the referrer uses; note this one
  // after the response is sent.
  const signal = readSignal(await headers(), (await cookies()).get(DEVICE_COOKIE)?.value);
  after(() => recordAccountSignal(user.id, signal));

  try {
    const summary = await getReferralSummary(user.id);
    if (!summary) return NextResponse.json({ error: "No referral account" }, { status: 404 });
    return NextResponse.json(summary, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Referral summary failed:", error);
    return NextResponse.json({ error: "Couldn't load your referrals" }, { status: 500 });
  }
}
