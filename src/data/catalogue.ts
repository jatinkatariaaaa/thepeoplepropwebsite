/**
 * The People Prop — product catalogue.
 *
 * One file holds every fact a trader can read about an account type: the
 * phases and their objectives, the funded-stage rules, payouts, the perks that
 * come with every account, the program terms and the program FAQ. The public
 * pages, the dashboard, the support assistant and the Google Drive export all
 * render from here, so a rule is only ever written once.
 *
 * Numbers here mirror what the trading engine enforces (see trading_rules in
 * Supabase and apply_risk_tick in the terminal): loss limits are measured on
 * equity, the daily limit is anchored to the balance at 5pm New York, the
 * overall limit is static from the starting balance.
 */

import { programs, type ProgramKey } from "./programs";

/* ─────────────────────────── perks on every account ─────────────────────────── */

export const PERKS = {
  stipend: {
    ratePct: 1,
    cycleDays: 30,
    minTradingDays: 4,
  },
  onDemandPayouts: 5,
  payoutCycleDays: 14,
  minPayout: 50,
  freeReset: {
    minSize: 50_000,
    windowHours: 24,
    claimHours: 72,
  },
  accessUpfront: 5,
  accessActivationHours: 48,
  inactivityDays: 30,
} as const;

export interface Perk {
  key: "stipend" | "on-demand" | "free-reset";
  title: string;
  figure: string;
  figureNote: string;
  summary: string;
  points: string[];
}

export const perks: Perk[] = [
  {
    key: "stipend",
    title: "Monthly stipend",
    figure: "1%",
    figureNote: "of your account size, every month",
    summary:
      "Every active account earns a stipend of 1% of its size for each 30-day cycle it stays open and traded. A $100K account accrues $1,000 a month.",
    points: [
      "Applies to every program and every phase, from the day your account opens.",
      `A cycle counts when the account has no breach and at least ${PERKS.stipend.minTradingDays} trading days in it.`,
      "Stipends collect in your rewards balance and are paid out together with your payouts.",
      "Passing a phase keeps the clock running. The stipend follows your account into the next phase.",
    ],
  },
  {
    key: "on-demand",
    title: "On-demand payouts",
    figure: "5",
    figureNote: "payouts with no waiting period",
    summary:
      "The first five payouts on every funded account can be requested the moment you have profit to withdraw. From the sixth payout the regular 14-day cycle applies.",
    points: [
      "No minimum waiting period and no fixed payout date for payouts one to five.",
      `Minimum withdrawal is $${PERKS.minPayout}. Open positions must be closed before you request.`,
      "Approved payouts are sent within 24 hours on business days.",
      "Your evaluation fee is refunded with the first payout on 1-Step, 2-Step and 3-Step accounts.",
    ],
  },
  {
    key: "free-reset",
    title: "24-hour free reset",
    figure: "$0",
    figureNote: "to restart a $50K+ account that fails on day one",
    summary:
      "If an account of $50,000 or more breaches a loss limit within 24 hours of its first trade, you can reset it once for free and start again with a fresh balance.",
    points: [
      "Available on every program, on accounts of $50K and above.",
      "One free reset per purchased account. A reset account does not earn a second one.",
      `Claim it from your dashboard within ${PERKS.freeReset.claimHours} hours of the breach.`,
      "The reset account starts at the same phase with the same rules and a full balance.",
    ],
  },
];

/* ─────────────────────────── trading conditions ─────────────────────────── */

export const CONDITIONS = {
  platform: "TPP Terminal",
  platformNote: "Our own web terminal. It runs in any modern browser on desktop, tablet and phone, with nothing to install.",
  leverage: "1:100",
  commission: "$3 per lot, per side",
  dayRollover: "5:00pm New York time",
  instruments: [
    {
      group: "Forex",
      count: 18,
      examples: "EURUSD, GBPUSD, USDJPY, AUDUSD, USDCAD, EURJPY, GBPJPY and 11 more majors, minors and exotics",
      spread: "1.2 pips",
      hours: "Sunday 22:00 to Friday 22:00 UTC",
    },
    {
      group: "Metals",
      count: 1,
      examples: "XAUUSD (Gold)",
      spread: "0.012% of price",
      hours: "Sunday 22:00 to Friday 22:00 UTC",
    },
    {
      group: "Crypto",
      count: 2,
      examples: "BTC/USD, ETH/USD",
      spread: "0.02% of price",
      hours: "24 hours a day, 7 days a week",
    },
  ],
} as const;

/* ─────────────────────────── program detail ─────────────────────────── */

export type PhaseKey = "phase-1" | "phase-2" | "phase-3" | "funded";

export interface PhaseSpec {
  key: PhaseKey;
  label: string;
  /** Profit target as a percentage of the starting balance; null on funded accounts. */
  targetPct: number | null;
  dailyLossPct: number;
  maxLossPct: number;
  minTradingDays: number;
  summary: string;
}

export interface Guideline {
  title: string;
  status: "allowed" | "restricted" | "limit" | "not-allowed";
  tag: string;
  body: string;
}

export interface QA {
  q: string;
  a: string;
  category?: string;
}

export interface TermsSection {
  title: string;
  clauses: string[];
}

export interface ProgramDetail {
  key: ProgramKey;
  name: string;
  /** Two or three words that say what the route is for. */
  motto: string;
  summary: string;
  bestFor: string[];
  phases: PhaseSpec[];
  funded: PhaseSpec & { consistencyPct: number };
  /** Whether the evaluation fee comes back with the first payout. */
  feeRefund: boolean;
  feeNote: string;
  journey: { title: string; body: string }[];
  guidelines: Guideline[];
  faqs: QA[];
  terms: TermsSection[];
}

