import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { accountId, amount, cryptoAddress } = await request.json();

    if (!accountId || !amount || !cryptoAddress) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify account belongs to user and is funded
    const { data: account } = await supabaseAdmin
      .from("accounts")
      .select("*")
      .eq("id", accountId)
      .eq("user_id", user.id)
      .eq("status", "funded")
      .single();

    if (!account) {
      return NextResponse.json({ error: "Invalid account or not funded" }, { status: 400 });
    }

    const maxProfit = Math.max(0, account.balance - account.starting_balance);
    if (amount > maxProfit) {
      return NextResponse.json({ error: "Requested amount exceeds maximum withdrawable profit" }, { status: 400 });
    }

    if (amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Deduct from balance
    const newBalance = account.balance - amount;
    const newEquity = account.equity - amount; // Also reduce equity to keep it synced

    const { error: updateError } = await supabaseAdmin
      .from("accounts")
      .update({ balance: newBalance, equity: newEquity })
      .eq("id", account.id);

    if (updateError) {
      throw updateError;
    }

    // Insert payout record
    const { data: payout, error: insertError } = await supabaseAdmin
      .from("payouts")
      .insert({
        user_id: user.id,
        account_id: account.id,
        amount,
        crypto_address: cryptoAddress,
        status: "pending"
      })
      .select()
      .single();

    if (insertError) {
      // Rollback not supported easily without RPC, but this is a rare case
      throw insertError;
    }

    return NextResponse.json({ success: true, payout });
  } catch (error: any) {
    console.error("Payout error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
