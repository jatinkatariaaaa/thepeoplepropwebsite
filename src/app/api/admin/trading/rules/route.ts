import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAdminUser, logAudit } from "@/lib/admin-auth";

// Whitelist of editable rule fields so the client can never write arbitrary columns.
const RULE_FIELDS = [
  "name",
  "description",
  "profit_target_pct",
  "max_daily_drawdown_pct",
  "max_overall_drawdown_pct",
  "min_trading_days",
  "max_trading_days",
  "is_news_trading_allowed",
  "is_weekend_holding_allowed",
  "is_ea_allowed",
  "is_hedging_allowed",
  "is_copy_trading_allowed",
  "is_martingale_allowed",
  "is_grid_trading_allowed",
] as const;

function pickRuleFields(body: Record<string, any>) {
  const out: Record<string, any> = {};
  for (const key of RULE_FIELDS) {
    if (body[key] !== undefined) out[key] = body[key];
  }
  return out;
}

// GET /api/admin/trading/rules
export async function GET(request: Request) {
  try {
    await getAdminUser(request);

    const { data, error } = await supabaseAdmin
      .from("trading_rules")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ rules: data || [] });
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

// POST /api/admin/trading/rules  (create or duplicate)
export async function POST(request: Request) {
  try {
    const admin = await getAdminUser(request);
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json({ error: "Template name is required" }, { status: 400 });
    }

    const payload = pickRuleFields(body);

    const { data: rule, error } = await supabaseAdmin
      .from("trading_rules")
      .insert(payload)
      .select("*")
      .single();

    if (error) throw error;

    await logAudit({
      adminId: admin.user.id,
      adminEmail: admin.email,
      action: "create_trading_rule",
      entityType: "trading_rules",
      entityId: rule.id,
      newValue: rule,
      request,
    });

    return NextResponse.json({ success: true, rule });
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

// PATCH /api/admin/trading/rules  (update existing, id in body)
export async function PATCH(request: Request) {
  try {
    const admin = await getAdminUser(request);
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Rule id is required" }, { status: 400 });
    }

    const { data: oldRule } = await supabaseAdmin
      .from("trading_rules")
      .select("*")
      .eq("id", id)
      .single();

    if (!oldRule) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    const payload = pickRuleFields(body);

    const { data: rule, error } = await supabaseAdmin
      .from("trading_rules")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;

    await logAudit({
      adminId: admin.user.id,
      adminEmail: admin.email,
      action: "update_trading_rule",
      entityType: "trading_rules",
      entityId: id,
      oldValue: oldRule,
      newValue: rule,
      request,
    });

    return NextResponse.json({ success: true, rule });
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

// DELETE /api/admin/trading/rules?id=...
export async function DELETE(request: Request) {
  try {
    const admin = await getAdminUser(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Rule id is required" }, { status: 400 });
    }

    const { data: oldRule } = await supabaseAdmin
      .from("trading_rules")
      .select("*")
      .eq("id", id)
      .single();

    if (!oldRule) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    const { error } = await supabaseAdmin
      .from("trading_rules")
      .delete()
      .eq("id", id);

    if (error) throw error;

    await logAudit({
      adminId: admin.user.id,
      adminEmail: admin.email,
      action: "delete_trading_rule",
      entityType: "trading_rules",
      entityId: id,
      oldValue: oldRule,
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
