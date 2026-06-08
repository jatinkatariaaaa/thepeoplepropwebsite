/**
 * TPP challenge programs — full pricing matrix.
 * Inspired by Atlas Funded's structure (1-Step, 2-Step, 3-Step, Instant, Access)
 * but with TPP's own pricing, naming, and rules. NOT copied verbatim.
 *
 * All fees are USD one-time, all percentages are of the starting balance,
 * and every program ships with the same TPP-wide guarantees:
 *   - Unlimited trading period
 *   - EAs / bots / news trading allowed
 *   - Weekend holds allowed (no opening trades on Sat/Sun)
 *   - Fee refund on first qualifying payout
 */

export type ProgramKey = "1-step" | "2-step" | "3-step" | "instant" | "access";

export type AccountSize =
  | 5_000
  | 10_000
  | 25_000
  | 50_000
  | 100_000
  | 200_000
  | 300_000
  | 400_000;

export interface Program {
  key: ProgramKey;
  label: string;
  shortLabel: string;
  tagline: string;
  badge?: string;
  /** phases shown to the user, 0 = instant funded */
  phases: number;
  profitSplit: number; // default split
  /** maximum split after add-on */
  profitSplitMax: number;
  payoutCycle: string;
  /** First profit target (for display in the spec card). For multi-step,
   *  the spec shows the per-phase split. */
  profitTarget: string;
  dailyDrawdown: string;
  maxDrawdown: string;
  /** Min days per phase (eval). */
  minTradingDays: number;
  consistencyRule: string;
  highlights: string[];
  /** Per-account-size fee map. Sizes that aren't offered for a program are absent. */
  fees: Partial<Record<AccountSize, number>>;
}

/**
 * Pricing was set to feel competitive with Atlas while undercutting on
 * lower tiers. Numbers were rounded to retail-friendly "9" endings.
 */
export const programs: Program[] = [
  {
    key: "1-step",
    label: "1-Step Evaluation",
    shortLabel: "1-Step",
    tagline: "Fastest path to funded. Hit 10% in one phase.",
    badge: "Popular",
    phases: 1,
    profitSplit: 80,
    profitSplitMax: 100,
    payoutCycle: "Bi-weekly",
    profitTarget: "10%",
    dailyDrawdown: "4%",
    maxDrawdown: "7%",
    minTradingDays: 5,
    consistencyRule: "30%",
    highlights: [
      "One phase, one target",
      "100% split add-on available",
      "Free retry on first breach",
    ],
    fees: {
      5_000: 59,
      10_000: 99,
      25_000: 199,
      50_000: 309,
      100_000: 529,
      200_000: 979,
    },
  },
  {
    key: "2-step",
    label: "2-Step Evaluation",
    shortLabel: "2-Step",
    tagline: "Lower fee, classic two-phase route.",
    phases: 2,
    profitSplit: 80,
    profitSplitMax: 100,
    payoutCycle: "Bi-weekly",
    profitTarget: "8% + 5%",
    dailyDrawdown: "5%",
    maxDrawdown: "10%",
    minTradingDays: 5,
    consistencyRule: "30%",
    highlights: [
      "Lower fee, more headroom",
      "5% daily / 10% overall drawdown",
      "Optional on-demand payouts",
    ],
    fees: {
      5_000: 39,
      10_000: 79,
      25_000: 169,
      50_000: 259,
      100_000: 489,
      200_000: 919,
    },
  },
  {
    key: "3-step",
    label: "3-Step Evaluation",
    shortLabel: "3-Step",
    tagline: "Most affordable. Three smaller 6% milestones.",
    badge: "Lowest Fee",
    phases: 3,
    profitSplit: 80,
    profitSplitMax: 100,
    payoutCycle: "Bi-weekly",
    profitTarget: "6% × 3",
    dailyDrawdown: "4%",
    maxDrawdown: "8%",
    minTradingDays: 4,
    consistencyRule: "30%",
    highlights: [
      "Three 6% phases — easy pacing",
      "Cheapest entry in our line-up",
      "Scalping add-on supported",
    ],
    fees: {
      5_000: 29,
      10_000: 59,
      25_000: 139,
      50_000: 219,
      100_000: 359,
      200_000: 659,
    },
  },
  {
    key: "instant",
    label: "Instant Funded",
    shortLabel: "Instant",
    tagline: "Skip evaluation. Trade real allocation today.",
    badge: "No Evaluation",
    phases: 0,
    profitSplit: 80,
    profitSplitMax: 100,
    payoutCycle: "First at 28d, then 14d",
    profitTarget: "—",
    dailyDrawdown: "3%",
    maxDrawdown: "5% trailing",
    minTradingDays: 5,
    consistencyRule: "20%",
    highlights: [
      "No evaluation, direct funded",
      "Trailing drawdown locks at breakeven",
      "Weekly payout add-on available",
    ],
    fees: {
      5_000: 59,
      10_000: 99,
      25_000: 199,
      50_000: 419,
      100_000: 709,
      200_000: 1_099,
      300_000: 1_589,
    },
  },
  {
    key: "access",
    label: "Access · Pay After You Pass",
    shortLabel: "Access",
    tagline: "Start for $5. Pay the full fee only after you pass.",
    badge: "New",
    phases: 2,
    profitSplit: 80,
    profitSplitMax: 100,
    payoutCycle: "Bi-weekly",
    profitTarget: "6% + 4%",
    dailyDrawdown: "5%",
    maxDrawdown: "10%",
    minTradingDays: 2,
    consistencyRule: "30%",
    highlights: [
      "$5 upfront broker fee",
      "Funded fee only after Phase 2 pass",
      "72-hour reset window if breached",
    ],
    fees: {
      // shown as the post-pass funded fee
      5_000: 69,
      10_000: 129,
      25_000: 269,
      50_000: 409,
      100_000: 779,
      200_000: 1_469,
      300_000: 2_269,
      400_000: 2_739,
    },
  },
];

