import type { NextRequest } from "next/server";
import { activePartnerLink, partnerCookie, readVisit, resolveLegacyRef } from "@/lib/partner-referral";

export async function GET(request: NextRequest) {
  const headers = { "Cache-Control": "private, no-store" };
  try {
    const visit = readVisit(request.cookies.get(partnerCookie)?.value);
    if (visit && await activePartnerLink(visit.code)) return Response.json({ partner_code: visit.code }, { headers });
    const affiliate = await resolveLegacyRef(request.cookies.get("tpp_affiliate")?.value);
    return Response.json(affiliate ? { affiliate_id: affiliate } : {}, { headers });
  } catch {
    return Response.json({ error: "Could not verify your referral. Please try again." }, { status: 503, headers });
  }
}
