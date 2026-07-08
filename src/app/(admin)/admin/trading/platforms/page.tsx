"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Button } from "@/components/ui/Button";
import { Plus, Edit2, Boxes, X, Wifi, Activity, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function PlatformsAdminPage() {
  const [platforms, setPlatforms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);
  
  // connection status: { [platformId]: { status: 'loading' | 'ok' | 'error' | 'missing', ms?: number, message?: string } }
  const [connectionStatus, setConnectionStatus] = useState<Record<string, any>>({});
  
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
      // Auto-test all platforms
      data.forEach(p => {
        if (p.is_active) {
          testPlatformConnection(p);
        }
      });
    }
    setLoading(false);
  }

  async function testPlatformConnection(platform: any) {
    if (!platform.api_url || !platform.api_key) {
       setConnectionStatus(prev => ({ ...prev, [platform.id]: { status: 'missing', message: 'API URL or Key missing. Click Edit to add them.' } }));
       return;
    }

    setConnectionStatus(prev => ({ ...prev, [platform.id]: { status: 'loading' } }));
    setTestingId(platform.id);
    
    try {
      const res = await fetch("/api/admin/trading/platforms/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platformId: platform.id })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setConnectionStatus(prev => ({ ...prev, [platform.id]: { status: 'ok', ms: data.latencyMs, message: data.message } }));
      } else {
        setConnectionStatus(prev => ({ ...prev, [platform.id]: { status: 'error', message: data.message || data.error } }));
      }
    } catch (e: any) {
      setConnectionStatus(prev => ({ ...prev, [platform.id]: { status: 'error', message: e.message } }));
    } finally {
      setTestingId(null);
    }
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
        toast.success("Platform updated");
      } else {
        toast.error("Error updating platform: " + error.message);
      }
    } else {
      const { error } = await supabase
        .from("tpp_platforms")
        .insert([formData]);
      if (!error) {
        setIsModalOpen(false);
        fetchPlatforms();
        toast.success("Platform added");
      } else {
        toast.error("Error creating platform: " + error.message);
      }
    }
  }

  if (loading && platforms.length === 0) return <div className="p-10 animate-pulse bg-[var(--paper)] rounded-xl h-40" />;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[var(--paper)] p-6 rounded-3xl border border-[var(--border)] shadow-sm">
        <div>
          <h1 className="text-2xl font-display font-bold text-[var(--ink-950)] flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-500" /> Terminal Connection
          </h1>
          <p className="text-[var(--ink-500)] text-[14px] mt-1">
            Real-time status of your TPP Trading Terminal. 
          </p>
        </div>
        <Button onClick={openNewModal} variant="outline" className="shrink-0 gap-2">
          <Plus className="w-4 h-4" /> Custom Terminal
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {platforms.map(plat => {
           const status = connectionStatus[plat.id];
           
           return (
          <div key={plat.id} className={cn(
            "bg-white rounded-3xl p-6 border shadow-xl shadow-black/5 transition-all relative overflow-hidden",
            plat.is_active ? "border-[var(--border)]" : "border-red-100 bg-red-50/30 opacity-70"
          )}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center shadow-lg shadow-gray-900/20">
                  <Boxes className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[var(--ink-950)] leading-none mb-1.5">{plat.name}</h3>
                  <div className="flex gap-2 items-center">
                    <span className={cn(
                      "inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
                      plat.is_active ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"
                    )}>
                      {plat.is_active ? "Active Platform" : "Disabled"}
                    </span>
                    <span className="text-[12px] font-mono text-[var(--ink-400)]">{plat.server_name || "N/A"}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => openEditModal(plat)}
                title="Edit Configuration"
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-[var(--paper-2)] border border-[var(--border)] text-[var(--ink-500)] hover:text-[var(--ink-950)] hover:border-[var(--ink-950)] transition-all"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            {/* Live Connection Status Board */}
            <div className="bg-[var(--paper-2)] rounded-2xl p-4 border border-[var(--border)] mb-4">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-[12px] font-bold text-[var(--ink-500)] uppercase tracking-wider">Live System Status</span>
                  <button 
                    onClick={() => testPlatformConnection(plat)}
                    disabled={status?.status === 'loading'}
                    className={cn(
                      "flex items-center gap-1.5 text-[12px] font-bold transition-colors",
                      status?.status === 'loading' ? "text-blue-500 animate-pulse" : "text-blue-600 hover:text-blue-800"
                    )}
                  >
                    <Wifi className="w-3.5 h-3.5" /> 
                    {status?.status === 'loading' ? "Pinging..." : "Re-ping"}
                  </button>
               </div>
               
               {(!status || status.status === 'loading') && (
                  <div className="flex items-center gap-3 text-[var(--ink-600)] font-medium text-sm py-2">
                     <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                     Establishing connection to terminal API...
                  </div>
               )}
               
               {status?.status === 'ok' && (
                 <div className="flex flex-col gap-2 py-1">
                   <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      TERMINAL ONLINE & CONNECTED
                   </div>
                   <p className="text-[13px] text-[var(--ink-600)]">
                     The system is actively communicating with the terminal. Connection latency: <strong>{status.ms}ms</strong>. Ready to create accounts and process live metrics!
                   </p>
                 </div>
               )}
               
               {status?.status === 'error' && (
                 <div className="flex flex-col gap-2 py-1">
                   <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      TERMINAL OFFLINE OR UNACHIEVABLE
                   </div>
                   <p className="text-[13px] text-red-500/80">
                     {status.message}
                   </p>
                   <p className="text-[12px] text-[var(--ink-500)] mt-1">
                     Click the edit button to verify your API URL and Secret Key. Make sure your terminal server is running.
                   </p>
                 </div>
               )}
               
               {status?.status === 'missing' && (
                 <div className="flex flex-col gap-2 py-1">
                   <div className="flex items-center gap-2 text-amber-600 font-bold text-sm">
                      <AlertCircle className="w-5 h-5 text-amber-500" />
                      API CONFIGURATION REQUIRED
                   </div>
                   <p className="text-[13px] text-amber-600/80">
                     {status.message}
                   </p>
                 </div>
               )}
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[var(--ink-500)] font-medium">Extra Fee Configuration</span>
                <span className={cn("font-bold px-2 py-1 rounded-lg", plat.extra_fee_pct > 0 ? "bg-[var(--ink-950)] text-white" : "bg-emerald-100 text-emerald-700")}>
                  {plat.extra_fee_pct > 0 ? `+${plat.extra_fee_pct}% Fee` : "Free Delivery"}
                </span>
              </div>
            </div>
          </div>
        )})}

        {platforms.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-[var(--border)] rounded-3xl bg-[var(--paper-2)]">
            <Boxes className="w-10 h-10 text-[var(--ink-300)] mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[var(--ink-950)] mb-1">No Terminal Connected</h3>
            <p className="text-[var(--ink-500)] font-medium max-w-sm mx-auto">Click "Custom Terminal" above to connect your TPP Trading Terminal.</p>
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
