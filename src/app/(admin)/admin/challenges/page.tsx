"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/Button";
import { Plus, Edit2, X, Trash2 } from "lucide-react";

const RISK_ONLY_PROGRAM_KEYS = new Set(["instant", "access"]);

const DEFAULT_RULE_FLAGS = {
  is_news_trading_allowed: true,
  is_weekend_holding_allowed: true,
  is_ea_allowed: true,
  is_hedging_allowed: true,
  is_copy_trading_allowed: true,
  is_martingale_allowed: false,
  is_grid_trading_allowed: false,
};

function isRiskOnlyProgramKey(key: string) {
  return RISK_ONLY_PROGRAM_KEYS.has(key.toLowerCase());
}

function parsePercent(value: string, fallback = 0) {
  const match = String(value || "").match(/-?\d+(\.\d+)?/);
  if (!match) return fallback;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseTargets(value: string) {
  const text = String(value || "");
  const repeatedTarget = text.match(/(-?\d+(\.\d+)?)\s*%?\s*(?:x|×|\*)\s*(\d+)/i);
  if (repeatedTarget) {
    const target = Number(repeatedTarget[1]);
    const phases = Number(repeatedTarget[3]);
    if (Number.isFinite(target) && Number.isInteger(phases) && phases > 0) {
      return Array.from({ length: phases }, () => target);
    }
  }

  return Array.from(text.matchAll(/-?\d+(\.\d+)?/g))
    .map((match) => Number(match[0]))
    .filter(Number.isFinite);
}

export default function ChallengesAdminPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
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
    phases: 1,
    profit_split: 80,
    is_active: true,
    phase_1_rule_id: "",
    phase_2_rule_id: "",
    phase_3_rule_id: "",
    funded_rule_id: ""
  });
  const [formFees, setFormFees] = useState<{account_size: number, fee: number}[]>([]);
  const [selectedFeeIndex, setSelectedFeeIndex] = useState<number | null>(null);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchPrograms();
    fetchRules();
  }, []);

  async function fetchRules() {
    const { data } = await supabase.from("trading_rules").select("*").order("created_at", { ascending: true });
    if (data) setRules(data);
  }

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
      key: "", label: "", short_label: "", profit_target: "", max_drawdown: "", daily_drawdown: "", phases: 1, profit_split: 80, is_active: true, phase_1_rule_id: "", phase_2_rule_id: "", phase_3_rule_id: "", funded_rule_id: ""
    });
    setFormFees([]);
    setSelectedFeeIndex(null);
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
      phases: Number(prog.phases) || 1,
      profit_split: prog.profit_split || 80,
      is_active: prog.is_active,
      phase_1_rule_id: prog.phase_1_rule_id || "",
      phase_2_rule_id: prog.phase_2_rule_id || "",
      phase_3_rule_id: prog.phase_3_rule_id || "",
      funded_rule_id: prog.funded_rule_id || ""
    });
    const fees = (prog.tpp_program_fees || []).map((f: any) => ({
      account_size: f.account_size,
      fee: f.fee
    }));
    setFormFees(fees);
    setSelectedFeeIndex(fees.length > 0 ? 0 : null);
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const isEditing = !!editingProgram;

    // Save Program
    const progKey = formData.key;
    const isRiskOnly = isRiskOnlyProgramKey(progKey);
    const normalizedFormData = {
      ...formData,
      phases: isRiskOnly ? 0 : Number(formData.phases),
      profit_target: isRiskOnly ? "None" : formData.profit_target,
      phase_2_rule_id: isRiskOnly ? "" : formData.phase_2_rule_id,
      phase_3_rule_id: isRiskOnly ? "" : formData.phase_3_rule_id,
      funded_rule_id: isRiskOnly
        ? formData.funded_rule_id || formData.phase_1_rule_id
        : formData.funded_rule_id,
    };
    const targetValues = parseTargets(normalizedFormData.profit_target);
    const dailyDrawdown = parsePercent(normalizedFormData.daily_drawdown, 5);
    const overallDrawdown = parsePercent(normalizedFormData.max_drawdown, 10);

    const ensureProgramRule = async (
      existingRuleId: string,
      phaseLabel: string,
      profitTargetPct: number
    ) => {
      const selectedRule = rules.find((rule) => rule.id === existingRuleId);
      const ownedName = `${normalizedFormData.short_label || normalizedFormData.key} ${phaseLabel}`.trim();
      const source = selectedRule || {};
      const rulePayload = {
        ...DEFAULT_RULE_FLAGS,
        ...source,
        id: undefined,
        created_at: undefined,
        updated_at: undefined,
        name: ownedName,
        description: `Auto-synced from ${normalizedFormData.label || normalizedFormData.key} challenge settings.`,
        profit_target_pct: profitTargetPct,
        max_daily_drawdown_pct: dailyDrawdown,
        max_overall_drawdown_pct: overallDrawdown,
        min_trading_days: Number(source.min_trading_days ?? 0),
        max_trading_days: Number(source.max_trading_days ?? 0),
      };

      const { data: existingByName, error: findError } = await supabase
        .from("trading_rules")
        .select("id")
        .eq("name", ownedName)
        .limit(1)
        .maybeSingle();

      if (findError) throw findError;

      const targetRuleId = selectedRule?.name === ownedName ? existingRuleId : existingByName?.id;
      if (targetRuleId) {
        const { error: updateRuleError } = await supabase
          .from("trading_rules")
          .update(rulePayload)
          .eq("id", targetRuleId);
        if (updateRuleError) throw updateRuleError;
        return targetRuleId as string;
      }

      const { data: insertedRule, error: insertRuleError } = await supabase
        .from("trading_rules")
        .insert([rulePayload])
        .select("id")
        .single();

      if (insertRuleError) throw insertRuleError;
      return insertedRule.id as string;
    };

    try {
      if (isRiskOnly) {
        const riskRuleId = await ensureProgramRule(
          normalizedFormData.funded_rule_id || normalizedFormData.phase_1_rule_id,
          "Risk Only",
          0
        );
        normalizedFormData.phase_1_rule_id = riskRuleId;
        normalizedFormData.funded_rule_id = riskRuleId;
      } else {
        normalizedFormData.phase_1_rule_id = await ensureProgramRule(
          normalizedFormData.phase_1_rule_id,
          "Phase 1",
          targetValues[0] ?? parsePercent(normalizedFormData.profit_target, 0)
        );

        if (normalizedFormData.phases >= 2) {
          normalizedFormData.phase_2_rule_id = await ensureProgramRule(
            normalizedFormData.phase_2_rule_id || normalizedFormData.phase_1_rule_id,
            "Phase 2",
            targetValues[1] ?? targetValues[0] ?? 0
          );
        } else {
          normalizedFormData.phase_2_rule_id = "";
        }

        if (normalizedFormData.phases >= 3) {
          normalizedFormData.phase_3_rule_id = await ensureProgramRule(
            normalizedFormData.phase_3_rule_id || normalizedFormData.phase_2_rule_id,
            "Phase 3",
            targetValues[2] ?? targetValues[0] ?? 0
          );
        } else {
          normalizedFormData.phase_3_rule_id = "";
        }

        normalizedFormData.funded_rule_id = await ensureProgramRule(
          normalizedFormData.funded_rule_id || normalizedFormData.phase_1_rule_id,
          "Funded",
          0
        );
      }
    } catch (ruleError: any) {
      alert("Rule sync failed: " + ruleError.message);
      return;
    }

    const payload = {
      ...normalizedFormData,
      phase_1_rule_id: normalizedFormData.phase_1_rule_id || null,
      phase_2_rule_id: normalizedFormData.phase_2_rule_id || null,
      phase_3_rule_id: normalizedFormData.phase_3_rule_id || null,
      funded_rule_id: normalizedFormData.funded_rule_id || null,
    };
    
    const { error } = isEditing 
      ? await supabase.from("tpp_programs").update(payload).eq("id", editingProgram.id)
      : await supabase.from("tpp_programs").insert([payload]);

    if (error) {
      alert("Error saving program: " + error.message);
      return;
    }

    // Save Fees
    // First, delete old fees for this program key
    await supabase.from("tpp_program_fees").delete().eq("program_key", progKey);
    
    // Then insert new fees
    if (formFees.length > 0) {
      const feesToInsert = formFees.map(f => ({
        program_key: progKey,
        account_size: f.account_size,
        fee: f.fee
      }));
      await supabase.from("tpp_program_fees").insert(feesToInsert);
    }

    setIsModalOpen(false);
    fetchPrograms();
    fetchRules();
  }

  if (loading && programs.length === 0) return <div className="p-10 animate-pulse bg-[var(--dash-canvas)] rounded-xl h-40" />;

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
                  <label className="mb-1 block text-xs font-medium text-ink-700">Key (e.g. 1-step)</label>
                  <input required disabled={!!editingProgram} type="text" value={formData.key} onChange={e => setFormData({...formData, key: e.target.value.toLowerCase()})} className="w-full rounded-[8px] border border-[var(--dash-hairline)] bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink-400 bg-gray-50" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink-700">Short Label</label>
                  <input required type="text" value={formData.short_label} onChange={e => setFormData({...formData, short_label: e.target.value})} className="w-full rounded-[8px] border border-[var(--dash-hairline)] bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink-400" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-ink-700">Full Label</label>
                <input required type="text" value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} className="w-full rounded-[8px] border border-[var(--dash-hairline)] bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink-400" placeholder="e.g. 1-Step Evaluation" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink-700">Profit Target</label>
                  <input type="text" value={formData.profit_target} onChange={e => setFormData({...formData, profit_target: e.target.value})} className="w-full rounded-[8px] border border-[var(--dash-hairline)] bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink-400" placeholder="10%" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink-700">Max Drawdown</label>
                  <input type="text" value={formData.max_drawdown} onChange={e => setFormData({...formData, max_drawdown: e.target.value})} className="w-full rounded-[8px] border border-[var(--dash-hairline)] bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink-400" placeholder="6%" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink-700">Daily Drawdown</label>
                  <input type="text" value={formData.daily_drawdown} onChange={e => setFormData({...formData, daily_drawdown: e.target.value})} className="w-full rounded-[8px] border border-[var(--dash-hairline)] bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink-400" placeholder="3%" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink-700">Profit Split %</label>
                  <input type="number" value={formData.profit_split} onChange={e => setFormData({...formData, profit_split: Number(e.target.value)})} className="w-full rounded-[8px] border border-[var(--dash-hairline)] bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink-400" />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink-700">Evaluation Phases</label>
                  <select value={formData.phases} onChange={e => setFormData({...formData, phases: Number(e.target.value)})} className="w-full rounded-[8px] border border-[var(--dash-hairline)] bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink-400 bg-white">
                    <option value={0}>Risk Only / Instant</option>
                    <option value={1}>1 Step</option>
                    <option value={2}>2 Step</option>
                    <option value={3}>3 Step</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 mt-6">
                  <input type="checkbox" checked={formData.is_active} onChange={e => setFormData({...formData, is_active: e.target.checked})} id="prog_active" />
                  <label htmlFor="prog_active" className="text-sm font-semibold text-green-700">Program is Active</label>
                </div>
              </div>

              {/* RULES EDITOR */}
              <div className="grid grid-cols-1 gap-4 pt-4 border-t">
                <h3 className="text-sm font-bold">Trading Rule Engines</h3>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Phase 1 Rules</label>
                  <select value={formData.phase_1_rule_id} onChange={e => setFormData({...formData, phase_1_rule_id: e.target.value})} className="w-full rounded-[8px] border border-[var(--dash-hairline)] bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink-400 bg-white text-sm">
                    <option value="">No Rules Selected</option>
                    {rules.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Phase 2 Rules</label>
                  <select value={formData.phase_2_rule_id} onChange={e => setFormData({...formData, phase_2_rule_id: e.target.value})} className="w-full rounded-[8px] border border-[var(--dash-hairline)] bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink-400 bg-white text-sm">
                    <option value="">No Rules Selected</option>
                    {rules.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Phase 3 Rules</label>
                  <select value={formData.phase_3_rule_id} onChange={e => setFormData({...formData, phase_3_rule_id: e.target.value})} className="w-full rounded-[8px] border border-[var(--dash-hairline)] bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink-400 bg-white text-sm">
                    <option value="">No Rules Selected</option>
                    {rules.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">Funded Rules</label>
                  <select value={formData.funded_rule_id} onChange={e => setFormData({...formData, funded_rule_id: e.target.value})} className="w-full rounded-[8px] border border-[var(--dash-hairline)] bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink-400 bg-white text-sm">
                    <option value="">No Rules Selected</option>
                    {rules.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
              </div>

              {/* FEES EDITOR */}
              <div className="mt-6 border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold">Account Sizes & Fees</h3>
                  <button type="button" onClick={() => {
                    const newFees = [...formFees, { account_size: 10000, fee: 99 }];
                    setFormFees(newFees);
                    setSelectedFeeIndex(newFees.length - 1);
                  }} className="text-xs flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold">
                    <Plus className="w-3 h-3" /> Add Size
                  </button>
                </div>
                
                {formFees.length > 0 ? (
                  <div className="space-y-4 bg-gray-50 p-4 rounded-lg border">
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-600 mb-1">Select Account Size to Edit</label>
                      <select 
                        value={selectedFeeIndex ?? ""}
                        onChange={(e) => setSelectedFeeIndex(Number(e.target.value))}
                        className="w-full rounded-[8px] border border-[var(--dash-hairline)] bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink-400 text-sm bg-white"
                      >
                        {formFees.map((f, i) => (
                          <option key={i} value={i}>
                            ${f.account_size.toLocaleString()} Account
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedFeeIndex !== null && formFees[selectedFeeIndex] && (
                      <div className="flex gap-4 items-end pt-2 border-t border-gray-200">
                        <div className="flex-1">
                          <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Size ($)</label>
                          <input type="number" required value={formFees[selectedFeeIndex].account_size} onChange={e => {
                            const newFees = [...formFees];
                            newFees[selectedFeeIndex].account_size = Number(e.target.value);
                            setFormFees(newFees);
                          }} className="w-full rounded-[8px] border border-[var(--dash-hairline)] bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink-400 text-sm" />
                        </div>
                        <div className="flex-1">
                          <label className="block text-[10px] font-semibold text-gray-500 mb-0.5">Fee ($)</label>
                          <input type="number" required value={formFees[selectedFeeIndex].fee} onChange={e => {
                            const newFees = [...formFees];
                            newFees[selectedFeeIndex].fee = Number(e.target.value);
                            setFormFees(newFees);
                          }} className="w-full rounded-[8px] border border-[var(--dash-hairline)] bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink-400 text-sm" />
                        </div>
                        <button type="button" onClick={() => {
                          const newFees = formFees.filter((_, idx) => idx !== selectedFeeIndex);
                          setFormFees(newFees);
                          setSelectedFeeIndex(newFees.length > 0 ? 0 : null);
                        }} className="mb-0.5 p-2 text-red-500 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No account sizes added.</p>
                )}
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
          <div key={prog.id} className="bg-white border border-[var(--dash-hairline)] rounded-[20px] p-6 shadow-sm relative overflow-hidden">
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

            <div className="grid grid-cols-2 gap-4 mt-6 p-4 bg-[var(--dash-canvas)] rounded-xl border border-[var(--dash-hairline)]">
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
                  <div key={f.id} className="bg-white border border-[var(--dash-hairline)] rounded-md px-2 py-1 text-xs font-medium text-[var(--ink-700)] shadow-sm">
                    ${f.account_size >= 1000 ? `${f.account_size/1000}K` : f.account_size}: <span className="text-green-600">${f.fee}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        {programs.length === 0 && !loading && (
          <div className="col-span-full py-12 text-center text-[var(--ink-500)] border-2 border-dashed border-[var(--dash-hairline)] rounded-2xl">
            <p>No programs found. Did you seed the database?</p>
          </div>
        )}
      </div>
    </div>
  );
}
