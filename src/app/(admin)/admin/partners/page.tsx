import { supabaseAdmin } from "@/lib/supabase";
import { PartnerProgramClient } from "./PartnerProgramClient";

export const revalidate = 0;

export default async function PartnersPage() {
  const { data: certificates } = await supabaseAdmin
    .from("certificates")
    .select("*")
    .order("issued_at", { ascending: false });

  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id, email, display_name");

  const profilesMap: Record<
    string,
    { email: string; display_name: string | null }
  > = {};
  for (const p of profiles || []) {
    profilesMap[p.id] = { email: p.email, display_name: p.display_name };
  }

  const enrichedCertificates = (certificates || []).map((cert) => ({
    ...cert,
    user_email: profilesMap[cert.user_id]?.email || null,
    user_display_name: profilesMap[cert.user_id]?.display_name || null,
  }));

  const allProfiles = (profiles || []).map((p) => ({
    id: p.id,
    email: p.email,
    display_name: p.display_name,
  }));

  return (
    <PartnerProgramClient
      certificates={enrichedCertificates}
      allProfiles={allProfiles}
    />
  );
}