/* ── shared building blocks ── */

const evalGuidelines = (extra: Guideline[] = []): Guideline[] => [
  {
    title: "News trading",
    status: "allowed",
    tag: "Allowed in evaluation",
    body: "You can hold and trade through any release during the evaluation. On the funded account, profit from trades opened or closed within 2 minutes either side of a high-impact release is removed at payout review. The account itself is not breached.",
  },
  {
    title: "Overnight and weekend holding",
    status: "allowed",
    tag: "Allowed",
    body: "Positions can stay open overnight and over the weekend on every phase. Forex and gold do not trade from Friday 22:00 to Sunday 22:00 UTC, so a weekend gap counts toward your loss limits when the market reopens.",
  },
  {
    title: "No time limit",
    status: "allowed",
    tag: "Unlimited",
    body: "There is no deadline on any phase. Take the trades your plan gives you and nothing more.",
  },
  {
    title: "Inactivity",
    status: "limit",
    tag: `${PERKS.inactivityDays} days`,
    body: `Place at least one trade every ${PERKS.inactivityDays} days. An account with no trade for ${PERKS.inactivityDays} consecutive days is closed.`,
  },
  {
    title: "Leverage and costs",
    status: "limit",
    tag: CONDITIONS.leverage,
    body: `${CONDITIONS.leverage} on forex, gold and crypto. Commission is ${CONDITIONS.commission}. There are no swap charges on any account.`,
  },
  {
    title: "Automated trading",
    status: "not-allowed",
    tag: "Manual only",
    body: "TPP Terminal is a manual trading platform. It has no EA, bot or API access, and third-party trade copiers cannot connect to it.",
  },
  ...extra,
];

const PROHIBITED = [
  "Exploiting price-feed errors, delayed quotes or platform faults, including latency and tick arbitrage.",
  "Opposite positions across two or more accounts, yours or anyone else's, to guarantee one of them wins.",
  "Sharing your account, letting someone else trade it, or trading an account that belongs to another person.",
  "Copying the same trades across accounts held by different people (group or signal-service trading).",
  "Martingale or grid position building that adds to a losing position without a stop loss.",
  "Placing trades only to satisfy the minimum trading days with no real market risk, such as opening and closing within seconds at minimum size.",
];

const sharedTerms = (o: {
  name: string;
  evalText: string;
  fundedLimits: string;
  consistencyPct: number;
  feeClause: string;
  extra?: TermsSection[];
}): TermsSection[] => [
  {
    title: "1. The account",
    clauses: [
      `The ${o.name} account is a simulated trading account provided by The People Prop. All trading takes place in a simulated environment using live market prices. No real money is placed in the market on your behalf.`,
      "You must be at least 18 years old, and you may not live in a country where our services are restricted. You are responsible for checking that taking part is lawful where you live.",
      "An account is personal to you. You may hold several accounts, but the combined funded allocation for one person is capped at $400,000.",
      o.evalText,
    ],
  },
  {
    title: "2. Loss limits",
    clauses: [
      o.fundedLimits,
      `The daily loss limit is measured from your account balance at ${CONDITIONS.dayRollover} and includes floating profit and loss. If your equity touches the daily limit at any moment, the account is breached.`,
      "The maximum loss limit is static. It is measured from your starting balance and never moves, whatever your account has earned.",
      "A breach is final. Open positions are closed at the current market price, pending orders are cancelled and the account is closed for trading.",
    ],
  },
  {
    title: "3. Trading conduct",
    clauses: [
      "You agree to trade the account as you would trade real capital, with a risk plan and position sizes that make sense for the account size.",
      ...PROHIBITED.map((p) => `Not permitted: ${p}`),
      "If we find a prohibited practice we may remove the profit it produced, refuse a payout, or close the account. We will tell you which trades were involved.",
    ],
  },
  {
    title: "4. Payouts",
    clauses: [
      `Your first ${PERKS.onDemandPayouts} payouts on a funded account are on demand: you can request one whenever the account holds withdrawable profit. From payout ${PERKS.onDemandPayouts + 1} onward you can request once every ${PERKS.payoutCycleDays} days.`,
      "The default profit split is 80% to you. With the 100% Profit Split add-on you keep all of it.",
      `Consistency: no single trading day may account for more than ${o.consistencyPct}% of the profit you are withdrawing. If one day is above that share, keep trading until it falls back under the limit. The account is not breached.`,
      `The minimum payout is $${PERKS.minPayout}. All positions must be closed when you request. The amount you withdraw is deducted from the account balance.`,
      "Identity verification (KYC) must be approved before your first payout is sent. Payouts are paid in USDT (TRC20, ERC20 or BEP20) or by bank transfer, to an account in your own name.",
      "Approved payouts are sent within 24 hours on business days.",
    ],
  },
  {
    title: "5. Stipend, reset and fees",
    clauses: [
      `Stipend: each 30-day cycle in which your account is open, unbreached and has at least ${PERKS.stipend.minTradingDays} trading days adds ${PERKS.stipend.ratePct}% of the account size to your rewards balance. The rewards balance is paid together with your payouts and has no cash value on its own.`,
      `Free reset: an account of $${PERKS.freeReset.minSize.toLocaleString("en-US")} or more that breaches within ${PERKS.freeReset.windowHours} hours of its first trade may be reset once at no cost, if you claim the reset within ${PERKS.freeReset.claimHours} hours of the breach.`,
      o.feeClause,
      "Fees are otherwise non-refundable once the account has placed its first trade. An account that has not been traded can be refunded within 14 days of purchase.",
    ],
  },
  ...(o.extra ?? []),
  {
    title: `${6 + (o.extra?.length ?? 0)}. General`,
    clauses: [
      `An account with no trade for ${PERKS.inactivityDays} consecutive days may be paused for inactivity.`,
      "We may change these terms for new purchases. An account you already hold keeps the rules it was sold with until it is closed.",
      "These program terms sit alongside our Terms of Service, Payout Policy, Refund Policy and Risk Disclosure. If they conflict, these program terms decide questions about this account type.",
    ],
  },
];

