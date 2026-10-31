import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAdminUser, logAudit } from "@/lib/admin-auth";
import { isValidStatus } from "@/lib/trading";
import { calculateAccountMetrics, type MetricsTradeRow } from "@/lib/account-metrics";

type RouteContext = { params: Promise<{ id: string }> };

const PHASE_INDEX: Record<string, number> = {
  challenge: 1,
  verification: 2,
  phase_3: 3,
  funded: 99,
};

function normalizePhase(value: unknown) {
  return typeof value === "string" && value in PHASE_INDEX ? value : null;
}

function phaseSort(value: unknown) {
  return typeof value === "string" && value in PHASE_INDEX ? PHASE_INDEX[value] : 0;
}

function withNoStore(body: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Cache-Control", "no-store, max-age=0");
  return NextResponse.json(body, { ...init, headers });
}

// GET /api/admin/trading/accounts/:id
// Returns the CRM account, live terminal snapshot, calculated trade metrics,
// phase progression timeline, and terminal risk events for the admin detail view.
export async function GET(request: Request, context: RouteContext) {
  try {
    await getAdminUser(request);
    const { id } = await context.params;

    if (!id) {
      return withNoStore({ error: "Account id is required" }, { status: 400 });
    }

    const { data: account, error: accountError } = await supabaseAdmin
      .from("trading_accounts")
      .select(`
        *,
        profiles (id, email, display_name),
        tpp_platforms (id, name, server_name, api_url, is_active),
        trading_rules (*)
      `)
      .eq("id", id)
      .single();

    if (accountError || !account) {
      return withNoStore({ error: "Account not found" }, { status: 404 });
    }

    const phaseGroupId = account.phase_group_id || account.id;
    const historyQuery = supabaseAdmin
      .from("trading_accounts")
      .select(`
        id,
        account_number,
        login,
        terminal_account_id,
        program_key,
        phase,
        phase_index,
        status,
        starting_balance,
        balance,
        equity,
        highest_equity,
        previous_account_id,
        phase_group_id,
        passed_at,
        created_at,
        updated_at,
        trading_rules (id, name, profit_target_pct, max_daily_drawdown_pct, max_overall_drawdown_pct),
        tpp_platforms (id, name, server_name)
      `)
      .or(`phase_group_id.eq.${phaseGroupId},id.eq.${account.id},previous_account_id.eq.${account.id}`)
      .order("created_at", { ascending: true });

    const [terminalResult, tradesResult, historyResult] = await Promise.all([
      account.terminal_account_id
        ? supabaseAdmin
            .from("accounts")
            .select("id, label, phase, status, starting_balance, balance, equity, highest_equity, daily_start_balance, max_daily_drawdown, max_overall_drawdown, profit_target, breach_reason, created_at, updated_at")
            .eq("id", account.terminal_account_id)
            .maybeSingle()
        : Promise.resolve({ data: null, error: null }),
      account.terminal_account_id
        ? supabaseAdmin
            .from("trades")
            .select("id, symbol, direction, volume, open_time, close_time, gross_pnl, commission, swap, net_pnl")
            .eq("account_id", account.terminal_account_id)
            .order("close_time", { ascending: true })
        : Promise.resolve({ data: [], error: null }),
      historyQuery,
    ]);

    if (terminalResult.error) throw terminalResult.error;
    if (tradesResult.error) throw tradesResult.error;
    if (historyResult.error) throw historyResult.error;

    const terminal = terminalResult.data;
    const metrics = calculateAccountMetrics({
      trades: (tradesResult.data ?? []) as MetricsTradeRow[],
      startingBalance: account.starting_balance,
      terminal: terminal ?? {
        balance: account.balance,
        equity: account.equity,
        highest_equity: account.highest_equity,
        status: account.status,
      },
    });

    const terminalIds = (historyResult.data ?? [])
      .map((row: any) => row.terminal_account_id)
      .filter(Boolean);
    const { data: events, error: eventsError } = terminalIds.length
      ? await supabaseAdmin
          .from("account_events")
          .select("id, account_id, type, equity_at_event, detail, created_at")
          .in("account_id", terminalIds)
          .order("created_at", { ascending: false })
      : { data: [], error: null };

    if (eventsError) throw eventsError;

    const phaseHistory = (historyResult.data ?? [])
      .sort((a: any, b: any) => {
        const ai = Number(a.phase_index ?? phaseSort(a.phase));
        const bi = Number(b.phase_index ?? phaseSort(b.phase));
        if (ai !== bi) return ai - bi;
        return String(a.created_at).localeCompare(String(b.created_at));
      });

    return withNoStore({
      account: {
        ...account,
        balance: terminal?.balance ?? account.balance,
        equity: terminal?.equity ?? account.equity,
        highest_equity: terminal?.highest_equity ?? account.highest_equity,
        terminal_status: terminal?.status ?? null,
      },
      terminal,
      metrics,
      phaseHistory,
      events: events ?? [],
    });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return withNoStore(
        { error: error.message },
        { status: error.message === "Unauthorized" ? 401 : 403 }
      );
    }
    return withNoStore({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/admin/trading/accounts/:id
// Body: { action: string, ...payload }
// Handles: reset_challenge | assign_challenge | enable | disable |
//          change_leverage | change_status
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const admin = await getAdminUser(request);
    const { id } = await context.params;
    const body = await request.json();
    const action: string = body.action;

    if (!id || !action) {
      return NextResponse.json(
        { error: "Account id and action are required" },
        { status: 400 }
      );
    }

    const { data: account, error: fetchError } = await supabaseAdmin
      .from("trading_accounts")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    let update: Record<string, any> = {};
    let auditAction = action;

    switch (action) {
      case "reset_challenge": {
        // Reset balances and risk counters back to the starting balance.
        const startBal = Number(account.starting_balance) || 0;
        update = {
          balance: startBal,
          equity: startBal,
          highest_equity: startBal,
          current_daily_drawdown: 0,
          current_max_drawdown: 0,
          status: "active",
          phase: "challenge",
          phase_index: PHASE_INDEX.challenge,
          passed_at: null,
        };
        break;
      }

      case "assign_challenge": {
        if (!body.rule_id) {
          return NextResponse.json(
            { error: "rule_id is required to assign a challenge" },
            { status: 400 }
          );
        }
        update = { rule_id: body.rule_id };
        if (body.phase) {
          const phase = normalizePhase(body.phase);
          if (!phase) {
            return NextResponse.json({ error: "Invalid phase value" }, { status: 400 });
          }
          update.phase = phase;
          update.phase_index = PHASE_INDEX[phase];
        }
        break;
      }

      case "enable": {
        update = { status: "active", disabled_at: null };
        break;
      }

      case "disable": {
        update = { status: "disabled", disabled_at: new Date().toISOString() };
        break;
      }

      case "change_leverage": {
        const lev = Number(body.leverage);
        if (!Number.isFinite(lev) || lev <= 0) {
          return NextResponse.json(
            { error: "A valid leverage value is required" },
            { status: 400 }
          );
        }
        update = { leverage: lev };
        break;
      }

      case "change_status": {
        if (!isValidStatus(body.status)) {
          return NextResponse.json(
            { error: "Invalid status value" },
            { status: 400 }
          );
        }
        update = { status: body.status };
        if (body.status !== "disabled") update.disabled_at = null;
        break;
      }

      default:
        return NextResponse.json(
          { error: `Unsupported action: ${action}` },
          { status: 400 }
        );
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("trading_accounts")
      .update(update)
      .eq("id", id)
      .select(
        `*, profiles (id, email, display_name), tpp_platforms (name), trading_rules (name)`
      )
      .single();

    if (updateError) throw updateError;

    await logAudit({
      adminId: admin.user.id,
      adminEmail: admin.email,
      action: auditAction,
      entityType: "trading_accounts",
      entityId: id,
      oldValue: account,
      newValue: updated,
      request,
    });

    return NextResponse.json({ success: true, account: updated });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === "Unauthorized" ? 401 : 403 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/admin/trading/accounts/:id
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const admin = await getAdminUser(request);
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ error: "Account id is required" }, { status: 400 });
    }

    const { data: account } = await supabaseAdmin
      .from("trading_accounts")
      .select("*")
      .eq("id", id)
      .single();

    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const { error } = await supabaseAdmin
      .from("trading_accounts")
      .delete()
      .eq("id", id);

    if (error) throw error;

    await logAudit({
      adminId: admin.user.id,
      adminEmail: admin.email,
      action: "delete_trading_account",
      entityType: "trading_accounts",
      entityId: id,
      oldValue: account,
      request,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json(
        { error: error.message },
        { status: error.message === "Unauthorized" ? 401 : 403 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
