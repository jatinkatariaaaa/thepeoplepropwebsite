export type CouponAccount = {
  programKey: string;
  accountSize: number;
};

export type CouponProgram = {
  key: string;
  label: string;
  accountSizes: number[];
};

export type CouponEligibility = {
  programKey: string | null;
  accounts: CouponAccount[] | null;
};

export const couponAccountMismatch = "That promo code does not apply to the selected program and account size.";

export const couponAccountKey = ({ programKey, accountSize }: CouponAccount) => `${programKey}:${accountSize}`;

export function couponAppliesToAccount(
  eligibility: CouponEligibility,
  programKey: string,
  accountSize: number,
) {
  if (eligibility.programKey && eligibility.programKey !== programKey) return false;
  if (eligibility.accounts === null) return true;

  return Array.isArray(eligibility.accounts) && eligibility.accounts.some(
    (account) => account?.programKey === programKey && account?.accountSize === accountSize,
  );
}
