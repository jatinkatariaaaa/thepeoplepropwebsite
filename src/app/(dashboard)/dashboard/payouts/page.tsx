import { supabaseAdmin } from "@/lib/supabase";
import { PayoutsClient } from "./PayoutsClient";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const revalidate = 0;

export default async function PayoutsPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let accounts: Record<string, unknown>[] | null = null;
  let payouts: Record<string, unknown>[] | null = null;

  // Only query Supabase when configured; otherwise render the empty shell
  // so the page never crashes with a 500 in preview environments.
  if (supabaseUrl && supabaseAnonKey) {
    const cookieStore = await cookies();
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      // Fetch only funded accounts
      const { data: accountsData } = await supabaseAdmin
        .from("accounts")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "funded")
        .order("created_at", { ascending: false });
      accounts = accountsData;

      // Fetch existing payouts
      const { data: payoutsData } = await supabaseAdmin
        .from("payouts")
        .select("*, accounts(balance)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      payouts = payoutsData;
    }
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold text-[var(--ink-950)] mb-2">Payouts</h1>
        <p className="text-[var(--ink-500)]">Request profit withdrawals from your funded accounts.</p>
      </div>

      <PayoutsClient 
        fundedAccounts={accounts || []} 
        initialPayouts={payouts || []} 
      />
    </div>
  );
}
