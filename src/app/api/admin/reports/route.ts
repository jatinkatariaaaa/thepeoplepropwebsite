import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAdminUser, logAudit } from "@/lib/admin-auth";
import Papa from "papaparse";

function getPeriodKey(date: Date, period: string): string {
  const d = new Date(date);
  switch (period) {
    case "weekly":
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      return weekStart.toISOString().split("T")[0];
    case "monthly":
      return d.toISOString().slice(0, 7);
    case "yearly":
      return d.toISOString().slice(0, 4);
    default:
      return d.toISOString().split("T")[0];
  }
}

function formatPeriodLabel(key: string, period: string): string {
  if (period === "monthly") return key;
  if (period === "yearly") return key;
  if (period === "weekly") {
    const d = new Date(key);
    return `Week of ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
  }
  return key;
}

export async function GET(request: Request) {
  try {
    const admin = await getAdminUser(request);

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "revenue";
    const period = searchParams.get("period") || "daily";
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const format = searchParams.get("format") || "json";

    if (type === "revenue") {
      let query = supabaseAdmin.from("purchases").select("price_amount, created_at").eq("payment_status", "paid");
      if (from) query = query.gte("created_at", from);
      if (to) query = query.lte("created_at", to);

      const { data, error } = await query;
      if (error) throw error;

      const grouped: Record<string, { revenue: number; orders: number }> = {};
      let totalRev = 0;
      data?.forEach(d => {
        const key = getPeriodKey(new Date(d.created_at), period);
        if (!grouped[key]) grouped[key] = { revenue: 0, orders: 0 };
        grouped[key].revenue += d.price_amount || 0;
        grouped[key].orders += 1;
        totalRev += d.price_amount || 0;
      });

      const chartData = Object.keys(grouped).sort().map(key => ({
        date: formatPeriodLabel(key, period),
        revenue: grouped[key].revenue,
        orders: grouped[key].orders,
      }));

      const tableData = chartData;
      const avgOrder = data?.length ? totalRev / data.length : 0;

      if (format === "csv") {
        await logAudit({ adminId: admin.user.id, adminEmail: admin.email, action: "export_report", entityType: "revenue", request });
        const csv = Papa.unparse(tableData);
        return new NextResponse(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=revenue_report.csv" }});
      }
      if (format === "excel") {
        await logAudit({ adminId: admin.user.id, adminEmail: admin.email, action: "export_report", entityType: "revenue", request });
        const csv = Papa.unparse(tableData);
        return new NextResponse(csv, { headers: { "Content-Type": "application/vnd.ms-excel", "Content-Disposition": "attachment; filename=revenue_report.xls" }});
      }
      if (format === "pdf") {
        await logAudit({ adminId: admin.user.id, adminEmail: admin.email, action: "export_report", entityType: "revenue", request });
        return NextResponse.json({ message: "PDF export requires server-side PDF generation. Use CSV/Excel for now." });
      }

      return NextResponse.json({
        summary: { total_revenue: totalRev, total_orders: data?.length || 0, avg_order_value: avgOrder },
        chart_data: chartData,
        table_data: tableData,
      });
    }

    if (type === "users") {
      let query = supabaseAdmin.from("profiles").select("created_at, id, last_login");
      if (from) query = query.gte("created_at", from);
      if (to) query = query.lte("created_at", to);

      const { data, error } = await query;
      if (error) throw error;

      // Count active users (logged in within last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const activeUsers = data?.filter(d => d.last_login && new Date(d.last_login) >= thirtyDaysAgo).length || 0;

      // Count challenge purchases
      let purchaseQuery = supabaseAdmin.from("purchases").select("id, created_at").eq("payment_status", "paid");
      if (from) purchaseQuery = purchaseQuery.gte("created_at", from);
      if (to) purchaseQuery = purchaseQuery.lte("created_at", to);
      const { data: purchases } = await purchaseQuery;

      const grouped: Record<string, { new_users: number; active_users: number; purchases: number }> = {};
      data?.forEach(d => {
        const key = getPeriodKey(new Date(d.created_at), period);
        if (!grouped[key]) grouped[key] = { new_users: 0, active_users: 0, purchases: 0 };
        grouped[key].new_users += 1;
      });

      // Distribute purchases across periods
      purchases?.forEach(p => {
        const key = getPeriodKey(new Date(p.created_at), period);
        if (grouped[key]) grouped[key].purchases += 1;
        else grouped[key] = { new_users: 0, active_users: 0, purchases: 1 };
      });

      const chartData = Object.keys(grouped).sort().map(key => ({
        date: formatPeriodLabel(key, period),
        new_users: grouped[key].new_users,
        active_users: grouped[key].active_users,
        purchases: grouped[key].purchases,
      }));

      if (format === "csv") {
        await logAudit({ adminId: admin.user.id, adminEmail: admin.email, action: "export_report", entityType: "users", request });
        const csv = Papa.unparse(chartData);
        return new NextResponse(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=users_report.csv" }});
      }
      if (format === "excel") {
        await logAudit({ adminId: admin.user.id, adminEmail: admin.email, action: "export_report", entityType: "users", request });
        const csv = Papa.unparse(chartData);
        return new NextResponse(csv, { headers: { "Content-Type": "application/vnd.ms-excel", "Content-Disposition": "attachment; filename=users_report.xls" }});
      }
      if (format === "pdf") {
        await logAudit({ adminId: admin.user.id, adminEmail: admin.email, action: "export_report", entityType: "users", request });
        return NextResponse.json({ message: "PDF export requires server-side PDF generation. Use CSV/Excel for now." });
      }

      return NextResponse.json({
        summary: { total_users: data?.length || 0, active_users: activeUsers, challenge_purchases: purchases?.length || 0 },
        chart_data: chartData,
        table_data: chartData,
      });
    }

    if (type === "trading") {
      // Get trading accounts with their status
      let accountQuery = supabaseAdmin.from("trading_accounts").select("status, created_at, phase");
      if (from) accountQuery = accountQuery.gte("created_at", from);
      if (to) accountQuery = accountQuery.lte("created_at", to);

      const { data: accounts, error } = await accountQuery;
      if (error) throw error;

      const grouped: Record<string, { pass_count: number; fail_count: number; active_count: number }> = {};

      accounts?.forEach(acc => {
        const key = getPeriodKey(new Date(acc.created_at), period);
        if (!grouped[key]) grouped[key] = { pass_count: 0, fail_count: 0, active_count: 0 };

        if (acc.status === "funded") grouped[key].pass_count += 1;
        else if (acc.status === "breached" || acc.status === "failed") grouped[key].fail_count += 1;
        else if (acc.status === "active" || acc.status === "evaluation") grouped[key].active_count += 1;
      });

      const chartData = Object.keys(grouped).sort().map(key => ({
        date: formatPeriodLabel(key, period),
        pass_count: grouped[key].pass_count,
        fail_count: grouped[key].fail_count,
        active_count: grouped[key].active_count,
      }));

      const totalPass = accounts?.filter(a => a.status === "funded").length || 0;
      const totalFail = accounts?.filter(a => a.status === "breached" || a.status === "failed").length || 0;
      const totalActive = accounts?.filter(a => a.status === "active" || a.status === "evaluation").length || 0;
      const totalResolved = totalPass + totalFail;
      const passRate = totalResolved ? (totalPass / totalResolved) * 100 : 0;
      const failRate = totalResolved ? (totalFail / totalResolved) * 100 : 0;

      if (format === "csv") {
        await logAudit({ adminId: admin.user.id, adminEmail: admin.email, action: "export_report", entityType: "trading", request });
        const csv = Papa.unparse(chartData);
        return new NextResponse(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=trading_report.csv" }});
      }
      if (format === "excel") {
        await logAudit({ adminId: admin.user.id, adminEmail: admin.email, action: "export_report", entityType: "trading", request });
        const csv = Papa.unparse(chartData);
        return new NextResponse(csv, { headers: { "Content-Type": "application/vnd.ms-excel", "Content-Disposition": "attachment; filename=trading_report.xls" }});
      }
      if (format === "pdf") {
        await logAudit({ adminId: admin.user.id, adminEmail: admin.email, action: "export_report", entityType: "trading", request });
        return NextResponse.json({ message: "PDF export requires server-side PDF generation. Use CSV/Excel for now." });
      }

      return NextResponse.json({
        summary: { pass_rate: passRate, fail_rate: failRate, active_accounts: totalActive },
        chart_data: chartData,
        table_data: chartData,
      });
    }

    return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
