"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Plus, Search, Filter, Wallet, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AdminTable } from "@/components/admin/AdminTable";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function TradingAccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    setLoading(true);
    // Joining with profiles and platforms
    const { data, error } = await supabase
      .from("trading_accounts")
      .select(`
        *,
        profiles (email, display_name),
        tpp_platforms (name)
      `)
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      setAccounts(data);
    } else if (error) {
      toast.error("Failed to load accounts. Ensure migrations are applied.");
    }
    setLoading(false);
  }

  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = 
      acc.account_number.toLowerCase().includes(search.toLowerCase()) || 
      acc.profiles?.email?.toLowerCase().includes(search.toLowerCase()) ||
      acc.profiles?.display_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || acc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "account_number",
      header: "Account",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center border border-blue-100">
            <Wallet className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <Link href={`/admin/trading/accounts/${row.original.id}`} className="font-bold text-[14px] text-[var(--ink-950)] hover:text-blue-600 hover:underline">
              {row.original.account_number}
            </Link>
            <p className="text-[11px] text-[var(--ink-500)] mt-0.5">{row.original.tpp_platforms?.name || 'Unknown Platform'}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "user",
      header: "Customer",
      cell: ({ row }) => (
        <div>
          <p className="font-semibold text-[13px] text-[var(--ink-950)]">{row.original.profiles?.display_name || "—"}</p>
          <p className="text-[11px] text-[var(--ink-500)]">{row.original.profiles?.email || "—"}</p>
        </div>
      ),
    },
    {
      accessorKey: "balance",
      header: "Balance / Equity",
      cell: ({ row }) => {
        const bal = parseFloat(row.original.balance) || 0;
        const eq = parseFloat(row.original.equity) || 0;
        const isUp = eq >= bal;
        return (
          <div>
            <p className="font-bold text-[13px]">${bal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
            <p className={cn("text-[11px] font-medium", isUp ? "text-emerald-600" : "text-red-600")}>
              ${eq.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </p>
          </div>
        )
      },
    },
    {
      accessorKey: "phase",
      header: "Phase",
      cell: ({ row }) => (
        <span className="capitalize text-[13px] font-semibold text-[var(--ink-700)]">
          {row.original.phase}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const s = row.original.status;
        return (
          <span className={cn(
            "inline-flex px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
            s === "active" ? "bg-emerald-50 text-emerald-700" :
            s === "breached" ? "bg-red-50 text-red-700" :
            s === "passed" ? "bg-blue-50 text-blue-700" :
            s === "suspended" ? "bg-amber-50 text-amber-700" :
            "bg-gray-100 text-gray-700"
          )}>
            {s}
          </span>
        )
      },
    },
    {
      accessorKey: "created_at",
      header: "Created",
      cell: ({ row }) => <span className="text-[13px]">{format(new Date(row.original.created_at), "MMM dd, yyyy")}</span>,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Link href={`/admin/trading/accounts/${row.original.id}`} className="p-2 hover:bg-[var(--paper-2)] rounded-lg text-[var(--ink-500)] transition-colors">
            <MoreHorizontal className="w-5 h-5" />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--ink-950)]">Trading Accounts</h1>
          <p className="text-[var(--ink-500)] text-[14px]">View and manage all active challenges and funded accounts.</p>
        </div>
        <Button className="shrink-0 gap-2">
          <Plus className="w-4 h-4" /> Issue Account
        </Button>
      </div>

      <div className="bg-white border border-[var(--border)] rounded-2xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-400)]" />
          <input 
            type="text"
            placeholder="Search by account #, email, or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 h-10 bg-[var(--paper-2)] border border-[var(--border)] rounded-xl text-[14px] focus:outline-none focus:border-[var(--ink-400)]"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-[var(--ink-500)] shrink-0">
            <Filter className="w-4 h-4" /> Status:
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 bg-[var(--paper-2)] border border-[var(--border)] rounded-xl px-3 text-[13px] focus:outline-none font-medium outline-none min-w-[120px]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="breached">Breached</option>
            <option value="passed">Passed</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      <AdminTable data={filteredAccounts} columns={columns} loading={loading} />
    </div>
  );
}
