import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import { attachKycProfiles, kycReviewRoles, maxKycPageSize } from "@/lib/admin-kyc";
import { supabaseAdmin } from "@/lib/supabase";
import { KycClient } from "./KycClient";

export const revalidate = 0;

async function loadQueue() {
  const { data, error } = await supabaseAdmin
    .from("kyc_documents")
    .select("*")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(maxKycPageSize);
  if (error) throw error;

  const documents = await attachKycProfiles(data);

  // Stored values are paths in the private kyc-documents bucket; turn them into one-hour signed links.
  const paths = [...new Set(documents
    .flatMap((d) => [d.front_image_url, d.back_image_url, d.selfie_image_url])
    .filter((p): p is string => typeof p === "string" && p.length > 0 && !p.startsWith("http")))];
  const signed = new Map<string, string>();
  if (paths.length) {
    const { data } = await supabaseAdmin.storage.from("kyc-documents").createSignedUrls(paths, 3600);
    for (const row of data ?? []) if (row.path && row.signedUrl) signed.set(row.path, row.signedUrl);
  }
  const link = (p: string | null) => (p ? (p.startsWith("http") ? p : (signed.get(p) ?? null)) : null);

  return documents.map((d) => ({
    ...d,
    front_image_url: link(d.front_image_url),
    back_image_url: link(d.back_image_url),
    selfie_image_url: link(d.selfie_image_url),
  }));
}

export default async function AdminKycPage() {
  const admin = await getAdminUser().catch(() => null);
  if (!admin || !kycReviewRoles.includes(admin.role)) redirect("/admin");

  const documents = await loadQueue().catch(() => {
    console.error("Unable to load the admin KYC queue");
    return null;
  });


  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-[var(--ink-950)] mb-2">KYC Management</h1>
        <p className="text-[var(--ink-500)]">Review and manage user identity verification documents.</p>
      </div>

      {documents ? (
        <KycClient initialDocuments={documents} />
      ) : (
        <p role="alert" className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          Couldn’t load KYC requests. Refresh this page to try again.
        </p>
      )}
    </div>
  );
}
