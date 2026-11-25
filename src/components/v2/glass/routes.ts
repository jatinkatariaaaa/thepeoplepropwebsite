/**
 * Every public page of the site. Link with href(key) rather than a literal
 * path, so a page can move without hunting down every link to it.
 */
export type PageKey =
  | "home"
  | "challenges"
  | "rules"
  | "faqs"
  | "about"
  | "contact"
  | "careers"
  | "leaderboard"
  | "heatmap"
  | "contest"
  | "reviews"
  | "blog"
  | "help"
  | "press"
  | "status"
  | "terms"
  | "privacy"
  | "cookie"
  | "aml-policy"
  | "risk-disclosure"
  | "tools"
  | "payout-policy"
  | "refund-policy";

export function href(key: PageKey): string {
  return key === "home" ? "/" : `/${key}`;
}

/** App routes stay where they are. */
/** Detail page of one account type. */
export const programHref = (key: string) => `/challenges/${key}`;

export const APP = {
  login: "/login",
  dashboard: "/dashboard",
  newChallenge: "/dashboard/new-challenge",
} as const;
