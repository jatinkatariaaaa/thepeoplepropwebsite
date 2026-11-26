import { NextResponse } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { activePartnerLink, partnerCookie, readVisit } from '@/lib/partner-referral';
import { forgetReferralCookies, settleReferralCookie } from '@/lib/referrals';
import { DEVICE_COOKIE, DEVICE_COOKIE_OPTIONS, isDeviceId, newDeviceId, readSignal, recordAccountSignal } from '@/lib/network-signal';

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
      // Record who referred a brand-new account (Google sign-ups carry no metadata), then forget the link.
      // First touch wins: partner links never replace an earlier referral link, so a live partner visit
      // in the cookies came first and /auth/partner-referral decides this account instead.
      if (data?.session?.user) {
        try {
          const visit = readVisit(cookieStore.get(partnerCookie)?.value);
          if (visit && (await activePartnerLink(visit.code))) forgetReferralCookies(cookieStore);
          else await settleReferralCookie(data.session.user.id, cookieStore);
        } catch (e) {
          console.error('Referral recording error:', e);
        }
        // Where this login or sign-up came from (connection and browser). For a brand-new referred
        // account this is its sign-up network, which the contest checks; it runs after the referral
        // is recorded above. It never blocks the login.
        let device = cookieStore.get(DEVICE_COOKIE)?.value;
        if (!isDeviceId(device)) {
          device = newDeviceId();
          cookieStore.set(DEVICE_COOKIE, device, DEVICE_COOKIE_OPTIONS);
        }
        await recordAccountSignal(data.session.user.id, readSignal(request.headers, device));
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
