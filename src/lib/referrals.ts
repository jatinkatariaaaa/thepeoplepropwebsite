import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseAdmin } from "@/lib/supabase";
import { provisionTradingAccountForPurchase } from "@/lib/account-provisioning";
import { LEGACY_REF_COOKIES, REF_COOKIE, isUuid, referralUrl, type ClaimResult, type ReferralSummary } from "@/lib/referral-link";
import { DEVICE_COOKIE, DEVICE_COOKIE_OPTIONS, isDeviceId, newDeviceId } from "@/lib/network-signal";

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
  // the browser gets its device id before it signs up, so sign-ups made in one browser can be told apart
  if (!isDeviceId(request.cookies.get(DEVICE_COOKIE)?.value)) response.cookies.set(DEVICE_COOKIE, newDeviceId(), DEVICE_COOKIE_OPTIONS);

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

  const result = data as {
    ok: boolean;
    reason?: "not_enough" | "already_claimed" | "held" | "rejected";
    note?: string | null;
    verified?: number;
    target?: number;
    purchaseId?: string;
  };
  if (!result.ok && result.reason === "not_enough") {
    return { ok: false, reason: "not_enough", verified: result.verified, target: result.target, message: `You have ${result.verified} of ${result.target} sign-ups that count.` };
  }
  if (!result.ok && result.reason === "held") {
    return {
      ok: false,
      reason: "held",
      verified: result.verified,
      target: result.target,
      message: "Thanks! Our team is checking your sign-ups. Your free account is created as soon as the claim is approved, usually within 24 hours.",
    };
  }
  if (!result.ok && result.reason === "rejected") {
    return { ok: false, reason: "rejected", message: result.note ? `Your claim was declined: ${result.note}` : "Your claim was declined after review. Contact support if you think this is a mistake." };
  }

  return ensureRewardAccount(userId, result.ok);
}

export type ClaimDecision = "approve" | "reject" | "reset";

/**
 * Admin decision on a claim: 'approve' gives the free account (and creates it on the trading
 * platform), 'reject' declines it with a note the trader sees, 'reset' lets them claim again.
 * The trader is told either way.
 */
export async function reviewReferralClaim(userId: string, adminId: string, decision: ClaimDecision, note?: string | null) {
  const { data, error } = await supabaseAdmin.rpc("review_referral_claim", { p_user: userId, p_admin: adminId, p_decision: decision, p_note: note?.trim() || null });
  if (error) throw new Error(error.message);
  const result = data as { ok: boolean; reason?: string };
  if (!result.ok) {
    return { ok: false, message: result.reason === "already_claimed" ? "This reward was already given." : "There is no claim to review." };
  }

  if (decision === "approve") {
    const account = await ensureRewardAccount(userId, true);
    await supabaseAdmin.from("user_notifications").insert({
      user_id: userId,
      type: "contest_reward",
      title: "Your free account is approved",
      body: account.ok && account.provisioned ? "Your contest reward account is ready to trade." : "Your contest reward is approved and the account is being set up.",
      link: "/dashboard/contest",
    });
    return { ok: true, message: account.ok && account.provisioned ? "Approved. The account is created." : account.message };
  }
  if (decision === "reject") {
    await supabaseAdmin.from("user_notifications").insert({
      user_id: userId,
      type: "contest_reward",
      title: "Contest claim declined",
      body: note?.trim() ? note.trim().slice(0, 140) : "Too many of your sign-ups failed our checks.",
      link: "/dashboard/contest",
    });
    return { ok: true, message: "Claim declined." };
  }
  return { ok: true, message: "The trader can claim again." };
}

/** The reward purchase exists: make sure its trading account does too. */
async function ensureRewardAccount(userId: string, fresh: boolean): Promise<ClaimResult> {
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
    if (!fresh && !created) {
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
