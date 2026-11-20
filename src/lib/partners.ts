import { supabaseAdmin } from "@/lib/supabase";
import { longDate } from "@/lib/certificates/present";
import { SITE_URL, type Certificate } from "@/lib/certificates/types";

export interface PartnerCertificateSummary {
  id: string;
  issued_at: string;
  revoked_at: string | null;
}

export interface PartnerCollaborator {
  id: string;
  displayName: string;
  approvedAt: string;
  hasAffiliate: boolean;
  referralUrl: string | null;
  certificate: PartnerCertificateSummary | null;
}

export const PARTNERS_PAGE_SIZE = 25;

export async function listPartners(page: number) {
  const offset = (page - 1) * PARTNERS_PAGE_SIZE;
  const { data, error } = await supabaseAdmin.from("partner_collaborators")
    .select("id,display_name,affiliate_user_id,approved_at,partner_certificates(id,issued_at,revoked_at)")
    .order("approved_at", { ascending: false })
    .order("id")
    .range(offset, offset + PARTNERS_PAGE_SIZE);
  if (error) throw error;
  const rows = data.slice(0, PARTNERS_PAGE_SIZE);
  const affiliateIds = rows.flatMap((row) => row.affiliate_user_id ? [row.affiliate_user_id as string] : []);
  const { data: affiliates, error: affiliateError } = affiliateIds.length
    ? await supabaseAdmin.from("affiliates").select("user_id").eq("status", "active").in("user_id", affiliateIds)
    : { data: [], error: null };
  if (affiliateError) throw affiliateError;
  const active = new Set(affiliates.map((affiliate) => affiliate.user_id));
  const collaborators: PartnerCollaborator[] = rows.map((row) => {
    const certificates: PartnerCertificateSummary[] = row.partner_certificates;
    const certificate = certificates.find((cert) => !cert.revoked_at)
      ?? [...certificates].sort((a, b) => b.issued_at.localeCompare(a.issued_at))[0]
      ?? null;
    return {
      id: row.id,
      displayName: row.display_name,
      approvedAt: row.approved_at,
      hasAffiliate: Boolean(row.affiliate_user_id),
      referralUrl: active.has(row.affiliate_user_id) ? SITE_URL + "/ref/" + row.affiliate_user_id.slice(0, 8) : null,
      certificate,
    };
  });
  return { collaborators, hasMore: data.length > PARTNERS_PAGE_SIZE };
}

export async function getPartnerCertificate(id: string): Promise<Certificate<"partner"> | null> {
  const { data, error } = await supabaseAdmin.from("partner_certificates")
    .select("id,issued_at,revoked_at,partner_collaborators!inner(display_name)")
    .eq("id", id)
    .maybeSingle();
  // Trading certificate links continue to resolve during a staged rollout.
  if (error?.code === "PGRST205" || error?.code === "42P01") return null;
  if (error) throw error;
  if (!data) return null;
  const partner = data.partner_collaborators as unknown as { display_name: string };
  return {
    id: data.id,
    number: "TPP-PARTNER-" + id.replace(/-/g, "").slice(0, 12).toUpperCase(),
    kind: "partner",
    status: data.revoked_at ? "revoked" : "active",
    revokedReason: null,
    traderName: partner.display_name,
    issuedOn: longDate(data.issued_at),
    issuedAt: data.issued_at,
    program: null,
    accountSize: null,
    phase: null,
    amount: null,
    period: null,
    title: null,
    statement: null,
    highlightLabel: null,
    highlightValue: null,
    source: "admin",
    isTest: false,
  };
}
