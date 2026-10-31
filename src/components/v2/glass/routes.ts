/**
 * Every public page and where it lives. Pages that already have a glass
 * version under /v2 link there; the rest keep pointing at the current site,
 * so no link ever breaks while the redesign rolls out page by page.
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
  | "terms"
  | "privacy"
  | "cookie"
  | "aml-policy"
  | "risk-disclosure";

/** Glass pages that are live under /v2. */
const BUILT = new Set<PageKey>(["home", "challenges", "rules", "faqs", "about", "contact", "careers", "leaderboard", "heatmap", "contest", "reviews", "blog", "terms", "privacy", "cookie", "aml-policy", "risk-disclosure"]);

export function href(key: PageKey): string {
  if (key === "home") return "/v2";
  return BUILT.has(key) ? `/v2/${key}` : `/${key}`;
}

/** App routes stay where they are. */
export const APP = {
  login: "/login",
  dashboard: "/dashboard",
  newChallenge: "/dashboard/new-challenge",
} as const;
