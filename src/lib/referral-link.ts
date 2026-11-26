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

export type ReferralSummary = {
  code: string;
  link: string;
  clicks: number;
  /** everyone who signed up through the link */
  signups: number;
  /** of those, confirmed emails */
  confirmed: number;
  /** of those, sign-ups that passed the checks (one per person, device and connection): what the contest counts */
  verified: number;
  /** confirmed sign-ups that failed a check */
  flagged: number;
  /** traders who bought a challenge: what earns commission */
  paid: number;
  earnings: { total: number; pending: number; ratePct: number };
  reward: {
    target: number;
    program: string;
    size: number;
    claimed: boolean;
    claimedAt: string | null;
    /** a claim waiting for the team ("held"), declined ("rejected") or given ("approved") */
    status: "held" | "approved" | "rejected" | null;
    requestedAt: string | null;
    note: string | null;
    purchaseId: string | null;
    accountId: string | null;
  };
  referrals: { email: string; joinedAt: string; verified: boolean; counted: boolean; reason: ReferralCheck | null; paid: boolean }[];
};

/** Why a sign-up does not count toward the reward. */
export type ReferralCheck =
  | "unconfirmed"
  | "no_network"
  | "referrer_network"
  | "referrer_device"
  | "shared_network"
  | "shared_device"
  | "rejected"
  | "approved";

/** The reason as the referrer reads it. Connection details stay private. */
export const CHECK_LABEL: Record<ReferralCheck, string> = {
  unconfirmed: "Email not confirmed",
  no_network: "Couldn't verify",
  referrer_network: "Same connection as you",
  referrer_device: "Same device as you",
  shared_network: "Connection already used",
  shared_device: "Device already used",
  rejected: "Not accepted",
  approved: "Approved",
};

/** The same reasons with the detail an admin needs. */
export const CHECK_ADMIN_LABEL: Record<ReferralCheck, string> = {
  unconfirmed: "Email not confirmed",
  no_network: "No sign-up IP on record",
  referrer_network: "Same IP as the referrer",
  referrer_device: "Same browser as the referrer",
  shared_network: "IP used by an earlier sign-up",
  shared_device: "Browser used by an earlier sign-up",
  rejected: "Rejected by an admin",
  approved: "Approved by an admin",
};

/** A stored network key for display: the IPv4 address, or the IPv6 /64 prefix. */
export function networkLabel(net: string | null | undefined) {
  if (!net) return "—";
  if (net.startsWith("v4:")) return net.slice(3);
  const groups = net.slice(3).match(/.{4}/g) ?? [];
  return `${groups.map((g) => g.replace(/^0+(?=.)/, "")).join(":")}::/64`;
}

/** One row of the admin's per-referrer review (public.referral_signup_list). */
export type SignupRow = {
  referred_user_id: string;
  email: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  confirmed: boolean;
  net: string | null;
  ip: string | null;
  country: string | null;
  device_id: string | null;
  source: string | null;
  net_signups: number;
  device_signups: number;
  reason: ReferralCheck | null;
  counted: boolean;
  review: "approved" | "rejected" | null;
  review_note: string | null;
};

/** One row of the admin board (public.referral_board). */
export type BoardRow = {
  user_id: string;
  email: string | null;
  display_name: string | null;
  code: string;
  signups: number;
  confirmed: number;
  counted: number;
  flagged: number;
  self_flags: number;
  networks: number;
  returned: number;
  linked_referrers: number;
  first_signup: string | null;
  last_signup: string | null;
  paid: number;
  claimed: boolean;
  claimed_at: string | null;
  claim_status: "held" | "approved" | "rejected" | null;
  claim_requested_at: string | null;
  reward_account: string | null;
  reward_account_status: string | null;
};

export type ClaimResult =
  | { ok: true; accountId: string | null; provisioned: boolean; message: string }
  | { ok: false; reason: "not_enough" | "already_claimed" | "held" | "rejected" | "error"; verified?: number; target?: number; message: string };
