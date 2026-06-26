// Shared helpers + types for the Trading Operations module (admin).
// Keep this framework-agnostic so it can be reused by API routes and pages.

export const ACCOUNT_STATUSES = [
  "active",
  "suspended",
  "breached",
  "passed",
  "disabled",
] as const;

export type AccountStatus = (typeof ACCOUNT_STATUSES)[number];

export const ACCOUNT_PHASES = ["challenge", "verification", "phase_3", "funded"] as const;
export type AccountPhase = (typeof ACCOUNT_PHASES)[number];

// Account management actions the admin API understands.
export const ACCOUNT_ACTIONS = [
  "reset_challenge",
  "assign_challenge",
  "enable",
  "disable",
  "change_leverage",
  "change_status",
] as const;

export type AccountAction = (typeof ACCOUNT_ACTIONS)[number];

// Allowed leverage values (1:N). Adjust freely without code changes elsewhere.
export const LEVERAGE_OPTIONS = [10, 20, 30, 50, 100, 200, 500] as const;

/**
 * Generate a unique-ish 8 digit trading account number.
 * Uniqueness is still enforced at the DB level (unique constraint);
 * the API retries on collision.
 */
export function generateAccountNumber(): string {
  return String(Math.floor(10_000_000 + Math.random() * 89_999_999));
}

export function isValidStatus(value: unknown): value is AccountStatus {
  return (
    typeof value === "string" &&
    (ACCOUNT_STATUSES as readonly string[]).includes(value)
  );
}
