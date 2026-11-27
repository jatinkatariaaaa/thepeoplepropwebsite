import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// The marketing pages render the same content for everyone. Session refresh can
// wait until an authenticated screen or auth-aware API is requested.
const PUBLIC_SECTIONS = new Set([
  "", "about", "aml-policy", "blog", "careers", "challenges", "contact",
  "contest", "cookie", "faqs", "heatmap", "help", "leaderboard", "payout-policy",
  "press", "privacy", "refund-policy", "reviews", "risk-disclosure", "rules",
  "status", "terms", "tools", "v2", "verify",
]);

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (PUBLIC_SECTIONS.has(path.split("/")[1]) || path === "/api/programs") {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // If Supabase env vars are not configured (e.g. preview environment),
  // skip auth checks so public pages still render.
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return supabaseResponse;
  }

  const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;
  const cookieOptions = cookieDomain ? { domain: cookieDomain } : undefined;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, cookieDomain ? { ...options, domain: cookieDomain } : options)
          );
        },
      },
      cookieOptions,
    }
  );

  // Verify the session here without a round trip to Supabase Auth: getClaims checks the access token's
  // ES256 signature against the project's published signing key (cached in memory) and its expiry. An
  // expired token is refreshed exactly as before, which keeps the cookies fresh for pages and API routes.
  // Routes that move money or grant access still confirm the session with Auth (getUser) themselves.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims ?? null;

  // If the user is not signed in and the current path is under /dashboard or /admin
  if (!user && (request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/admin'))) {
    // Redirect the user to the login page
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // If the user is signed in and on the login/signup pages, redirect to dashboard
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/signup')) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
