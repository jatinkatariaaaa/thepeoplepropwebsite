"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/Button";
import { Plus, Edit2, X } from "lucide-react";

export default function ChallengesAdminPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<any>(null);
  const [formData, setFormData] = useState({
    key: "",
    label: "",
    short_label: "",
    profit_target: "",
    max_drawdown: "",
    daily_drawdown: "",
    profit_split: 80,
    is_active: true
  });

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

  function openNewModal() {
    setEditingProgram(null);
    setFormData({
      key: "", label: "", short_label: "", profit_target: "", max_drawdown: "", daily_drawdown: "", profit_split: 80, is_active: true
    });
    setIsModalOpen(true);
  }

  function openEditModal(prog: any) {
    setEditingProgram(prog);
    setFormData({
      key: prog.key,
      label: prog.label,
      short_label: prog.short_label,
      profit_target: prog.profit_target || "",
      max_drawdown: prog.max_drawdown || "",
      daily_drawdown: prog.daily_drawdown || "",
      profit_split: prog.profit_split || 80,
      is_active: prog.is_active
    });
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (editingProgram) {
      const { error } = await supabase.from("tpp_programs").update(formData).eq("id", editingProgram.id);
      if (!error) {
        setIsModalOpen(false);
        fetchPrograms();
      } else alert(error.message);
    } else {
      const { error } = await supabase.from("tpp_programs").insert([formData]);
      if (!error) {
        setIsModalOpen(false);
        fetchPrograms();
      } else alert(error.message);
    }
  }

  if (loading && programs.length === 0) return <div className="p-10 animate-pulse bg-[var(--paper)] rounded-xl h-40" />;

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative">
      
      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-bold">{editingProgram ? "Edit Program" : "Create Program"}</h2>
              <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <form onSubmit={handleSave} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Key (e.g. 1-step)</label>
                  <input required disabled={!!editingProgram} type="text" value={formData.key} onChange={e => setFormData({...formData, key: e.target.value.toLowerCase()})} className="w-full border rounded-lg p-2 bg-gray-50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Short Label</label>
                  <input required type="text" value={formData.short_label} onChange={e => setFormData({...formData, short_label: e.target.value})} className="w-full border rounded-lg p-2" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">Full Label</label>
                <input required type="text" value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} className="w-full border rounded-lg p-2" placeholder="e.g. 1-Step Evaluation" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Profit Target</label>
                  <input type="text" value={formData.profit_target} onChange={e => setFormData({...formData, profit_target: e.target.value})} className="w-full border rounded-lg p-2" placeholder="10%" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Max Drawdown</label>
                  <input type="text" value={formData.max_drawdown} onChange={e => setFormData({...formData, max_drawdown: e.target.value})} className="w-full border rounded-lg p-2" placeholder="6%" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">Daily Drawdown</label>
                  <input type="text" value={formData.daily_drawdown} onChange={e => setFormData({...formData, daily_drawdown: e.target.value})} className="w-full border rounded-lg p-2" placeholder="3%" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Profit Split %</label>
                  <input type="number" value={formData.profit_split} onChange={e => setFormData({...formData, profit_split: Number(e.target.value)})} className="w-full border rounded-lg p-2" />
                </div>
                <div className="flex items-center gap-2 mt-6">
                  <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} id="prog_active" />
                  <label htmlFor="prog_active" className="text-sm font-semibold text-green-700">Program is Active</label>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-2 border-t mt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" className="bg-[#bcff2e] text-black">Save Program</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ink-950)]">Challenge Programs</h1>
          <p className="text-[var(--ink-500)] text-sm">Manage your trading evaluations and funding programs</p>
        </div>
        <Button onClick={openNewModal} className="flex items-center gap-2 bg-[#bcff2e] text-[#0a0a0a] hover:bg-[#a5e622]">
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
                <button onClick={() => openEditModal(prog)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 rounded-lg">
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
