import { supabaseAdmin } from "@/lib/supabase";
import { AccountsClient } from "./AccountsClient";

export const revalidate = 0;

export default async function AdminAccountsPage() {
  const { data: accounts, error } = await supabaseAdmin
    .from("accounts")
    .select(`
      *,
      profiles (
        email,
        display_name
      )
    `)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-[var(--ink-950)] mb-2">Trading Accounts</h1>
        <p className="text-[var(--ink-500)]">Manage all trading challenges and funded accounts.</p>
      </div>

      <AccountsClient initialAccounts={accounts || []} />
    </div>
  );
}
