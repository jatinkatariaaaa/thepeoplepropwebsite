"use client";

import { useState, useEffect } from "react";
import { AdminAreaChart, AdminBarChart } from "@/components/admin/AdminChart";
import { BarChart3, Download, Calendar, DollarSign, Users, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { format, subDays } from "date-fns";

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<"revenue" | "orders" | "users">("revenue");
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  // Date range
  const [fromDate, setFromDate] = useState<string>(format(subDays(new Date(), 30), "yyyy-MM-dd"));
  const [toDate, setToDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reports?type=${activeTab}&from=${fromDate}T00:00:00.000Z&to=${toDate}T23:59:59.999Z`);
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
  }, [activeTab]);

  const handleExport = () => {
    window.open(`/api/admin/reports?type=${activeTab}&from=${fromDate}T00:00:00.000Z&to=${toDate}T23:59:59.999Z&format=csv`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ink-950)] flex items-center gap-2">
            <BarChart3 className="w-6 h-6" /> Analytics & Reports
          </h1>
          <p className="text-[var(--ink-500)] mt-1">Generate insights on revenue, orders, and user growth.</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--paper-2)] border border-[var(--border)] text-[var(--ink-950)] rounded-xl font-bold hover:bg-[var(--border)] transition-colors"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-[var(--border)] p-6 shadow-sm mb-8 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex bg-[var(--paper-2)] p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("revenue")}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${activeTab === "revenue" ? "bg-white text-[var(--ink-950)] shadow-sm" : "text-[var(--ink-500)] hover:text-[var(--ink-950)]"}`}
          >
            Revenue
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${activeTab === "orders" ? "bg-white text-[var(--ink-950)] shadow-sm" : "text-[var(--ink-500)] hover:text-[var(--ink-950)]"}`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-colors ${activeTab === "users" ? "bg-white text-[var(--ink-950)] shadow-sm" : "text-[var(--ink-500)] hover:text-[var(--ink-950)]"}`}
          >
            Users
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--ink-400)]" />
            <input 
              type="date" 
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="border border-[var(--border)] rounded-lg px-2 py-1 text-sm outline-none bg-white" 
            />
            <span className="text-[var(--ink-400)] text-sm">to</span>
            <input 
              type="date" 
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="border border-[var(--border)] rounded-lg px-2 py-1 text-sm outline-none bg-white" 
            />
          </div>
          <button 
            onClick={fetchReport}
            disabled={loading}
            className="px-4 py-1.5 bg-[var(--ink-950)] text-white rounded-lg text-sm font-bold hover:bg-black disabled:opacity-50"
          >
            Generate
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-24"><div className="w-8 h-8 border-2 border-[var(--ink-200)] border-t-[var(--ink-950)] rounded-full animate-spin"></div></div>
      ) : reportData ? (
        <div className="space-y-6">
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeTab === "revenue" && (
              <>
                <div className="bg-white rounded-2xl border border-[var(--border)] p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-50 rounded-lg"><DollarSign className="w-5 h-5 text-emerald-600" /></div>
                    <h3 className="font-bold text-[var(--ink-600)]">Total Revenue</h3>
                  </div>
                  <p className="text-3xl font-bold text-[var(--ink-950)]">${reportData.total_revenue?.toLocaleString() || 0}</p>
                </div>
                <div className="bg-white rounded-2xl border border-[var(--border)] p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-50 rounded-lg"><ShoppingCart className="w-5 h-5 text-blue-600" /></div>
                    <h3 className="font-bold text-[var(--ink-600)]">Paid Orders</h3>
                  </div>
                  <p className="text-3xl font-bold text-[var(--ink-950)]">{reportData.total_orders?.toLocaleString() || 0}</p>
                </div>
                <div className="bg-white rounded-2xl border border-[var(--border)] p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-50 rounded-lg"><Activity className="w-5 h-5 text-amber-600" /></div>
                    <h3 className="font-bold text-[var(--ink-600)]">Avg Order Value</h3>
                  </div>
                  <p className="text-3xl font-bold text-[var(--ink-950)]">${reportData.total_orders ? (reportData.total_revenue / reportData.total_orders).toFixed(2) : 0}</p>
                </div>
              </>
            )}

            {activeTab === "users" && (
              <>
                <div className="bg-white rounded-2xl border border-[var(--border)] p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-50 rounded-lg"><Users className="w-5 h-5 text-blue-600" /></div>
                    <h3 className="font-bold text-[var(--ink-600)]">Total Signups</h3>
                  </div>
                  <p className="text-3xl font-bold text-[var(--ink-950)]">{reportData.total_users?.toLocaleString() || 0}</p>
                </div>
                <div className="bg-white rounded-2xl border border-[var(--border)] p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-50 rounded-lg"><Activity className="w-5 h-5 text-emerald-600" /></div>
                    <h3 className="font-bold text-[var(--ink-600)]">KYC Verified</h3>
                  </div>
                  <p className="text-3xl font-bold text-[var(--ink-950)]">{reportData.kyc_stats?.verified || 0}</p>
                </div>
                <div className="bg-white rounded-2xl border border-[var(--border)] p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-50 rounded-lg"><Activity className="w-5 h-5 text-amber-600" /></div>
                    <h3 className="font-bold text-[var(--ink-600)]">KYC Pending/None</h3>
                  </div>
                  <p className="text-3xl font-bold text-[var(--ink-950)]">{(reportData.kyc_stats?.pending || 0) + (reportData.kyc_stats?.none || 0)}</p>
                </div>
              </>
            )}
          </div>

          {/* Chart */}
          <div className="bg-white rounded-2xl border border-[var(--border)] p-6 shadow-sm">
            <h3 className="font-bold text-lg text-[var(--ink-950)] mb-6 capitalize">{activeTab} Trend</h3>
            
            {activeTab === "revenue" && reportData.data && (
              <AdminAreaChart
                data={reportData.data.map((d: any) => ({ name: format(new Date(d.date), "MMM dd"), value: d.revenue }))}
                color="#0ea5e9"
                height={350}
              />
            )}
            
            {activeTab === "users" && reportData.data && (
              <AdminBarChart
                data={reportData.data.map((d: any) => ({ name: format(new Date(d.date), "MMM dd"), value: d.new_users }))}
                color="#8b5cf6"
                height={350}
              />
            )}

            {activeTab === "orders" && reportData.by_program && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-bold text-sm text-[var(--ink-500)] mb-4">By Program</h4>
                  <AdminBarChart
                    data={reportData.by_program.map((p: any) => ({ name: p.program, value: p.count }))}
                    color="#f59e0b"
                    height={300}
                  />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[var(--ink-500)] mb-4">By Status</h4>
                  <AdminBarChart
                    data={reportData.by_status.map((s: any) => ({ name: s.status, value: s.count }))}
                    color="#cbfb45"
                    height={300}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