const faqCommon = (name: string): QA[] => [
  {
    q: "Is there a time limit?",
    a: `No. There is no deadline on any ${name} phase. The only clock is inactivity: place at least one trade every ${PERKS.inactivityDays} days.`,
    category: "Rules",
  },
  {
    q: "How is the daily loss limit calculated?",
    a: `It is a percentage of your balance at ${CONDITIONS.dayRollover}, and it is checked against your equity, so floating losses count. Example on a $100,000 account with a 5% daily limit: you start the day at $100,000, so your equity may not touch $95,000. If you close the day at $102,000, the next day's floor is $96,900.`,
    category: "Rules",
  },
  {
    q: "Which platform and instruments can I trade?",
    a: `All accounts trade on ${CONDITIONS.platform}, our own web terminal for desktop and mobile. You can trade 18 forex pairs, gold (XAUUSD), BTC/USD and ETH/USD at ${CONDITIONS.leverage} leverage. Commission is ${CONDITIONS.commission} and there are no swaps.`,
    category: "Platform",
  },
  {
    q: "How does the monthly stipend work on this account?",
    a: `Each 30-day cycle your account stays open without a breach and has at least ${PERKS.stipend.minTradingDays} trading days, ${PERKS.stipend.ratePct}% of the account size is added to your rewards balance. It starts from the day the account opens, including evaluation phases, and it is paid out together with your payouts once you are funded.`,
    category: "Perks",
  },
];

/* ── the five programs ── */

