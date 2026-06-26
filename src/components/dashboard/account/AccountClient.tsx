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
        setAccount(data);
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
      <PerformanceCharts />
      <AccountBalanceChart />
      <TradingObjectives account={account} />
      <DailySummary />
      <AnalysisGrid />
    </div>
  );
}