/** All sizes that appear in at least one program (used for the size grid). */
export const ALL_SIZES: AccountSize[] = [
  5_000, 10_000, 25_000, 50_000, 100_000, 200_000, 300_000, 400_000,
];

export const formatSize = (n: AccountSize) =>
  n >= 1_000 ? `$${n / 1_000}K` : `$${n}`;

export const formatSizeLong = (n: AccountSize) =>
  `$${n.toLocaleString("en-US")}`;

/* ─── Add-ons ──────────────────────────────────────────────────── */

export type AddOnKey =
  | "split-100"
  | "payout-on-demand"
  | "no-min-days"
  | "scalping"
  | "free-retry";

export interface AddOn {
  key: AddOnKey;
  label: string;
  description: string;
  /** Percent of base fee added when toggled on. */
  feePct: number;
  /** Which programs this add-on applies to. */
  appliesTo: ProgramKey[];
}

export const addOns: AddOn[] = [
  {
    key: "split-100",
    label: "100% Profit Split",
    description: "Upgrade your split from 80% to 100% from day one.",
    feePct: 20,
    appliesTo: ["1-step", "2-step", "3-step", "instant", "access"],
  },
  {
    key: "payout-on-demand",
    label: "First Payout on Demand",
    description: "Your first payout can be requested at any time. Subsequent payouts follow standard cycle.",
    feePct: 0,
    appliesTo: ["1-step", "2-step", "3-step", "instant", "access"],
  },
  {
    key: "no-min-days",
    label: "No Min Trading Days",
    description: "Remove the minimum-day requirement on the evaluation.",
    feePct: 20,
    appliesTo: ["1-step", "2-step", "3-step", "access"],
  },
  {
    key: "scalping",
    label: "Scalping Pack",
    description: "Tighter spreads + sub-second hold allowance for scalpers.",
    feePct: 25,
    appliesTo: ["3-step", "instant"],
  },
  {
    key: "free-retry",
    label: "Free Retry",
    description: "One free re-attempt on the same account if you breach during evaluation.",
    feePct: 25,
    appliesTo: ["1-step", "2-step", "3-step"],
  },
];

/* ─── Platforms ────────────────────────────────────────────────── */

export type PlatformKey = "tppdashboard" | "mt5" | "tradelocker" | "matchtrader";

export interface Platform {
  key: PlatformKey;
  label: string;
  sub: string;
  status?: "live" | "soon";
}

export const platforms: Platform[] = [
  { key: "tppdashboard", label: "TPP Dashboard", sub: "Built-in web platform", status: "live" },
  { key: "mt5", label: "MetaTrader 5", sub: "Industry standard", status: "live" },
  { key: "tradelocker", label: "TradeLocker", sub: "Web-first, no install", status: "live" },
  { key: "matchtrader", label: "Match-Trader", sub: "Modern UI, fast fills", status: "live" },
];

/* ─── Helpers ──────────────────────────────────────────────────── */

export function feeFor(
  program: Program,
  size: AccountSize,
  selectedAddOns: AddOnKey[],
): { base: number | null; total: number | null; addOnFees: { key: AddOnKey; amount: number }[] } {
  const base = program.fees[size];
  if (base == null) return { base: null, total: null, addOnFees: [] };

  const addOnFees = addOns
    .filter((a) => selectedAddOns.includes(a.key) && a.appliesTo.includes(program.key))
    .map((a) => ({ key: a.key, amount: Math.round((base * a.feePct) / 100) }));

  const total = base + addOnFees.reduce((s, a) => s + a.amount, 0);
  return { base, total, addOnFees };
}

export function programOffersSize(program: Program, size: AccountSize): boolean {
  return program.fees[size] != null;
}