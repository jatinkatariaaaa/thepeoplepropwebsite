import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { calculateAccountMetrics, type MetricsTradeRow } from "@/lib/account-metrics";
import { supabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

function jsonNoStore(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "no-store, max-age=0");
  return NextResponse.json(body, { ...init, headers });
}

async function getAuthenticatedUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    (process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"),
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "public-anon-key-placeholder"),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, { ...options });
          });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return jsonNoStore({ error: "Authentication required" }, { status: 401 });
    }

    const { id: accountId } = await params;
    if (!accountId) {
      return jsonNoStore({ error: "Account id is required" }, { status: 400 });
    }

    const { data: crmAccount, error: accountError } = await supabaseAdmin
      .from("trading_accounts")
      .select(
        "id, user_id, terminal_account_id, starting_balance, balance, equity, status, highest_equity"
      )
      .eq("id", accountId)
      .maybeSingle();

    if (accountError) {
      console.error("Account metrics CRM lookup failed:", accountError);
      return jsonNoStore({ error: "Failed to fetch account" }, { status: 500 });
    }

    if (!crmAccount) {
      return jsonNoStore({ error: "Account not found" }, { status: 404 });
    }

    if (crmAccount.user_id !== user.id) {
      return jsonNoStore({ error: "Forbidden" }, { status: 403 });
    }

    if (!crmAccount.terminal_account_id) {
      return jsonNoStore({ error: "Account is not linked to terminal" }, { status: 404 });
    }

    const [terminalResult, tradesResult] = await Promise.all([
      supabaseAdmin
        .from("accounts")
        .select("balance, equity, highest_equity, status")
        .eq("id", crmAccount.terminal_account_id)
        .maybeSingle(),
      supabaseAdmin
        .from("trades")
        .select(
          "id, symbol, direction, volume, open_time, close_time, gross_pnl, commission, swap, net_pnl"
        )
        .eq("account_id", crmAccount.terminal_account_id)
        .order("close_time", { ascending: true }),
    ]);

    if (terminalResult.error) {
      console.error("Account metrics terminal lookup failed:", terminalResult.error);
      return jsonNoStore({ error: "Failed to fetch terminal account" }, { status: 500 });
    }

    if (!terminalResult.data) {
      return jsonNoStore({ error: "Linked terminal account not found" }, { status: 404 });
    }

    if (tradesResult.error) {
      console.error("Account metrics trades lookup failed:", tradesResult.error);
      return jsonNoStore({ error: "Failed to fetch trades" }, { status: 500 });
    }

    const metrics = calculateAccountMetrics({
      trades: (tradesResult.data ?? []) as MetricsTradeRow[],
      startingBalance: crmAccount.starting_balance,
      terminal: terminalResult.data,
    });

    return jsonNoStore({
      accountId: crmAccount.id,
      terminalAccountId: crmAccount.terminal_account_id,
      metrics,
    });
  } catch (error: unknown) {
    console.error("Account metrics error:", error instanceof Error ? error.message : error);
    return jsonNoStore({ error: "Internal server error" }, { status: 500 });
  }
}
