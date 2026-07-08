"use client";

import { useState, useEffect } from "react";
import {
  Settings, Globe, Palette, ShieldCheck, Save, Server, Mail,
  Lock, Clock, ToggleLeft, ToggleRight, RefreshCw, Shield,
  CheckCircle, AlertTriangle, KeyRound, Eye, EyeOff
} from "lucide-react";
import { toast } from "sonner";

type SettingsTab = "general" | "branding" | "trading" | "email" | "security";

interface SettingValue {
  category: string;
  key: string;
  value: string;
}

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        const data = await res.json();
        if (data.raw && data.raw.length > 0) {
          const newFormData: Record<string, string> = {};
          data.raw.forEach((s: any) => {
            newFormData[s.key] = s.value;
          });
          setFormData(newFormData);
        }
      } catch {
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

  const handleToggle = (key: string) => {
    setFormData(prev => ({ ...prev, [key]: prev[key] === "true" ? "false" : "true" }));
  };

  const handleSave = async (category: string, keys: string[]) => {
    setSaving(true);
    try {
      const updates = keys.map(key => ({
        category,
        key,
        value: formData[key] || ""
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

  if (loading) return (
    <div className="flex justify-center p-12">
      <div className="w-8 h-8 border-2 border-[var(--ink-200)] border-t-[var(--ink-950)] rounded-full animate-spin" />
    </div>
  );

  const tabs: { id: SettingsTab; label: string; icon: typeof Settings }[] = [
    { id: "general", label: "General", icon: Settings },
    { id: "branding", label: "Branding", icon: Palette },
    { id: "trading", label: "Trading", icon: Server },
    { id: "email", label: "Email", icon: Mail },
    { id: "security", label: "Security", icon: ShieldCheck },
  ];

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out pb-12">
      <div className="mb-8">
        <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-ink">
          <Settings className="w-6 h-6" /> System Settings
        </h1>
        <p className="text-[var(--ink-500)] mt-1">Configure global preferences, branding, trading, email, and security policies.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-none font-semibold transition-colors ${
                  activeTab === tab.id ? "bg-[var(--carbon-blue)] text-white" : "text-[var(--ink-500)] hover:bg-[var(--dash-canvas)] hover:text-[var(--ink-950)]"
                }`}
              >
                <Icon className="w-5 h-5" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 dash-card p-5 md:p-8 shadow-sm">

          {activeTab === "general" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[var(--ink-950)] mb-4">General Settings</h2>
                <div className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Company Name</label>
                    <input
                      type="text"
                      value={formData.company_name || ""}
                      onChange={(e) => handleChange("company_name", e.target.value)}
                      className="w-full max-w-md border border-[var(--dash-hairline)] rounded-none p-3 outline-none focus:border-[var(--ink-950)]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-6 max-w-md">
                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Timezone</label>
                      <select
                        value={formData.timezone || "UTC"}
                        onChange={(e) => handleChange("timezone", e.target.value)}
                        className="w-full border border-[var(--dash-hairline)] rounded-none p-3 outline-none bg-white"
                      >
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">EST (New York)</option>
                        <option value="America/Chicago">CST (Chicago)</option>
                        <option value="America/Denver">MST (Denver)</option>
                        <option value="America/Los_Angeles">PST (Los Angeles)</option>
                        <option value="Europe/London">GMT (London)</option>
                        <option value="Europe/Paris">CET (Paris)</option>
                        <option value="Asia/Dubai">GST (Dubai)</option>
                        <option value="Asia/Tokyo">JST (Tokyo)</option>
                        <option value="Australia/Sydney">AEST (Sydney)</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Currency</label>
                      <select
                        value={formData.currency || "USD"}
                        onChange={(e) => handleChange("currency", e.target.value)}
                        className="w-full border border-[var(--dash-hairline)] rounded-none p-3 outline-none bg-white"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="JPY">JPY (¥)</option>
                        <option value="AUD">AUD (A$)</option>
                        <option value="CAD">CAD (C$)</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-none border border-[var(--dash-hairline)] bg-[var(--dash-canvas)] p-4 border border-[var(--dash-hairline)] max-w-md">
                    <div>
                      <h3 className="font-bold text-[var(--ink-950)]">Maintenance Mode</h3>
                      <p className="text-sm text-[var(--ink-500)]">Disable public access to the website temporarily.</p>
                    </div>
                    <button onClick={() => handleToggle("maintenance_mode")} className="relative inline-flex items-center cursor-pointer">
                      <div className={`w-11 h-6 rounded-full transition-colors ${formData.maintenance_mode === "true" ? "bg-red-500" : "bg-gray-200"}`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${formData.maintenance_mode === "true" ? "translate-x-5" : "translate-x-0.5"} mt-0.5`} />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-[var(--dash-hairline)] flex justify-end">
                <button
                  onClick={() => handleSave("general", ["company_name", "timezone", "currency", "maintenance_mode"])}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 carbon-btn-primary disabled:opacity-50"
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
                    <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Brand Name</label>
                    <input
                      type="text"
                      value={formData.brand_name || ""}
                      onChange={(e) => handleChange("brand_name", e.target.value)}
                      className="w-full max-w-md border border-[var(--dash-hairline)] rounded-none p-3 outline-none focus:border-[var(--ink-950)]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Logo URL (Absolute URL)</label>
                    <input
                      type="url"
                      value={formData.logo_url || ""}
                      onChange={(e) => handleChange("logo_url", e.target.value)}
                      placeholder="https://..."
                      className="w-full max-w-md border border-[var(--dash-hairline)] rounded-none p-3 outline-none focus:border-[var(--ink-950)]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Favicon URL</label>
                    <input
                      type="url"
                      value={formData.favicon_url || ""}
                      onChange={(e) => handleChange("favicon_url", e.target.value)}
                      placeholder="https://..."
                      className="w-full max-w-md border border-[var(--dash-hairline)] rounded-none p-3 outline-none focus:border-[var(--ink-950)]"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Primary Color (Hex)</label>
                    <div className="flex items-center gap-3 max-w-md">
                      <input
                        type="color"
                        value={formData.primary_color || "#cbfb45"}
                        onChange={(e) => handleChange("primary_color", e.target.value)}
                        className="w-12 h-12 p-1 rounded-none border border-[var(--dash-hairline)] cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.primary_color || "#cbfb45"}
                        onChange={(e) => handleChange("primary_color", e.target.value)}
                        className="flex-1 border border-[var(--dash-hairline)] rounded-none p-3 outline-none focus:border-[var(--ink-950)] uppercase font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-[var(--dash-hairline)] flex justify-end">
                <button
                  onClick={() => handleSave("branding", ["brand_name", "logo_url", "favicon_url", "primary_color"])}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 carbon-btn-primary disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === "trading" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[var(--ink-950)] mb-4">Trading Configuration</h2>
                <div className="space-y-5">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Default Leverage</label>
                    <select
                      value={formData.default_leverage || "100"}
                      onChange={(e) => handleChange("default_leverage", e.target.value)}
                      className="w-full max-w-xs border border-[var(--dash-hairline)] rounded-none p-3 outline-none bg-white"
                    >
                      <option value="10">1:10</option>
                      <option value="20">1:20</option>
                      <option value="50">1:50</option>
                      <option value="100">1:100</option>
                      <option value="200">1:200</option>
                      <option value="500">1:500</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Trading Servers (JSON Array)</label>
                    <textarea
                      value={formData.trading_servers || "[]"}
                      onChange={(e) => handleChange("trading_servers", e.target.value)}
                      rows={4}
                      className="w-full max-w-md border border-[var(--dash-hairline)] rounded-none p-3 outline-none focus:border-[var(--ink-950)] font-mono text-sm resize-none"
                      placeholder='[{"name":"Server 1","host":"trade.example.com","port":443}]'
                    />
                    <p className="text-[11px] text-[var(--ink-400)] mt-1">JSON array of server objects with name, host, and port.</p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Rule Templates (JSON Array)</label>
                    <textarea
                      value={formData.rule_templates || "[]"}
                      onChange={(e) => handleChange("rule_templates", e.target.value)}
                      rows={4}
                      className="w-full max-w-md border border-[var(--dash-hairline)] rounded-none p-3 outline-none focus:border-[var(--ink-950)] font-mono text-sm resize-none"
                      placeholder='[{"name":"Standard","max_daily_drawdown":5,"max_overall_drawdown":10}]'
                    />
                    <p className="text-[11px] text-[var(--ink-400)] mt-1">JSON array of rule template objects.</p>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-[var(--dash-hairline)] flex justify-end">
                <button
                  onClick={() => handleSave("trading", ["default_leverage", "trading_servers", "rule_templates"])}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 carbon-btn-primary disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === "email" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-[var(--ink-950)] mb-4">Email Configuration</h2>
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-ink-700">SMTP Host</label>
                      <input
                        type="text"
                        value={formData.smtp_host || ""}
                        onChange={(e) => handleChange("smtp_host", e.target.value)}
                        placeholder="smtp.example.com"
                        className="w-full rounded-none border border-[var(--dash-hairline)] bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-400"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-ink-700">SMTP Port</label>
                      <input
                        type="number"
                        value={formData.smtp_port || "587"}
                        onChange={(e) => handleChange("smtp_port", e.target.value)}
                        className="w-full rounded-none border border-[var(--dash-hairline)] bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-400"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-ink-700">SMTP User</label>
                      <input
                        type="text"
                        value={formData.smtp_user || ""}
                        onChange={(e) => handleChange("smtp_user", e.target.value)}
                        className="w-full rounded-none border border-[var(--dash-hairline)] bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-400"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-ink-700">SMTP Password</label>
                      <div className="relative">
                        <input
                          type={showSmtpPass ? "text" : "password"}
                          value={formData.smtp_pass || ""}
                          onChange={(e) => handleChange("smtp_pass", e.target.value)}
                          className="w-full border border-[var(--dash-hairline)] rounded-none p-3 pr-10 outline-none focus:border-[var(--ink-950)]"
                        />
                        <button
                          onClick={() => setShowSmtpPass(!showSmtpPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-400)] hover:text-[var(--ink-950)]"
                        >
                          {showSmtpPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-none border border-[var(--dash-hairline)] bg-[var(--dash-canvas)] p-4 border border-[var(--dash-hairline)] max-w-md">
                    <div>
                      <h3 className="font-bold text-[var(--ink-950)]">Secure Connection (TLS/SSL)</h3>
                      <p className="text-sm text-[var(--ink-500)]">Use encrypted connection for SMTP.</p>
                    </div>
                    <button onClick={() => handleToggle("smtp_secure")} className="relative inline-flex items-center cursor-pointer">
                      <div className={`w-11 h-6 rounded-full transition-colors ${formData.smtp_secure === "true" ? "bg-emerald-500" : "bg-gray-200"}`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${formData.smtp_secure === "true" ? "translate-x-5" : "translate-x-0.5"} mt-0.5`} />
                      </div>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Sender Name</label>
                      <input
                        type="text"
                        value={formData.sender_name || ""}
                        onChange={(e) => handleChange("sender_name", e.target.value)}
                        className="w-full rounded-none border border-[var(--dash-hairline)] bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-400"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Sender Email</label>
                      <input
                        type="email"
                        value={formData.sender_email || ""}
                        onChange={(e) => handleChange("sender_email", e.target.value)}
                        className="w-full rounded-none border border-[var(--dash-hairline)] bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-[var(--dash-hairline)] flex justify-end">
                <button
                  onClick={() => handleSave("email", ["smtp_host", "smtp_port", "smtp_user", "smtp_pass", "smtp_secure", "sender_name", "sender_email"])}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 carbon-btn-primary disabled:opacity-50"
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
                  <div className="bg-[var(--dash-canvas)] rounded-none border border-[var(--dash-hairline)] p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <KeyRound className="w-5 h-5 text-[var(--ink-600)]" />
                      <h3 className="font-bold text-[var(--ink-950)]">Password Policy</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Minimum Length</label>
                        <input
                          type="number"
                          min={6}
                          max={32}
                          value={formData.password_min_length || "8"}
                          onChange={(e) => handleChange("password_min_length", e.target.value)}
                          className="w-full rounded-none border border-[var(--dash-hairline)] bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-400"
                        />
                      </div>
                      <div className="flex flex-col justify-end">
                        <div className="flex items-center justify-between p-3 bg-white rounded-none border border-[var(--dash-hairline)]">
                          <span className="text-sm font-semibold text-[var(--ink-950)]">Require Uppercase</span>
                          <button onClick={() => handleToggle("password_require_uppercase")} className="relative inline-flex items-center cursor-pointer">
                            <div className={`w-11 h-6 rounded-full transition-colors ${formData.password_require_uppercase === "true" ? "bg-emerald-500" : "bg-gray-200"}`}>
                              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${formData.password_require_uppercase === "true" ? "translate-x-5" : "translate-x-0.5"} mt-0.5`} />
                            </div>
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col justify-end">
                        <div className="flex items-center justify-between p-3 bg-white rounded-none border border-[var(--dash-hairline)]">
                          <span className="text-sm font-semibold text-[var(--ink-950)]">Require Number</span>
                          <button onClick={() => handleToggle("password_require_number")} className="relative inline-flex items-center cursor-pointer">
                            <div className={`w-11 h-6 rounded-full transition-colors ${formData.password_require_number === "true" ? "bg-emerald-500" : "bg-gray-200"}`}>
                              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${formData.password_require_number === "true" ? "translate-x-5" : "translate-x-0.5"} mt-0.5`} />
                            </div>
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col justify-end">
                        <div className="flex items-center justify-between p-3 bg-white rounded-none border border-[var(--dash-hairline)]">
                          <span className="text-sm font-semibold text-[var(--ink-950)]">Require Special Character</span>
                          <button onClick={() => handleToggle("password_require_special")} className="relative inline-flex items-center cursor-pointer">
                            <div className={`w-11 h-6 rounded-full transition-colors ${formData.password_require_special === "true" ? "bg-emerald-500" : "bg-gray-200"}`}>
                              <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${formData.password_require_special === "true" ? "translate-x-5" : "translate-x-0.5"} mt-0.5`} />
                            </div>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[var(--dash-canvas)] rounded-none border border-[var(--dash-hairline)] p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Clock className="w-5 h-5 text-[var(--ink-600)]" />
                      <h3 className="font-bold text-[var(--ink-950)]">Session & Login</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div>
                        <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Session Timeout (hrs)</label>
                        <input
                          type="number"
                          min={1}
                          max={168}
                          value={formData.session_timeout_hours || "24"}
                          onChange={(e) => handleChange("session_timeout_hours", e.target.value)}
                          className="w-full rounded-none border border-[var(--dash-hairline)] bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-400"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Max Login Attempts</label>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={formData.max_login_attempts || "5"}
                          onChange={(e) => handleChange("max_login_attempts", e.target.value)}
                          className="w-full rounded-none border border-[var(--dash-hairline)] bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-400"
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Lockout Duration (min)</label>
                        <input
                          type="number"
                          min={1}
                          max={1440}
                          value={formData.lockout_duration_minutes || "30"}
                          onChange={(e) => handleChange("lockout_duration_minutes", e.target.value)}
                          className="w-full rounded-none border border-[var(--dash-hairline)] bg-white px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-ink-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[var(--dash-canvas)] rounded-none border border-[var(--dash-hairline)] p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Shield className="w-5 h-5 text-[var(--ink-600)]" />
                      <h3 className="font-bold text-[var(--ink-950)]">Two-Factor Authentication</h3>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-none border border-[var(--dash-hairline)] max-w-md">
                      <div>
                        <span className="text-sm font-semibold text-[var(--ink-950)]">Require 2FA for Admins</span>
                        <p className="text-xs text-[var(--ink-500)]">Force all admin accounts to use 2FA.</p>
                      </div>
                      <button onClick={() => handleToggle("two_factor_auth")} className="relative inline-flex items-center cursor-pointer">
                        <div className={`w-11 h-6 rounded-full transition-colors ${formData.two_factor_auth === "true" ? "bg-emerald-500" : "bg-gray-200"}`}>
                          <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${formData.two_factor_auth === "true" ? "translate-x-5" : "translate-x-0.5"} mt-0.5`} />
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-white rounded-none border border-[var(--dash-hairline)] max-w-md">
                    <div>
                      <span className="text-sm font-semibold text-[var(--ink-950)]">Require Email Verification</span>
                      <p className="text-xs text-[var(--ink-500)]">Users must verify email before accessing features.</p>
                    </div>
                    <button onClick={() => handleToggle("require_email_verification")} className="relative inline-flex items-center cursor-pointer">
                      <div className={`w-11 h-6 rounded-full transition-colors ${formData.require_email_verification === "true" ? "bg-emerald-500" : "bg-gray-200"}`}>
                        <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${formData.require_email_verification === "true" ? "translate-x-5" : "translate-x-0.5"} mt-0.5`} />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-[var(--dash-hairline)] flex justify-end">
                <button
                  onClick={() => handleSave("security", [
                    "password_min_length", "password_require_uppercase", "password_require_number", "password_require_special",
                    "session_timeout_hours", "max_login_attempts", "lockout_duration_minutes",
                    "two_factor_auth", "require_email_verification"
                  ])}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 carbon-btn-primary disabled:opacity-50"
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
