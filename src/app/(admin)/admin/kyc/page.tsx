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
    .order("created_at", { ascending: false, nullsFirst: false })
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

  const seenUsers = new Set<string>();
  const now = Date.now();
  return documents.map((doc) => {
    const latest = !seenUsers.has(doc.user_id);
    seenUsers.add(doc.user_id);
    const filePaths = [doc.front_image_url, doc.back_image_url, doc.selfie_image_url]
      .filter((path): path is string => typeof path === "string" && path.length > 0);
    const requiredPaths = doc.document_type === "passport"
      ? [doc.front_image_url, doc.selfie_image_url]
      : [doc.front_image_url, doc.back_image_url, doc.selfie_image_url];

    return {
      ...doc,
      front_image_url: link(doc.front_image_url),
      back_image_url: link(doc.back_image_url),
      selfie_image_url: link(doc.selfie_image_url),
      has_hosted_files: filePaths.some((path) => signed.has(path))
        && filePaths.every((path) => path.startsWith(`${doc.user_id}/`) && !path.includes("..")),
      bulk_eligible: latest && doc.status === "pending" && doc.profiles?.kyc_status === "pending"
        && (!doc.expires_at || Date.parse(doc.expires_at) > now)
        && ["passport", "national_id", "driving_license"].includes(doc.document_type)
        && requiredPaths.every((path) => path?.startsWith(`${doc.user_id}/`) && signed.has(path))
        && new Set(requiredPaths).size === requiredPaths.length,
    };
  });
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
