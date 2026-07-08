"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  Clock,
  GitBranch,
  PauseCircle,
  RefreshCw,
  ShieldAlert,
  Target,
  TrendingUp,
  Wallet,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { AccountMetrics, MetricPoint } from "@/lib/account-metrics";

type OverviewResponse = {
  account: any;
  terminal: any | null;
  metrics: AccountMetrics;
  phaseHistory: any[];
  events: any[];
};

const PHASE_LABEL: Record<string, string> = {
  challenge: "Phase 1",
  verification: "Phase 2",
  phase_3: "Phase 3",
  funded: "Funded",
};

function money(value: unknown) {
  const next = Number(value || 0);
  return `$${next.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function percent(value: unknown) {
  const next = Number(value || 0);
  return `${next.toFixed(2)}%`;
}

function phaseLabel(value: unknown) {
  const key = String(value || "challenge");
  return PHASE_LABEL[key] || key.replace("_", " ");
}

function statusTone(status: string) {
  if (status === "active") return "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (status === "breached") return "text-red-700 bg-red-50 border-red-200";
  if (status === "passed") return "text-blue-700 bg-blue-50 border-blue-200";
  if (status === "suspended") return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-gray-700 bg-gray-50 border-gray-200";
}

function StatusIcon({ status }: { status: string }) {
  const Icon =
    status === "active" ? CheckCircle2 :
    status === "breached" ? XCircle :
    status === "passed" ? CheckCircle2 :
    status === "suspended" ? PauseCircle :
    AlertTriangle;
  return <Icon className="w-3.5 h-3.5" />;
}

function MiniMetric({ label, value, tone = "" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-[var(--dash-hairline)]">
      <p className="text-[12px] font-bold text-[var(--ink-500)] uppercase tracking-wider mb-1">{label}</p>
      <p className={cn("text-xl font-bold text-[var(--ink-950)]", tone)}>{value}</p>
    </div>
  );
}

function EquityCurve({ points }: { points: MetricPoint[] }) {
  const chartPoints = points.filter((point) => Number.isFinite(point.equity));
  const width = 720;
  const height = 220;
  const padding = 22;

  const { path, min, max } = useMemo(() => {
    if (chartPoints.length === 0) return { path: "", min: 0, max: 0 };
    const values = chartPoints.map((point) => Number(point.equity));
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const range = Math.max(1, maxValue - minValue);
    const nextPath = chartPoints
      .map((point, index) => {
        const x = padding + (index / Math.max(1, chartPoints.length - 1)) * (width - padding * 2);
        const y = height - padding - ((Number(point.equity) - minValue) / range) * (height - padding * 2);
        return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");
    return { path: nextPath, min: minValue, max: maxValue };
  }, [chartPoints]);

  if (chartPoints.length <= 1) {
    return (
      <div className="h-72 flex flex-col items-center justify-center text-center">
        <Activity className="w-10 h-10 text-[var(--ink-300)] mb-3" />
        <p className="text-sm font-semibold text-[var(--ink-700)]">No closed-trade curve yet</p>
      </div>
    );
  }

  return (
    <div className="h-72">
      <div className="flex items-center justify-between text-[12px] text-[var(--ink-500)] font-semibold mb-3">
        <span>{money(min)}</span>
        <span>{money(max)}</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[220px] overflow-visible">
        <defs>
          <linearGradient id="admin-equity-line" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
        </defs>
        <path d={`M ${padding} ${height - padding} H ${width - padding}`} stroke="var(--border)" strokeWidth="1" />
        <path d={path} fill="none" stroke="url(#admin-equity-line)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export default function TradingAccountDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [overview, setOverview] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/trading/accounts/${id}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Account not found");
      setOverview(json);
    } catch (error: any) {
      toast.error(error.message || "Account not found");
      router.push("/admin/trading/accounts");
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  async function updateStatus(newStatus: string) {
    if (!confirm(`Are you sure you want to change the status to ${newStatus}?`)) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/trading/accounts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "change_status", status: newStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update status");
      toast.success(`Status updated to ${newStatus}`);
      await fetchOverview();
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <div className="p-10 animate-pulse bg-[var(--dash-canvas)] rounded-xl h-64" />;
  if (!overview) return null;

  const { account, terminal, metrics, phaseHistory, events } = overview;
  const balance = Number(account.balance || 0);
  const equity = Number(account.equity || 0);
  const startBal = Number(account.starting_balance || 0);
  const profit = equity - startBal;
  const profitPct = startBal > 0 ? (profit / startBal) * 100 : 0;
  const status = String(account.status || "");
  const progressTarget = Number(account.trading_rules?.profit_target_pct || 0);
  const profitTargetAmount = startBal * (progressTarget / 100);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex items-center gap-4">
          <Link href="/admin/trading/accounts" className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-[var(--dash-hairline)] hover:bg-[var(--dash-canvas)] transition-colors">
            <ArrowLeft className="w-5 h-5 text-[var(--ink-500)]" />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">Account #{account.account_number}</h1>
              <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border", statusTone(status))}>
                <StatusIcon status={status} />
                {status}
              </span>
              {terminal?.status && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border bg-[var(--dash-canvas)] text-[var(--ink-700)] border-[var(--dash-hairline)]">
                  Terminal: {terminal.status}
                </span>
              )}
            </div>
            <p className="text-[var(--ink-500)] text-[14px]">
              {account.profiles?.display_name || "Unnamed trader"} ({account.profiles?.email || "no email"}) · {phaseLabel(account.phase)}
            </p>
          </div>
        </div>

        <div className="lg:ml-auto flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={fetchOverview} disabled={updating} className="gap-2">
            <RefreshCw className="w-4 h-4" /> Refresh
          </Button>
          {status !== "breached" && (
            <Button variant="outline" className="text-[var(--dash-negative)] border-red-200 hover:bg-red-50" onClick={() => updateStatus("breached")} disabled={updating}>
              Mark Breached
            </Button>
          )}
          {status !== "passed" && (
            <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => updateStatus("passed")} disabled={updating}>
              Mark Passed
            </Button>
          )}
          {status === "suspended" ? (
            <Button variant="outline" className="text-[var(--dash-positive)] border-emerald-200 hover:bg-emerald-50" onClick={() => updateStatus("active")} disabled={updating}>
              Enable Account
            </Button>
          ) : (
            <Button variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50" onClick={() => updateStatus("suspended")} disabled={updating}>
              Suspend Account
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <MiniMetric label="Live Balance" value={money(balance)} />
        <MiniMetric label="Live Equity" value={money(equity)} tone={equity >= balance ? "text-[var(--dash-positive)]" : "text-[var(--dash-negative)]"} />
        <MiniMetric label="P/L" value={`${profit >= 0 ? "+" : ""}${money(profit)}`} tone={profit >= 0 ? "text-[var(--dash-positive)]" : "text-[var(--dash-negative)]"} />
        <MiniMetric label="P/L %" value={`${profitPct >= 0 ? "+" : ""}${percent(profitPct)}`} tone={profit >= 0 ? "text-[var(--dash-positive)]" : "text-[var(--dash-negative)]"} />
        <MiniMetric label="Win Rate" value={percent(metrics.winRate)} />
        <MiniMetric label="Trades" value={String(metrics.totalTrades)} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="dash-card p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-[16px] font-bold text-[var(--ink-950)] flex items-center gap-2">
                  <Activity className="w-5 h-5" /> Equity Curve
                </h3>
                <p className="text-[13px] text-[var(--ink-500)]">Closed trades plus live terminal snapshot</p>
              </div>
              <p className="text-[12px] text-[var(--ink-500)] font-semibold">
                Updated {format(new Date(metrics.lastUpdated), "MMM dd, HH:mm")}
              </p>
            </div>
            <EquityCurve points={metrics.equityCurve} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MiniMetric label="Profit Factor" value={metrics.profitFactor == null ? "No loss" : metrics.profitFactor.toFixed(2)} />
            <MiniMetric label="Average Win" value={money(metrics.averageWin)} tone="text-[var(--dash-positive)]" />
            <MiniMetric label="Average Loss" value={money(metrics.averageLoss)} tone="text-[var(--dash-negative)]" />
          </div>

          <div className="dash-card p-5">
            <h3 className="text-[16px] font-bold text-[var(--ink-950)] flex items-center gap-2 mb-5">
              <GitBranch className="w-5 h-5" /> Phase Progression History
            </h3>
            <div className="space-y-3">
              {phaseHistory.map((phase) => (
                <div key={phase.id} className="flex items-start gap-4 p-4 rounded-xl border border-[var(--dash-hairline)] bg-[var(--dash-canvas)]">
                  <div className={cn("mt-0.5 w-9 h-9 rounded-full border flex items-center justify-center", statusTone(phase.status))}>
                    <StatusIcon status={phase.status} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-[14px] text-[var(--ink-950)]">{phaseLabel(phase.phase)}</p>
                      <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-white border border-[var(--dash-hairline)]">{phase.status}</span>
                      <span className="text-[11px] text-[var(--ink-500)]">{phase.account_number}</span>
                    </div>
                    <p className="text-[12px] text-[var(--ink-500)] mt-1">
                      {phase.trading_rules?.name || "No rule assigned"} · Balance {money(phase.balance)} · Equity {money(phase.equity)}
                    </p>
                    <p className="text-[11px] text-[var(--ink-400)] mt-1">
                      Created {format(new Date(phase.created_at), "MMM dd, yyyy HH:mm")}
                      {phase.passed_at ? ` · Passed ${format(new Date(phase.passed_at), "MMM dd, yyyy HH:mm")}` : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="dash-card overflow-hidden">
            <div className="p-5 border-b border-[var(--dash-hairline)] bg-[var(--dash-canvas)]">
              <h3 className="font-bold text-[16px] text-[var(--ink-950)] flex items-center gap-2">
                <Wallet className="w-4 h-4" /> Account Details
              </h3>
            </div>
            <div className="divide-y divide-[var(--dash-hairline)]">
              {[
                ["Program", account.program_key || "Not set"],
                ["Phase", phaseLabel(account.phase)],
                ["Platform", account.tpp_platforms?.name || "Unknown"],
                ["Server", account.tpp_platforms?.server_name || "N/A"],
                ["Login", account.login],
                ["Terminal ID", account.terminal_account_id || "Not linked"],
                ["Leverage", `1:${account.leverage || 100}`],
                ["Created", format(new Date(account.created_at), "MMM dd, yyyy")],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-4 p-4">
                  <span className="text-[13px] text-[var(--ink-500)] font-medium">{label}</span>
                  <span className="text-[13px] font-bold text-right text-[var(--ink-950)] break-all">{value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="dash-card p-5">
            <h3 className="font-bold text-[16px] text-[var(--ink-950)] flex items-center gap-2 mb-4">
              <Target className="w-4 h-4" /> Rules Snapshot
            </h3>
            {account.trading_rules ? (
              <div className="space-y-4">
                <p className="text-[14px] font-bold text-[var(--ink-950)]">{account.trading_rules.name}</p>
                <div className="grid grid-cols-2 gap-3">
                  <MiniMetric label="Target" value={percent(account.trading_rules.profit_target_pct)} />
                  <MiniMetric label="Daily DD" value={percent(account.trading_rules.max_daily_drawdown_pct)} />
                  <MiniMetric label="Overall DD" value={percent(account.trading_rules.max_overall_drawdown_pct)} />
                  <MiniMetric label="Min Days" value={String(account.trading_rules.min_trading_days || 0)} />
                </div>
                {progressTarget > 0 && (
                  <div>
                    <div className="flex justify-between text-[12px] font-semibold mb-2">
                      <span>Profit Target Progress</span>
                      <span>{money(Math.max(0, profit))} / {money(profitTargetAmount)}</span>
                    </div>
                    <div className="h-2.5 bg-[var(--dash-canvas)] rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, (Math.max(0, profit) / Math.max(1, profitTargetAmount)) * 100)}%` }} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[13px] text-[var(--ink-500)]">No rule template assigned.</p>
            )}
          </div>

          <div className="dash-card p-5">
            <h3 className="font-bold text-[16px] text-[var(--ink-950)] flex items-center gap-2 mb-4">
              <ShieldAlert className="w-4 h-4" /> Terminal Events
            </h3>
            {events.length > 0 ? (
              <div className="space-y-3">
                {events.slice(0, 8).map((event) => (
                  <div key={event.id} className="border border-[var(--dash-hairline)] rounded-xl p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[12px] font-bold uppercase text-[var(--ink-950)]">{String(event.type).replace("_", " ")}</p>
                      <Clock className="w-3.5 h-3.5 text-[var(--ink-400)]" />
                    </div>
                    <p className="text-[12px] text-[var(--ink-500)] mt-1">{event.detail || "No detail"}</p>
                    <p className="text-[11px] text-[var(--ink-400)] mt-1">{format(new Date(event.created_at), "MMM dd, HH:mm")}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-[var(--ink-500)]">No terminal risk events yet.</p>
            )}
          </div>

          <div className="dash-card p-5">
            <h3 className="font-bold text-[16px] text-[var(--ink-950)] flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4" /> Direction Split
            </h3>
            <div className="space-y-3">
              {[
                ["Long", metrics.longStats],
                ["Short", metrics.shortStats],
              ].map(([label, stats]: any) => (
                <div key={label} className="flex justify-between items-center border border-[var(--dash-hairline)] rounded-xl p-3">
                  <div>
                    <p className="text-[13px] font-bold">{label}</p>
                    <p className="text-[11px] text-[var(--ink-500)]">{stats.trades} trades · {percent(stats.winRate)}</p>
                  </div>
                  <p className={cn("text-[13px] font-bold", stats.netPnl >= 0 ? "text-[var(--dash-positive)]" : "text-[var(--dash-negative)]")}>{money(stats.netPnl)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
