import type { NextRequest } from "next/server";
import { referralRedirect } from "@/lib/referrals";

/**
 * GET /ref/<code> — the one referral link. A sign-up through it counts toward the
 * referrer's contest progress and, when the friend buys a challenge, earns commission.
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return referralRedirect(request, id, "link");
}
