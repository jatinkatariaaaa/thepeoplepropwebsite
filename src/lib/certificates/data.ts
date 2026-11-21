import { supabaseAdmin } from "@/lib/supabase";
import { getPartnerCertificate } from "@/lib/partners";
import { present } from "./present";
import { isUuid, type Certificate, type CertificateKind, type CertificateRow, type ShareableCertificate } from "./types";

/*
 * Reads issued certificates (public.certificates). Rows are created by database
 * triggers when a phase is passed, a funded account is issued or a payout is paid,
 * and by admins from Admin → Certificates.
 */

async function one(query: PromiseLike<{ data: unknown }>) {
  const { data } = await query;
  const row = (Array.isArray(data) ? data[0] : data) as CertificateRow | undefined | null;
  return row ? present(row) : null;
}

/** A certificate by its own id, active or revoked. */
export async function getCertificate(id: string): Promise<Certificate | null> {
  if (!isUuid(id)) return null;
  return one(supabaseAdmin.from("certificates").select("*").eq("id", id).maybeSingle());
}

/**
 * The certificate behind any id printed on a certificate, for /verify/<id> and the
 * image route. Certificates issued before they had their own rows printed the
 * account id (funding) or the payout id (payouts), so those still resolve.
 */
export async function findCertificate(id: string): Promise<ShareableCertificate | null> {
  if (!isUuid(id)) return null;
  const own = await getCertificate(id);
  if (own) return own;
  const partner = await getPartnerCertificate(id);
  if (partner) return partner;
  const byPayout = await one(supabaseAdmin.from("certificates").select("*").eq("payout_id", id).eq("kind", "payout").order("status").order("created_at", { ascending: false }).limit(1));
  if (byPayout) return byPayout;
  return one(
    supabaseAdmin
      .from("certificates")
      .select("*")
      .or(`account_id.eq.${id},trading_account_id.eq.${id}`)
      .in("kind", ["funded", "phase_pass"])
      .order("status")
      .order("issued_at", { ascending: false })
      .limit(1),
  );
}

/** Legacy image routes: the certificate of a given kind recorded for a payout. */
export async function findByPayout(payoutId: string, kind: CertificateKind): Promise<Certificate | null> {
  if (!isUuid(payoutId)) return null;
  return one(supabaseAdmin.from("certificates").select("*").eq("payout_id", payoutId).eq("kind", kind).order("status").order("created_at", { ascending: false }).limit(1));
}

/** A trader's live certificates, newest first. */
export async function listCertificates(userId: string): Promise<Certificate[]> {
  const { data } = await supabaseAdmin.from("certificates").select("*").eq("user_id", userId).eq("status", "active").order("issued_at", { ascending: false });
  return ((data ?? []) as CertificateRow[]).map(present);
}
