import { NextResponse, type NextRequest } from "next/server";
import { activePartnerLink, createVisit, partnerCookie, readVisit, referralLifetime, resolveLegacyRef } from "@/lib/partner-referral";
import { REF_COOKIE } from "@/lib/referral-link";
import { resolveReferralCode } from "@/lib/referrals";

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const destination = new URL("/", request.url);
  const response = NextResponse.redirect(destination);
  response.headers.set("Cache-Control", "private, no-store");
  try {
    if (!await activePartnerLink(code)) {
      return new Response("This partner link is unavailable.", { status: 404, headers: { "Cache-Control": "no-store" } });
    }
    const existing = readVisit(request.cookies.get(partnerCookie)?.value);
    if (existing && await activePartnerLink(existing.code)) return response;
    // First touch wins: a referral link opened earlier (new or old cookie) keeps this visitor.
    if (await resolveLegacyRef(request.cookies.get(REF_COOKIE)?.value)) return response;
    if (await resolveLegacyRef(request.cookies.get("tpp_affiliate")?.value)) return response;
    const contestCode = request.cookies.get("tpp_contest_ref")?.value;
    if (contestCode && (await resolveReferralCode(contestCode, "contest"))) return response;
    response.cookies.set(partnerCookie, createVisit(code), {
      path: "/", sameSite: "lax", secure: request.nextUrl.protocol === "https:", maxAge: referralLifetime,
    });
    return response;
  } catch {
    return new Response("Could not verify this link. Refresh to retry.", { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
