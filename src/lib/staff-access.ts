export const STAFF_RIGHTS = {
  view_total_logins: "Site-wide signed-in user count",
  view_referrals: "Own referred user counts",
  view_commissions: "Own commission earnings",
  manage_links: "Manage promoter links and sale shares",
} as const;

export type StaffPermission = keyof typeof STAFF_RIGHTS;

export function isStaffPermission(value: unknown): value is StaffPermission {
  return typeof value === "string" && Object.hasOwn(STAFF_RIGHTS, value);
}

export function percentToBps(value: string): number | null {
  if (!/^\d{1,3}(?:\.\d{1,2})?$/.test(value)) return null;
  const [whole, decimals = ""] = value.split(".");
  const bps = Number(whole) * 100 + Number(decimals.padEnd(2, "0"));
  return bps <= 10000 ? bps : null;
}

export function formatPercent(bps: number): string {
  return String(bps / 100);
}

export interface StaffMember {
  user_id: string;
  rank: string;
  permissions: StaffPermission[];
  commission_bps: number;
  active: boolean;
  updated_at: string;
  name: string | null;
  email: string | null;
}
