"use client";

import { useEffect, useState } from "react";
import { StatCards } from "./StatCards";
import { ActiveAccounts } from "./ActiveAccounts";
import { supabase } from "@/lib/supabase";

export function DashboardClient() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAccounts() {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const { data } = await supabase
          .from("accounts")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });
          
        if (data) {
          setAccounts(data);
        }
      }
      setLoading(false);
    }
    
    fetchAccounts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <StatCards accounts={accounts} />
      <ActiveAccounts accounts={accounts} loading={loading} />
    </div>
  );
}
