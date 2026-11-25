import type { NextRequest } from "next/server";
import { activePartnerLink, partnerCookie, readVisit, resolveLegacyRef } from "@/lib/partner-referral";
import { REF_COOKIE } from "@/lib/referral-link";
import { resolveReferralCode } from "@/lib/referrals";

export async function GET(request: NextRequest) {
  const headers = { "Cache-Control": "private, no-store" };
  try {
    const visit = readVisit(request.cookies.get(partnerCookie)?.value);
    if (visit && await activePartnerLink(visit.code)) return Response.json({ partner_code: visit.code }, { headers });
    // The referral link (/ref/<code>) stores the referrer's id in tpp_ref. Links opened before it
    // was introduced left one of the two older cookies instead.
    const contestCode = request.cookies.get("tpp_contest_ref")?.value;
    const affiliate =
      (await resolveLegacyRef(request.cookies.get(REF_COOKIE)?.value)) ??
      (await resolveLegacyRef(request.cookies.get("tpp_affiliate")?.value)) ??
      (contestCode ? await resolveReferralCode(contestCode, "contest") : null);
    return Response.json(affiliate ? { affiliate_id: affiliate } : {}, { headers });
  } catch {
    return Response.json({ error: "Could not verify your referral. Please try again." }, { status: 503, headers });
  }
}
