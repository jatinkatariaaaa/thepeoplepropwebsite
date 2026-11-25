/*
 * Certificates are issued records (public.certificates): created automatically when a
 * phase is passed, a funded account is issued or a payout is paid, or issued by an admin.
 * This file is safe to import from client components.
 */

export type CertificateKind = "phase_pass" | "funded" | "payout" | "highest_payout" | "award";
export type CertificateStatus = "active" | "revoked";

/** A row of public.certificates. */
export type CertificateRow = {
  id: string;
  number: string;
  kind: CertificateKind;
  status: CertificateStatus;
  user_id: string;
  trader_name: string;
  account_id: string | null;
  trading_account_id: string | null;
  payout_id: string | null;
  program_key: string | null;
  account_size: number | string | null;
  phase_index: number | null;
  amount: number | string | null;
  period_label: string | null;
  title: string | null;
  statement: string | null;
  highlight_label: string | null;
  highlight_value: string | null;
  issued_at: string;
  source: "system" | "admin";
  issued_by: string | null;
  revoked_reason: string | null;
  revoked_at: string | null;
  note: string | null;
  is_test: boolean;
  created_at: string;
};

/** Everything a certificate shows, formatted. Built from a row by ./data (or ./present). */
export type Certificate = {
  id: string;
  number: string;
  kind: CertificateKind;
  status: CertificateStatus;
  revokedReason: string | null;
  traderName: string;
  /** "October 30, 2026": the date of the event the certificate records. */
  issuedOn: string;
  issuedAt: string;
  /** "2-Step Evaluation", when known. */
  program: string | null;
  /** "$100,000", when known. */
  accountSize: string | null;
  /** "Phase 1", for passed phases. */
  phase: string | null;
  /** "$3,056.21" for payouts and highest-payout awards. */
  amount: string | null;
  /** "October 2026" for highest-payout awards. */
  period: string | null;
  /** Awards: the title, the sentence and an optional highlight. */
  title: string | null;
  statement: string | null;
  highlightLabel: string | null;
  highlightValue: string | null;
  source: "system" | "admin";
  /** Staff test certificate: rendered with a TEST mark, not a real result. */
  isTest: boolean;
};

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://thepeopleprop.live").replace(/\/$/, "");

/** Public page that confirms a certificate (the QR code points here). */
export const verifyUrl = (id: string) => `${SITE_URL}/verify/${id}`;

/** PNG of a certificate. */
export const certificateImagePath = (id: string) => `/api/certificate/${id}`;

export const KIND_LABEL: Record<CertificateKind, string> = {
  phase_pass: "Phase Passed",
  funded: "Certificate of Funding",
  payout: "Payout Certificate",
  highest_payout: "Highest Payout Award",
  award: "Award",
};

/** The name a certificate goes by in lists: awards use their own title. */
export const certificateTitle = (c: Pick<Certificate, "kind" | "title" | "phase">) =>
  c.kind === "award" ? c.title || "Award" : c.kind === "phase_pass" ? `${c.phase ?? "Evaluation"} Passed` : KIND_LABEL[c.kind];

export const isUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
