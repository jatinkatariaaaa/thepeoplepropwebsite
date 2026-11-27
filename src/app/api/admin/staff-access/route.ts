import { logAudit, requireRole } from "@/lib/admin-auth";
import { refreshSidebarFlags } from "@/lib/sidebar-flags";
import { jsonError } from "@/lib/api-auth";
import { isUuid } from "@/lib/certificates/types";
import { isStaffPermission } from "@/lib/staff-access";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const owner = await requireRole(request, ["super_admin"]);
    if (!request.headers.get("content-type")?.startsWith("application/json")) return jsonError("Send a JSON request.", 415);
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) return jsonError("Invalid request.");
    const { permissions, commissionBps, active } = body;
    const rank = typeof body.rank === "string" ? body.rank.trim() : "";
    if (!rank || rank.length > 60 || /[\r\n\t]/.test(rank)) return jsonError("Enter a rank between 1 and 60 characters.");
    if (!Array.isArray(permissions) || permissions.length > 4 || !permissions.every(isStaffPermission) || new Set(permissions).size !== permissions.length) {
      return jsonError("Choose valid partner desk permissions.");
    }
    if (!Number.isInteger(commissionBps) || commissionBps < 0 || commissionBps > 10000) return jsonError("Enter a sale share between 0% and 100%.");
    if (typeof active !== "boolean") return jsonError("Choose an access status.");

    let userId: string;
    let expectedVersion: string | null = null;
    if (body.userId === undefined) {
      const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
      if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return jsonError("Enter the email used to sign in.");
      const { data, error } = await supabaseAdmin.rpc("partner_account_id", { p_email: email });
      if (error) throw error;
      if (!data) return jsonError("No website account uses that sign-in email.", 404);
      userId = data;
    } else {
      if (typeof body.userId !== "string" || !isUuid(body.userId)) return jsonError("Invalid staff member.");
      if (typeof body.updatedAt !== "string" || !Number.isFinite(Date.parse(body.updatedAt))) return jsonError("Refresh to load the latest settings.", 409);
      userId = body.userId;
      expectedVersion = body.updatedAt;
    }
    if (userId === owner.user.id) return jsonError("Choose a staff or partner account.", 409);
    const { error } = await supabaseAdmin.rpc("set_staff_member", {
      p_user_id: userId, p_rank: rank, p_permissions: permissions, p_commission_bps: commissionBps,
      p_active: active, p_expected_updated_at: expectedVersion,
    });
    if (error?.code === "40001" || error?.code === "23505") return jsonError("This grant already exists or has changed. Open its latest settings to edit it.", 409);
    if (error?.code === "42501") return jsonError("This account already has admin access. Revoke its admin role in Roles & Permissions before assigning a limited staff grant.", 409);
    if (error?.code === "23514") return jsonError("This pool is below an active promoter's sale share. Lower or pause that promoter link first.", 409);
    if (error?.code === "22023") return jsonError("Check the rank, permissions and commission pool.");
    if (error) throw error;
    await logAudit({
      adminId: owner.user.id, adminEmail: owner.email, request,
      action: expectedVersion ? "update_staff_access" : "grant_staff_access",
      entityType: "staff_member", entityId: userId, newValue: { rank, permissions, commissionBps, active },
    });
    refreshSidebarFlags();
    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") return jsonError("Sign in to continue.", 401);
    if (error instanceof Error && error.message === "Forbidden") return jsonError("Owner access is required.", 403);
    console.error("Staff access update failed", error);
    return jsonError("Staff access could not be saved.", 500);
  }
}
