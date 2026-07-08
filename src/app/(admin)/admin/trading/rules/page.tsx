"use client";

import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Plus, Edit2, Scale, X, Copy } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function RuleTemplatesPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    profit_target_pct: 0,
    max_daily_drawdown_pct: 0,
    max_overall_drawdown_pct: 0,
    min_trading_days: 0,
    max_trading_days: 0,
    is_news_trading_allowed: true,
    is_weekend_holding_allowed: true,
    is_ea_allowed: true,
    is_hedging_allowed: true,
    is_copy_trading_allowed: true,
    is_martingale_allowed: false,
    is_grid_trading_allowed: false,
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchRules();
  }, []);

  async function fetchRules() {
    setLoading(true);
    const { data, error } = await supabase
      .from("trading_rules")
      .select("*")
      .order("created_at", { ascending: true });
    
    if (!error && data) {
      setRules(data);
    }
    setLoading(false);
  }

  function openNewModal() {
    setEditingRule(null);
    setFormData({
      name: "",
      description: "",
      profit_target_pct: 10,
      max_daily_drawdown_pct: 5,
      max_overall_drawdown_pct: 10,
      min_trading_days: 5,
      max_trading_days: 0,
      is_news_trading_allowed: true,
      is_weekend_holding_allowed: true,
      is_ea_allowed: true,
      is_hedging_allowed: true,
      is_copy_trading_allowed: true,
      is_martingale_allowed: false,
      is_grid_trading_allowed: false,
    });
    setIsModalOpen(true);
  }

  function openEditModal(rule: any) {
    setEditingRule(rule);
    setFormData({ ...rule });
    setIsModalOpen(true);
  }

  function handleDuplicate(rule: any) {
    setEditingRule(null);
    setFormData({
      ...rule,
      id: undefined,
      name: `${rule.name} (Copy)`
    });
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (editingRule) {
      const { error } = await supabase
        .from("trading_rules")
        .update(formData)
        .eq("id", editingRule.id);
      if (!error) {
        setIsModalOpen(false);
        fetchRules();
      } else {
        alert("Error updating rule: " + error.message);
      }
    } else {
      const { error } = await supabase
        .from("trading_rules")
        .insert([formData]);
      if (!error) {
        setIsModalOpen(false);
        fetchRules();
      } else {
        alert("Error creating rule: " + error.message);
      }
    }
  }

  if (loading && rules.length === 0) return <div className="p-10 animate-pulse bg-[var(--dash-canvas)] rounded-none h-40" />;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">Rule Templates</h1>
          <p className="text-[var(--ink-500)] text-[14px]">Manage rules and risk limits for trading challenges.</p>
        </div>
        <Button onClick={openNewModal} className="shrink-0 gap-2">
          <Plus className="w-4 h-4" /> Create Template
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {rules.map(rule => (
          <div key={rule.id} className="dash-card dash-card-hover p-4 flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-none bg-violet-50 flex items-center justify-center border border-violet-100">
                  <Scale className="w-5 h-5 text-violet-600" />
                </div>
                <div>
                  <h3 className="font-bold text-[16px] text-[var(--ink-950)] leading-none">{rule.name}</h3>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => handleDuplicate(rule)}
                  className="w-8 h-8 flex items-center justify-center rounded-none hover:bg-[var(--dash-canvas)] text-[var(--ink-400)] hover:text-[var(--ink-950)] transition-colors"
                  title="Duplicate"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => openEditModal(rule)}
                  className="w-8 h-8 flex items-center justify-center rounded-none hover:bg-[var(--dash-canvas)] text-[var(--ink-400)] hover:text-[var(--ink-950)] transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-[13px] text-[var(--ink-500)] line-clamp-2 mb-4 h-10">{rule.description}</p>

            <div className="grid grid-cols-2 gap-3 mb-4 mt-auto">
              <div className="bg-[var(--dash-canvas)] p-2.5 rounded-none border border-[var(--dash-hairline)]">
                <p className="text-[11px] text-[var(--ink-500)] font-semibold uppercase tracking-wider mb-0.5">Target</p>
                <p className="font-bold text-[15px]">{rule.profit_target_pct > 0 ? `${rule.profit_target_pct}%` : 'None'}</p>
              </div>
              <div className="bg-[var(--dash-canvas)] p-2.5 rounded-none border border-[var(--dash-hairline)]">
                <p className="text-[11px] text-[var(--ink-500)] font-semibold uppercase tracking-wider mb-0.5">Max DD</p>
                <p className="font-bold text-[15px] text-[var(--dash-negative)]">{rule.max_overall_drawdown_pct}%</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 mt-auto pt-4 border-t border-[var(--dash-hairline)]">
              {rule.is_news_trading_allowed && <span className="px-2 py-1 bg-[#e0e0e0] text-[#393939] text-[10px] font-bold uppercase rounded-none">News OK</span>}
              {rule.is_weekend_holding_allowed && <span className="px-2 py-1 bg-purple-50 text-purple-700 text-[10px] font-bold uppercase rounded-none">Weekend OK</span>}
              {rule.is_ea_allowed && <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase rounded-none">EA OK</span>}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-none border border-[var(--dash-hairline)] bg-white shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-[var(--dash-hairline)]">
              <h2 className="font-bold text-[18px] text-[var(--ink-950)] flex items-center gap-2">
                <Scale className="w-5 h-5" />
                {editingRule ? "Edit Rule Template" : "Create Rule Template"}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-none hover:bg-[var(--dash-canvas)] text-[var(--ink-400)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto">
              <form id="rule-form" onSubmit={handleSave} className="space-y-6">
                
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Template Name</label>
                    <input 
                      type="text" 
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-[var(--dash-canvas)] border border-[var(--dash-hairline)] rounded-none h-11 px-4 text-[14px] focus:outline-none focus:border-[var(--ink-400)]"
                      placeholder="e.g. Phase 1 Evaluation"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Description</label>
                    <textarea 
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-[var(--dash-canvas)] border border-[var(--dash-hairline)] rounded-none p-3 text-[14px] focus:outline-none focus:border-[var(--ink-400)] h-20 resize-none"
                      placeholder="Brief description of these rules..."
                    />
                  </div>
                </div>

                {/* Core Parameters */}
                <div className="pt-4 border-t border-[var(--dash-hairline)]">
                  <h3 className="text-[13px] font-bold text-[var(--ink-950)] mb-4 uppercase tracking-wider">Core Parameters</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Profit Target (%)</label>
                      <input 
                        type="number" min="0" step="0.01" required
                        value={formData.profit_target_pct}
                        onChange={e => setFormData({...formData, profit_target_pct: parseFloat(e.target.value) || 0})}
                        className="w-full bg-[var(--dash-canvas)] border border-[var(--dash-hairline)] rounded-none h-11 px-4 text-[14px] focus:outline-none focus:border-[var(--ink-400)]"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Max Daily DD (%)</label>
                      <input 
                        type="number" min="0" step="0.01" required
                        value={formData.max_daily_drawdown_pct}
                        onChange={e => setFormData({...formData, max_daily_drawdown_pct: parseFloat(e.target.value) || 0})}
                        className="w-full bg-[var(--dash-canvas)] border border-[var(--dash-hairline)] rounded-none h-11 px-4 text-[14px] focus:outline-none focus:border-[var(--ink-400)]"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Max Overall DD (%)</label>
                      <input 
                        type="number" min="0" step="0.01" required
                        value={formData.max_overall_drawdown_pct}
                        onChange={e => setFormData({...formData, max_overall_drawdown_pct: parseFloat(e.target.value) || 0})}
                        className="w-full bg-[var(--dash-canvas)] border border-[var(--dash-hairline)] rounded-none h-11 px-4 text-[14px] focus:outline-none focus:border-[var(--ink-400)]"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Min Trading Days</label>
                      <input 
                        type="number" min="0" step="1" required
                        value={formData.min_trading_days}
                        onChange={e => setFormData({...formData, min_trading_days: parseInt(e.target.value) || 0})}
                        className="w-full bg-[var(--dash-canvas)] border border-[var(--dash-hairline)] rounded-none h-11 px-4 text-[14px] focus:outline-none focus:border-[var(--ink-400)]"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Max Trading Days (0 = ∞)</label>
                      <input 
                        type="number" min="0" step="1" required
                        value={formData.max_trading_days}
                        onChange={e => setFormData({...formData, max_trading_days: parseInt(e.target.value) || 0})}
                        className="w-full bg-[var(--dash-canvas)] border border-[var(--dash-hairline)] rounded-none h-11 px-4 text-[14px] focus:outline-none focus:border-[var(--ink-400)]"
                      />
                    </div>
                  </div>
                </div>

                {/* Risk Parameters */}
                <div className="pt-4 border-t border-[var(--dash-hairline)]">
                  <h3 className="text-[13px] font-bold text-[var(--ink-950)] mb-4 uppercase tracking-wider">Trading Restrictions</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { key: 'is_news_trading_allowed', label: 'News Trading' },
                      { key: 'is_weekend_holding_allowed', label: 'Weekend Holding' },
                      { key: 'is_ea_allowed', label: 'EA Trading' },
                      { key: 'is_hedging_allowed', label: 'Hedging' },
                      { key: 'is_copy_trading_allowed', label: 'Copy Trading' },
                      { key: 'is_martingale_allowed', label: 'Martingale' },
                      { key: 'is_grid_trading_allowed', label: 'Grid Trading' },
                    ].map(param => (
                      <div key={param.key} className="flex items-center gap-2.5">
                        <input 
                          type="checkbox" 
                          id={param.key}
                          checked={(formData as any)[param.key]}
                          onChange={e => setFormData({...formData, [param.key]: e.target.checked})}
                          className="w-4 h-4 rounded border-[var(--dash-hairline)] text-[var(--accent)] focus:ring-[var(--accent)]"
                        />
                        <label htmlFor={param.key} className="text-[13px] font-medium text-[var(--ink-700)] cursor-pointer select-none">
                          Allow {param.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </form>
            </div>

            <div className="flex gap-3 border-t border-[var(--dash-hairline)] bg-[var(--dash-canvas)] p-4">
              <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" form="rule-form" className="flex-1">
                Save Rule Template
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
