import "server-only";
import { supabaseAdmin } from "@/lib/supabase";

type CleanupResult = { id: string; status: "removed" | "pending" };

export async function removeArchivedKycFiles(documentIds: string[]): Promise<CleanupResult[]> {
  if (!documentIds.length) return [];

  const args = { p_document_ids: documentIds };
  const completedIds = new Set<string>();

  try {
    const { data: candidates, error } = await supabaseAdmin.rpc("kyc_cleanup_candidates", args);
    if (error) throw error;

    const paths = [...new Set<string>((candidates ?? []).map((candidate: { path: string }) => candidate.path))];
    if (paths.length) {
      const { error: removalError } = await supabaseAdmin.storage.from("kyc-documents").remove(paths);
      if (removalError) console.error("Unable to remove some archived KYC files from storage");
    }

    // Check actual object existence before clearing references, including after a partial failure.
    const { data: completed, error: completionError } = await supabaseAdmin.rpc("complete_kyc_storage_cleanup", args);
    if (completionError) throw completionError;
    for (const row of completed ?? []) completedIds.add(row.id);
  } catch {
    console.error("Unable to complete archived KYC file cleanup");
  }

  return documentIds.map((id) => ({ id, status: completedIds.has(id) ? "removed" : "pending" }));
}
