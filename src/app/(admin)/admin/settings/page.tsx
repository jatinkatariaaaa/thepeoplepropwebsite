"use client";

import { useState, useEffect } from "react";
import { Settings, Globe, Palette, ShieldCheck, Save } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "branding" | "seo" | "security">("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [formData, setFormData] = useState<Record<string, string>>({
    // General
    maintenance_mode: "false",
    announcement_text: "",
    // Branding
    brand_name: "The People Prop",
    logo_url: "",
    favicon_url: "",
    primary_color: "#cbfb45",
    // SEO
    default_meta_title: "",
    default_meta_description: "",
    // Security
    max_login_attempts: "5",
    session_timeout_hours: "24"
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        
        if (data.raw && data.raw.length > 0) {
          const newFormData = { ...formData };
          data.raw.forEach((s: any) => {
            newFormData[s.key] = s.value;
          });
          setFormData(newFormData);
        }
      } catch (e) {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async (category: string, keys: string[]) => {
    setSaving(true);
    try {
      const updates = keys.map(key => ({
        category,
        key,
        value: formData[key]
      }));

      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      toast.success(`${category.charAt(0).toUpperCase() + category.slice(1)} settings saved`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-2 border-[var(--ink-200)] border-t-[var(--ink-950)] rounded-full animate-spin"></div></div>;

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--ink-950)] flex items-center gap-2">
          <Settings className="w-6 h-6" /> System Settings
        </h1>
        <p className="text-[var(--ink-500)] mt-1">Configure global preferences, branding, and security policies.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          <button
            onClick={() => setActiveTab("general")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${
              activeTab === "general" ? "bg-[var(--ink-950)] text-white" : "text-[var(--ink-500)] hover:bg-[var(--paper-2)] hover:text-[var(--ink-950)]"
            }`}
          >
            <Settings className="w-5 h-5" /> General
          </button>
          <button
            onClick={() => setActiveTab("branding")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${
              activeTab === "branding" ? "bg-[var(--ink-950)] text-white" : "text-[var(--ink-500)] hover:bg-[var(--paper-2)] hover:text-[var(--ink-950)]"
            }`}
          >
            <Palette className="w-5 h-5" /> Branding
          </button>
          <button
            onClick={() => setActiveTab("seo")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${
              activeTab === "seo" ? "bg-[var(--ink-950)] text-white" : "text-[var(--ink-500)] hover:bg-[var(--paper-2)] hover:text-[var(--ink-950)]"
            }`}
          >
            <Globe className="w-5 h-5" /> SEO
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors ${
              activeTab === "security" ? "bg-[var(--ink-950)] text-white" : "text-[var(--ink-500)] hover:bg-[var(--paper-2)] hover:text-[var(--ink-950)]"
            }`}
          >
            <ShieldCheck className="w-5 h-5" /> Security
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl border border-[var(--border)] p-6 md:p-8 shadow-sm">
          
          {activeTab === "general" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[var(--ink-950)] mb-4">General Settings</h2>
                <div className="space-y-5">
                  <div className="flex items-center justify-between p-4 bg-[var(--paper-2)] rounded-xl border border-[var(--border)]">
                    <div>
                      <h3 className="font-bold text-[var(--ink-950)]">Maintenance Mode</h3>
                      <p className="text-sm text-[var(--ink-500)]">Disable public access to the website temporarily.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={formData.maintenance_mode === "true"} 
                        onChange={(e) => handleChange("maintenance_mode", e.target.checked ? "true" : "false")} 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                    </label>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-[var(--border)] flex justify-end">
                <button 
                  onClick={() => handleSave("general", ["maintenance_mode"])} 
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[var(--ink-950)] text-white rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === "branding" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[var(--ink-950)] mb-4">Branding & Identity</h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-[var(--ink-950)]">Brand Name</label>
                    <input 
                      type="text" 
                      value={formData.brand_name} 
                      onChange={(e) => handleChange("brand_name", e.target.value)} 
                      className="w-full max-w-md border border-[var(--border)] rounded-xl p-3 outline-none focus:border-[var(--ink-950)]" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-[var(--ink-950)]">Logo URL (Absolute URL)</label>
                    <input 
                      type="url" 
                      value={formData.logo_url} 
                      onChange={(e) => handleChange("logo_url", e.target.value)} 
                      placeholder="https://..."
                      className="w-full max-w-md border border-[var(--border)] rounded-xl p-3 outline-none focus:border-[var(--ink-950)]" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-[var(--ink-950)]">Primary Color (Hex)</label>
                    <div className="flex items-center gap-3 max-w-md">
                      <input 
                        type="color" 
                        value={formData.primary_color} 
                        onChange={(e) => handleChange("primary_color", e.target.value)} 
                        className="w-12 h-12 p-1 rounded-lg border border-[var(--border)] cursor-pointer" 
                      />
                      <input 
                        type="text" 
                        value={formData.primary_color} 
                        onChange={(e) => handleChange("primary_color", e.target.value)} 
                        className="flex-1 border border-[var(--border)] rounded-xl p-3 outline-none focus:border-[var(--ink-950)] uppercase font-mono" 
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-[var(--border)] flex justify-end">
                <button 
                  onClick={() => handleSave("branding", ["brand_name", "logo_url", "favicon_url", "primary_color"])} 
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[var(--ink-950)] text-white rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === "seo" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[var(--ink-950)] mb-4">Global SEO</h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-[var(--ink-950)]">Default Meta Title</label>
                    <input 
                      type="text" 
                      value={formData.default_meta_title} 
                      onChange={(e) => handleChange("default_meta_title", e.target.value)} 
                      className="w-full border border-[var(--border)] rounded-xl p-3 outline-none focus:border-[var(--ink-950)]" 
                      placeholder="The People Prop - Best Prop Trading Firm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1 text-[var(--ink-950)]">Default Meta Description</label>
                    <textarea 
                      value={formData.default_meta_description} 
                      onChange={(e) => handleChange("default_meta_description", e.target.value)} 
                      className="w-full border border-[var(--border)] rounded-xl p-3 outline-none focus:border-[var(--ink-950)] resize-none" 
                      rows={4}
                      placeholder="Pass our challenge and get funded up to $200k..."
                    />
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-[var(--border)] flex justify-end">
                <button 
                  onClick={() => handleSave("seo", ["default_meta_title", "default_meta_description"])} 
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[var(--ink-950)] text-white rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[var(--ink-950)] mb-4">Security Policies</h2>
                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-6 max-w-lg">
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-[var(--ink-950)]">Max Login Attempts</label>
                      <input 
                        type="number" 
                        value={formData.max_login_attempts} 
                        onChange={(e) => handleChange("max_login_attempts", e.target.value)} 
                        className="w-full border border-[var(--border)] rounded-xl p-3 outline-none focus:border-[var(--ink-950)]" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1 text-[var(--ink-950)]">Session Timeout (Hrs)</label>
                      <input 
                        type="number" 
                        value={formData.session_timeout_hours} 
                        onChange={(e) => handleChange("session_timeout_hours", e.target.value)} 
                        className="w-full border border-[var(--border)] rounded-xl p-3 outline-none focus:border-[var(--ink-950)]" 
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-[var(--border)] flex justify-end">
                <button 
                  onClick={() => handleSave("security", ["max_login_attempts", "session_timeout_hours"])} 
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[var(--ink-950)] text-white rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
