import { supabaseAdmin } from "@/lib/supabase";
import { AccountsClient } from "./AccountsClient";

export const revalidate = 0;

export default async function AdminAccountsPage() {
  const [ { data: accounts }, { data: profiles } ] = await Promise.all([
    supabaseAdmin.from("accounts").select("*").order("created_at", { ascending: false }),
    supabaseAdmin.from("profiles").select("id, email, display_name")
  ]);

  const profilesMap = (profiles || []).reduce((acc: any, p: any) => {
    acc[p.id] = p;
    return acc;
  }, {});

  const enrichedAccounts = (accounts || []).map(acc => ({
    ...acc,
    profiles: profilesMap[acc.user_id] || { email: "Unknown" }
  }));

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-[var(--ink-950)] mb-2">Trading Accounts</h1>
        <p className="text-[var(--ink-500)]">Manage all trading challenges and funded accounts.</p>
      </div>

      <AccountsClient initialAccounts={enrichedAccounts} />
    </div>
  );
}
