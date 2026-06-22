"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  Users,
  CreditCard,
  Activity,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Ticket,
  ShieldCheck,
  ArrowRight,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { AdminAreaChart, AdminBarChart } from "@/components/admin/AdminChart";
import { format, subDays, startOfDay } from "date-fns";

/* ─── Types ─── */
interface DashboardStats {
  totalUsers: number;
  activeChallenges: number;
  totalRevenue: number;
  pendingPayouts: number;
  openTickets: number;
  activeCoupons: number;
  newUsersToday: number;
  revenueToday: number;
}

interface RecentOrder {
  id: string;
  email: string;
  program_key: string;
  account_size: number;
  price_amount: number;
  payment_status: string;
  created_at: string;
}

interface RecentUser {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
}

interface ChartPoint {
  date: string;
  revenue: number;
  orders: number;
}

/* ─── Stat Card ─── */
function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
  trend,
  trendLabel,
  href,
}: {
  label: string;
  value: string | number;
  icon: any;
  color: string;
  bg: string;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  href?: string;
}) {
  const className = "group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm transition-all hover:shadow-md";

  const content = (
    <>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] font-medium text-[var(--ink-400)]">{label}</p>
          <p className="mt-1 text-3xl font-bold tracking-tight text-[var(--ink-950)]">
            {value}
          </p>
          {trendLabel && (
            <div className="mt-2 flex items-center gap-1">
              {trend === "up" && (
                <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
              )}
              {trend === "down" && (
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              )}
              <span
                className={`text-[12px] font-semibold ${
                  trend === "up"
                    ? "text-emerald-600"
                    : trend === "down"
                    ? "text-red-500"
                    : "text-[var(--ink-400)]"
                }`}
              >
                {trendLabel}
              </span>
            </div>
          )}
        </div>
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${bg}`}
        >
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
      {href && (
        <div className="absolute bottom-0 right-0 p-3 opacity-0 transition-opacity group-hover:opacity-100">
          <ArrowRight className="h-4 w-4 text-[var(--ink-400)]" />
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <div className={className}>
      {content}
    </div>
  );
}

/* ─── Status Badge ─── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; dot: string }> = {
    paid: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
    completed: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
    active: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
    pending: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
    failed: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
    open: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  };
  const s = map[status] || { bg: "bg-gray-50", text: "text-gray-700", dot: "bg-gray-500" };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${s.bg} ${s.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

/* ─── Main Dashboard ─── */
export default function AdminDashboardClient() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    async function fetchDashboard() {
      try {
        const today = startOfDay(new Date()).toISOString();

        // Parallel fetches
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
          supabase.from("profiles").select("*", { count: "exact", head: true }),
          supabase.from("accounts").select("*", { count: "exact", head: true }).in("status", ["active", "passed"]),
          supabase.from("purchases").select("price_amount").eq("payment_status", "paid"),
          supabase.from("payouts").select("*", { count: "exact", head: true }).eq("status", "pending"),
          supabase.from("support_tickets").select("*", { count: "exact", head: true }).eq("status", "open").then(r => r.error ? { count: 0 } : r),
          supabase.from("tpp_coupons").select("*", { count: "exact", head: true }).eq("is_active", true),
          supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", today),
          supabase.from("purchases").select("price_amount").eq("payment_status", "paid").gte("created_at", today),
          supabase.from("purchases").select("id, email, program_key, account_size, price_amount, payment_status, created_at").order("created_at", { ascending: false }).limit(8),
          supabase.from("profiles").select("id, email, display_name, created_at").order("created_at", { ascending: false }).limit(8),
          supabase.from("purchases").select("price_amount, created_at").eq("payment_status", "paid").gte("created_at", subDays(new Date(), 30).toISOString()),
        ]);

        const totalRevenue = allPurchases?.reduce((s, p) => s + Number(p.price_amount), 0) || 0;
        const revenueToday = todayPurchases?.reduce((s, p) => s + Number(p.price_amount), 0) || 0;

        setStats({
          totalUsers: totalUsers || 0,
          activeChallenges: activeChallenges || 0,
          totalRevenue,
          pendingPayouts: pendingPayouts || 0,
          openTickets: (openTickets as number) || 0,
          activeCoupons: activeCoupons || 0,
          newUsersToday: newUsersToday || 0,
          revenueToday,
        });

        setRecentOrders(recentOrdersData || []);
        setRecentUsers(recentUsersData || []);

        // Build 30-day chart data
        const days: ChartPoint[] = [];
        for (let i = 29; i >= 0; i--) {
          const day = subDays(new Date(), i);
          const dayStr = format(day, "yyyy-MM-dd");
          const dayLabel = format(day, "MMM dd");
          const dayOrders = last30DaysPurchases?.filter(
            (p) => format(new Date(p.created_at), "yyyy-MM-dd") === dayStr
          );
          days.push({
            date: dayLabel,
            revenue: dayOrders?.reduce((s, p) => s + Number(p.price_amount), 0) || 0,
            orders: dayOrders?.length || 0,
          });
        }
        setChartData(days);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--ink-200)] border-t-[var(--ink-950)]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--ink-950)]">Dashboard</h1>
        <p className="text-[var(--ink-500)]">
          Platform overview and real-time metrics
        </p>
      </div>

      {/* Stat Cards — Row 1 */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={stats?.totalUsers || 0}
          icon={Users}
          color="text-blue-600"
          bg="bg-blue-50"
          trend="up"
          trendLabel={`+${stats?.newUsersToday || 0} today`}
          href="/admin/users"
        />
        <StatCard
          label="Active Challenges"
          value={stats?.activeChallenges || 0}
          icon={Activity}
          color="text-amber-600"
          bg="bg-amber-50"
          href="/admin/accounts"
        />
        <StatCard
          label="Total Revenue"
          value={`$${(stats?.totalRevenue || 0).toLocaleString()}`}
          icon={CreditCard}
          color="text-emerald-600"
          bg="bg-emerald-50"
          trend="up"
          trendLabel={`+$${(stats?.revenueToday || 0).toLocaleString()} today`}
          href="/admin/purchases"
        />
        <StatCard
          label="Pending Payouts"
          value={stats?.pendingPayouts || 0}
          icon={DollarSign}
          color="text-violet-600"
          bg="bg-violet-50"
          href="/admin/payouts"
        />
      </div>

      {/* Stat Cards — Row 2 */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
        <StatCard
          label="Open Support Tickets"
          value={stats?.openTickets || 0}
          icon={Ticket}
          color="text-rose-600"
          bg="bg-rose-50"
          href="/admin/tickets"
        />
        <StatCard
          label="Active Coupons"
          value={stats?.activeCoupons || 0}
          icon={ShieldCheck}
          color="text-sky-600"
          bg="bg-sky-50"
          href="/admin/coupons"
        />
      </div>

      {/* Charts Row */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-bold text-[var(--ink-950)]">
                Revenue
              </h3>
              <p className="text-[12px] text-[var(--ink-400)]">Last 30 days</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-bold text-emerald-700">
              ${(stats?.totalRevenue || 0).toLocaleString()}
            </span>
          </div>
          <AdminAreaChart
            data={chartData}
            dataKey="revenue"
            xKey="date"
            color="#0c0c0c"
            height={240}
          />
        </div>

        {/* Orders Chart */}
        <div className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-bold text-[var(--ink-950)]">
                Orders
              </h3>
              <p className="text-[12px] text-[var(--ink-400)]">Last 30 days</p>
            </div>
            <span className="rounded-full bg-[#cbfb45]/20 px-3 py-1 text-[12px] font-bold text-[var(--ink-950)]">
              {chartData.reduce((s, d) => s + d.orders, 0)} total
            </span>
          </div>
          <AdminBarChart
            data={chartData}
            dataKey="orders"
            xKey="date"
            color="#cbfb45"
            height={240}
          />
        </div>
      </div>

      {/* Recent Activity Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="rounded-2xl border border-[var(--border)] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
            <h3 className="text-[15px] font-bold text-[var(--ink-950)]">
              Recent Orders
            </h3>
            <Link
              href="/admin/purchases"
              className="text-[12px] font-semibold text-[var(--ink-400)] transition-colors hover:text-[var(--ink-950)]"
            >
              View all →
            </Link>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {recentOrders.length === 0 && (
              <div className="px-6 py-8 text-center text-[13px] text-[var(--ink-400)]">
                No orders yet
              </div>
            )}
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between px-6 py-3.5 transition-colors hover:bg-[var(--paper-2)]"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-[var(--ink-950)]">
                    {order.email}
                  </p>
                  <p className="text-[12px] text-[var(--ink-400)]">
                    {order.program_key} · ${Number(order.account_size).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[14px] font-bold text-[var(--ink-950)]">
                    ${Number(order.price_amount).toLocaleString()}
                  </span>
                  <StatusBadge status={order.payment_status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Registrations */}
        <div className="rounded-2xl border border-[var(--border)] bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
            <h3 className="text-[15px] font-bold text-[var(--ink-950)]">
              Recent Registrations
            </h3>
            <Link
              href="/admin/users"
              className="text-[12px] font-semibold text-[var(--ink-400)] transition-colors hover:text-[var(--ink-950)]"
            >
              View all →
            </Link>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {recentUsers.length === 0 && (
              <div className="px-6 py-8 text-center text-[13px] text-[var(--ink-400)]">
                No users yet
              </div>
            )}
            {recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between px-6 py-3.5 transition-colors hover:bg-[var(--paper-2)]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--ink-950)] text-[13px] font-bold text-white">
                    {(user.display_name || user.email || "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[13px] font-semibold text-[var(--ink-950)]">
                      {user.display_name || "—"}
                    </p>
                    <p className="text-[12px] text-[var(--ink-400)]">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[12px] text-[var(--ink-400)]">
                  <Clock className="h-3.5 w-3.5" />
                  {format(new Date(user.created_at), "MMM dd, HH:mm")}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
