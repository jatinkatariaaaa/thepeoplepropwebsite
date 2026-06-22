"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Wallet, AlertTriangle, CheckCircle2, XCircle, PauseCircle, Activity, Scale, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

export default function TradingAccountDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [account, setAccount] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchAccount();
  }, [id]);

  async function fetchAccount() {
    setLoading(true);
    const { data, error } = await supabase
      .from("trading_accounts")
      .select(`
        *,
        profiles (id, email, display_name),
        tpp_platforms (name, server_name),
        trading_rules (*)
      `)
      .eq("id", id)
      .single();
    
    if (!error && data) {
      setAccount(data);
    } else {
      toast.error("Account not found");
      router.push("/admin/trading/accounts");
    }
    setLoading(false);
  }

  async function updateStatus(newStatus: string) {
    if (!confirm(`Are you sure you want to change the status to ${newStatus}?`)) return;
    
    const { error } = await supabase
      .from("trading_accounts")
      .update({ status: newStatus })
      .eq("id", id);
      
    if (!error) {
      toast.success(`Status updated to ${newStatus}`);
      fetchAccount();
    } else {
      toast.error("Failed to update status");
    }
  }

  if (loading) return <div className="p-10 animate-pulse bg-[var(--paper)] rounded-xl h-64" />;
  if (!account) return null;

  const bal = parseFloat(account.balance) || 0;
  const eq = parseFloat(account.equity) || 0;
  const startBal = parseFloat(account.starting_balance) || 0;
  const highEq = parseFloat(account.highest_equity) || 0;
  
  const profit = eq - startBal;
  const profitPct = startBal > 0 ? (profit / startBal) * 100 : 0;
  const isUp = eq >= bal;

  const s = account.status;
  const StatusIcon = 
    s === "active" ? CheckCircle2 :
    s === "breached" ? XCircle :
    s === "passed" ? CheckCircle2 :
    s === "suspended" ? PauseCircle : AlertTriangle;

  const statusColor = 
    s === "active" ? "text-emerald-600 bg-emerald-50 border-emerald-200" :
    s === "breached" ? "text-red-600 bg-red-50 border-red-200" :
    s === "passed" ? "text-blue-600 bg-blue-50 border-blue-200" :
    s === "suspended" ? "text-amber-600 bg-amber-50 border-amber-200" :
    "text-gray-600 bg-gray-50 border-gray-200";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/trading/accounts" className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-[var(--border)] hover:bg-[var(--paper-2)] transition-colors">
          <ArrowLeft className="w-5 h-5 text-[var(--ink-500)]" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold text-[var(--ink-950)]">
              Account #{account.account_number}
            </h1>
            <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border", statusColor)}>
              <StatusIcon className="w-3.5 h-3.5" />
              {account.status}
            </span>
          </div>
          <p className="text-[var(--ink-500)] text-[14px]">
            {account.profiles?.display_name} ({account.profiles?.email})
          </p>
        </div>
        
        <div className="ml-auto flex items-center gap-2">
          {s !== 'breached' && (
            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => updateStatus('breached')}>
              Mark Breached
            </Button>
          )}
          {s !== 'passed' && (
            <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => updateStatus('passed')}>
              Mark Passed
            </Button>
          )}
          {s === 'suspended' ? (
            <Button variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => updateStatus('active')}>
              Enable Account
            </Button>
          ) : (
            <Button variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50" onClick={() => updateStatus('suspended')}>
              Suspend Account
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Metrics & Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[var(--border)]">
              <p className="text-[12px] font-bold text-[var(--ink-500)] uppercase tracking-wider mb-1">Balance</p>
              <p className="text-xl font-bold text-[var(--ink-950)]">
                ${bal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-[var(--border)]">
              <p className="text-[12px] font-bold text-[var(--ink-500)] uppercase tracking-wider mb-1">Equity</p>
              <p className={cn("text-xl font-bold", isUp ? "text-emerald-600" : "text-red-600")}>
                ${eq.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-[var(--border)]">
              <p className="text-[12px] font-bold text-[var(--ink-500)] uppercase tracking-wider mb-1">Starting Balance</p>
              <p className="text-xl font-bold text-[var(--ink-950)]">
                ${startBal.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-[var(--border)]">
              <p className="text-[12px] font-bold text-[var(--ink-500)] uppercase tracking-wider mb-1">Profit/Loss</p>
              <p className={cn("text-xl font-bold", profit >= 0 ? "text-emerald-600" : "text-red-600")}>
                {profit >= 0 ? '+' : ''}${profit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
              </p>
              <p className={cn("text-[11px] font-bold mt-0.5", profit >= 0 ? "text-emerald-600" : "text-red-600")}>
                {profitPct >= 0 ? '+' : ''}{profitPct.toFixed(2)}%
              </p>
            </div>
          </div>

          {/* Equity Chart Placeholder */}
          <div className="bg-white p-6 rounded-2xl border border-[var(--border)] h-80 flex flex-col items-center justify-center text-center">
            <Activity className="w-12 h-12 text-[var(--ink-300)] mb-4" />
            <h3 className="text-[var(--ink-950)] font-bold mb-1">Equity Curve</h3>
            <p className="text-[var(--ink-500)] text-sm max-w-sm">Connect a real broker API to stream trade history and visualize the account's equity curve over time.</p>
          </div>
          
          {/* Risk Limits */}
          <div className="bg-white p-6 rounded-2xl border border-[var(--border)]">
            <div className="flex items-center gap-2 mb-6">
              <ShieldAlert className="w-5 h-5 text-[var(--ink-950)]" />
              <h3 className="text-[16px] font-bold text-[var(--ink-950)]">Risk Dashboard</h3>
            </div>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-[13px] font-semibold text-[var(--ink-700)]">Daily Drawdown</span>
                  <span className="text-[13px] font-bold">
                    ${parseFloat(account.current_daily_drawdown).toLocaleString()} / ${(startBal * ((account.trading_rules?.max_daily_drawdown_pct || 5) / 100)).toLocaleString()} Limit
                  </span>
                </div>
                <div className="w-full bg-[var(--paper-2)] rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-red-500 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(100, (parseFloat(account.current_daily_drawdown) / (startBal * ((account.trading_rules?.max_daily_drawdown_pct || 5) / 100))) * 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-[13px] font-semibold text-[var(--ink-700)]">Overall Drawdown</span>
                  <span className="text-[13px] font-bold">
                    ${parseFloat(account.current_max_drawdown).toLocaleString()} / ${(startBal * ((account.trading_rules?.max_overall_drawdown_pct || 10) / 100)).toLocaleString()} Limit
                  </span>
                </div>
                <div className="w-full bg-[var(--paper-2)] rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-red-600 h-2.5 rounded-full" 
                    style={{ width: `${Math.min(100, (parseFloat(account.current_max_drawdown) / (startBal * ((account.trading_rules?.max_overall_drawdown_pct || 10) / 100))) * 100)}%` }}
                  ></div>
                </div>
              </div>
              
              {account.trading_rules?.profit_target_pct > 0 && (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-[13px] font-semibold text-[var(--ink-700)]">Profit Target</span>
                    <span className="text-[13px] font-bold">
                      ${Math.max(0, profit).toLocaleString()} / ${(startBal * (account.trading_rules.profit_target_pct / 100)).toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-[var(--paper-2)] rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, (Math.max(0, profit) / (startBal * (account.trading_rules.profit_target_pct / 100))) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Information */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
            <div className="p-5 border-b border-[var(--border)] bg-[var(--paper)]">
              <h3 className="font-bold text-[16px] text-[var(--ink-950)]">Account Information</h3>
            </div>
            <div className="p-0">
              <div className="flex justify-between p-4 border-b border-[var(--border)]">
                <span className="text-[13px] text-[var(--ink-500)] font-medium">Phase</span>
                <span className="text-[13px] font-bold capitalize">{account.phase}</span>
              </div>
              <div className="flex justify-between p-4 border-b border-[var(--border)]">
                <span className="text-[13px] text-[var(--ink-500)] font-medium">Platform</span>
                <span className="text-[13px] font-bold">{account.tpp_platforms?.name || 'Unknown'}</span>
              </div>
              <div className="flex justify-between p-4 border-b border-[var(--border)]">
                <span className="text-[13px] text-[var(--ink-500)] font-medium">Server</span>
                <span className="text-[13px] font-bold">{account.tpp_platforms?.server_name || 'N/A'}</span>
              </div>
              <div className="flex justify-between p-4 border-b border-[var(--border)]">
                <span className="text-[13px] text-[var(--ink-500)] font-medium">Login</span>
                <span className="text-[13px] font-bold">{account.login}</span>
              </div>
              <div className="flex justify-between p-4 border-b border-[var(--border)]">
                <span className="text-[13px] text-[var(--ink-500)] font-medium">Leverage</span>
                <span className="text-[13px] font-bold">1:{account.leverage}</span>
              </div>
              <div className="flex justify-between p-4">
                <span className="text-[13px] text-[var(--ink-500)] font-medium">Created</span>
                <span className="text-[13px] font-bold">{format(new Date(account.created_at), "MMM dd, yyyy")}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[var(--border)] overflow-hidden">
            <div className="p-5 border-b border-[var(--border)] bg-[var(--paper)] flex items-center justify-between">
              <h3 className="font-bold text-[16px] text-[var(--ink-950)] flex items-center gap-2">
                <Scale className="w-4 h-4" /> Challenge Rules
              </h3>
            </div>
            <div className="p-5 space-y-4">
              {account.trading_rules ? (
                <>
                  <p className="text-[14px] font-bold text-[var(--ink-950)] mb-2">{account.trading_rules.name}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[11px] font-semibold text-[var(--ink-500)] uppercase">Max Daily Loss</p>
                      <p className="text-[14px] font-bold">{account.trading_rules.max_daily_drawdown_pct}%</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-[var(--ink-500)] uppercase">Max Overall Loss</p>
                      <p className="text-[14px] font-bold">{account.trading_rules.max_overall_drawdown_pct}%</p>
                    </div>
                  </div>
                  
                  <div className="pt-3 mt-3 border-t border-[var(--border)] flex flex-wrap gap-1.5">
                    {account.trading_rules.is_news_trading_allowed && <span className="px-2 py-1 bg-[var(--paper-2)] border border-[var(--border)] text-[10px] font-bold uppercase rounded-md">News OK</span>}
                    {account.trading_rules.is_weekend_holding_allowed && <span className="px-2 py-1 bg-[var(--paper-2)] border border-[var(--border)] text-[10px] font-bold uppercase rounded-md">Weekend OK</span>}
                    {account.trading_rules.is_ea_allowed && <span className="px-2 py-1 bg-[var(--paper-2)] border border-[var(--border)] text-[10px] font-bold uppercase rounded-md">EA OK</span>}
                  </div>
                </>
              ) : (
                <p className="text-[13px] text-[var(--ink-500)]">No rule template assigned.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
