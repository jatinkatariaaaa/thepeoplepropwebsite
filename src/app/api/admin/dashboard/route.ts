import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAdminUser } from "@/lib/admin-auth";
import { subDays, startOfDay } from "date-fns";

export async function GET(request: Request) {
  try {
    await getAdminUser(request);

    const today = startOfDay(new Date()).toISOString();
    const thirtyDaysAgo = subDays(new Date(), 30).toISOString();

    const [
      { count: totalUsers },
      { count: activeChallenges },
      { data: allPurchases },
      { count: pendingPayouts },
      { count: openTickets },
      { count: activeCoupons },
      { count: newUsersToday },
      { data: todayPurchases },
      { data: recentOrdersData },
      { data: recentUsersData },
      { data: last30DaysPurchases },
    ] = await Promise.all([
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("trading_accounts").select("*", { count: "exact", head: true }).in("status", ["active", "passed"]),
      supabaseAdmin.from("purchases").select("price_amount").eq("payment_status", "paid"),
      supabaseAdmin.from("payouts").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabaseAdmin.from("support_tickets").select("*", { count: "exact", head: true }).eq("status", "open").then(r => r.error ? { count: 0 } : r),
      supabaseAdmin.from("tpp_coupons").select("*", { count: "exact", head: true }).eq("is_active", true),
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", today),
      supabaseAdmin.from("purchases").select("price_amount").eq("payment_status", "paid").gte("created_at", today),
      supabaseAdmin.from("purchases").select("id, email, program_key, account_size, price_amount, payment_status, created_at").order("created_at", { ascending: false }).limit(8),
      supabaseAdmin.from("profiles").select("id, email, display_name, created_at").order("created_at", { ascending: false }).limit(8),
      supabaseAdmin.from("purchases").select("price_amount, created_at").eq("payment_status", "paid").gte("created_at", thirtyDaysAgo),
    ]);

    const totalRevenue = allPurchases?.reduce((s, p) => s + Number(p.price_amount), 0) || 0;
    const revenueToday = todayPurchases?.reduce((s, p) => s + Number(p.price_amount), 0) || 0;

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers || 0,
        activeChallenges: activeChallenges || 0,
        totalRevenue,
        pendingPayouts: pendingPayouts || 0,
        openTickets: (openTickets as number) || 0,
        activeCoupons: activeCoupons || 0,
        newUsersToday: newUsersToday || 0,
        revenueToday,
      },
      recentOrders: recentOrdersData || [],
      recentUsers: recentUsersData || [],
      last30DaysPurchases: last30DaysPurchases || []
    });
  } catch (error: any) {
    console.error("Admin dashboard fetch error:", error);
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
