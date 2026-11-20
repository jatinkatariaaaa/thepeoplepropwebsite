import { supabaseAdmin } from "@/lib/supabase";
import type { PartnerDeskSnapshot } from "@/lib/partner-desk-types";

/** Caller must supply the ID from a verified session. The database filters every field. */
export async function readPartnerDesk(userId: string): Promise<PartnerDeskSnapshot | null> {
  const { data, error } = await supabaseAdmin.rpc("partner_desk_snapshot", { p_user_id: userId });
  if (error) throw new Error("Could not load the partner desk.", { cause: error });
  return data as PartnerDeskSnapshot | null;
}

export function deskResponse(body: unknown, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "private, no-store" } });
}
