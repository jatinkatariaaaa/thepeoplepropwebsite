"use client";

import { useEffect, useState } from "react";
import { StatCards } from "./StatCards";
import { ActiveAccounts } from "./ActiveAccounts";
import { supabase } from "@/lib/supabase";

type DashboardAccount = Record<string, unknown> & {
  id: string;
  user_id?: string;
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
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <StatCards accounts={accounts} totalPayouts={totalPayouts} />
      <ActiveAccounts accounts={accounts} loading={loading} />
    </div>
  );
}
