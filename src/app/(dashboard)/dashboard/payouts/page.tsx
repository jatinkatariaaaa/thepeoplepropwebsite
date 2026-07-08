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

  // Only query Supabase when configured; otherwise render the empty shell.
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
    <div className="mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
      <div className="mb-6">
        <p className="dash-overline mb-1.5">Capital</p>
        <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">Payouts</h1>
        <p className="mt-1 text-sm text-ink-500">Request profit withdrawals from your funded accounts.</p>
      </div>

      <PayoutsClient 
        fundedAccounts={accounts || []} 
        initialPayouts={payouts || []} 
      />
    </div>
  );
}