const DETAILS: ProgramDetail[] = [
  {
    key: "1-step",
    name: "1-Step",
    motto: "One phase, one target",
    summary:
      "The shortest route to a funded account. Reach 10% once, inside a 4% daily and 7% overall loss limit, and you are funded. Built for traders who already have a tested plan and want to get on with it.",
    bestFor: ["Traders with a proven strategy", "Swing and intraday traders who can wait for clean setups", "Anyone who wants a single evaluation, not a series"],
    phases: [
      {
        key: "phase-1",
        label: "Evaluation",
        targetPct: 10,
        dailyLossPct: 4,
        maxLossPct: 7,
        minTradingDays: 3,
        summary: "Reach 10% profit while staying inside a 4% daily and 7% overall loss limit, on at least 3 trading days.",
      },
    ],
    funded: {
      key: "funded",
      label: "Funded account",
      targetPct: null,
      dailyLossPct: 4,
      maxLossPct: 7,
      minTradingDays: 0,
      consistencyPct: 40,
      summary: "No profit target. The same 4% daily and 7% overall loss limits protect the account.",
    },
    feeRefund: true,
    feeNote: "One-time fee, refunded with your first payout.",
    journey: [
      { title: "Buy the evaluation", body: "Pick a size from $5K to $200K. Your login for TPP Terminal arrives in your dashboard within a minute of payment." },
      { title: "Hit 10% once", body: "Trade at your own pace on at least 3 separate days. No deadline." },
      { title: "Get funded", body: "Your funded account is created automatically when the target is reached. The fee you paid comes back with your first payout." },
    ],
    guidelines: evalGuidelines(),
    faqs: [
      {
        q: "What exactly do I need to do to pass 1-Step?",
        a: "Reach 10% profit on the account, trade on at least 3 different days, and never let your equity touch the 4% daily or the 7% overall loss limit. There is only one phase. When the target is reached with the minimum days done, the phase passes and your funded account is created automatically.",
        category: "Rules",
      },
      {
        q: "Why is the 1-Step loss limit tighter than 2-Step?",
        a: "Because there is only one phase. 1-Step gives you 7% of overall room and 4% a day, in exchange for skipping the second evaluation. If you want more room and do not mind a second phase, 2-Step has 5% a day and 10% overall.",
        category: "Rules",
      },
      {
        q: "When do I get my fee back?",
        a: "With your first payout from the funded account. The amount you paid for the evaluation is added to that payout.",
        category: "Payouts",
      },
      ...faqCommon("1-Step"),
    ],
    terms: sharedTerms({
      name: "1-Step",
      evalText: "The evaluation has one phase. You pass when your equity reaches 10% above the starting balance and you have traded on at least 3 separate trading days. A funded account of the same size is then issued to you.",
      fundedLimits: "Evaluation and funded account: maximum daily loss 4%, maximum overall loss 7% of the starting balance.",
      consistencyPct: 40,
      feeClause: "The evaluation fee is charged once. The amount you paid is refunded with your first payout from the funded account.",
    }),
  },
  {
    key: "2-step",
    name: "2-Step",
    motto: "The classic, with room to breathe",
    summary:
      "Two phases, 8% and then 5%, with the widest loss limits we offer on an evaluation: 5% a day and 10% overall. The lower fee and extra room make it the route most traders pass.",
    bestFor: ["Traders who want the most drawdown room", "A first prop-firm evaluation", "Strategies with wider stops or more open trades"],
    phases: [
      {
        key: "phase-1",
        label: "Phase 1",
        targetPct: 8,
        dailyLossPct: 5,
        maxLossPct: 10,
        minTradingDays: 3,
        summary: "Reach 8% profit inside a 5% daily and 10% overall loss limit, on at least 3 trading days.",
      },
      {
        key: "phase-2",
        label: "Phase 2",
        targetPct: 5,
        dailyLossPct: 5,
        maxLossPct: 10,
        minTradingDays: 3,
        summary: "Reach 5% profit with the same limits, on a fresh account of the same size.",
      },
    ],
    funded: {
      key: "funded",
      label: "Funded account",
      targetPct: null,
      dailyLossPct: 5,
      maxLossPct: 10,
      minTradingDays: 0,
      consistencyPct: 40,
      summary: "No profit target. 5% daily and 10% overall loss limits stay the same.",
    },
    feeRefund: true,
    feeNote: "One-time fee, refunded with your first payout.",
    journey: [
      { title: "Buy the evaluation", body: "Sizes from $5K to $200K. Trade as soon as the payment clears." },
      { title: "Phase 1: 8%", body: "Reach 8% on at least 3 trading days. Your Phase 2 account is created automatically." },
      { title: "Phase 2: 5%", body: "A fresh account, a smaller target, the same limits. Pass it and you are funded." },
      { title: "Get funded", body: "Withdraw on demand for your first five payouts. Your fee comes back with the first one." },
    ],
    guidelines: evalGuidelines(),
    faqs: [
      {
        q: "What are the two phases of 2-Step?",
        a: "Phase 1 asks for 8% profit and Phase 2 asks for 5%. Both have a 5% daily and 10% overall loss limit and need at least 3 trading days. Each phase is a fresh account of the same size, created automatically the moment you pass the one before it.",
        category: "Rules",
      },
      {
        q: "Do my Phase 1 profits carry into Phase 2?",
        a: "No. Phase 2 starts on a new account at the original balance. Profit made during evaluation phases shows that you can trade the account; it is not withdrawn. Withdrawals start on the funded account.",
        category: "Rules",
      },
      {
        q: "When do I get my fee back?",
        a: "With your first payout from the funded account. The amount you paid for the evaluation is added to that payout.",
        category: "Payouts",
      },
      ...faqCommon("2-Step"),
    ],
    terms: sharedTerms({
      name: "2-Step",
      evalText: "The evaluation has two phases. Phase 1 passes at 8% profit and Phase 2 at 5%, each with at least 3 separate trading days. Each phase is a new account at the original balance. A funded account of the same size is issued when Phase 2 is passed.",
      fundedLimits: "Both phases and the funded account: maximum daily loss 5%, maximum overall loss 10% of the starting balance.",
      consistencyPct: 40,
      feeClause: "The evaluation fee is charged once and covers both phases. The amount you paid is refunded with your first payout from the funded account.",
    }),
  },
  {
    key: "3-step",
    name: "3-Step",
    motto: "Lowest fee, smaller steps",
    summary:
      "Three phases of 6% each for the lowest fee in the line-up. Smaller targets mean smaller positions and less pressure on any single trade. It takes longer, and costs less.",
    bestFor: ["Traders who prefer small, steady targets", "The lowest entry cost", "Building a track record before sizing up"],
    phases: [
      { key: "phase-1", label: "Phase 1", targetPct: 6, dailyLossPct: 4, maxLossPct: 8, minTradingDays: 3, summary: "Reach 6% inside a 4% daily and 8% overall loss limit, on at least 3 trading days." },
      { key: "phase-2", label: "Phase 2", targetPct: 6, dailyLossPct: 4, maxLossPct: 8, minTradingDays: 3, summary: "Another 6% on a fresh account with the same limits." },
      { key: "phase-3", label: "Phase 3", targetPct: 6, dailyLossPct: 4, maxLossPct: 8, minTradingDays: 3, summary: "A final 6%. Pass it and your funded account is issued." },
    ],
    funded: {
      key: "funded",
      label: "Funded account",
      targetPct: null,
      dailyLossPct: 4,
      maxLossPct: 8,
      minTradingDays: 0,
      consistencyPct: 40,
      summary: "No profit target. 4% daily and 8% overall loss limits stay the same.",
    },
    feeRefund: true,
    feeNote: "One-time fee, refunded with your first payout.",
    journey: [
      { title: "Buy the evaluation", body: "The lowest fee we sell, from $29 for a $5K account." },
      { title: "Three phases of 6%", body: "Each phase is a fresh account. Pass one and the next opens automatically." },
      { title: "Get funded", body: "After Phase 3 your funded account is issued, and the fee comes back with your first payout." },
    ],
    guidelines: evalGuidelines(),
    faqs: [
      {
        q: "Why would I choose three phases over one?",
        a: "Price and pacing. 3-Step costs the least, and a 6% target can be reached with smaller positions than a 10% one. The trade-off is time: you pass three evaluations before you are funded.",
        category: "Rules",
      },
      {
        q: "What are the limits in each 3-Step phase?",
        a: "All three phases are identical: 6% profit target, 4% daily loss limit, 8% overall loss limit and at least 3 trading days. The funded account keeps the same 4% and 8% limits with no target.",
        category: "Rules",
      },
      {
        q: "When do I get my fee back?",
        a: "With your first payout from the funded account. The amount you paid for the evaluation is added to that payout.",
        category: "Payouts",
      },
      ...faqCommon("3-Step"),
    ],
    terms: sharedTerms({
      name: "3-Step",
      evalText: "The evaluation has three phases. Each phase passes at 6% profit with at least 3 separate trading days, and each is a new account at the original balance. A funded account of the same size is issued when Phase 3 is passed.",
      fundedLimits: "All three phases and the funded account: maximum daily loss 4%, maximum overall loss 8% of the starting balance.",
      consistencyPct: 40,
      feeClause: "The evaluation fee is charged once and covers all three phases. The amount you paid is refunded with your first payout from the funded account.",
    }),
  },
  {
    key: "instant",
    name: "Instant",
    motto: "Funded from the first trade",
    summary:
      "No evaluation at all. You trade a funded account from day one and can request a payout as soon as you have profit. The loss limits are the tightest we sell, 3% a day and 5% overall, because there is no test before them.",
    bestFor: ["Experienced traders who do not want to be evaluated again", "Low-drawdown strategies", "Traders who want payouts as early as possible"],
    phases: [],
    funded: {
      key: "funded",
      label: "Funded account",
      targetPct: null,
      dailyLossPct: 3,
      maxLossPct: 5,
      minTradingDays: 0,
      consistencyPct: 25,
      summary: "No profit target and no evaluation. A 3% daily and a static 5% overall loss limit protect the account.",
    },
    feeRefund: false,
    feeNote: "One-time fee. Instant accounts are not refunded with the first payout.",
    journey: [
      { title: "Buy the account", body: "Sizes from $5K to $300K. Your funded login is ready as soon as the payment clears." },
      { title: "Trade", body: "No target to chase. Keep inside 3% a day and 5% overall." },
      { title: "Withdraw", body: "Request your first five payouts on demand. The 25% consistency rule is checked on each one." },
    ],
    guidelines: evalGuidelines([
      {
        title: "Consistency on payouts",
        status: "limit",
        tag: "25%",
        body: "No single trading day may make up more than 25% of the profit you withdraw. It is checked when you request a payout and never breaches the account.",
      },
    ]).map((g) =>
      g.title === "News trading"
        ? {
            ...g,
            status: "restricted" as const,
            tag: "Restricted",
            body: "Instant accounts are funded from the start, so the funded news rule applies from day one: profit from trades opened or closed within 2 minutes either side of a high-impact release is removed at payout review. The account is not breached.",
          }
        : g,
    ),
    faqs: [
      {
        q: "Is there really no evaluation on Instant?",
        a: "Correct. An Instant account is funded from the first trade. There is no profit target and no phase to pass. You only have to stay inside the 3% daily and 5% overall loss limits.",
        category: "Rules",
      },
      {
        q: "Is the 5% loss limit trailing?",
        a: "No. It is static. The floor sits 5% below your starting balance and never moves up when you make profit. On a $100,000 Instant account your equity may not touch $95,000, however much you have earned.",
        category: "Rules",
      },
      {
        q: "What is the 25% consistency rule?",
        a: "When you request a payout, no single trading day may account for more than 25% of the profit being withdrawn. Example: to withdraw $4,000 of profit, your best day in that period must be $1,000 or less. If it is higher, keep trading until the ratio drops. Your account is never breached by this rule.",
        category: "Payouts",
      },
      {
        q: "Is the Instant fee refunded?",
        a: "No. Evaluation fees are refunded with the first payout because the fee paid for a test you passed. An Instant account has no test, so its fee is not refunded.",
        category: "Payouts",
      },
      ...faqCommon("Instant"),
    ],
    terms: sharedTerms({
      name: "Instant",
      evalText: "There is no evaluation. The account is a funded account from the moment it is issued and has no profit target.",
      fundedLimits: "Maximum daily loss 3%, maximum overall loss 5% of the starting balance.",
      consistencyPct: 25,
      feeClause: "The account fee is charged once. It is not refunded with the first payout.",
    }),
  },
  {
    key: "access",
    name: "Access",
    motto: "Pass first, pay later",
    summary:
      "Start a full two-phase evaluation for $5. You only pay the account fee after you have passed both phases, and you have 48 hours to do it. If you never pass, $5 is all it cost you.",
    bestFor: ["Traders who want to prove themselves before paying", "Trying a larger account size without the upfront fee", "Accounts up to $400K, the largest we offer"],
    phases: [
      { key: "phase-1", label: "Phase 1", targetPct: 8, dailyLossPct: 5, maxLossPct: 10, minTradingDays: 3, summary: "Reach 8% profit inside a 5% daily and 10% overall loss limit, on at least 3 trading days." },
      { key: "phase-2", label: "Phase 2", targetPct: 5, dailyLossPct: 5, maxLossPct: 10, minTradingDays: 3, summary: "Reach 5% profit with the same limits, on a fresh account of the same size." },
    ],
    funded: {
      key: "funded",
      label: "Funded account",
      targetPct: null,
      dailyLossPct: 5,
      maxLossPct: 10,
      minTradingDays: 0,
      consistencyPct: 40,
      summary: "Issued once the account fee is paid. No profit target, 5% daily and 10% overall loss limits.",
    },
    feeRefund: false,
    feeNote: `$${PERKS.accessUpfront} today. The account fee is due within ${PERKS.accessActivationHours} hours of passing Phase 2.`,
    journey: [
      { title: `Start for $${PERKS.accessUpfront}`, body: "Choose a size from $5K to $400K and pay the start fee. Your Phase 1 account opens straight away." },
      { title: "Pass both phases", body: "8% and then 5%, with 5% daily and 10% overall loss limits and at least 3 trading days in each." },
      { title: "Pay the rest of the fee", body: `You have ${PERKS.accessActivationHours} hours after passing Phase 2 to pay the remaining account fee from your dashboard.` },
      { title: "Get funded", body: "Your funded account is issued the moment the fee is paid. The first five payouts are on demand." },
    ],
    guidelines: evalGuidelines(),
    faqs: [
      {
        q: "How does pass first, pay later work?",
        a: `You pay $${PERKS.accessUpfront} to start the evaluation. You trade two phases, 8% and then 5%, under the same rules as 2-Step. Only after you pass Phase 2 do you pay the account fee for your size, and you have ${PERKS.accessActivationHours} hours to pay it from your dashboard. Your funded account is issued as soon as the payment clears.`,
        category: "Rules",
      },
      {
        q: "What happens if I do not pay the fee within 48 hours?",
        a: "The pass expires and the funded account is not issued. Nothing else is owed. Contact support before the deadline if you need a short extension and we will look at it.",
        category: "Payouts",
      },
      {
        q: "Why is the Access fee higher than the 2-Step fee?",
        a: "Because you only pay it if you pass. With 2-Step you pay a lower fee up front and get it back with your first payout. With Access you risk $5 and pay a higher fee only for an account you have already earned. The Access fee is not refunded with the first payout.",
        category: "Payouts",
      },
      {
        q: "What does it cost if I fail an Access evaluation?",
        a: `Only the $${PERKS.accessUpfront} start fee. You can start another Access evaluation whenever you like.`,
        category: "Rules",
      },
      ...faqCommon("Access"),
    ],
    terms: sharedTerms({
      name: "Access",
      evalText: "The evaluation has two phases. Phase 1 passes at 8% profit and Phase 2 at 5%, each with at least 3 separate trading days. Each phase is a new account at the original balance.",
      fundedLimits: "Both phases and the funded account: maximum daily loss 5%, maximum overall loss 10% of the starting balance.",
      consistencyPct: 40,
      feeClause: `The start fee of $${PERKS.accessUpfront} is charged at purchase and is not refundable. The account fee for your size is charged only after Phase 2 is passed and is not refunded with the first payout.`,
      extra: [
        {
          title: "6. Activation",
          clauses: [
            `When Phase 2 is passed, the account fee shown at purchase becomes payable. You have ${PERKS.accessActivationHours} hours from the moment of passing to pay it.`,
            "The funded account is issued when the payment is confirmed. Until then no funded account exists and no payout can be requested.",
            "If the fee is not paid in time the pass lapses. The start fee is not returned and no further amount is owed.",
          ],
        },
      ],
    }),
  },
];

