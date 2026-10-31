export interface Rule {
  id: string;
  title: string;
  icon:
    | "target"
    | "shield"
    | "alert"
    | "scale"
    | "newspaper"
    | "calendar"
    | "trending"
    | "refund";
  summary: string;
  details: string[];
}

export const rules: Rule[] = [
  {
    id: "profit-target",
    title: "Profit Target",
    icon: "target",
    summary:
      "Reach 10% profit on the evaluation account, in any number of days, with no time pressure.",
    details: [
      "The profit target is fixed at 10% of the starting balance for all account sizes.",
      "Profit is calculated on closed trades only — open positions do not count toward the target.",
      "There is no maximum time limit. Trade at your own pace.",
      "Once the target is hit and minimum trading days are completed, you advance to the funded stage.",
    ],
  },
  {
    id: "daily-loss-limit",
    title: "Daily Loss Limit",
    icon: "alert",
    summary:
      "A 4% daily drawdown ceiling resets at midnight UTC. Includes floating P&L.",
    details: [
      "Daily loss is measured against the highest equity from the previous day's close.",
      "The limit includes both realized losses and floating (unrealized) drawdown.",
      "Hitting the daily limit ends the evaluation. Funded accounts use a soft breach with one allowance.",
      "The limit resets at 00:00 UTC every trading day.",
    ],
  },
  {
    id: "max-loss-limit",
    title: "Max Loss Limit",
    icon: "shield",
    summary:
      "Total drawdown across the account is capped at 8% from the starting balance.",
    details: [
      "Maximum loss is a static value based on the original account size.",
      "If equity drops below 92% of the starting balance, the account is breached.",
      "This is the single most important risk parameter — protect it at all times.",
    ],
  },
  {
    id: "consistency-rule",
    title: "Consistency Rule",
    icon: "scale",
    summary:
      "No single day's profit may exceed 30% of total profit at the time of payout.",
    details: [
      "The rule applies only at payout review on funded accounts.",
      "It exists to ensure long-term, repeatable performance — not single lucky trades.",
      "If a single day exceeds the threshold, the payout is paused but the account is not breached.",
      "Continue trading consistently to bring the ratio back into range.",
    ],
  },
  {
    id: "news-trading",
    title: "News Trading Rule",
    icon: "newspaper",
    summary:
      "Trading is permitted during high-impact news. No restrictions during evaluation.",
    details: [
      "TPP allows news trading on both evaluation and funded accounts.",
      "On funded accounts, profits made during 5 minutes before/after Tier-1 news may be reviewed.",
      "Strategies that rely solely on news arbitrage may be flagged for manual review.",
    ],
  },
  {
    id: "weekend-holding",
    title: "Weekend Holding",
    icon: "calendar",
    summary:
      "Positions may be held over weekends with no penalty on all account types.",
    details: [
      "TPP does not require positions to be flat at the end of the week.",
      "Be aware that weekend gaps still count toward your daily loss on Monday open.",
      "Recommended practice: reduce size before high-uncertainty weekends.",
    ],
  },
  {
    id: "scaling-plan",
    title: "Scaling Plan",
    icon: "trending",
    summary:
      "Scale account size by 25% every 4 months of consistent performance.",
    details: [
      "Eligibility: minimum 4 months on funded, 10% net profit, no breached rules.",
      "Each scale event increases your account by 25% of the original balance.",
      "Maximum scaled balance is 4× the starting size.",
      "Scaling is automatic — no application required.",
    ],
  },
  {
    id: "refund-policy",
    title: "Refund Policy",
    icon: "refund",
    summary:
      "Pass the evaluation and your full challenge fee is refunded with the first payout.",
    details: [
      "100% of the evaluation fee is refunded with your first profit split on the funded account.",
      "Refunds are paid in the same currency as the original purchase.",
      "Account upgrades or expedited evaluation services are non-refundable.",
    ],
  },
];
