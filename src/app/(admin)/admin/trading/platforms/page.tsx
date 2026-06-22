"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/Button";
import { Plus, Edit2, Boxes, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PlatformsAdminPage() {
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<any>(null);
  const [formData, setFormData] = useState<any>({
    name: "",
    extra_fee_pct: 0,
    is_active: true,
    api_url: "",
    api_key: "",
    server_name: ""
  });

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    fetchPlatforms();
  }, []);

  async function fetchPlatforms() {
    setLoading(true);
    const { data, error } = await supabase
      .from("tpp_platforms")
      .select("*")
      .order("created_at", { ascending: true });
    
    if (!error && data) {
      setPlatforms(data);
    }
    setLoading(false);
  }

  function openNewModal() {
    setEditingPlatform(null);
    setFormData({
      name: "",
      extra_fee_pct: 0,
      is_active: true,
      api_url: "",
      api_key: "",
      server_name: ""
    } as any);
    setIsModalOpen(true);
  }

  function openEditModal(platform: any) {
    setEditingPlatform(platform);
    setFormData({
      name: platform.name,
      extra_fee_pct: platform.extra_fee_pct,
      is_active: platform.is_active,
      api_url: platform.api_url || "",
      api_key: platform.api_key || "",
      server_name: platform.server_name || ""
    } as any);
    setIsModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (editingPlatform) {
      const { error } = await supabase
        .from("tpp_platforms")
        .update(formData)
        .eq("id", editingPlatform.id);
      if (!error) {
        setIsModalOpen(false);
        fetchPlatforms();
      } else {
        alert("Error updating platform: " + error.message);
      }
    } else {
      const { error } = await supabase
        .from("tpp_platforms")
        .insert([formData]);
      if (!error) {
        setIsModalOpen(false);
        fetchPlatforms();
      } else {
        alert("Error creating platform: " + error.message);
      }
    }
  }

  if (loading && platforms.length === 0) return <div className="p-10 animate-pulse bg-[var(--paper)] rounded-xl h-40" />;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--ink-950)]">Platforms</h1>
          <p className="text-[var(--ink-500)] text-[14px]">Manage trading platforms and their extra fee percentages.</p>
        </div>
        <Button onClick={openNewModal} className="shrink-0 gap-2">
          <Plus className="w-4 h-4" /> Add Platform
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {platforms.map(plat => (
          <div key={plat.id} className={cn(
            "bg-white rounded-2xl p-5 border shadow-sm transition-all relative overflow-hidden",
            plat.is_active ? "border-[var(--border)]" : "border-red-100 bg-red-50/30 opacity-70"
          )}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--paper-2)] border border-[var(--border)] flex items-center justify-center">
                  <Boxes className="w-5 h-5 text-[var(--ink-600)]" />
                </div>
                <div>
                  <h3 className="font-bold text-[16px] text-[var(--ink-950)] leading-none">{plat.name}</h3>
                  <span className={cn(
                    "inline-flex mt-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider",
                    plat.is_active ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                  )}>
                    {plat.is_active ? "Active" : "Disabled"}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => openEditModal(plat)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--paper-2)] text-[var(--ink-400)] hover:text-[var(--ink-950)] transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-4 border-t border-[var(--border)]">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[var(--ink-500)]">Extra Fee</span>
                <span className={cn("font-bold", plat.extra_fee_pct > 0 ? "text-[var(--ink-950)]" : "text-emerald-600")}>
                  {plat.extra_fee_pct > 0 ? `+${plat.extra_fee_pct}%` : "Free"}
                </span>
              </div>
            </div>
          </div>
        ))}

        {platforms.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-[var(--border)] rounded-2xl">
            <Boxes className="w-8 h-8 text-[var(--ink-400)] mx-auto mb-3" />
            <p className="text-[var(--ink-500)] font-medium">No platforms found. Add one to get started.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-5 border-b border-[var(--border)]">
              <h2 className="font-bold text-[18px] text-[var(--ink-950)]">
                {editingPlatform ? "Edit Platform" : "Add Platform"}
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--paper-2)] text-[var(--ink-400)] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto">
              <form id="platform-form" onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-[12px] font-bold text-[var(--ink-700)] mb-1.5">Platform Name</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-[var(--paper-2)] border border-[var(--border)] rounded-xl h-11 px-4 text-[14px] focus:outline-none focus:border-[var(--ink-400)]"
                    placeholder="e.g. MetaTrader 5"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[12px] font-bold text-[var(--ink-700)] mb-1.5">API URL</label>
                    <input 
                      type="url" 
                      value={formData.api_url || ""}
                      onChange={e => setFormData({...formData, api_url: e.target.value})}
                      className="w-full bg-[var(--paper-2)] border border-[var(--border)] rounded-xl h-11 px-4 text-[14px] focus:outline-none focus:border-[var(--ink-400)]"
                      placeholder="https://api.broker.com"
                    />
                  </div>
                  <div>
                    <label className="block text-[12px] font-bold text-[var(--ink-700)] mb-1.5">Server Name</label>
                    <input 
                      type="text" 
                      value={formData.server_name || ""}
                      onChange={e => setFormData({...formData, server_name: e.target.value})}
                      className="w-full bg-[var(--paper-2)] border border-[var(--border)] rounded-xl h-11 px-4 text-[14px] focus:outline-none focus:border-[var(--ink-400)]"
                      placeholder="Broker-Live"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[var(--ink-700)] mb-1.5">API Key</label>
                  <input 
                    type="password" 
                    value={formData.api_key || ""}
                    onChange={e => setFormData({...formData, api_key: e.target.value})}
                    className="w-full bg-[var(--paper-2)] border border-[var(--border)] rounded-xl h-11 px-4 text-[14px] focus:outline-none focus:border-[var(--ink-400)]"
                    placeholder="Secret Key (hidden after saving)"
                  />
                </div>
                
                <div>
                  <label className="block text-[12px] font-bold text-[var(--ink-700)] mb-1.5">Extra Fee Percentage (%)</label>
                  <input 
                    type="number" 
                    required
                    min="0"
                    step="0.01"
                    value={formData.extra_fee_pct}
                    onChange={e => setFormData({...formData, extra_fee_pct: parseFloat(e.target.value) || 0})}
                    className="w-full bg-[var(--paper-2)] border border-[var(--border)] rounded-xl h-11 px-4 text-[14px] focus:outline-none focus:border-[var(--ink-400)]"
                  />
                  <p className="text-[11px] text-[var(--ink-500)] mt-1.5">
                    Enter 0 for Free, or 10 for a +10% extra fee on checkout.
                  </p>
                </div>
                
                <div className="flex items-center gap-3 pt-2">
                  <input 
                    type="checkbox" 
                    id="is_active"
                    checked={formData.is_active}
                    onChange={e => setFormData({...formData, is_active: e.target.checked})}
                    className="w-4 h-4 rounded border-[var(--border)] text-[var(--accent)] focus:ring-[var(--accent)]"
                  />
                  <label htmlFor="is_active" className="text-[14px] font-medium text-[var(--ink-700)] cursor-pointer">
                    Platform is Active
                  </label>
                </div>
              </form>
            </div>

            <div className="p-5 border-t border-[var(--border)] bg-[var(--paper)] flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" form="platform-form" className="flex-1">
                Save Platform
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
