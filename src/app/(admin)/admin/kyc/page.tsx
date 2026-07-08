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

  const enrichedDocs = (documents || []).map((d: any) => ({
    ...d,
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
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
      <div className="mb-8">
        <h1 className="mb-1 text-xl font-semibold tracking-tight text-ink sm:text-2xl">KYC Management</h1>
        <p className="text-[var(--ink-500)]">Review and manage user identity verification documents.</p>
      </div>

      <KycClient initialDocuments={enrichedDocs} statusCounts={statusCounts} />
    </div>
  );
}
