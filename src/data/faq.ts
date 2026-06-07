export interface FAQItem {
  q: string;
  a: string;
  category?: "general" | "rules" | "payouts" | "platform";
}

export const faq: FAQItem[] = [
  {
    q: "What is The People Prop?",
    a: "TPP is a proprietary trading firm that funds skilled retail traders with up to $200,000 in evaluation capital. Pass the evaluation, trade our capital, and keep up to 90% of the profits.",
    category: "general",
  },
  {
    q: "What is TPP referral campaign?",
    a: "Join our telegram community and get your unique referral link and refer your friends to our telegram community and win guaranteed evaluations.",
    category: "general",
  },
  {
    q: "Do I need experience to apply?",
    a: "There is no formal experience requirement, but our evaluation is built for traders who have a demonstrated edge. We strongly recommend 6+ months of consistent demo or live trading before purchasing.",
    category: "general",
  },
  {
    q: "What platforms do you support?",
    a: "TPP runs on MetaTrader 5 and cTrader at launch, with TradingView integration in Q4 2026. All execution is on raw spreads with $3 round-turn commission per standard lot.",
    category: "platform",
  },
  {
    q: "How long does the evaluation take?",
    a: "There is no time limit. Most traders pass the 1-step evaluation in 8 to 25 trading days. Minimum is 3 trading days.",
    category: "rules",
  },
  {
    q: "What is the profit split on a funded account?",
    a: "Profit splits range from 80% on the $5K starter to 90% on the $25K and $50K accounts. The first payout includes a 100% refund of your evaluation fee.",
    category: "payouts",
  },
  {
    q: "How often are payouts processed?",
    a: "Bi-weekly. Standard processing time is under 24 hours via bank wire, USDT, or major e-wallets. Your first payout is available 14 days after your first funded trade.",
    category: "payouts",
  },
  {
    q: "What's the maximum daily loss?",
    a: "4% of the previous day's closing balance, including floating P&L. The limit resets at midnight UTC. Breaching it ends the evaluation; funded accounts get one soft breach allowance.",
    category: "rules",
  },
  {
    q: "Can I trade news events?",
    a: "Yes — news trading is permitted on both evaluation and funded accounts. Profits during the 5-minute window around Tier-1 news may be subject to review on funded accounts.",
    category: "rules",
  },
  {
    q: "Can I hold positions over the weekend?",
    a: "Yes, weekend holding is permitted with no penalty on all account types. Be mindful that gap risk still counts toward Monday's daily loss limit.",
    category: "rules",
  },
  {
    q: "What is the consistency rule?",
    a: "No single trading day's profit may exceed 30% of your total profit at payout review. This applies only on funded accounts, and it pauses payouts rather than breaching the account.",
    category: "rules",
  },
  {
    q: "How does the scaling plan work?",
    a: "After 4 months of consistent funded performance with 10% net profit and no rule breaches, your account scales by 25% of the original balance. Maximum scaled size is 4× the starting account.",
    category: "general",
  },
];
