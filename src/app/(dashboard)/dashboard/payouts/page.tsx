import { supabaseAdmin } from "@/lib/supabase";
import { PayoutsClient } from "./PayoutsClient";
import { PageTitle } from "@/components/dashboard/glass";
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
    <div className="mx-auto max-w-4xl">
      <PageTitle lead="Payouts" lede="Request profit withdrawals from your funded accounts." />

      <PayoutsClient 
        fundedAccounts={accounts || []} 
        initialPayouts={payouts || []} 
      />
    </div>
  );
}
