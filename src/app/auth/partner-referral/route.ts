import { NextResponse, type NextRequest } from "next/server";
import { getSessionUser } from "@/lib/api-auth";
import { partnerCookie, readVisit } from "@/lib/partner-referral";
import { supabaseAdmin } from "@/lib/supabase";
import { safeReturn } from "@/lib/auth-return";

export async function GET(request: NextRequest) {
  const path = request.nextUrl.searchParams.get("next") ?? "";
  const next = safeReturn(path);
  const response = NextResponse.redirect(new URL(request.nextUrl.origin + next));
  response.headers.set("Cache-Control", "private, no-store");
  try {
    const visit = readVisit(request.cookies.get(partnerCookie)?.value);
    if (visit) {
      const user = await getSessionUser(request);
      if (!user) return NextResponse.redirect(new URL("/login", request.url));
      // A partner can acquire new signups only. The timestamp comes from a signed visit cookie.
      if (Date.parse(user.created_at) >= visit.visitedAt) {
        const { error } = await supabaseAdmin.rpc("attribute_partner_link", { p_user_id: user.id, p_code: visit.code });
        if (error) throw new Error("Referral lookup failed");
      }
    }
    response.cookies.delete(partnerCookie);
    return response;
  } catch {
    return new Response("Your sign-in succeeded. Refresh this page to finish saving your referral.", {
      status: 503, headers: { "Cache-Control": "private, no-store" },
    });
  }
}
