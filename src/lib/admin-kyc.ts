import "server-only";
import { supabaseAdmin } from "@/lib/supabase";

export const kycReviewRoles = ["super_admin", "finance", "support"];
export const maxKycPageSize = 200;
export const kycDocumentIdPattern = /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

export async function attachKycProfiles<T extends { user_id: string }>(documents: T[]) {
  if (!documents.length) return [];

  // KYC records reference auth.users. Profiles have the same IDs but no direct foreign key.
  const userIds = [...new Set(documents.map((document) => document.user_id))];
  const { data: profiles, error } = await supabaseAdmin
    .from("profiles")
    .select("id, email, display_name, kyc_status")
    .in("id", userIds);

  if (error) throw error;

  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));
  return documents.map((document) => ({
    ...document,
    profiles: profilesById.get(document.user_id) ?? null,
  }));
}
