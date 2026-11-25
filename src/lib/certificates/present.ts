import { programs } from "@/data/programs";
import type { Certificate, CertificateRow } from "./types";

/* Turns a certificate row into the formatted fields the artwork and pages print. */

const usd = (value: number | string | null | undefined, cents: boolean) =>
  value == null || value === ""
    ? null
    : Number(value).toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 });

export const longDate = (iso: string) => new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

export const monthLabel = (iso: string) => new Date(iso).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" });

export const programLabel = (key: string | null | undefined) => (key ? (programs.find((p) => p.key === key)?.label ?? null) : null);

export function present(row: CertificateRow): Certificate {
  return {
    id: row.id,
    number: row.number,
    kind: row.kind,
    status: row.status,
    revokedReason: row.revoked_reason,
    traderName: row.trader_name,
    issuedOn: longDate(row.issued_at),
    issuedAt: row.issued_at,
    program: programLabel(row.program_key),
    accountSize: usd(row.account_size, false),
    phase: row.phase_index ? `Phase ${row.phase_index}` : null,
    amount: usd(row.amount, true),
    period: row.period_label,
    title: row.title,
    statement: row.statement,
    highlightLabel: row.highlight_label,
    highlightValue: row.highlight_value,
    source: row.source,
    isTest: Boolean(row.is_test),
  };
}
