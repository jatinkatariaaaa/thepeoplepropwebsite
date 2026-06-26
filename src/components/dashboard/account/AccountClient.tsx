"use client";

import { useEffect, useState } from "react";
import { AccountHeader } from "./AccountHeader";
import { TopMetrics } from "./TopMetrics";
import { PerformanceCharts } from "./PerformanceCharts";
import { AccountBalanceChart } from "./AccountBalanceChart";
import { TradingObjectives } from "./TradingObjectives";
import { DailySummary } from "./DailySummary";
import { AnalysisGrid } from "./AnalysisGrid";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";

export function AccountClient({ accountId }: { accountId: string }) {
  const [account, setAccount] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAccount() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        redirect("/login");
        return;
      }

      const { data } = await supabase
        .from("trading_accounts")
        .select("*, trading_rules(*), tpp_platforms(*)")
        .eq("id", accountId)
        .eq("user_id", session.user.id)
        .single();
        
      if (data) {
        // Fetch live metrics directly from the Terminal's accounts table
        if (data.terminal_account_id) {
          const { data: terminalData } = await supabase
            .from("accounts")
            .select("balance, equity, highest_equity, status")
            .eq("id", data.terminal_account_id)
            .single();
            
          if (terminalData) {
            // Merge the live terminal data into the CRM account object
            data.balance = terminalData.balance;
            data.equity = terminalData.equity;
            data.highest_equity = terminalData.highest_equity;
            // Also sync status if the webhook hasn't processed it yet
            if (terminalData.status !== "active") {
               data.status = terminalData.status;
            }
          }
        }
        setAccount(data);
        
        // Fetch real metrics
        try {
           const res = await fetch(`/api/account-metrics/${accountId}`);
           if (res.ok) {
             const metricsData = await res.json();
             setMetrics(metricsData);
           }
        } catch (e) {
           console.error("Failed to fetch metrics", e);
        }
      }
      setLoading(false);
    }
    
    fetchAccount();
  }, [accountId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex justify-center py-20">
        <div className="w-12 h-12 rounded-full border-4 border-[var(--accent)] border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="max-w-7xl mx-auto py-20 text-center">
        <h2 className="text-2xl font-bold mb-2">Account Not Found</h2>
        <p className="text-[var(--ink-500)]">The account you are looking for does not exist or you do not have permission to view it.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-20">
      <AccountHeader account={account} />
      <TopMetrics account={account} />
      <PerformanceCharts account={account} metrics={metrics} />
      <AccountBalanceChart metrics={metrics} />
      <TradingObjectives account={account} />
      <DailySummary metrics={metrics} />
      <AnalysisGrid metrics={metrics} />
    </div>
  );
}
