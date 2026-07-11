"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Users,
  DollarSign,
  Ticket,
  ArrowUpRight,
  CreditCard,
  Plus,
  Send,
  ShieldCheck,
  MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import { AdminBarChart } from "@/components/admin/AdminChart";
import { format, subDays } from "date-fns";

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

type Range = "week" | "month";

/* ─── Pill stat card (Rise "My Spending" style) ─── */
function PillStat({
  label,
  value,
  progress,
}: {
  label: string;
  value: string;
  progress: number; // 0–100
}) {
  return (
    <div className="rounded-2xl bg-[#f4f4f2] px-5 py-4">
      <p className="text-[12px] font-semibold text-[var(--ink-400)]">{label}</p>
      <p className="mt-0.5 text-xl font-bold tracking-tight text-[var(--ink-950)]">
        {value}
      </p>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[var(--ink-200)]">
        <div
          className="h-full rounded-full bg-[#0c0c0c]"
          style={{ width: `${Math.min(Math.max(progress, 4), 100)}%` }}
        />
      </div>
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
  const s =
    map[status] || { bg: "bg-gray-50", text: "text-gray-700", dot: "bg-gray-500" };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${s.bg} ${s.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

/* ─── Quick action button (Rise right panel style) ─── */
function QuickAction({
  icon: Icon,
  label,
  href,
}: {
  icon: any;
  label: string;
  href: string;
}) {
  return (
    <Link href={href} className="flex flex-col items-center gap-2 group">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border)] bg-white text-[var(--ink-950)] transition-all group-hover:bg-[#0c0c0c] group-hover:text-white group-hover:border-transparent">
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-[11px] font-semibold text-[var(--ink-500)]">
        {label}
      </span>
    </Link>
  );
}

/* ─── Main Dashboard ─── */
export default function AdminDashboardClient() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [range, setRange] = useState<Range>("month");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
            revenue:
              dayOrders?.reduce(
                (s: number, p: any) => s + Number(p.price_amount),
                0
              ) || 0,
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

  const visibleChart = useMemo(
    () => (range === "week" ? chartData.slice(-7) : chartData),
    [chartData, range]
  );

  const rangeRevenue = useMemo(
    () => visibleChart.reduce((s, d) => s + d.revenue, 0),
    [visibleChart]
  );
  const rangeOrders = useMemo(
    () => visibleChart.reduce((s, d) => s + d.orders, 0),
    [visibleChart]
  );

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--ink-200)] border-t-[var(--ink-950)]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px]">
        {/* ══════════ LEFT COLUMN ══════════ */}
        <div className="min-w-0 rounded-[28px] bg-white p-5 sm:p-7 shadow-sm">
          {/* Section header + range toggle */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold tracking-tight text-[var(--ink-950)]">
              Platform Overview
            </h2>
            <div className="flex items-center gap-1 text-[12px] font-semibold">
              {(
                [
                  { key: "week", label: "Week" },
                  { key: "month", label: "Month" },
                ] as { key: Range; label: string }[]
              ).map((r) => (
                <button
                  key={r.key}
                  onClick={() => setRange(r.key)}
                  className={`rounded-full px-4 py-1.5 transition-colors ${
                    range === r.key
                      ? "bg-[#0c0c0c] text-white"
                      : "text-[var(--ink-400)] hover:text-[var(--ink-950)]"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Pill stats */}
          <div className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <PillStat
              label="Revenue"
              value={`$${rangeRevenue.toLocaleString()}`}
              progress={
                stats?.totalRevenue
                  ? (rangeRevenue / stats.totalRevenue) * 100
                  : 0
              }
            />
            <PillStat
              label="Orders"
              value={rangeOrders.toLocaleString()}
              progress={rangeOrders > 0 ? 65 : 0}
            />
            <PillStat
              label="Total Users"
              value={(stats?.totalUsers || 0).toLocaleString()}
              progress={stats?.totalUsers ? 80 : 0}
            />
          </div>

          {/* Bar chart */}
          <div className="mb-8">
            <AdminBarChart
              data={visibleChart}
              dataKey="revenue"
              xKey="date"
              color="#0c0c0c"
              height={240}
            />
          </div>

          {/* Recent Transactions */}
          <div>
            <div className="mb-3 flex items-center justify-between">
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

            <div className="space-y-2.5">
              {recentOrders.length === 0 && (
                <div className="rounded-2xl bg-[#f4f4f2] px-6 py-8 text-center text-[13px] text-[var(--ink-400)]">
                  No orders yet
                </div>
              )}
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-[#f4f4f2] px-4 py-3.5 transition-colors hover:bg-[var(--ink-100)]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">
                      <CreditCard className="h-[18px] w-[18px] text-[var(--ink-950)]" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-bold text-[var(--ink-950)]">
                        {order.email}
                      </p>
                      <p className="truncate text-[12px] text-[var(--ink-400)]">
                        {order.program_key} · $
                        {Number(order.account_size).toLocaleString()} ·{" "}
                        {format(new Date(order.created_at), "MMM dd, HH:mm")}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-[14px] font-bold text-[var(--ink-950)]">
                      ${Number(order.price_amount).toLocaleString()}
                    </span>
                    <StatusBadge status={order.payment_status} />
                    <MoreHorizontal className="hidden sm:block h-4 w-4 text-[var(--ink-300)]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════ RIGHT COLUMN ══════════ */}
        <div className="flex flex-col rounded-[28px] bg-white p-5 sm:p-7 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-[15px] font-bold text-[var(--ink-950)]">
              Revenue Card
            </h3>
            <MoreHorizontal className="h-4 w-4 text-[var(--ink-300)]" />
          </div>

          {/* Lime card */}
          <div className="relative mb-8">
            <div className="relative z-10 rounded-3xl bg-[#cbfb45] p-6">
              <div className="flex items-center justify-between">
                <span className="flex h-6 w-11 items-center rounded-full bg-[#0c0c0c] px-1">
                  <span className="h-4 w-4 rounded-full bg-[#cbfb45]" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0c0c0c]/50">
                  Live
                </span>
              </div>
              <p className="mt-5 text-2xl font-bold tracking-[0.08em] text-[#0c0c0c]">
                ${(stats?.totalRevenue || 0).toLocaleString()}
              </p>
              <div className="mt-5 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#0c0c0c]/50">
                    Today
                  </p>
                  <p className="text-[13px] font-bold text-[#0c0c0c]">
                    +${(stats?.revenueToday || 0).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#0c0c0c]/50">
                    New Users
                  </p>
                  <p className="text-[13px] font-bold text-[#0c0c0c]">
                    +{stats?.newUsersToday || 0} today
                  </p>
                </div>
              </div>
            </div>
            {/* Stacked card effect */}
            <div className="absolute inset-x-4 -bottom-2 h-6 rounded-b-3xl bg-[#0c0c0c]" />
          </div>

          {/* Quick actions */}
          <div className="mb-8 grid grid-cols-3 gap-2">
            <QuickAction icon={Users} label="Users" href="/admin/users" />
            <QuickAction icon={Send} label="Payouts" href="/admin/payouts" />
            <QuickAction icon={Ticket} label="Tickets" href="/admin/tickets" />
          </div>

          {/* Balance */}
          <div className="mb-8 text-center">
            <p className="text-[12px] font-semibold text-[var(--ink-400)]">
              Active Challenges
            </p>
            <p className="mt-1 text-4xl font-bold tracking-tight text-[var(--ink-950)]">
              {(stats?.activeChallenges || 0).toLocaleString()}
            </p>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <Link
                href="/admin/payouts"
                className="rounded-2xl bg-[#f4f4f2] px-4 py-3 transition-colors hover:bg-[var(--ink-100)]"
              >
                <p className="text-[11px] font-semibold text-[var(--ink-400)]">
                  Pending Payouts
                </p>
                <p className="text-lg font-bold text-[var(--ink-950)]">
                  {stats?.pendingPayouts || 0}
                </p>
              </Link>
              <Link
                href="/admin/tickets"
                className="rounded-2xl bg-[#f4f4f2] px-4 py-3 transition-colors hover:bg-[var(--ink-100)]"
              >
                <p className="text-[11px] font-semibold text-[var(--ink-400)]">
                  Open Tickets
                </p>
                <p className="text-lg font-bold text-[var(--ink-950)]">
                  {stats?.openTickets || 0}
                </p>
              </Link>
            </div>
          </div>

          {/* Recent registrations */}
          <div className="mt-auto">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-[13px] font-bold text-[var(--ink-950)]">
                New Registrations
              </h4>
              <Link
                href="/admin/users"
                className="text-[11px] font-semibold text-[var(--ink-400)] transition-colors hover:text-[var(--ink-950)]"
              >
                View all
              </Link>
            </div>
            <div className="flex items-start gap-3 overflow-x-auto pb-1">
              <Link
                href="/admin/users"
                className="flex flex-col items-center gap-1.5 shrink-0"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-dashed border-[var(--ink-300)] text-[var(--ink-400)] transition-colors hover:border-[var(--ink-950)] hover:text-[var(--ink-950)]">
                  <Plus className="h-4 w-4" />
                </span>
                <span className="text-[10px] font-semibold text-[var(--ink-400)]">
                  Add
                </span>
              </Link>
              {recentUsers.slice(0, 4).map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col items-center gap-1.5 shrink-0"
                  title={user.email}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0c0c0c] text-[13px] font-bold text-white">
                    {(user.display_name || user.email || "?")[0].toUpperCase()}
                  </span>
                  <span className="max-w-[56px] truncate text-[10px] font-semibold text-[var(--ink-500)]">
                    {(user.display_name || user.email || "—").split(" ")[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Coupons / KYC shortcut row */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link
              href="/admin/coupons"
              className="group flex items-center justify-between rounded-2xl bg-[#f4f4f2] px-4 py-3 transition-colors hover:bg-[#0c0c0c]"
            >
              <div>
                <p className="text-[11px] font-semibold text-[var(--ink-400)] group-hover:text-white/50">
                  Coupons
                </p>
                <p className="text-[15px] font-bold text-[var(--ink-950)] group-hover:text-white">
                  {stats?.activeCoupons || 0} active
                </p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-[var(--ink-400)] group-hover:text-[#cbfb45]" />
            </Link>
            <Link
              href="/admin/kyc"
              className="group flex items-center justify-between rounded-2xl bg-[#f4f4f2] px-4 py-3 transition-colors hover:bg-[#0c0c0c]"
            >
              <div>
                <p className="text-[11px] font-semibold text-[var(--ink-400)] group-hover:text-white/50">
                  KYC
                </p>
                <p className="text-[15px] font-bold text-[var(--ink-950)] group-hover:text-white">
                  Review
                </p>
              </div>
              <ShieldCheck className="h-4 w-4 text-[var(--ink-400)] group-hover:text-[#cbfb45]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
