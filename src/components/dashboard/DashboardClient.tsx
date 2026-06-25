"use client";

import { useEffect, useState } from "react";
import { StatCards } from "./StatCards";
import { ActiveAccounts } from "./ActiveAccounts";
import { supabase } from "@/lib/supabase";

export function DashboardClient() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [totalPayouts, setTotalPayouts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription: any;

    async function fetchDashboard() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Fetch accounts
        const { data: accountsData } = await supabase
          .from("trading_accounts")
          .select("*, tpp_platforms(name), trading_rules(name)")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });
          
        if (accountsData) {
          setAccounts(accountsData);
        }

        // Fetch payouts
        const { data: payoutsData } = await supabase
          .from("payouts")
          .select("amount")
          .eq("user_id", session.user.id)
          .eq("status", "paid");
          
        if (payoutsData) {
          const total = payoutsData.reduce((s, p) => s + Number(p.amount), 0);
          setTotalPayouts(total);
        }

        // Setup Realtime Sync
        subscription = supabase
          .channel("dashboard-accounts")
          .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "trading_accounts", filter: `user_id=eq.${session.user.id}` },
            (payload) => {
              setAccounts((prev) => 
                prev.map(acc => acc.id === payload.new.id ? { ...acc, ...payload.new } : acc)
              );
            }
          )
          .subscribe();
      }
      setLoading(false);
    }
    
    fetchDashboard();

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <StatCards accounts={accounts} totalPayouts={totalPayouts} />
      <ActiveAccounts accounts={accounts} loading={loading} />
    </div>
  );
}
