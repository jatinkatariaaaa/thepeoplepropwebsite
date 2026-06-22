import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAdminUser, logAudit } from "@/lib/admin-auth";
import { isValidStatus } from "@/lib/trading";

type RouteContext = { params: Promise<{ id: string }> };

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
          phase: "phase_1",
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
        if (body.phase) update.phase = body.phase;
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
