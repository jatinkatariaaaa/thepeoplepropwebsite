"use client";

import { useState, useEffect, useMemo } from "react";
import { AdminAreaChart, AdminBarChart, AdminPieChart } from "@/components/admin/AdminChart";
import { AdminTable } from "@/components/admin/AdminTable";
import { ColumnDef } from "@tanstack/react-table";
import { ChartBar as BarChart3, Download, Calendar, DollarSign, Users, ShoppingCart, Activity, TrendingUp, TrendingDown, FileSpreadsheet, FileText, FileDown, ChevronDown, ListFilter as Filter, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { format, subDays, startOfWeek, startOfMonth, startOfYear } from "date-fns";

type ReportTab = "revenue" | "users" | "trading";
type Period = "daily" | "weekly" | "monthly" | "yearly";
type ExportFormat = "csv" | "excel" | "pdf";

interface ReportData {
  summary: {
    total_revenue?: number;
    total_orders?: number;
    avg_order_value?: number;
    total_users?: number;
    active_users?: number;
    challenge_purchases?: number;
    pass_rate?: number;
    fail_rate?: number;
    active_accounts?: number;
  };
  chart_data: any[];
  table_data?: any[];
}

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<ReportTab>("revenue");
  const [period, setPeriod] = useState<Period>("daily");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const [fromDate, setFromDate] = useState<string>(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [toDate, setToDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/reports?type=${activeTab}&period=${period}&from=${fromDate}T00:00:00.000Z&to=${toDate}T23:59:59.999Z`
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setReportData(data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeTab, period]);

  const handleExport = (format: ExportFormat) => {
    window.open(
      `/api/admin/reports?type=${activeTab}&period=${period}&from=${fromDate}T00:00:00.000Z&to=${toDate}T23:59:59.999Z&format=${format}`,
      "_blank"
    );
    setShowExportMenu(false);
    toast.success(`Exporting ${format.toUpperCase()}...`);
  };

  const periodOptions: { value: Period; label: string }[] = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "yearly", label: "Yearly" },
  ];

  const summaryCards = useMemo(() => {
    if (!reportData?.summary) return [];
    const s = reportData.summary;

    if (activeTab === "revenue") {
      return [
        { icon: DollarSign, color: "text-[var(--dash-positive)] bg-emerald-50", label: "Total Revenue", value: `$${(s.total_revenue || 0).toLocaleString()}` },
        { icon: ShoppingCart, color: "text-blue-600 bg-blue-50", label: "Paid Orders", value: (s.total_orders || 0).toLocaleString() },
        { icon: Activity, color: "text-amber-600 bg-amber-50", label: "Avg Order Value", value: `$${s.avg_order_value?.toFixed(2) || "0.00"}` },
      ];
    }
    if (activeTab === "users") {
      return [
        { icon: Users, color: "text-blue-600 bg-blue-50", label: "Total Signups", value: (s.total_users || 0).toLocaleString() },
        { icon: Activity, color: "text-[var(--dash-positive)] bg-emerald-50", label: "Active Users", value: (s.active_users || 0).toLocaleString() },
        { icon: ShoppingCart, color: "text-amber-600 bg-amber-50", label: "Challenge Purchases", value: (s.challenge_purchases || 0).toLocaleString() },
      ];
    }
    return [
      { icon: TrendingUp, color: "text-[var(--dash-positive)] bg-emerald-50", label: "Pass Rate", value: `${(s.pass_rate || 0).toFixed(1)}%` },
      { icon: TrendingDown, color: "text-[var(--dash-negative)] bg-red-50", label: "Fail Rate", value: `${(s.fail_rate || 0).toFixed(1)}%` },
      { icon: Activity, color: "text-blue-600 bg-blue-50", label: "Active Accounts", value: (s.active_accounts || 0).toLocaleString() },
    ];
  }, [reportData, activeTab]);

  const tableColumns: ColumnDef<any>[] = useMemo(() => {
    if (activeTab === "revenue") {
      return [
        { accessorKey: "date", header: "Date", cell: ({ row }) => <span className="text-[13px] font-semibold">{row.original.date}</span> },
        { accessorKey: "revenue", header: "Revenue", cell: ({ row }) => <span className="text-[13px] font-semibold text-[var(--dash-positive)]">${row.original.revenue?.toLocaleString()}</span> },
        { accessorKey: "orders", header: "Orders", cell: ({ row }) => <span className="text-[13px]">{row.original.orders}</span> },
      ];
    }
    if (activeTab === "users") {
      return [
        { accessorKey: "date", header: "Date", cell: ({ row }) => <span className="text-[13px] font-semibold">{row.original.date}</span> },
        { accessorKey: "new_users", header: "New Users", cell: ({ row }) => <span className="text-[13px] font-semibold text-blue-600">{row.original.new_users}</span> },
        { accessorKey: "active_users", header: "Active", cell: ({ row }) => <span className="text-[13px]">{row.original.active_users}</span> },
        { accessorKey: "purchases", header: "Purchases", cell: ({ row }) => <span className="text-[13px] text-amber-600">{row.original.purchases}</span> },
      ];
    }
    return [
      { accessorKey: "date", header: "Date", cell: ({ row }) => <span className="text-[13px] font-semibold">{row.original.date}</span> },
      { accessorKey: "pass_count", header: "Passed", cell: ({ row }) => <span className="text-[13px] font-semibold text-[var(--dash-positive)]">{row.original.pass_count}</span> },
      { accessorKey: "fail_count", header: "Failed", cell: ({ row }) => <span className="text-[13px] font-semibold text-[var(--dash-negative)]">{row.original.fail_count}</span> },
      { accessorKey: "active_count", header: "Active", cell: ({ row }) => <span className="text-[13px] text-blue-600">{row.original.active_count}</span> },
    ];
  }, [activeTab]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-ink">
            <BarChart3 className="w-6 h-6" /> Analytics & Reports
          </h1>
          <p className="text-[var(--ink-500)] mt-1">Generate insights on revenue, users, and trading performance.</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--dash-canvas)] border border-[var(--dash-hairline)] text-[var(--ink-950)] rounded-xl font-bold hover:bg-ink-100 transition-colors"
          >
            <Download className="w-4 h-4" /> Export <ChevronDown className="w-3 h-3" />
          </button>
          {showExportMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[var(--dash-hairline)] rounded-xl shadow-lg z-50 overflow-hidden">
              <button onClick={() => handleExport("csv")} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold hover:bg-[var(--dash-canvas)] transition-colors">
                <FileText className="w-4 h-4" /> CSV
              </button>
              <button onClick={() => handleExport("excel")} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold hover:bg-[var(--dash-canvas)] transition-colors">
                <FileSpreadsheet className="w-4 h-4" /> Excel
              </button>
              <button onClick={() => handleExport("pdf")} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-semibold hover:bg-[var(--dash-canvas)] transition-colors">
                <FileDown className="w-4 h-4" /> PDF
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="dash-card p-5 mb-8 flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
        <div className="flex bg-[var(--dash-canvas)] p-1 rounded-xl">
          {(["revenue", "users", "trading"] as ReportTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${activeTab === tab ? "bg-white text-[var(--ink-950)] shadow-sm" : "text-[var(--ink-500)] hover:text-[var(--ink-950)]"}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-[var(--dash-canvas)] p-1 rounded-xl">
            {periodOptions.map((p) => (
              <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${period === p.value ? "bg-white text-[var(--ink-950)] shadow-sm" : "text-[var(--ink-500)] hover:text-[var(--ink-950)]"}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--ink-400)]" />
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border border-[var(--dash-hairline)] rounded-lg px-2 py-1.5 text-sm outline-none bg-white"
            />
            <span className="text-[var(--ink-400)] text-sm">to</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border border-[var(--dash-hairline)] rounded-lg px-2 py-1.5 text-sm outline-none bg-white"
            />
          </div>
          <button
            onClick={fetchReport}
            disabled={loading}
            className="px-4 py-1.5 flex items-center gap-2 rounded-lg bg-ink text-[13px] font-semibold text-white transition-colors hover:bg-ink-800 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Generate
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-24">
          <div className="w-8 h-8 border-2 border-[var(--ink-200)] border-t-[var(--ink-950)] rounded-full animate-spin" />
        </div>
      ) : reportData ? (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {summaryCards.map((card, i) => (
              <div key={i} className="dash-card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`p-2 rounded-lg ${card.color}`}>
                    <card.icon className={`w-5 h-5 ${card.color.split(" ")[0]}`} />
                  </div>
                  <h3 className="font-bold text-[var(--ink-600)]">{card.label}</h3>
                </div>
                <p className="text-3xl font-bold text-[var(--ink-950)]">{card.value}</p>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="dash-card p-5">
            <h3 className="font-bold text-lg text-[var(--ink-950)] mb-6 capitalize">{activeTab} Trend</h3>
            {activeTab === "trading" && reportData.chart_data ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <AdminBarChart
                  data={reportData.chart_data.map((d: any) => ({ name: d.date, value: d.pass_count + d.fail_count }))}
                  xKey="name"
                  dataKey="value"
                  color="#059669"
                  height={350}
                />
                <AdminPieChart
                  data={[
                    { name: "Passed", value: reportData.summary.pass_rate || 0 },
                    { name: "Failed", value: reportData.summary.fail_rate || 0 },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  height={350}
                />
              </div>
            ) : (
              <AdminAreaChart
                data={reportData.chart_data?.map((d: any) => ({
                  name: d.date,
                  value: activeTab === "revenue" ? d.revenue : d.new_users,
                })) || []}
                xKey="name"
                dataKey="value"
                color={activeTab === "revenue" ? "#0ea5e9" : "#8b5cf6"}
                height={350}
              />
            )}
          </div>

          {/* Data Table */}
          {reportData.table_data && reportData.table_data.length > 0 && (
            <div className="dash-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-4 h-4 text-[var(--ink-400)]" />
                <h3 className="font-bold text-[var(--ink-950)]">Detailed Data</h3>
              </div>
              <AdminTable data={reportData.table_data} columns={tableColumns} pageSize={10} />
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
