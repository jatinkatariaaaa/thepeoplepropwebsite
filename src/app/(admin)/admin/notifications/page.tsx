import { supabaseAdmin } from "@/lib/supabase";
import { NotificationsClient } from "./NotificationsClient";

export const revalidate = 0;

export default async function AdminNotificationsPage() {
  const [{ data: notifications }, { data: profiles }] = await Promise.all([
    supabaseAdmin
      .from("admin_notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200),
    supabaseAdmin.from("profiles").select("id, email, display_name"),
  ]);

  const profilesMap = (profiles || []).reduce((acc: any, p: any) => {
    acc[p.id] = p;
    return acc;
  }, {});

  const enrichedNotifs = (notifications || []).map((n: any) => ({
    ...n,
    profiles: profilesMap[n.user_id] || null,
  }));

  const unreadCount = enrichedNotifs.filter((n: any) => !n.is_read).length;
  const typeCounts = enrichedNotifs.reduce((acc: any, n: any) => {
    acc[n.type] = (acc[n.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-[var(--ink-950)] mb-2">Notifications</h1>
        <p className="text-[var(--ink-500)]">
          {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up"}
        </p>
      </div>

      <NotificationsClient
        initialNotifications={enrichedNotifs}
        unreadCount={unreadCount}
        typeCounts={typeCounts}
      />
    </div>
  );
}
