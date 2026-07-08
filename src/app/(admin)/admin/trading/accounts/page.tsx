"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AdminTable } from "@/components/admin/AdminTable";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { CreateAccountModal } from "@/components/admin/trading/CreateAccountModal";
import { LeverageModal } from "@/components/admin/trading/LeverageModal";
import { AssignChallengeModal } from "@/components/admin/trading/AssignChallengeModal";
import {
  AccountActionsMenu,
} from "@/components/admin/trading/AccountActionsMenu";
import {
  fetchTradingAccounts,
  createTradingAccount,
  accountAction,
  deleteTradingAccount,
} from "@/lib/trading-client";

type DialogKind = "reset" | "disable" | "enable" | "delete" | null;

export default function TradingAccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal / dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [leverageTarget, setLeverageTarget] = useState<any>(null);
  const [assignTarget, setAssignTarget] = useState<any>(null);
  const [confirmKind, setConfirmKind] = useState<DialogKind>(null);
  const [confirmTarget, setConfirmTarget] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  async function loadAccounts() {
    setLoading(true);
    try {
      const { accounts } = await fetchTradingAccounts();
      setAccounts(accounts);
    } catch (e: any) {
      toast.error(e.message || "Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }

  // Replace a single account row in local state (instant update, no refresh).
  function upsertAccount(updated: any) {
    setAccounts((prev) =>
      prev.some((a) => a.id === updated.id)
        ? prev.map((a) => (a.id === updated.id ? updated : a))
        : [updated, ...prev]
    );
  }

  function removeAccount(id: string) {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
  }

  // ---- Action handlers -----------------------------------------------------
  async function handleCreate(payload: any) {
    setActionLoading(true);
    try {
      const { account } = await createTradingAccount(payload);
      // Re-fetch to hydrate joined fields (profiles / platform / rule names).
      await loadAccounts();
      toast.success(`Account ${account.account_number} issued`);
      setCreateOpen(false);
    } catch (e: any) {
      toast.error(e.message || "Failed to create account");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleLeverage(leverage: number) {
    if (!leverageTarget) return;
    setActionLoading(true);
    try {
      const { account } = await accountAction(leverageTarget.id, {
        action: "change_leverage",
        leverage,
      });
      upsertAccount(account);
      toast.success(`Leverage updated to 1:${leverage}`);
      setLeverageTarget(null);
    } catch (e: any) {
      toast.error(e.message || "Failed to update leverage");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAssign(ruleId: string, phase: string) {
    if (!assignTarget) return;
    setActionLoading(true);
    try {
      const { account } = await accountAction(assignTarget.id, {
        action: "assign_challenge",
        rule_id: ruleId,
        phase,
      });
      upsertAccount(account);
      toast.success("Challenge assigned");
      setAssignTarget(null);
    } catch (e: any) {
      toast.error(e.message || "Failed to assign challenge");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleConfirm() {
    if (!confirmKind || !confirmTarget) return;
    setActionLoading(true);
    try {
      if (confirmKind === "delete") {
        await deleteTradingAccount(confirmTarget.id);
        removeAccount(confirmTarget.id);
        toast.success("Account deleted");
      } else {
        const actionMap: Record<string, string> = {
          reset: "reset_challenge",
          disable: "disable",
          enable: "enable",
        };
        const { account } = await accountAction(confirmTarget.id, {
          action: actionMap[confirmKind],
        });
        upsertAccount(account);
        const msg: Record<string, string> = {
          reset: "Challenge reset",
          disable: "Account disabled",
          enable: "Account enabled",
        };
        toast.success(msg[confirmKind]);
      }
      setConfirmKind(null);
      setConfirmTarget(null);
    } catch (e: any) {
      toast.error(e.message || "Action failed");
    } finally {
      setActionLoading(false);
    }
  }

  function openConfirm(kind: DialogKind, account: any) {
    setConfirmTarget(account);
    setConfirmKind(kind);
  }

  // ---- Filtering -----------------------------------------------------------
  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      acc.account_number?.toLowerCase().includes(search.toLowerCase()) ||
      acc.profiles?.email?.toLowerCase().includes(search.toLowerCase()) ||
      acc.profiles?.display_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || acc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const confirmConfig: Record<
    Exclude<DialogKind, null>,
    { title: string; message: string; confirmLabel: string; destructive: boolean }
  > = {
    reset: {
      title: "Reset Challenge",
      message:
        "This resets balance, equity and drawdown counters back to the starting balance and sets the account to active / phase 1. Continue?",
      confirmLabel: "Reset Challenge",
      destructive: false,
    },
    disable: {
      title: "Disable Account",
      message:
        "The customer will no longer be able to trade on this account until it is re-enabled. Continue?",
      confirmLabel: "Disable Account",
      destructive: false,
    },
    enable: {
      title: "Enable Account",
      message: "Re-enable trading on this account?",
      confirmLabel: "Enable Account",
      destructive: false,
    },
    delete: {
      title: "Delete Account",
      message:
        "This permanently deletes the trading account. This action cannot be undone. Continue?",
      confirmLabel: "Delete Account",
      destructive: true,
    },
  };

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
          <p className="font-semibold text-[13px] text-[var(--ink-950)]">{row.original.profiles?.display_name || "\u2014"}</p>
          <p className="text-[11px] text-[var(--ink-500)]">{row.original.profiles?.email || "\u2014"}</p>
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
            <p className={cn("text-[11px] font-medium", isUp ? "text-[var(--dash-positive)]" : "text-[var(--dash-negative)]")}>
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
          {String(row.original.phase || "").replace("_", " ")}
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
            "inline-flex px-2 py-1 rounded-none text-[10px] font-bold uppercase tracking-wider",
            s === "active" ? "bg-[#a7f0ba] text-[#0e6027]" :
            s === "breached" ? "bg-[#ffd7d9] text-[#a2191f]" :
            s === "passed" ? "bg-[#e0e0e0] text-[#393939]" :
            s === "suspended" ? "bg-[#fcf4d6] text-[#8e6a00]" :
            s === "disabled" ? "bg-gray-200 text-gray-700" :
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
        <AccountActionsMenu
          account={row.original}
          handlers={{
            onResetChallenge: () => openConfirm("reset", row.original),
            onAssignChallenge: () => setAssignTarget(row.original),
            onEnable: () => openConfirm("enable", row.original),
            onDisable: () => openConfirm("disable", row.original),
            onChangeLeverage: () => setLeverageTarget(row.original),
            onDelete: () => openConfirm("delete", row.original),
          }}
        />
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">Trading Accounts</h1>
          <p className="text-[var(--ink-500)] text-[14px]">View and manage all active challenges and funded accounts.</p>
        </div>
        <Button className="shrink-0 gap-2" onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4" /> Issue Account
        </Button>
      </div>

      <div className="bg-white border border-[var(--dash-hairline)] rounded-none p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-400)]" />
          <input 
            type="text"
            placeholder="Search by account #, email, or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 h-10 bg-[var(--dash-canvas)] border border-[var(--dash-hairline)] rounded-none text-[14px] focus:outline-none focus:border-[var(--ink-400)]"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-[var(--ink-500)] shrink-0">
            <Filter className="w-4 h-4" /> Status:
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 bg-[var(--dash-canvas)] border border-[var(--dash-hairline)] rounded-none px-3 text-[13px] focus:outline-none font-medium outline-none min-w-[120px]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="breached">Breached</option>
            <option value="passed">Passed</option>
            <option value="suspended">Suspended</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </div>

      <AdminTable data={filteredAccounts} columns={columns} loading={loading} searchable={false} />

      {/* Modals */}
      <CreateAccountModal
        open={createOpen}
        loading={actionLoading}
        onCreate={handleCreate}
        onCancel={() => setCreateOpen(false)}
      />

      <LeverageModal
        open={!!leverageTarget}
        currentLeverage={leverageTarget?.leverage || 100}
        loading={actionLoading}
        onSave={handleLeverage}
        onCancel={() => setLeverageTarget(null)}
      />

      <AssignChallengeModal
        open={!!assignTarget}
        currentRuleId={assignTarget?.rule_id}
        loading={actionLoading}
        onSave={handleAssign}
        onCancel={() => setAssignTarget(null)}
      />

      <ConfirmDialog
        open={!!confirmKind}
        title={confirmKind ? confirmConfig[confirmKind].title : ""}
        message={confirmKind ? confirmConfig[confirmKind].message : ""}
        confirmLabel={confirmKind ? confirmConfig[confirmKind].confirmLabel : "Confirm"}
        destructive={confirmKind ? confirmConfig[confirmKind].destructive : false}
        loading={actionLoading}
        onConfirm={handleConfirm}
        onCancel={() => {
          setConfirmKind(null);
          setConfirmTarget(null);
        }}
      />
    </div>
  );
}
