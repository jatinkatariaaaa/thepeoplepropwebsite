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
  const className = "dash-card dash-card-hover group relative block overflow-hidden p-4 sm:p-5";

  const content = (
    <>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="dash-overline">{label}</p>
        <Icon className="h-4 w-4 shrink-0 text-ink-300" aria-hidden="true" />
      </div>
      <p className="dash-figure text-2xl">{value}</p>
      {trendLabel && (
        <div className="mt-1.5 flex items-center gap-1">
          {trend === "up" && (
            <TrendingUp className="h-3 w-3 text-[var(--dash-positive)]" />
          )}
          {trend === "down" && (
            <TrendingDown className="h-3 w-3 text-[var(--dash-negative)]" />
          )}
          <span
            className={`dash-num text-[12px] font-medium ${
              trend === "up"
                ? "text-[var(--dash-positive)]"
                : trend === "down"
                ? "text-[var(--dash-negative)]"
                : "text-ink-400"
            }`}
          >
            {trendLabel}
          </span>
        </div>
      )}
      {href && (
        <div className="absolute bottom-3 right-3 opacity-0 transition-opacity group-hover:opacity-100">
          <ArrowRight className="h-3.5 w-3.5 text-ink-400" />
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
  const map: Record<string, { bg: string; text: string; border: string; dot: string }> = {
    paid: { bg: "bg-success-50", text: "text-success-700", border: "border-[#A7F3D0]", dot: "bg-[#059669]" },
    completed: { bg: "bg-success-50", text: "text-success-700", border: "border-[#A7F3D0]", dot: "bg-[#059669]" },
    active: { bg: "bg-ink-50", text: "text-ink-700", border: "border-ink-200", dot: "bg-ink-400" },
    pending: { bg: "bg-amber-50", text: "text-amber-700", border: "border-[#FDE68A]", dot: "bg-[#D97706]" },
    failed: { bg: "bg-rose-50", text: "text-rose-700", border: "border-[#FECDD3]", dot: "bg-[#E11D48]" },
    open: { bg: "bg-ink-50", text: "text-ink-700", border: "border-ink-200", dot: "bg-ink-400" },
  };
  const s = map[status] || { bg: "bg-ink-50", text: "text-ink-600", border: "border-ink-200", dot: "bg-ink-400" };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${s.border} ${s.bg} ${s.text}`}
    >
      <span className={`status-dot ${s.dot}`} aria-hidden="true" />
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
        const response = await fetch("/api/admin/dashboard");
        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }
        const data = await response.json();

        setStats(data.stats);
        setRecentOrders(data.recentOrders);
        setRecentUsers(data.recentUsers);

        // Build 30-day chart data
        const days: ChartPoint[] = [];
        for (let i = 29; i >= 0; i--) {
          const day = subDays(new Date(), i);
          const dayStr = format(day, "yyyy-MM-dd");
          const dayLabel = format(day, "MMM dd");
          const dayOrders = data.last30DaysPurchases?.filter(
            (p: any) => format(new Date(p.created_at), "yyyy-MM-dd") === dayStr
          );
          days.push({
            date: dayLabel,
            revenue: dayOrders?.reduce((s: number, p: any) => s + Number(p.price_amount), 0) || 0,
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
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink-200 border-t-ink" role="status" aria-label="Loading dashboard" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
      {/* Header */}
      <div className="mb-6">
        <p className="dash-overline mb-1.5">Admin</p>
        <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-500">
          Platform overview and real-time metrics.
        </p>
      </div>

      {/* Stat Cards — Row 1 */}
      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
          color="text-[var(--dash-positive)]"
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
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatCard
          label="Open Support Tickets"
          value={stats?.openTickets || 0}
          icon={Ticket}
          color="text-[var(--dash-negative)]"
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
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className="dash-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-semibold tracking-tight text-ink">
                Revenue
              </h3>
              <p className="text-[12px] text-ink-400">Last 30 days</p>
            </div>
            <span className="dash-num rounded-full border bg-success-50 px-2.5 py-0.5 text-[12px] font-semibold text-success-700">
              ${(stats?.totalRevenue || 0).toLocaleString()}
            </span>
          </div>
          <AdminAreaChart
            data={chartData}
            dataKey="revenue"
            xKey="date"
            color="#0F172A"
            height={240}
          />
        </div>

        {/* Orders Chart */}
        <div className="dash-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-semibold tracking-tight text-ink">
                Orders
              </h3>
              <p className="text-[12px] text-ink-400">Last 30 days</p>
            </div>
            <span className="dash-num rounded-full border border-ink-200 bg-ink-50 px-2.5 py-0.5 text-[12px] font-semibold text-ink-700">
              {chartData.reduce((s, d) => s + d.orders, 0)} total
            </span>
          </div>
          <AdminBarChart
            data={chartData}
            dataKey="orders"
            xKey="date"
            color="#0F172A"
            height={240}
          />
        </div>
      </div>

      {/* Recent Activity Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="dash-card">
          <div className="flex items-center justify-between border-b border-[var(--dash-hairline)] px-4 py-3.5 sm:px-5">
            <h3 className="text-[15px] font-semibold tracking-tight text-ink">
              Recent Orders
            </h3>
            <Link
              href="/admin/purchases"
              className="text-[12px] font-medium text-ink-400 transition-colors hover:text-ink"
            >
              View all →
            </Link>
          </div>
          <div className="divide-y divide-[var(--ink-100)]">
            {recentOrders.length === 0 && (
              <div className="px-5 py-10 text-center text-[13px] text-ink-400">
                No orders yet
              </div>
            )}
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-ink-50 sm:px-5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-ink">
                    {order.email}
                  </p>
                  <p className="text-[12px] text-ink-400">
                    {order.program_key} · ${Number(order.account_size).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="dash-num text-[13px] font-semibold text-ink">
                    ${Number(order.price_amount).toLocaleString()}
                  </span>
                  <StatusBadge status={order.payment_status} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Registrations */}
        <div className="dash-card">
          <div className="flex items-center justify-between border-b border-[var(--dash-hairline)] px-4 py-3.5 sm:px-5">
            <h3 className="text-[15px] font-semibold tracking-tight text-ink">
              Recent Registrations
            </h3>
            <Link
              href="/admin/users"
              className="text-[12px] font-medium text-ink-400 transition-colors hover:text-ink"
            >
              View all →
            </Link>
          </div>
          <div className="divide-y divide-[var(--ink-100)]">
            {recentUsers.length === 0 && (
              <div className="px-5 py-10 text-center text-[13px] text-ink-400">
                No users yet
              </div>
            )}
            {recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-ink-50 sm:px-5"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-950 text-[12px] font-semibold text-white">
                    {(user.display_name || user.email || "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-ink">
                      {user.display_name || "—"}
                    </p>
                    <p className="text-[12px] text-ink-400">
                      {user.email}
                    </p>
                  </div>
                </div>
                <div className="dash-num flex items-center gap-1.5 text-[12px] text-ink-400">
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
