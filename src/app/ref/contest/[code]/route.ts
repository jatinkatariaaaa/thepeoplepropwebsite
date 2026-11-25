import type { NextRequest } from "next/server";
import { referralRedirect } from "@/lib/referrals";

/** GET /ref/contest/<code> — contest links shared before the two links were merged. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return referralRedirect(request, code, "contest");
}
