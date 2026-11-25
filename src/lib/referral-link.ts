/**
 * One referral link per user, for the contest and the affiliate programme alike.
 * Safe to import from client components; the server side lives in `referrals.ts`.
 */

/** Where shared links point: production unless a site URL is configured. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://thepeopleprop.live").replace(/\/$/, "");

export const referralUrl = (code: string) => `${SITE_URL}/ref/${code}`;

/** Carries the referrer's user id from the link to sign-up (90 days). */
export const REF_COOKIE = "tpp_ref";
/** Set by the separate links used before the contest and affiliate links were merged. */
export const LEGACY_REF_COOKIES = ["tpp_affiliate", "tpp_contest_ref"] as const;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (value: unknown): value is string => typeof value === "string" && UUID.test(value);

function cookieValue(cookie: string, name: string) {
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * What to send as `affiliate_id` when signing up: the referrer id a new link stored,
 * or the code an older link left behind (the sign-up trigger resolves either).
 */
export function readReferral(cookie: string): string | null {
  const id = cookieValue(cookie, REF_COOKIE);
  if (isUuid(id)) return id;
  for (const name of LEGACY_REF_COOKIES) {
    const code = cookieValue(cookie, name);
    if (code && /^[A-Za-z0-9-]{4,64}$/.test(code)) return code;
  }
  return null;
}

export type ReferralSummary = {
  code: string;
  link: string;
  clicks: number;
  /** everyone who signed up through the link */
  signups: number;
  /** of those, confirmed emails: what the contest counts */
  verified: number;
  /** of those, traders who bought a challenge: what earns commission */
  paid: number;
  earnings: { total: number; pending: number; ratePct: number };
  reward: {
    target: number;
    program: string;
    size: number;
    claimed: boolean;
    claimedAt: string | null;
    purchaseId: string | null;
    accountId: string | null;
  };
  referrals: { email: string; joinedAt: string; verified: boolean; paid: boolean }[];
};

export type ClaimResult =
  | { ok: true; accountId: string | null; provisioned: boolean; message: string }
  | { ok: false; reason: "not_enough" | "already_claimed" | "error"; verified?: number; target?: number; message: string };
