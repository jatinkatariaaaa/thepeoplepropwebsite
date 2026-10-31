import { NextResponse } from "next/server";

/**
 * GET /ref/contest/[code]
 * Sets a tpp_contest_ref cookie with the referral code and redirects to signup.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const url = new URL(request.url);
  const signupUrl = new URL("/login", url.origin);
  signupUrl.searchParams.set("redirect", "/contest");

  const response = NextResponse.redirect(signupUrl);
  response.cookies.set({
    name: "tpp_contest_ref",
    value: code,
    httpOnly: false,
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return response;
}
