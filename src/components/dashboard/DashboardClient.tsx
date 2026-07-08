"use client";

import { useEffect, useState } from "react";
import { StatCards } from "./StatCards";
import { ActiveAccounts } from "./ActiveAccounts";
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
      
      if (session?.user) {
        // Fetch accounts
        const { data: accountsData } = await supabase
          .from("trading_accounts")
          .select("*, tpp_platforms(name), trading_rules(name)")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });
          
        if (accountsData && alive) {
          setAccounts(accountsData as DashboardAccount[]);
        }

        // Fetch payouts
        const { data: payoutsData } = await supabase
          .from("payouts")
          .select("amount")
          .eq("user_id", session.user.id)
          .eq("status", "paid");
          
        if (payoutsData && alive) {
          const total = payoutsData.reduce((s, p) => s + Number(p.amount), 0);
          setTotalPayouts(total);
        }

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
    
    void fetchDashboard();

    return () => {
      alive = false;
      if (subscription) void supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div className="w-full animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
      <div className="mb-6">
        <p className="dash-overline mb-1.5">Overview</p>
        <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
          Your trading desk
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Track accounts, payouts and evaluation progress in one place.
        </p>
      </div>
      <StatCards accounts={accounts} totalPayouts={totalPayouts} />
      <ActiveAccounts accounts={accounts} loading={loading} />
    </div>
  );
}
