/**
 * TPP challenge programs: the pricing matrix and the short facts the cards show.
 * The long-form detail for each program (phases, guidelines, terms, FAQ) lives
 * in ./catalogue.ts and is keyed by the same ProgramKey.
 *
 * Fees are one-time USD amounts. Percentages are of the starting balance.
 * Live values come from Supabase (tpp_programs, tpp_program_fees) and override
 * these defaults; the checkout prices orders on the server from the same tables.
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
    payoutCycle: "First 5 on demand, then bi-weekly",
    profitTarget: "10%",
    dailyDrawdown: "4%",
    maxDrawdown: "7%",
    minTradingDays: 3,
    consistencyRule: "40% on payouts",
    highlights: [
      "One phase, one target",
      "First 5 payouts on demand",
      "1% monthly stipend",
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
    payoutCycle: "First 5 on demand, then bi-weekly",
    profitTarget: "8% + 5%",
    dailyDrawdown: "5%",
    maxDrawdown: "10%",
    minTradingDays: 3,
    consistencyRule: "40% on payouts",
    highlights: [
      "Lower fee, more headroom",
      "5% daily / 10% overall loss limit",
      "First 5 payouts on demand",
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
    payoutCycle: "First 5 on demand, then bi-weekly",
    profitTarget: "6% × 3",
    dailyDrawdown: "4%",
    maxDrawdown: "8%",
    minTradingDays: 3,
    consistencyRule: "40% on payouts",
    highlights: [
      "Three 6% phases — easy pacing",
      "Cheapest entry in our line-up",
      "1% monthly stipend",
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
    tagline: "Skip the evaluation. Trade a funded account today.",
    badge: "No Evaluation",
    phases: 0,
    profitSplit: 80,
    profitSplitMax: 100,
    payoutCycle: "First 5 on demand, then bi-weekly",
    profitTarget: "—",
    dailyDrawdown: "3%",
    maxDrawdown: "5%",
    minTradingDays: 0,
    consistencyRule: "25% on payouts",
    highlights: [
      "No evaluation, funded from day one",
      "Static 5% loss limit, no trailing",
      "First 5 payouts on demand",
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
    label: "Access Account",
    shortLabel: "Access",
    tagline: "Pass first, pay later. Start for $5.",
    badge: "New",
    phases: 2,
    profitSplit: 80,
    profitSplitMax: 100,
    payoutCycle: "First 5 on demand, then bi-weekly",
    profitTarget: "8% + 5%",
    dailyDrawdown: "5%",
    maxDrawdown: "10%",
    minTradingDays: 3,
    consistencyRule: "40% on payouts",
    highlights: [
      "$5 to start the evaluation",
      "Pay the fee only after you pass",
      "5% daily / 10% overall loss limit",
    ],
    fees: {
      // the fee due within 48 hours of passing; $5 is charged at checkout
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

export type AddOnKey = "split-100" | "no-min-days" | "free-retry";

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
    description: "Keep 100% of your profit instead of 80%, from your first payout.",
    feePct: 20,
    appliesTo: ["1-step", "2-step", "3-step", "instant", "access"],
  },
  {
    key: "no-min-days",
    label: "No Minimum Trading Days",
    description: "Pass a phase the moment you hit the target. No three-day minimum.",
    feePct: 15,
    appliesTo: ["1-step", "2-step", "3-step", "access"],
  },
  {
    key: "free-retry",
    label: "Free Retry",
    description: "One free reset of the same account if you breach during the evaluation, at any time.",
    feePct: 20,
    appliesTo: ["1-step", "2-step", "3-step"],
  },
];

/* ─── Platforms ────────────────────────────────────────────────── */

export type PlatformKey = "tppterminal";

export interface Platform {
  key: PlatformKey;
  label: string;
  sub: string;
  status?: "live" | "soon";
  extraFeePct?: number;
}

export const platforms: Platform[] = [
  { key: "tppterminal", label: "TPP Terminal", sub: "Web and mobile, nothing to install", status: "live" },
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