export const programDetails: Record<ProgramKey, ProgramDetail> = Object.fromEntries(DETAILS.map((d) => [d.key, d])) as Record<ProgramKey, ProgramDetail>;
export const PROGRAM_ORDER: ProgramKey[] = DETAILS.map((d) => d.key);
export const isProgramKey = (v: string): v is ProgramKey => v in programDetails;
export const prohibitedPractices = PROHIBITED;

/** Program pricing row for a key, from the static matrix. */
export const pricingOf = (key: ProgramKey) => programs.find((p) => p.key === key)!;

/* ─────────────────────────── general FAQ ─────────────────────────── */

export const FAQ_CATEGORIES = ["Getting started", "Rules", "Payouts", "Perks", "Platform", "Account & billing"] as const;

export const generalFaqs: QA[] = [
  {
    q: "What is The People Prop?",
    a: "The People Prop is a proprietary trading firm. You prove you can trade inside clear loss limits on a simulated account, and we pay you a share of the profit you make on it: 80% as standard, 100% with the split add-on. You never risk more than the one-time fee for your account.",
    category: "Getting started",
  },
  {
    q: "What account sizes are available?",
    a: "1-Step, 2-Step and 3-Step are available up to $200,000, Instant up to $300,000, and Access up to $400,000. These are simulated account sizes. The separate limit across all active funded accounts is $400,000 per person.",
    category: "Getting started",
  },
  {
    q: "Which account type should I choose?",
    a: "1-Step is the fastest: one 10% target. 2-Step has the most room, 5% a day and 10% overall, across an 8% and a 5% phase. 3-Step is the cheapest, three phases of 6%. Instant skips the evaluation and is funded from day one with tighter limits. Access lets you start a two-phase evaluation for $5 and pay the account fee only after you pass.",
    category: "Getting started",
  },
  {
    q: "Do I trade real money?",
    a: "No. Every account, evaluation and funded, is a simulated account that follows live market prices. Your payouts are real money, paid by The People Prop from its own funds according to the profit on your simulated account.",
    category: "Getting started",
  },
  {
    q: "Who can open an account?",
    a: "Anyone aged 18 or over who lives in a country we serve. You will need to verify your identity (KYC) before your first payout, so the name on your account must be your own.",
    category: "Getting started",
  },
  {
    q: "How quickly do I get my account after paying?",
    a: "Usually within a minute. As soon as your payment is confirmed the account appears in your dashboard with a button that opens it in TPP Terminal.",
    category: "Getting started",
  },
  {
    q: "What breaches an account?",
    a: "Two things only: your equity touching the daily loss limit, or your equity touching the maximum loss limit. Both include floating losses. A breach closes the account. Rule checks at payout, such as consistency or the news window, can reduce a payout but never breach the account.",
    category: "Rules",
  },
  {
    q: "What counts as a trading day?",
    a: "A day on which you open at least one trade. Days run from 5:00pm to 5:00pm New York time. Each evaluation phase needs at least 3 trading days unless you bought the No Minimum Trading Days add-on.",
    category: "Rules",
  },
  {
    q: "Can I trade during news?",
    a: "Yes on evaluation phases, with no restriction. On funded accounts you can also trade through news, but profit from trades opened or closed within 2 minutes either side of a high-impact release is removed when your payout is reviewed. The account is not breached.",
    category: "Rules",
  },
  {
    q: "Can I hold trades overnight and over the weekend?",
    a: "Yes, on every account type and phase. Remember that forex and gold are closed from Friday 22:00 to Sunday 22:00 UTC, and a gap at the open counts toward your loss limits. There are no swap charges.",
    category: "Rules",
  },
  {
    q: "Can I use EAs, bots or copy trading?",
    a: "Not on TPP Terminal. It is a manual platform with no EA or API access, and trade copiers cannot connect to it. Trading the same strategy by hand on several of your own accounts is fine, as long as the positions are not hedged against each other.",
    category: "Rules",
  },
  {
    q: "What is not allowed?",
    a: "Exploiting feed errors or latency, hedging across accounts, sharing or selling your account, group trading the same signals across different people's accounts, martingale or grid building without a stop loss, and placing token trades only to tick off trading days. The full list is in the trading rules.",
    category: "Rules",
  },
  {
    q: "What happens if I do not trade for a while?",
    a: `An account with no trade for ${PERKS.inactivityDays} consecutive days may be paused for inactivity. One trade every ${PERKS.inactivityDays} days keeps it open.`,
    category: "Rules",
  },
  {
    q: "How do payouts work?",
    a: `Your first ${PERKS.onDemandPayouts} payouts on every funded account are on demand: request one whenever you have profit to withdraw. After that you can request once every ${PERKS.payoutCycleDays} days. You keep 80% of the profit, or 100% with the split add-on. The minimum payout is $${PERKS.minPayout}.`,
    category: "Payouts",
  },
  {
    q: "How long does a payout take?",
    a: "We review each request and send approved payouts within 24 hours on business days. You can follow the status in your dashboard.",
    category: "Payouts",
  },
  {
    q: "How will I be paid?",
    a: "In USDT on TRC20, ERC20 or BEP20, or by bank transfer. The wallet or bank account must belong to you.",
    category: "Payouts",
  },
  {
    q: "Do I need to verify my identity?",
    a: "Yes, once, before your first payout is sent. Upload a government ID and proof of address in your dashboard under Settings. Verification usually takes less than one business day.",
    category: "Payouts",
  },
  {
    q: "What is the consistency rule?",
    a: "It applies only when you request a payout on a funded account. No single trading day may make up more than 40% of the profit you withdraw, or 25% on Instant accounts. If one day is too large a share, keep trading until it falls under the limit. It never breaches your account.",
    category: "Payouts",
  },
  {
    q: "Is my evaluation fee refunded?",
    a: "On 1-Step, 2-Step and 3-Step, yes: the amount you paid is added to your first payout. Instant and Access fees are not refunded with the first payout.",
    category: "Payouts",
  },
  {
    q: "What is the monthly stipend?",
    a: `Every active account earns ${PERKS.stipend.ratePct}% of its size for each 30-day cycle it stays open, unbreached and traded on at least ${PERKS.stipend.minTradingDays} days. It applies to every account type from the day the account opens. The stipend builds up in your rewards balance and is paid out together with your payouts.`,
    category: "Perks",
  },
  {
    q: "When is the stipend paid?",
    a: "Your rewards balance is added to the next payout you request from a funded account. Stipend earned during evaluation phases waits in the balance until then. If an account is breached, the stipend already credited stays in your rewards balance; it just stops growing for that account.",
    category: "Perks",
  },
  {
    q: "What are on-demand payouts?",
    a: `A payout with no waiting period. On every funded account the first ${PERKS.onDemandPayouts} payouts can be requested whenever there is profit, even the day after you are funded. From the sixth payout the ${PERKS.payoutCycleDays}-day cycle applies.`,
    category: "Perks",
  },
  {
    q: "How does the free reset work?",
    a: `If an account of $${PERKS.freeReset.minSize.toLocaleString("en-US")} or more breaches within ${PERKS.freeReset.windowHours} hours of its first trade, a reset button appears on that account in your dashboard. Claim it within ${PERKS.freeReset.claimHours} hours and a fresh account with the same size, phase and rules is created at no cost. Each purchased account gets one free reset.`,
    category: "Perks",
  },
  {
    q: "What is TPP Terminal?",
    a: "Our own trading platform. It runs in the browser on desktop, tablet and phone, so there is nothing to install. It has live charts with indicators, one-tap market orders, limit and stop orders, stop loss and take profit that you can drag on the chart, partial closes and a full trade history.",
    category: "Platform",
  },
  {
    q: "What are the spreads and commission?",
    a: `Forex pairs carry a 1.2 pip spread, gold 0.012% of price and crypto 0.02% of price. Commission is ${CONDITIONS.commission}. There are no swaps and no other trading costs.`,
    category: "Platform",
  },
  {
    q: "What leverage do I get?",
    a: `${CONDITIONS.leverage} on every instrument: forex, gold and crypto.`,
    category: "Platform",
  },
  {
    q: "How do I pay for an account?",
    a: "Checkout is in crypto through NOWPayments, which accepts USDT, BTC, ETH and more than a hundred other coins. Your account is issued automatically when the network confirms the payment.",
    category: "Account & billing",
  },
  {
    q: "Can I get a refund?",
    a: "An account that has not placed a trade can be refunded within 14 days of purchase. Once the first trade is placed the fee is non-refundable, apart from the refund of evaluation fees that comes with your first payout.",
    category: "Account & billing",
  },
  {
    q: "How many accounts can I have?",
    a: "As many evaluations as you like. The combined size of your funded accounts is capped at $400,000 per person.",
    category: "Account & billing",
  },
  {
    q: "Do you have a referral programme?",
    a: "Yes. Every account comes with a referral link in the dashboard under Affiliate. You earn 10% of the fee on purchases made by traders you refer.",
    category: "Account & billing",
  },
  {
    q: "How do I contact support?",
    a: "Open a ticket from your dashboard under Support, email support@thepeopleprop.com, or ask the assistant in the corner of any page. It answers from the same rules published here and hands over to a person when it cannot.",
    category: "Account & billing",
  },
];

