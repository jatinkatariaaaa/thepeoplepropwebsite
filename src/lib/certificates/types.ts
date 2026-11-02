export type CertificateKind = "funded" | "payout" | "highest";

/** Everything a certificate shows. Built from Supabase rows by ./data. */
export type Certificate = {
  kind: CertificateKind;
  /** Terminal account id for "funded", payout id for "payout" and "highest". */
  id: string;
  /** Short reference printed on the certificate, e.g. "3F9A2C7E". */
  number: string;
  traderName: string;
  /** Issue date, e.g. "October 30, 2026": the pass date or the payout date. */
  issuedOn: string;
  /** Account size, e.g. "$100,000". */
  accountSize: string;
  /** Program, e.g. "2-Step Evaluation", when the account traces back to a purchase. */
  program: string | null;
  /** "passed" or "funded" (funded certificates only). */
  status?: string;
  /** Payout amount, e.g. "$3,056.21" (payout and highest). */
  amount?: string;
  /** Month a highest-payout award covers, e.g. "October 2026". */
  period?: string;
};

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://thepeopleprop.live";

/** Public page that confirms a certificate (the QR code points here). */
export const verifyUrl = (id: string) => `${SITE_URL}/verify/${id}`;

/** Image route for a certificate. Funded certificates keep their original URL. */
export const certificateImagePath = (kind: CertificateKind, id: string) =>
  kind === "funded" ? `/api/certificate/${id}` : `/api/certificate/${kind}/${id}`;

export const certificateTitle: Record<CertificateKind, string> = {
  funded: "Certificate of Funding",
  payout: "Payout Certificate",
  highest: "Highest Payout",
};
