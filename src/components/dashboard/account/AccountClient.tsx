"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AccountHeader } from "./AccountHeader";
import { TopMetrics } from "./TopMetrics";
import { PerformanceCharts } from "./PerformanceCharts";
import { AccountBalanceChart } from "./AccountBalanceChart";
import { TradingObjectives } from "./TradingObjectives";
import { DailySummary } from "./DailySummary";
import { AnalysisGrid } from "./AnalysisGrid";
import { AccountOffers } from "./AccountOffers";
import { CreateTradeRecord } from "./CreateTradeRecord";
import { supabase } from "@/lib/supabase";
import type { AccountMetrics } from "@/lib/account-metrics";
import { Panel, Spinner } from "../glass";

type DashboardAccount = Record<string, unknown> & {
  id?: string;
  user_id?: string;
  terminal_account_id?: string | null;
  balance?: number;
  equity?: number;
  highest_equity?: number;
  status?: string;
};

export function AccountClient({ accountId }: { accountId: string }) {
  const [account, setAccount] = useState<DashboardAccount | null>(null);
  const [metrics, setMetrics] = useState<AccountMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCreateTrade, setShowCreateTrade] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let alive = true;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    async function fetchAccount(isInitialLoad = false) {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        router.replace("/login");
        return null;
      }

      // Check if user is admin
      const { data: adminProfile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", session.user.id)
        .single();
      if (adminProfile?.is_admin && alive) setIsAdmin(true);

      const { data } = await supabase
        .from("trading_accounts")
        .select("*, trading_rules(*), tpp_platforms(*)")
        .eq("id", accountId)
        .eq("user_id", session.user.id)
        .single();
        
      if (!alive) return null;

      if (data) {
        const nextAccount = data as DashboardAccount;
        try {
          const res = await fetch(`/api/account-metrics/${accountId}`, {
            cache: "no-store",
          });

          if (res.ok) {
            const payload = await res.json();
            const nextMetrics = payload.metrics as AccountMetrics;
            const terminal = nextMetrics.terminal;

            if (terminal) {
              nextAccount.balance = terminal.balance;
              nextAccount.equity = terminal.equity;
              nextAccount.highest_equity = terminal.highest_equity;
              if (terminal.status && terminal.status !== "active") {
                nextAccount.status = terminal.status;
              }
            }

            if (alive) setMetrics(nextMetrics);
          } else if (alive) {
            setMetrics(null);
          }
        } catch (e) {
          console.error("Failed to fetch metrics", e);
          if (alive) setMetrics(null);
        }

        if (alive) setAccount({ ...nextAccount });
      }

      if (alive && isInitialLoad) setLoading(false);
      return (data as DashboardAccount | null)?.terminal_account_id ?? null;
    }

    async function start() {
      const terminalAccountId = await fetchAccount(true);
      if (!alive) return;

      const channelName = `account-metrics-${accountId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "trading_accounts", filter: `id=eq.${accountId}` },
          () => void fetchAccount()
        );

      if (terminalAccountId) {
        channel
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "accounts", filter: `id=eq.${terminalAccountId}` },
            () => void fetchAccount()
          )
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "trades", filter: `account_id=eq.${terminalAccountId}` },
            () => void fetchAccount()
          );
      }

      channel.subscribe();
    }

    void start();
    const intervalId = window.setInterval(() => void fetchAccount(), 15_000);

    return () => {
      alive = false;
      window.clearInterval(intervalId);
      if (channel) void supabase.removeChannel(channel);
    };
  }, [accountId, router]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto flex justify-center py-20">
        <Spinner className="h-12 w-12 border-[3px]" />
      </div>
    );
  }

  if (!account) {
    return (
      <div className="max-w-7xl mx-auto py-10">
        <Panel className="py-8 text-center">
          <h2 className="mb-2 text-[24px] font-semibold tracking-[-0.03em] text-[var(--g-ink)]">Account Not Found</h2>
          <p className="mx-auto max-w-md px-6 text-[14.5px] text-[var(--g-muted-ink)]">The account you are looking for does not exist or you do not have permission to view it.</p>
        </Panel>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <AccountHeader account={account} />

      {isAdmin && (
        <div className="mb-4 flex justify-end">
          <button
            onClick={() => setShowCreateTrade(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[var(--g-ink)] hover:opacity-90 text-[var(--g-lime)] text-sm font-semibold rounded-[14px] transition-all shadow-sm active:scale-[0.97] cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14m-7-7h14"/></svg>
            Create Trade Record
          </button>
        </div>
      )}

      {showCreateTrade && (
        <CreateTradeRecord
          accountId={accountId}
          onClose={() => setShowCreateTrade(false)}
          onSuccess={() => {
            setShowCreateTrade(false);
            window.location.reload();
          }}
        />
      )}

      <AccountOffers account={account} />
      <TopMetrics account={account} />
      <PerformanceCharts account={account} metrics={metrics} />
      <AccountBalanceChart metrics={metrics} />
      <TradingObjectives account={account} />
      <DailySummary metrics={metrics} />
      <AnalysisGrid metrics={metrics} />
    </div>
  );
}
