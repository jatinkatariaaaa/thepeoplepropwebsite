import { supabaseAdmin } from "@/lib/supabase";
import { PayoutsClient } from "./PayoutsClient";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export const revalidate = 0;

export default async function PayoutsPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Fetch only funded accounts
  const { data: accounts } = await supabaseAdmin
    .from("accounts")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "funded")
    .order("created_at", { ascending: false });

  // Fetch existing payouts
  const { data: payouts } = await supabaseAdmin
    .from("payouts")
    .select("*, accounts(balance)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

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
