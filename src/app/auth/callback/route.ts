import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { partnerCookie } from '@/lib/partner-referral';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // "next" may only be a path on this site: "@evil.com" or "//evil.com" would turn the redirect into an outside URL.
  const wanted = searchParams.get('next') ?? '';
  const next = /^\/(?![\/\\])/.test(wanted) ? wanted : '/dashboard';

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;
            cookieStore.set({ name, value, ...options, ...(cookieDomain && { domain: cookieDomain }) });
          },
          remove(name: string, options: CookieOptions) {
            const cookieDomain = process.env.NEXT_PUBLIC_COOKIE_DOMAIN;
            cookieStore.delete({ name, ...options, ...(cookieDomain && { domain: cookieDomain }) });
          },
        },
      }
    );
    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Check for contest referral cookie and track it
      const contestRef = cookieStore.get('tpp_contest_ref')?.value;
      if (contestRef && data?.session?.user) {
        try {
          await fetch(`${origin}/api/contest/track`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              referral_code: contestRef,
              user_id: data.session.user.id,
              email: data.session.user.email || '',
            }),
          });
          // Clear the cookie after tracking
          cookieStore.delete('tpp_contest_ref');
        } catch (e) {
          console.error('Contest tracking error:', e);
        }
      }
      if (cookieStore.has(partnerCookie)) {
        // The session has already been exchanged. A transient error on the next
        // step can now be retried without replaying the one-time OAuth code.
        const finish = new URL('/auth/partner-referral', origin);
        finish.searchParams.set('next', next);
        return NextResponse.redirect(finish);
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate with Google`);
}
