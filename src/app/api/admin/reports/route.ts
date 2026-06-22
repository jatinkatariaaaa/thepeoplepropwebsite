import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAdminUser, logAudit } from "@/lib/admin-auth";
import Papa from "papaparse";

export async function GET(request: Request) {
  try {
    const admin = await getAdminUser(request);
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "revenue"; // revenue, orders, users
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const format = searchParams.get("format") || "json";

    if (type === "revenue") {
      let query = supabaseAdmin.from("purchases").select("price_amount, created_at").eq("payment_status", "paid");
      if (from) query = query.gte("created_at", from);
      if (to) query = query.lte("created_at", to);

      const { data, error } = await query;
      if (error) throw error;

      // Group by date
      const grouped: Record<string, { revenue: number; orders: number }> = {};
      let totalRev = 0;
      data?.forEach(d => {
        const date = new Date(d.created_at).toISOString().split("T")[0];
        if (!grouped[date]) grouped[date] = { revenue: 0, orders: 0 };
        grouped[date].revenue += d.price_amount || 0;
        grouped[date].orders += 1;
        totalRev += d.price_amount || 0;
      });

      const formattedData = Object.keys(grouped).sort().map(date => ({
        date,
        revenue: grouped[date].revenue,
        orders: grouped[date].orders
      }));

      if (format === "csv") {
        await logAudit({ adminId: admin.user.id, adminEmail: admin.email, action: "export_report", entityType: "revenue", request });
        const csv = Papa.unparse(formattedData);
        return new NextResponse(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=revenue_report.csv" }});
      }

      return NextResponse.json({ data: formattedData, total_revenue: totalRev, total_orders: data?.length || 0 });
    }

    if (type === "orders") {
      let query = supabaseAdmin.from("purchases").select("payment_status, program_key, price_amount, created_at");
      if (from) query = query.gte("created_at", from);
      if (to) query = query.lte("created_at", to);

      const { data, error } = await query;
      if (error) throw error;

      const byStatus: Record<string, number> = {};
      const byProgram: Record<string, { count: number, revenue: number }> = {};

      data?.forEach(d => {
        byStatus[d.payment_status] = (byStatus[d.payment_status] || 0) + 1;
        if (!byProgram[d.program_key]) byProgram[d.program_key] = { count: 0, revenue: 0 };
        byProgram[d.program_key].count += 1;
        if (d.payment_status === "paid") {
          byProgram[d.program_key].revenue += d.price_amount || 0;
        }
      });

      const formattedStatus = Object.keys(byStatus).map(s => ({ status: s, count: byStatus[s] }));
      const formattedProgram = Object.keys(byProgram).map(p => ({ program: p, ...byProgram[p] }));

      if (format === "csv") {
        await logAudit({ adminId: admin.user.id, adminEmail: admin.email, action: "export_report", entityType: "orders", request });
        const csv = Papa.unparse(formattedProgram);
        return new NextResponse(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=orders_report.csv" }});
      }

      return NextResponse.json({ by_status: formattedStatus, by_program: formattedProgram });
    }

    if (type === "users") {
      let query = supabaseAdmin.from("profiles").select("created_at, kyc_status");
      if (from) query = query.gte("created_at", from);
      if (to) query = query.lte("created_at", to);

      const { data, error } = await query;
      if (error) throw error;

      const grouped: Record<string, number> = {};
      const kycStats = { verified: 0, pending: 0, rejected: 0, none: 0 };

      data?.forEach(d => {
        const date = new Date(d.created_at).toISOString().split("T")[0];
        grouped[date] = (grouped[date] || 0) + 1;
        
        const k = d.kyc_status || "none";
        // @ts-ignore
        kycStats[k] = (kycStats[k] || 0) + 1;
      });

      const formattedData = Object.keys(grouped).sort().map(date => ({ date, new_users: grouped[date] }));

      if (format === "csv") {
        await logAudit({ adminId: admin.user.id, adminEmail: admin.email, action: "export_report", entityType: "users", request });
        const csv = Papa.unparse(formattedData);
        return new NextResponse(csv, { headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=users_report.csv" }});
      }

      return NextResponse.json({ data: formattedData, total_users: data?.length || 0, kyc_stats: kycStats });
    }

    return NextResponse.json({ error: "Invalid report type" }, { status: 400 });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: error.message === "Unauthorized" ? 401 : 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
