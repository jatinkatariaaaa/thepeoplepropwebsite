import { supabaseAdmin } from "@/lib/supabase";
import { KycClient } from "./KycClient";

export const revalidate = 0;

export default async function AdminKycPage() {
  const [{ data: documents }, { data: profiles }] = await Promise.all([
    supabaseAdmin
      .from("kyc_documents")
      .select("*, profiles(id, email, display_name)")
      .order("created_at", { ascending: false })
      .limit(200),
    supabaseAdmin.from("profiles").select("id, email, display_name"),
  ]);

  const profilesMap = (profiles || []).reduce((acc: any, p: any) => {
    acc[p.id] = p;
    return acc;
  }, {});

  // Stored values are paths in the private kyc-documents bucket; turn them into one-hour signed links.
  const paths = (documents || [])
    .flatMap((d: any) => [d.front_image_url, d.back_image_url, d.selfie_image_url])
    .filter((p: unknown): p is string => typeof p === "string" && p.length > 0 && !p.startsWith("http"));
  const signed = new Map<string, string>();
  if (paths.length) {
    const { data } = await supabaseAdmin.storage.from("kyc-documents").createSignedUrls(paths, 3600);
    for (const row of data ?? []) if (row.path && row.signedUrl) signed.set(row.path, row.signedUrl);
  }
  const link = (p: string | null) => (p ? (p.startsWith("http") ? p : (signed.get(p) ?? null)) : null);

  const enrichedDocs = (documents || []).map((d: any) => ({
    ...d,
    front_image_url: link(d.front_image_url),
    back_image_url: link(d.back_image_url),
    selfie_image_url: link(d.selfie_image_url),
    profiles: d.profiles || profilesMap[d.user_id] || null,
  }));

  // Get counts by status
  const statusCounts = {
    pending: enrichedDocs.filter((d: any) => d.status === "pending").length,
    approved: enrichedDocs.filter((d: any) => d.status === "approved").length,
    rejected: enrichedDocs.filter((d: any) => d.status === "rejected").length,
    expired: enrichedDocs.filter((d: any) => d.status === "expired").length,
    reupload_requested: enrichedDocs.filter((d: any) => d.status === "reupload_requested").length,
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-[var(--ink-950)] mb-2">KYC Management</h1>
        <p className="text-[var(--ink-500)]">Review and manage user identity verification documents.</p>
      </div>

      <KycClient initialDocuments={enrichedDocs} statusCounts={statusCounts} />
    </div>
  );
}
