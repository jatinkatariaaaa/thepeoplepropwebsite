"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { AdminTable } from "@/components/admin/AdminTable";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Link from "@/components/IntentLink";
import { useSearchParams } from "next/navigation";
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

type DialogKind = "reset" | "disable" | "enable" | "pass" | "breach" | "delete" | null;

export default function TradingAccountsPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  // links from other admin pages can open the list filtered: /admin/trading/accounts?search=<email>
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("search") ?? "");
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
        const payload: Record<string, { action: string; status?: string }> = {
          reset: { action: "reset_challenge" },
          disable: { action: "disable" },
          enable: { action: "enable" },
          pass: { action: "change_status", status: "passed" },
          breach: { action: "change_status", status: "breached" },
        };
        const { account } = await accountAction(confirmTarget.id, payload[confirmKind]);
        if (confirmKind === "reset" || confirmKind === "pass") await loadAccounts();
        else upsertAccount(account);
        const msg: Record<string, string> = {
          reset: "Account reset",
          disable: "Trading suspended",
          enable: "Trading re-enabled",
          pass: "Phase passed. The next account has been issued.",
          breach: "Account closed as breached",
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
      title: "Reset account",
      message:
        "The trader gets a fresh account at the same phase, size and rules. Open positions on this one are closed at market and it stops trading. Continue?",
      confirmLabel: "Reset account",
      destructive: false,
    },
    disable: {
      title: "Suspend trading",
      message:
        "Open positions are closed at the current price, pending orders are cancelled and the trader cannot trade until you re-enable the account. Continue?",
      confirmLabel: "Suspend",
      destructive: false,
    },
    enable: {
      title: "Re-enable trading",
      message: "Let the trader trade on this account again?",
      confirmLabel: "Re-enable",
      destructive: false,
    },
    pass: {
      title: "Mark phase passed",
      message:
        "Open positions are closed at market, this phase is marked passed and the next account is issued (for Access, the trader is asked to pay the fee). Continue?",
      confirmLabel: "Mark passed",
      destructive: false,
    },
    breach: {
      title: "Close as breached",
      message:
        "Use this for a rule violation. Open positions are closed at market and the account is closed. No free reset is offered. Continue?",
      confirmLabel: "Close account",
      destructive: true,
    },
    delete: {
      title: "Delete account",
      message:
        "Trading stops and the account is hidden from the trader. Its trades, payouts and audit history are kept. Continue?",
      confirmLabel: "Delete account",
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
            "inline-flex px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider",
            s === "active" ? "bg-emerald-50 text-emerald-700" :
            s === "breached" ? "bg-red-50 text-red-700" :
            s === "passed" ? "bg-blue-50 text-blue-700" :
            s === "suspended" ? "bg-amber-50 text-amber-700" :
            s === "funded" ? "bg-lime-100 text-lime-800" :
            s === "deleted" ? "bg-gray-200 text-gray-500" :
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
            onPass: () => openConfirm("pass", row.original),
            onBreach: () => openConfirm("breach", row.original),
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
          <h1 className="text-2xl font-display font-bold text-[var(--ink-950)]">Trading Accounts</h1>
          <p className="text-[var(--ink-500)] text-[14px]">View and manage all active challenges and funded accounts.</p>
        </div>
        <Button className="shrink-0 gap-2" onClick={() => setCreateOpen(true)}>
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
            <option value="funded">Funded</option>
            <option value="deleted">Deleted</option>
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
