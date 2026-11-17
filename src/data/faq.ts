import { generalFaqs } from "./catalogue";

export interface FAQItem {
  q: string;
  a: string;
  category?: "general" | "rules" | "payouts" | "platform";
}

/** The catalogue's topics, folded into the four tabs the landing-page FAQ shows. */
const TAB: Record<string, FAQItem["category"]> = {
  "Getting started": "general",
  "Account & billing": "general",
  Perks: "payouts",
  Rules: "rules",
  Payouts: "payouts",
  Platform: "platform",
};

/** A short, representative set for the landing page. The help centre lists every question. */
const PICK = [
  "What is The People Prop?",
  "Which account type should I choose?",
  "Do I trade real money?",
  "What breaches an account?",
  "What counts as a trading day?",
  "Can I trade during news?",
  "Can I hold trades overnight and over the weekend?",
  "How do payouts work?",
  "What is the monthly stipend?",
  "How does the free reset work?",
  "Is my evaluation fee refunded?",
  "What is the consistency rule?",
  "What is TPP Terminal?",
  "What are the spreads and commission?",
];

export const faq: FAQItem[] = PICK.map((q) => generalFaqs.find((f) => f.q === q))
  .filter((f): f is NonNullable<typeof f> => Boolean(f))
  .map((f) => ({ q: f.q, a: f.a, category: TAB[f.category ?? ""] ?? "general" }));
