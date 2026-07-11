export type CertField = {
  /** query param key */
  id: string;
  label: string;
  default: string;
};

export type CertTypeConfig = {
  key: string;
  /** Display name in the studio UI */
  name: string;
  /** Small uppercase line above the title */
  eyebrow: string;
  /** Big headline on the certificate */
  title: string;
  /** Background image inside /public/certificates */
  bg: string;
  /** Accent hex used on the certificate */
  accent: string;
  /** If set, a big monospace amount is rendered with this label */
  amountLabel?: string;
  defaultAmount?: string;
  /** Exactly up to 3 meta fields shown in a row */
  fields: CertField[];
  /** Prefix used to build certificate IDs, e.g. TPP-P1 */
  idPrefix: string;
};

export const CERT_TYPES: Record<string, CertTypeConfig> = {
  phase1: {
    key: "phase1",
    name: "Phase 1 Passed",
    eyebrow: "Certificate of Achievement",
    title: "Phase One Cleared",
    bg: "bg-phase1.png",
    accent: "#c9f24b",
    fields: [
      { id: "account", label: "Account Size", default: "$100,000" },
      { id: "target", label: "Profit Target Hit", default: "8%" },
      { id: "date", label: "Date Achieved", default: "26 Jun 2026" },
    ],
    idPrefix: "TPP-P1",
  },
  phase2: {
    key: "phase2",
    name: "Phase 2 Passed",
    eyebrow: "Certificate of Verification",
    title: "Phase Two Cleared",
    bg: "bg-phase2.png",
    accent: "#c9f24b",
    fields: [
      { id: "account", label: "Account Size", default: "$100,000" },
      { id: "target", label: "Profit Target Hit", default: "5%" },
      { id: "date", label: "Date Achieved", default: "26 Jun 2026" },
    ],
    idPrefix: "TPP-P2",
  },
  funded: {
    key: "funded",
    name: "Funded Trader",
    eyebrow: "Certificate of Funding",
    title: "Funded Trader",
    bg: "bg-funded.png",
    accent: "#c9f24b",
    fields: [
      { id: "account", label: "Funded Capital", default: "$100,000" },
      { id: "split", label: "Profit Split", default: "90%" },
      { id: "date", label: "Date Funded", default: "26 Jun 2026" },
    ],
    idPrefix: "TPP-FT",
  },
  payout: {
    key: "payout",
    name: "Payout Certificate",
    eyebrow: "Certificate of Disbursement",
    title: "Payout Confirmed",
    bg: "bg-payout.png",
    accent: "#c9f24b",
    amountLabel: "Total Payout",
    defaultAmount: "$14,850.00",
    fields: [
      { id: "account", label: "Account", default: "$100,000" },
      { id: "split", label: "Profit Split", default: "90%" },
      { id: "date", label: "Date Paid", default: "26 Jun 2026" },
    ],
    idPrefix: "TPP-PO",
  },
  weekly: {
    key: "weekly",
    name: "Trader of the Week",
    eyebrow: "Weekly Leaderboard Award",
    title: "Trader of the Week",
    bg: "bg-weekly.png",
    accent: "#e8c65a",
    amountLabel: "Weekly Reward",
    defaultAmount: "$2,500.00",
    fields: [
      { id: "rank", label: "Leaderboard Rank", default: "#1" },
      { id: "week", label: "Week", default: "Week 27 · 2026" },
      { id: "gain", label: "Weekly Gain", default: "+12.4%" },
    ],
    idPrefix: "TPP-WK",
  },
  milestone: {
    key: "milestone",
    name: "Lifetime Milestone",
    eyebrow: "Elite Milestone",
    title: "Lifetime Payout Milestone",
    bg: "bg-milestone.png",
    accent: "#c9f24b",
    amountLabel: "Total Withdrawn",
    defaultAmount: "$50,000.00",
    fields: [
      { id: "payouts", label: "Payouts Received", default: "12" },
      { id: "since", label: "Member Since", default: "Jan 2025" },
      { id: "date", label: "Date Reached", default: "26 Jun 2026" },
    ],
    idPrefix: "TPP-ML",
  },
};

export const DEFAULT_NAME = "Aisha Okafor";
export const BRAND_DOMAIN = "thepeopleprop.live";
