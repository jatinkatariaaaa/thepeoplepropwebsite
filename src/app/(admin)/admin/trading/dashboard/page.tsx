"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Activity, ShieldAlert, AlertTriangle, TrendingUp, Wallet, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function RiskDashboardPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [nearingDaily, setNearingDaily] = useState<any[]>([]);
  const [nearingMax, setNearingMax] = useState<any[]>([]);
  const [passingSoon, setPassingSoon] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    
    // Fetch Alerts
    const { data: alertsData } = await supabase
      .from("trading_alerts")
      .select(`
        *,
        trading_accounts(account_number, profiles(display_name))
      `)
      .order("created_at", { ascending: false })
      .limit(10);
      
    if (alertsData) setAlerts(alertsData);

    // Fetch Active Accounts to calculate risk
    const { data: accountsData } = await supabase
      .from("trading_accounts")
      .select(`
        *,
        profiles(display_name),
        trading_rules(max_daily_drawdown_pct, max_overall_drawdown_pct, profit_target_pct)
      `)
      .eq("status", "active");

    if (accountsData) {
      const dailyRisk: any[] = [];
      const maxRisk: any[] = [];
      const passing: any[] = [];

      accountsData.forEach(acc => {
        const startBal = parseFloat(acc.starting_balance);
        if (!startBal || !acc.trading_rules) return;

        const eq = parseFloat(acc.equity);
        const dailyLimit = startBal * (acc.trading_rules.max_daily_drawdown_pct / 100);
        const maxLimit = startBal * (acc.trading_rules.max_overall_drawdown_pct / 100);
        const target = startBal * (acc.trading_rules.profit_target_pct / 100);
        
        const currDaily = parseFloat(acc.current_daily_drawdown);
        const currMax = parseFloat(acc.current_max_drawdown);
        const profit = eq - startBal;

        // If daily DD is > 80% of limit
        if (currDaily > dailyLimit * 0.8) {
          dailyRisk.push({ ...acc, riskPct: (currDaily / dailyLimit) * 100 });
        }
        
        // If overall DD is > 80% of limit
        if (currMax > maxLimit * 0.8) {
          maxRisk.push({ ...acc, riskPct: (currMax / maxLimit) * 100 });
        }

        // If profit is > 80% of target
        if (target > 0 && profit > target * 0.8) {
          passing.push({ ...acc, progressPct: (profit / target) * 100 });
        }
      });

      setNearingDaily(dailyRisk.sort((a, b) => b.riskPct - a.riskPct).slice(0, 5));
      setNearingMax(maxRisk.sort((a, b) => b.riskPct - a.riskPct).slice(0, 5));
      setPassingSoon(passing.sort((a, b) => b.progressPct - a.progressPct).slice(0, 5));
    }
    
    setLoading(false);
  }

  if (loading) return <div className="p-10 animate-pulse bg-[var(--dash-canvas)] rounded-xl h-64" />;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            <Activity className="w-6 h-6 text-indigo-600" /> Risk Dashboard
          </h1>
          <p className="text-[var(--ink-500)] text-[14px]">Monitor live trading metrics and risk warnings.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Alerts */}
        <div className="lg:col-span-1 space-y-6">
          <div className="dash-card overflow-hidden">
            <div className="p-4 border-b border-[var(--dash-hairline)] bg-[var(--dash-canvas)] flex items-center justify-between">
              <h3 className="font-bold text-[14px] text-[var(--ink-950)] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" /> Recent Alerts
              </h3>
            </div>
            <div className="divide-y divide-[var(--dash-hairline)]">
              {alerts.length === 0 ? (
                <div className="p-6 text-center text-[var(--ink-500)] text-[13px]">No recent alerts.</div>
              ) : (
                alerts.map(alert => (
                  <div key={alert.id} className="p-4 hover:bg-[var(--dash-canvas)] transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "mt-0.5 p-1.5 rounded-lg shrink-0",
                        alert.type === 'drawdown_warning' ? "bg-amber-100 text-amber-700" :
                        alert.type === 'rule_violation' ? "bg-red-100 text-red-700" :
                        alert.type === 'passing_soon' ? "bg-emerald-100 text-emerald-700" :
                        "bg-gray-100 text-gray-700"
                      )}>
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-[var(--ink-950)] leading-snug">
                          {alert.message}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Link href={`/admin/trading/accounts/${alert.account_id}`} className="text-[11px] font-bold text-indigo-600 hover:underline">
                            {alert.trading_accounts?.account_number}
                          </Link>
                          <span className="text-[10px] text-[var(--ink-400)]">•</span>
                          <span className="text-[11px] text-[var(--ink-500)]">{new Date(alert.created_at).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Risk Lists */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Nearing Daily Drawdown */}
          <div className="dash-card overflow-hidden">
            <div className="p-4 border-b border-[var(--dash-hairline)] bg-[var(--dash-canvas)]">
              <h3 className="font-bold text-[14px] text-[var(--ink-950)] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" /> Nearing Daily Limit
              </h3>
            </div>
            <div className="p-0">
              {nearingDaily.length === 0 ? (
                <div className="p-6 text-center text-[var(--ink-500)] text-[13px]">No accounts near daily limit.</div>
              ) : (
                <div className="divide-y divide-[var(--dash-hairline)]">
                  {nearingDaily.map(acc => (
                    <div key={acc.id} className="p-4 flex items-center justify-between">
                      <div>
                        <Link href={`/admin/trading/accounts/${acc.id}`} className="font-bold text-[13px] text-[var(--ink-950)] hover:text-indigo-600">
                          {acc.account_number}
                        </Link>
                        <p className="text-[11px] text-[var(--ink-500)]">{acc.profiles?.display_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[13px] font-bold text-red-600">{acc.riskPct.toFixed(1)}%</p>
                        <p className="text-[10px] text-[var(--ink-500)] uppercase font-semibold">of Limit</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Nearing Max Drawdown */}
          <div className="dash-card overflow-hidden">
            <div className="p-4 border-b border-[var(--dash-hairline)] bg-[var(--dash-canvas)]">
              <h3 className="font-bold text-[14px] text-[var(--ink-950)] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-red-600" /> Nearing Max Limit
              </h3>
            </div>
            <div className="p-0">
              {nearingMax.length === 0 ? (
                <div className="p-6 text-center text-[var(--ink-500)] text-[13px]">No accounts near max limit.</div>
              ) : (
                <div className="divide-y divide-[var(--dash-hairline)]">
                  {nearingMax.map(acc => (
                    <div key={acc.id} className="p-4 flex items-center justify-between">
                      <div>
                        <Link href={`/admin/trading/accounts/${acc.id}`} className="font-bold text-[13px] text-[var(--ink-950)] hover:text-indigo-600">
                          {acc.account_number}
                        </Link>
                        <p className="text-[11px] text-[var(--ink-500)]">{acc.profiles?.display_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[13px] font-bold text-red-600">{acc.riskPct.toFixed(1)}%</p>
                        <p className="text-[10px] text-[var(--ink-500)] uppercase font-semibold">of Limit</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Passing Soon */}
          <div className="dash-card overflow-hidden md:col-span-2">
            <div className="p-4 border-b border-[var(--dash-hairline)] bg-[var(--dash-canvas)]">
              <h3 className="font-bold text-[14px] text-[var(--ink-950)] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Passing Soon
              </h3>
            </div>
            <div className="p-0">
              {passingSoon.length === 0 ? (
                <div className="p-6 text-center text-[var(--ink-500)] text-[13px]">No accounts close to profit target.</div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[var(--dash-hairline)]">
                  {passingSoon.map(acc => (
                    <div key={acc.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center border border-emerald-100">
                          <Wallet className="w-4 h-4 text-emerald-600" />
                        </div>
                        <div>
                          <Link href={`/admin/trading/accounts/${acc.id}`} className="font-bold text-[13px] text-[var(--ink-950)] hover:text-emerald-600">
                            {acc.account_number}
                          </Link>
                          <p className="text-[11px] text-[var(--ink-500)]">{acc.profiles?.display_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[13px] font-bold text-emerald-600">{acc.progressPct.toFixed(1)}%</p>
                        <p className="text-[10px] text-[var(--ink-500)] uppercase font-semibold">to Target</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
