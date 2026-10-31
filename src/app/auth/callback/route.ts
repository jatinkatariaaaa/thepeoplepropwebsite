import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard';

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
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Could not authenticate with Google`);
}
