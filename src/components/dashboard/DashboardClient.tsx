"use client";

import { useEffect, useState } from "react";
import { StatCards } from "./StatCards";
import { ActiveAccounts } from "./ActiveAccounts";
import { PerksStrip } from "./PerksStrip";
import { supabase } from "@/lib/supabase";

type DashboardAccount = Record<string, unknown> & {
  id: string;
  user_id?: string | null;
  label?: string | null;
  created_at?: string | null;
  status?: string | null;
  starting_balance?: number | string | null;
  equity?: number | string | null;
  phase?: string | null;
  terminal_account_id?: string | null;
  tpp_platforms?: { name?: string | null } | null;
};

export function DashboardClient() {
  const [accounts, setAccounts] = useState<DashboardAccount[]>([]);
  const [totalPayouts, setTotalPayouts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    let subscription: ReturnType<typeof supabase.channel> | null = null;

    async function fetchDashboard() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!alive) return;
      if (session?.user) {
        const userId = session.user.id;
        const accountsRequest = supabase
          .from("trading_accounts")
          .select("id, created_at, status, starting_balance, equity, phase, terminal_account_id, tpp_platforms(name)")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        // Accounts can render while paid-payout totals are still loading.
        void supabase.from("payouts")
          .select("amount")
          .eq("user_id", userId)
          .eq("status", "paid")
          .then(({ data }) => {
            if (data && alive) setTotalPayouts(data.reduce((sum, row) => sum + Number(row.amount), 0));
          });

        const { data: accountsData } = await accountsRequest;
        if (!alive) return;
        if (accountsData) setAccounts(accountsData as unknown as DashboardAccount[]);

        // Setup Realtime Sync
        const channelName = `dashboard-accounts-${session.user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        subscription = supabase
          .channel(channelName)
          .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "trading_accounts", filter: `user_id=eq.${session.user.id}` },
            (payload) => {
              if (!alive) return;
              const updated = payload.new as DashboardAccount;
              setAccounts((prev) => 
                prev.map(acc => acc.id === updated.id ? { ...acc, ...updated } : acc)
              );
            }
          )
          .subscribe();
      }
      if (alive) setLoading(false);
    }
    
    void fetchDashboard().catch(() => {
      if (alive) setLoading(false);
    });

    return () => {
      alive = false;
      if (subscription) void supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto">
      <StatCards accounts={accounts} totalPayouts={totalPayouts} />
      <PerksStrip accounts={accounts} />
      <ActiveAccounts accounts={accounts} loading={loading} />
    </div>
  );
}
