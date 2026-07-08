"use client";

import { useState, useEffect } from "react";
import { AdminTable } from "@/components/admin/AdminTable";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Activity, Search, ListFilter as Filter, RefreshCw, Globe, CreditCard, Mail, Webhook, Server, ChevronDown, X } from "lucide-react";
import { toast } from "sonner";

type ApiType = "all" | "payment" | "trading" | "email" | "webhook" | "internal";
type MethodFilter = "all" | "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiLog {
  id: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms: number;
  api_type: string;
  error_message: string | null;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export default function AdminApiLogsPage() {
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiType, setApiType] = useState<ApiType>("all");
  const [methodFilter, setMethodFilter] = useState<MethodFilter>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 25;

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));
      if (apiType !== "all") params.set("api_type", apiType);
      if (methodFilter !== "all") params.set("method", methodFilter);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (searchQuery) params.set("search", searchQuery);
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);

      const res = await fetch(`/api/admin/api-logs?${params.toString()}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, apiType, methodFilter, statusFilter]);

  const clearFilters = () => {
    setApiType("all");
    setMethodFilter("all");
    setStatusFilter("all");
    setSearchQuery("");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET": return "text-blue-600 bg-blue-50";
      case "POST": return "text-emerald-600 bg-emerald-50";
      case "PUT": return "text-amber-600 bg-amber-50";
      case "PATCH": return "text-violet-600 bg-violet-50";
      case "DELETE": return "text-red-600 bg-red-50";
      default: return "text-[var(--ink-500)] bg-[var(--paper-2)]";
    }
  };

  const getStatusColor = (code: number) => {
    if (code >= 200 && code < 300) return "text-emerald-600 bg-emerald-50";
    if (code >= 300 && code < 400) return "text-blue-600 bg-blue-50";
    if (code >= 400 && code < 500) return "text-amber-600 bg-amber-50";
    if (code >= 500) return "text-red-600 bg-red-50";
    return "text-[var(--ink-500)] bg-[var(--paper-2)]";
  };

  const getApiTypeIcon = (type: string) => {
    switch (type) {
      case "payment": return CreditCard;
      case "trading": return Server;
      case "email": return Mail;
      case "webhook": return Webhook;
      default: return Globe;
    }
  };

  const columns: ColumnDef<ApiLog>[] = [
    {
      accessorKey: "endpoint",
      header: "Endpoint",
      cell: ({ row }) => (
        <div className="max-w-[300px]">
          <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-bold uppercase mr-1.5 ${getMethodColor(row.original.method)}`}>
            {row.original.method}
          </span>
          <span className="text-[13px] font-semibold text-[var(--ink-950)] font-mono truncate">{row.original.endpoint}</span>
        </div>
      ),
    },
    {
      accessorKey: "status_code",
      header: "Status",
      cell: ({ row }) => (
        <span className={`inline-flex px-2 py-0.5 rounded text-[11px] font-bold ${getStatusColor(row.original.status_code)}`}>
          {row.original.status_code}
        </span>
      ),
    },
    {
      accessorKey: "response_time_ms",
      header: "Response Time",
      cell: ({ row }) => {
        const ms = row.original.response_time_ms;
        const color = ms > 1000 ? "text-red-600" : ms > 500 ? "text-amber-600" : "text-emerald-600";
        return <span className={`text-[13px] font-semibold ${color}`}>{ms}ms</span>;
      },
    },
    {
      accessorKey: "api_type",
      header: "API Type",
      cell: ({ row }) => {
        const Icon = getApiTypeIcon(row.original.api_type);
        return (
          <div className="flex items-center gap-1.5">
            <Icon className="w-3.5 h-3.5 text-[var(--ink-400)]" />
            <span className="text-[12px] font-semibold capitalize text-[var(--ink-600)]">{row.original.api_type}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "ip_address",
      header: "IP",
      cell: ({ row }) => <span className="text-[11px] font-mono text-[var(--ink-500)]">{row.original.ip_address || "—"}</span>,
    },
    {
      accessorKey: "created_at",
      header: "Timestamp",
      cell: ({ row }) => <span className="text-[12px] text-[var(--ink-600)]">{format(new Date(row.original.created_at), "MMM dd, HH:mm:ss")}</span>,
    },
    {
      id: "error",
      header: "Error",
      cell: ({ row }) => row.original.error_message ? (
        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold text-red-600 bg-red-50">Error</span>
      ) : (
        <span className="text-[var(--ink-300)] text-[11px]">OK</span>
      ),
    },
  ];

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--ink-950)] flex items-center gap-2">
          <Activity className="w-6 h-6" /> API Logs
        </h1>
        <p className="text-[var(--ink-500)] mt-1">Monitor API requests, response times, and errors across all integrations.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[var(--border)] p-4 shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-400)]" />
              <input
                type="text"
                placeholder="Search endpoint..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchLogs()}
                className="pl-9 pr-4 py-2 border border-[var(--border)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--ink-950)] w-64"
              />
            </div>
            <select
              value={apiType}
              onChange={(e) => setApiType(e.target.value as ApiType)}
              className="px-3 py-2 border border-[var(--border)] rounded-xl text-sm outline-none bg-white"
            >
              <option value="all">All APIs</option>
              <option value="payment">Payment API</option>
              <option value="trading">Trading API</option>
              <option value="email">Email API</option>
              <option value="webhook">Webhooks</option>
              <option value="internal">Internal</option>
            </select>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value as MethodFilter)}
              className="px-3 py-2 border border-[var(--border)] rounded-xl text-sm outline-none bg-white"
            >
              <option value="all">All Methods</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="PATCH">PATCH</option>
              <option value="DELETE">DELETE</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-[var(--border)] rounded-xl text-sm outline-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="2xx">2xx Success</option>
              <option value="3xx">3xx Redirect</option>
              <option value="4xx">4xx Client Error</option>
              <option value="5xx">5xx Server Error</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-[var(--ink-500)] hover:text-[var(--ink-950)] rounded-xl hover:bg-[var(--paper-2)] transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-[var(--ink-500)] hover:text-[var(--ink-950)] rounded-xl hover:bg-[var(--paper-2)] transition-colors"
            >
              <Filter className="w-3.5 h-3.5" /> Filters
            </button>
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 bg-[var(--ink-950)] text-white rounded-xl text-sm font-bold hover:bg-black disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--ink-500)]">From:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border border-[var(--border)] rounded-lg px-2 py-1.5 text-sm outline-none bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--ink-500)]">To:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border border-[var(--border)] rounded-lg px-2 py-1.5 text-sm outline-none bg-white"
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Requests", value: total.toLocaleString(), color: "text-blue-600" },
          { label: "Avg Response", value: `${logs.length ? Math.round(logs.reduce((a, l) => a + l.response_time_ms, 0) / logs.length) : 0}ms`, color: "text-emerald-600" },
          { label: "Errors", value: logs.filter(l => l.error_message).length.toLocaleString(), color: "text-red-600" },
          { label: "Success Rate", value: `${logs.length ? Math.round((logs.filter(l => l.status_code >= 200 && l.status_code < 300).length / logs.length) * 100) : 0}%`, color: "text-amber-600" },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-xl border border-[var(--border)] p-4 shadow-sm">
            <p className="text-[11px] font-bold text-[var(--ink-400)] uppercase tracking-wider mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <AdminTable data={logs} columns={columns} loading={loading} pageSize={limit} searchable={false} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-4">
          <span className="text-sm text-[var(--ink-500)]">
            Page {page} of {totalPages} ({total} total)
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold text-[var(--ink-500)] hover:bg-[var(--paper-2)] disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold text-[var(--ink-500)] hover:bg-[var(--paper-2)] disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
