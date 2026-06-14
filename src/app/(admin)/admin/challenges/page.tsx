"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/Button";
import { Plus, Edit2, Trash2 } from "lucide-react";

export default function ChallengesAdminPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchPrograms();
  }, []);

  async function fetchPrograms() {
    setLoading(true);
    const { data, error } = await supabase
      .from("tpp_programs")
      .select("*, tpp_program_fees(*)")
      .order("created_at", { ascending: true });
    
    if (!error && data) {
      setPrograms(data);
    }
    setLoading(false);
  }

  if (loading) return <div className="p-10 animate-pulse bg-[var(--paper)] rounded-xl h-40" />;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ink-950)]">Challenge Programs</h1>
          <p className="text-[var(--ink-500)] text-sm">Manage your trading evaluations and funding programs</p>
        </div>
        <Button className="flex items-center gap-2 bg-[#bcff2e] text-[#0a0a0a] hover:bg-[#a5e622]">
          <Plus className="w-4 h-4" /> Add Program
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {programs.map((prog) => (
          <div key={prog.id} className="bg-white border border-[var(--border)] rounded-[20px] p-6 shadow-sm relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="inline-flex items-center rounded-full bg-[var(--accent-50)] text-[var(--accent-700)] px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider mb-2">
                  {prog.key}
                </span>
                <h3 className="text-xl font-bold text-[var(--ink-950)]">{prog.label}</h3>
                <p className="text-sm text-[var(--ink-500)] mt-1">{prog.tagline}</p>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 rounded-lg">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6 p-4 bg-[var(--paper)] rounded-xl border border-[var(--border)]">
              <div>
                <p className="text-xs text-[var(--ink-400)] font-medium uppercase tracking-wider">Profit Target</p>
                <p className="text-sm font-semibold text-[var(--ink-950)]">{prog.profit_target || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--ink-400)] font-medium uppercase tracking-wider">Max Drawdown</p>
                <p className="text-sm font-semibold text-[var(--ink-950)]">{prog.max_drawdown || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--ink-400)] font-medium uppercase tracking-wider">Daily Drawdown</p>
                <p className="text-sm font-semibold text-[var(--ink-950)]">{prog.daily_drawdown || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--ink-400)] font-medium uppercase tracking-wider">Payout Split</p>
                <p className="text-sm font-semibold text-[var(--ink-950)]">{prog.profit_split}%</p>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-xs font-semibold text-[var(--ink-950)] mb-2 uppercase tracking-wide">Account Sizes & Fees</h4>
              <div className="flex flex-wrap gap-2">
                {prog.tpp_program_fees?.sort((a: any, b: any) => a.account_size - b.account_size).map((f: any) => (
                  <div key={f.id} className="bg-white border border-[var(--border)] rounded-md px-2 py-1 text-xs font-medium text-[var(--ink-700)] shadow-sm">
                    ${f.account_size >= 1000 ? `${f.account_size/1000}K` : f.account_size}: <span className="text-green-600">${f.fee}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        {programs.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-[var(--ink-500)] border-2 border-dashed border-[var(--border)] rounded-2xl">
            <p>No programs found. Did you seed the database?</p>
          </div>
        )}
      </div>
    </div>
  );
}
