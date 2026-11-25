import { CONDITIONS, PERKS } from "./catalogue";

export interface Rule {
  id: string;
  title: string;
  icon: "target" | "shield" | "alert" | "scale" | "newspaper" | "calendar" | "trending" | "refund";
  summary: string;
  details: string[];
}

/** The rules in brief, for cards and the help centre. The full text lives on /rules and each account page. */
export const rules: Rule[] = [
  {
    id: "profit-target",
    title: "Profit targets",
    icon: "target",
    summary: "10% on 1-Step, 8% then 5% on 2-Step and Access, three phases of 6% on 3-Step. Instant has no target.",
    details: [
      "A phase passes when equity reaches the target and the minimum trading days are done.",
      "Each phase is a fresh account at the original balance.",
      "There is no time limit on any phase.",
    ],
  },
  {
    id: "daily-loss-limit",
    title: "Daily loss limit",
    icon: "alert",
    summary: `3% to 5% of the balance you held at ${CONDITIONS.dayRollover}, measured on equity.`,
    details: [
      "1-Step and 3-Step 4%, 2-Step and Access 5%, Instant 3%.",
      "Floating losses count. If equity touches the limit the account is closed.",
      "The limit resets every day from the new balance.",
    ],
  },
  {
    id: "max-loss-limit",
    title: "Maximum loss limit",
    icon: "shield",
    summary: "5% to 10% below the starting balance. Static: it never trails your profit.",
    details: ["1-Step 7%, 2-Step and Access 10%, 3-Step 8%, Instant 5%.", "Measured on equity from the starting balance of the account."],
  },
  {
    id: "consistency-rule",
    title: "Payout consistency",
    icon: "scale",
    summary: "No single day may be more than 40% of a payout, or 25% on Instant accounts.",
    details: ["Checked only when you request a payout from a funded account.", "It can delay a payout. It never breaches the account."],
  },
  {
    id: "news-trading",
    title: "News trading",
    icon: "newspaper",
    summary: "Unrestricted in evaluation. A 2-minute window either side of high-impact news on funded accounts.",
    details: ["Profit from trades opened or closed inside the window is removed at payout review.", "The account is not breached."],
  },
  {
    id: "weekend-holding",
    title: "Overnight and weekend holding",
    icon: "calendar",
    summary: "Allowed on every account, with no swap charges.",
    details: ["Forex and gold are closed from Friday 22:00 to Sunday 22:00 UTC.", "A gap at the open counts toward your loss limits."],
  },
  {
    id: "payouts",
    title: "Payouts and stipend",
    icon: "trending",
    summary: `First ${PERKS.onDemandPayouts} payouts on demand, then every ${PERKS.payoutCycleDays} days. A ${PERKS.stipend.ratePct}% stipend every month.`,
    details: [
      "You keep 80% of the profit, or 100% with the split add-on.",
      `Each 30-day cycle with at least ${PERKS.stipend.minTradingDays} trading days adds ${PERKS.stipend.ratePct}% of the account size to your rewards balance.`,
      "The rewards balance is paid together with your payouts.",
    ],
  },
  {
    id: "refund-policy",
    title: "Fees and resets",
    icon: "refund",
    summary: "Evaluation fees come back with your first payout. $50K+ accounts get a free reset if they fail on day one.",
    details: [
      "1-Step, 2-Step and 3-Step fees are added to your first payout.",
      `An account of $${PERKS.freeReset.minSize.toLocaleString("en-US")} or more that breaches within ${PERKS.freeReset.windowHours} hours of its first trade can be reset once for free.`,
      "An account that has not traded can be refunded within 14 days.",
    ],
  },
];