/* ─────────────────────────── policies ─────────────────────────── */

export interface PolicyDoc {
  key: "payout-policy" | "refund-policy";
  title: string;
  updated: string;
  intro: string;
  sections: { heading: string; body: string[] }[];
}

export const policies: PolicyDoc[] = [
  {
    key: "payout-policy",
    title: "Payout Policy",
    updated: "Last updated: November 2026",
    intro: "How and when The People Prop pays traders. This policy applies to every funded account, whichever program it came from.",
    sections: [
      {
        heading: "1. Who can request a payout",
        body: [
          "Payouts are available on funded accounts: the account issued after passing a 1-Step, 2-Step, 3-Step or Access evaluation, and every Instant account.",
          "The account must be active, with all positions closed and no pending orders, and its balance must be above the starting balance.",
          "Your identity verification must be approved before the first payout is sent. You can request the payout while verification is in progress.",
        ],
      },
      {
        heading: "2. Timing",
        body: [
          `The first ${PERKS.onDemandPayouts} payouts on each funded account are on demand. There is no waiting period.`,
          `From payout ${PERKS.onDemandPayouts + 1} onward, a new request can be made ${PERKS.payoutCycleDays} days after the previous one was requested.`,
          "Only one request can be open on an account at a time.",
        ],
      },
      {
        heading: "3. How much you receive",
        body: [
          "You choose how much profit to withdraw, up to the full profit on the account. Your share is 80% of that amount, or 100% with the 100% Profit Split add-on.",
          `The minimum payout is $${PERKS.minPayout} after the split.`,
          "The profit you withdraw is deducted from the account balance. Profit you leave in the account stays available for a later payout.",
          "On 1-Step, 2-Step and 3-Step accounts the evaluation fee you paid is added to your first payout.",
          "Your rewards balance, made up of monthly stipends, is added to each payout.",
        ],
      },
      {
        heading: "4. Checks before we pay",
        body: [
          "Consistency: no single trading day may account for more than 40% of the profit being withdrawn, or 25% on Instant accounts.",
          "News window: profit from trades opened or closed within 2 minutes either side of a high-impact economic release is not paid.",
          "Conduct: we review the trading for the practices listed as not permitted in the trading rules.",
          "A failed check reduces or delays a payout. It does not breach the account unless a prohibited practice is found.",
        ],
      },
      {
        heading: "5. Payment",
        body: [
          "Approved payouts are sent within 24 hours on business days.",
          "We pay in USDT on TRC20, ERC20 or BEP20, or by bank transfer. The destination must be in your own name.",
          "Network and bank charges on our side are covered by us. Charges taken by your own bank or exchange are yours.",
          "If a request is declined, the withdrawn amount is returned to the account balance and we tell you why.",
        ],
      },
    ],
  },
  {
    key: "refund-policy",
    title: "Refund Policy",
    updated: "Last updated: November 2026",
    intro: "When a fee can be returned, and how the evaluation-fee refund with your first payout works.",
    sections: [
      {
        heading: "1. Unused accounts",
        body: [
          "If you have not placed a trade on an account, you can ask for a full refund of its fee within 14 days of purchase.",
          "Refunds are returned to the original payment method. Crypto payments are refunded in the same coin at the USD value you paid.",
        ],
      },
      {
        heading: "2. Accounts that have traded",
        body: [
          "Once an account has placed its first trade the fee is non-refundable. This includes accounts that are breached, closed for inactivity or closed for a rule violation.",
          "Add-ons are part of the fee and follow the same rule.",
        ],
      },
      {
        heading: "3. Refund with your first payout",
        body: [
          "On 1-Step, 2-Step and 3-Step, the amount you paid for the evaluation is added to your first payout from the funded account.",
          "Instant fees and Access fees, including the $5 Access start fee, are not refunded with the first payout.",
        ],
      },
      {
        heading: "4. Free resets",
        body: [
          `An account of $${PERKS.freeReset.minSize.toLocaleString("en-US")} or more that breaches within ${PERKS.freeReset.windowHours} hours of its first trade can be reset once at no cost, if claimed within ${PERKS.freeReset.claimHours} hours.`,
          "A free reset is a new account, not a refund, and has no cash value.",
        ],
      },
      {
        heading: "5. Errors and duplicates",
        body: [
          "If you are charged twice for the same order, or a technical fault on our side prevents an account from being issued, we refund the affected payment in full.",
          "Email support@thepeopleprop.com with your order ID and we will resolve it within 3 business days.",
        ],
      },
    ],
  },
];

/* ─────────────────────────── helpers ─────────────────────────── */

export const pct = (n: number) => `${n}%`;

/** Dollar value of a percentage of an account size. */
export const pctOf = (size: number, p: number) => Math.round((size * p) / 100);

/** Every question we publish, tagged with the program it belongs to (null = general). */
export function allFaqs(): (QA & { program: ProgramKey | null })[] {
  return [
    ...generalFaqs.map((f) => ({ ...f, program: null })),
    ...DETAILS.flatMap((d) => d.faqs.map((f) => ({ ...f, program: d.key }))),
  ];
}
