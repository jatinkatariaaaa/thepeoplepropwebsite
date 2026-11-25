import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase";
import { provisionTradingAccountForPurchase } from "@/lib/account-provisioning";
import { LEGACY_REF_COOKIES, REF_COOKIE, isUuid, referralUrl, type ClaimResult, type ReferralSummary } from "@/lib/referral-link";

/**
 * Server side of the single referral link. The rules live in the database
 * (supabase/migrations/20261125000000_unified_referral_link.sql); this file
 * only moves values between cookies, the session and those functions.
 */

type CookieStore = Awaited<ReturnType<typeof cookies>>;
export type ReferralKind = "link" | "contest";

export async function getSessionUser() {
  const store = await cookies();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // read-only in some render paths; the middleware refreshes the session anyway
        }
      },
    },
  });
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function resolveReferralCode(code: string, kind: ReferralKind): Promise<string | null> {
  const { data, error } = await supabaseAdmin.rpc("resolve_referral_code", { p_code: code, p_kind: kind });
  if (error) {
    console.error("resolve_referral_code failed:", error.message);
    return null;
  }
  return isUuid(data) ? data : null;
}

/** Someone opened a referral link: remember who sent them, count the click, and take them to sign-up. */
export async function referralRedirect(request: NextRequest, code: string, kind: ReferralKind) {
  const url = new URL("/login", request.nextUrl.origin);
  url.searchParams.set("mode", "signup");
  const response = NextResponse.redirect(url);

  const referrer = await resolveReferralCode(code, kind);
  if (!referrer) return response;

  response.cookies.set({ name: REF_COOKIE, value: referrer, path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 90 });
  for (const name of LEGACY_REF_COOKIES) response.cookies.delete(name);

  const { error } = await supabaseAdmin.rpc("record_referral_click", { p_referrer: referrer });
  if (error) console.error("record_referral_click failed:", error.message);
  return response;
}

/**
 * After a login or sign-up, record the referral for a brand-new account (Google sign-ups
 * can't carry it in sign-up metadata; the database ignores existing accounts), then
 * forget it.
 */
export async function settleReferralCookie(userId: string, store: CookieStore) {
  const fresh = store.get(REF_COOKIE)?.value;
  let referrer = isUuid(fresh) ? fresh : null;
  if (!referrer) {
    const oldLink = store.get("tpp_affiliate")?.value;
    const oldContest = store.get("tpp_contest_ref")?.value;
    referrer = (oldLink && (await resolveReferralCode(oldLink, "link"))) || (oldContest && (await resolveReferralCode(oldContest, "contest"))) || null;
  }

  if (referrer) {
    const { error } = await supabaseAdmin.rpc("attribute_referral", { p_user: userId, p_referrer: referrer });
    if (error) console.error("attribute_referral failed:", error.message);
  }

  forgetReferralCookies(store);
}

/** Drop the referral-link cookies (new and old names) once they have done their job. */
export function forgetReferralCookies(store: CookieStore) {
  for (const name of [REF_COOKIE, ...LEGACY_REF_COOKIES]) {
    if (store.has(name)) store.delete(name);
  }
}

export type ReferralTerms = { target: number; program: string; size: number };

/** The campaign terms from admin settings, with the values it launched with as defaults. */
export async function getReferralTerms(): Promise<ReferralTerms> {
  const terms: ReferralTerms = { target: 20, program: "3-step", size: 10000 };
  try {
    const { data } = await supabaseAdmin
      .from("admin_settings")
      .select("key, value")
      .in("key", ["referral_reward_target", "referral_reward_program", "referral_reward_size"]);
    for (const row of data ?? []) {
      if (row.key === "referral_reward_target" && Number(row.value) > 0) terms.target = Math.round(Number(row.value));
      if (row.key === "referral_reward_program" && typeof row.value === "string" && row.value.trim()) terms.program = row.value.trim();
      if (row.key === "referral_reward_size" && Number(row.value) > 0) terms.size = Number(row.value);
    }
  } catch (error) {
    console.error("Referral terms unavailable, using defaults:", error);
  }
  return terms;
}

export async function getReferralSummary(userId: string): Promise<ReferralSummary | null> {
  const { data, error } = await supabaseAdmin.rpc("referral_summary", { p_user: userId });
  if (error) throw error;
  if (!data) return null;
  return { ...(data as Omit<ReferralSummary, "link">), link: referralUrl((data as { code: string }).code) };
}

/** Claims the free account and creates it on the trading platform. Safe to call again if creation failed. */
export async function claimReferralReward(userId: string): Promise<ClaimResult> {
  const { data, error } = await supabaseAdmin.rpc("claim_referral_reward", { p_user: userId });
  if (error) {
    console.error("claim_referral_reward failed:", error.message);
    return { ok: false, reason: "error", message: "We couldn't process your claim. Please try again." };
  }

  const result = data as { ok: boolean; reason?: "not_enough" | "already_claimed"; verified?: number; target?: number; purchaseId?: string };
  if (!result.ok && result.reason === "not_enough") {
    return { ok: false, reason: "not_enough", verified: result.verified, target: result.target, message: `You have ${result.verified} of ${result.target} verified sign-ups.` };
  }

  // A fresh claim, or an earlier one whose account wasn't created yet: make sure the account exists.
  const { data: purchase } = await supabaseAdmin
    .from("purchases")
    .select("id, user_id, email, program_key, account_size")
    .eq("user_id", userId)
    .eq("payment_method", "referral_reward")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!purchase) {
    return { ok: false, reason: "already_claimed", message: "Your reward has already been claimed." };
  }

  try {
    const { account, created } = await provisionTradingAccountForPurchase(purchase);
    if (!result.ok && !created) {
      return { ok: false, reason: "already_claimed", message: "Your reward has already been claimed." };
    }
    return { ok: true, accountId: typeof account?.id === "string" ? account.id : null, provisioned: true, message: "Your free account is ready." };
  } catch (err) {
    console.error("Referral reward provisioning failed:", err);
    return {
      ok: true,
      accountId: null,
      provisioned: false,
      message: "Your reward is reserved. The account is still being set up; try again in a few minutes or contact support.",
    };
  }
}
