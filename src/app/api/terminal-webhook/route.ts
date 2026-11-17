import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { provisionNextPhase } from "@/lib/account-provisioning";

/**
 * The risk worker calls this when an account passes or breaches.
 *
 * The request body is treated as a nudge, never as fact: the account's real
 * status, balance and equity are read from the terminal's own `accounts` row
 * in the shared database. A forged call can therefore only make us re-check
 * the truth; it cannot pass, fund or breach anything.
 */

const isUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);

export async function POST(req: Request) {
  try {
    const secret = process.env.TERMINAL_WEBHOOK_SECRET || process.env.CRM_WEBHOOK_SECRET;
    if (secret) {
      const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
      if (token !== secret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const terminalId = String(body.terminal_account_id || body.login || "");
    if (!isUuid(terminalId)) return NextResponse.json({ error: "terminal_account_id is required" }, { status: 400 });

    const { data: terminal } = await supabaseAdmin.from("accounts").select("id, status, balance, equity, highest_equity, breach_reason").eq("id", terminalId).maybeSingle();
    if (!terminal) return NextResponse.json({ error: "Account not found" }, { status: 404 });

    const { data: account } = await supabaseAdmin.from("trading_accounts").select("*").eq("terminal_account_id", terminalId).maybeSingle();
    if (!account) return NextResponse.json({ error: "No CRM account is linked to this terminal account" }, { status: 404 });

    // The database trigger already mirrors these on every change; this covers a row linked late.
    const patch: Record<string, unknown> = {};
    if (Number(account.balance) !== Number(terminal.balance)) patch.balance = terminal.balance;
    if (Number(account.equity) !== Number(terminal.equity)) patch.equity = terminal.equity;
    if (account.status !== terminal.status) patch.status = terminal.status;
    if (terminal.status === "breached" && terminal.breach_reason && !account.breach_reason) patch.breach_reason = terminal.breach_reason;
    if (Object.keys(patch).length) await supabaseAdmin.from("trading_accounts").update(patch).eq("id", account.id);

    const promotion = terminal.status === "passed" ? await provisionNextPhase({ ...account, ...patch }) : null;

    return NextResponse.json({ success: true, status: terminal.status, promotion });
  } catch (error) {
    console.error("Terminal webhook error:", (error as Error).message);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
