import { revalidateTag, unstable_cache } from "next/cache";
import { getAdminRole } from "@/lib/admin-auth";
import { supabaseAdmin } from "@/lib/supabase";

/**
 * The dashboard sidebar's two buttons, Admin panel and Partner desk, cached per user for a minute.
 * Each dashboard render used to ask the database three times (partner_desk_eligible, admin_roles and
 * profiles). Access itself is unchanged: /admin and /partner-desk still check on every request; this only
 * decides whether the buttons show. Admin role and staff changes clear it at once (refreshSidebarFlags).
 * A failed lookup is thrown, never cached.
 */
export const SIDEBAR_FLAGS_TAG = "sidebar-flags";

const cachedPartnerDesk = unstable_cache(
  async (userId: string): Promise<boolean> => {
    const { data, error } = await supabaseAdmin.rpc("partner_desk_eligible", { p_user_id: userId });
    if (error) throw new Error(error.message);
    return data === true;
  },
  ["sidebar-partner-desk-v1"],
  { tags: [SIDEBAR_FLAGS_TAG], revalidate: 60 },
);

const cachedIsAdmin = unstable_cache(
  async (userId: string): Promise<boolean> => (await getAdminRole(userId)) !== null,
  ["sidebar-is-admin-v1"],
  { tags: [SIDEBAR_FLAGS_TAG], revalidate: 60 },
);

/** Same fallbacks as before: a lookup that fails hides that button for this render. */
export async function getSidebarFlags(userId: string): Promise<{ hasPartnerDesk: boolean; isAdmin: boolean }> {
  const [hasPartnerDesk, isAdmin] = await Promise.all([
    cachedPartnerDesk(userId).catch(() => false),
    cachedIsAdmin(userId).catch(() => false),
  ]);
  return { hasPartnerDesk, isAdmin };
}

export function refreshSidebarFlags(): void {
  revalidateTag(SIDEBAR_FLAGS_TAG, { expire: 0 });
}
