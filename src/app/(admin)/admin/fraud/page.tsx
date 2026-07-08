import { supabaseAdmin } from "@/lib/supabase";
import { FraudClient } from "./FraudClient";

export const revalidate = 0;

export default async function AdminFraudPage() {
  const [{ data: fraudFlags }, { data: profiles }] = await Promise.all([
    supabaseAdmin
      .from("fraud_flags")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200),
    supabaseAdmin.from("profiles").select("id, email, display_name"),
  ]);

  const profilesMap = (profiles || []).reduce((acc: any, p: any) => {
    acc[p.id] = p;
    return acc;
  }, {});

  const enrichedFlags = (fraudFlags || []).map((f: any) => ({
    ...f,
    profiles: profilesMap[f.user_id] || null,
  }));

  const severityCounts = {
    critical: enrichedFlags.filter((f: any) => f.severity === "critical").length,
    high: enrichedFlags.filter((f: any) => f.severity === "high").length,
    medium: enrichedFlags.filter((f: any) => f.severity === "medium").length,
    low: enrichedFlags.filter((f: any) => f.severity === "low").length,
  };

  const typeCounts = enrichedFlags.reduce((acc: any, f: any) => {
    acc[f.flag_type] = (acc[f.flag_type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
      <div className="mb-8">
        <h1 className="mb-1 text-xl font-semibold tracking-tight text-ink sm:text-2xl">Fraud Detection</h1>
        <p className="text-[var(--ink-500)]">Monitor and manage fraud alerts, risk flags, and suspicious activity.</p>
      </div>

      <FraudClient
        initialFlags={enrichedFlags}
        severityCounts={severityCounts}
        typeCounts={typeCounts}
      />
    </div>
  );
}
