"use client";

import { useState, useEffect } from "react";
import { Mail, Settings, LayoutTemplate, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminEmailPage() {
  const [activeTab, setActiveTab] = useState<"settings" | "templates" | "test">("settings");
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [settings, setSettings] = useState<any>({});
  const [templates, setTemplates] = useState<any[]>([]);
  
  // Form states for settings
  const [host, setHost] = useState("");
  const [port, setPort] = useState("");
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [fromName, setFromName] = useState("");

  // Test email state
  const [testEmail, setTestEmail] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/email");
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
          setHost(data.settings.smtp_host || "");
          setPort(data.settings.smtp_port?.toString() || "587");
          setUser(data.settings.smtp_user || "");
          setPass(data.settings.smtp_pass || "");
          setFromEmail(data.settings.from_email || "");
          setFromName(data.settings.from_name || "The People Prop");
        }
        if (data.templates) setTemplates(data.templates);
      } catch (e) {
        toast.error("Failed to load email data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSaveSettings = async () => {
    try {
      const res = await fetch("/api/admin/email", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "settings",
          smtp_host: host,
          smtp_port: parseInt(port),
          smtp_user: user,
          smtp_pass: pass,
          from_email: fromEmail,
          from_name: fromName,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSettings(data.settings);
      toast.success("SMTP settings saved");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail) return toast.error("Please enter an email address");
    try {
      const res = await fetch("/api/admin/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to_email: testEmail }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success(data.message);
      setTestEmail("");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><div className="w-8 h-8 border-2 border-[var(--ink-200)] border-t-[var(--ink-950)] rounded-full animate-spin"></div></div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out pb-12">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-ink">
            <Mail className="w-6 h-6" /> Email Management
          </h1>
          <p className="text-[var(--ink-500)] mt-1">Configure SMTP servers and customize email templates.</p>
        </div>
        {settings.is_configured ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#a7f0ba] text-[#0e6027] rounded-full text-sm font-bold">
            <CheckCircle2 className="w-4 h-4" /> SMTP Configured
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#fcf4d6] text-[#8e6a00] rounded-full text-sm font-bold">
            <AlertCircle className="w-4 h-4" /> SMTP Not Configured
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-6 border-b border-[var(--dash-hairline)] overflow-x-auto">
        <button
          onClick={() => setActiveTab("settings")}
          className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === "settings" ? "border-[var(--ink-950)] text-[var(--ink-950)]" : "border-transparent text-[var(--ink-500)] hover:text-[var(--ink-950)]"}`}
        >
          <Settings className="w-4 h-4" /> SMTP Settings
        </button>
        <button
          onClick={() => setActiveTab("templates")}
          className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === "templates" ? "border-[var(--ink-950)] text-[var(--ink-950)]" : "border-transparent text-[var(--ink-500)] hover:text-[var(--ink-950)]"}`}
        >
          <LayoutTemplate className="w-4 h-4" /> Templates
        </button>
        <button
          onClick={() => setActiveTab("test")}
          className={`flex items-center gap-2 px-4 py-3 font-semibold text-sm border-b-2 transition-colors ${activeTab === "test" ? "border-[var(--ink-950)] text-[var(--ink-950)]" : "border-transparent text-[var(--ink-500)] hover:text-[var(--ink-950)]"}`}
        >
          <Send className="w-4 h-4" /> Test Email
        </button>
      </div>

      {activeTab === "settings" && (
        <div className="max-w-2xl dash-card p-5">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-ink-700">SMTP Host</label>
                <input type="text" value={host} onChange={e => setHost(e.target.value)} placeholder="smtp.resend.com" className="w-full rounded-none border border-[var(--dash-hairline)] bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink-400" />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-ink-700">SMTP Port</label>
                <input type="number" value={port} onChange={e => setPort(e.target.value)} placeholder="587" className="w-full rounded-none border border-[var(--dash-hairline)] bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink-400" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-ink-700">SMTP Username</label>
                <input type="text" value={user} onChange={e => setUser(e.target.value)} placeholder="resend" className="w-full rounded-none border border-[var(--dash-hairline)] bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink-400" />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-ink-700">SMTP Password</label>
                <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" className="w-full rounded-none border border-[var(--dash-hairline)] bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink-400" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-[var(--dash-hairline)] pt-4 mt-2">
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-ink-700">From Email</label>
                <input type="email" value={fromEmail} onChange={e => setFromEmail(e.target.value)} placeholder="noreply@thepeopleprop.live" className="w-full rounded-none border border-[var(--dash-hairline)] bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink-400" />
              </div>
              <div>
                <label className="mb-1.5 block text-[13px] font-medium text-ink-700">From Name</label>
                <input type="text" value={fromName} onChange={e => setFromName(e.target.value)} placeholder="The People Prop" className="w-full rounded-none border border-[var(--dash-hairline)] bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink-400" />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button onClick={handleSaveSettings} className="px-6 py-2.5 carbon-btn-primary">
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "templates" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((t) => (
            <div key={t.slug} className="dash-card p-5 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-[var(--ink-950)] text-lg">{t.name}</h3>
                  <span className={`w-2.5 h-2.5 rounded-full ${t.is_active ? "bg-emerald-500" : "bg-gray-300"}`}></span>
                </div>
                <p className="text-[13px] text-[var(--ink-500)] line-clamp-2 mb-4 font-medium">Subject: {t.subject}</p>
              </div>
              <Link 
                href={`/admin/email/templates/${t.slug}`}
                className="block text-center w-full py-2 bg-[var(--dash-canvas)] border border-[var(--dash-hairline)] text-[var(--ink-950)] font-semibold rounded-none hover:bg-ink-100 transition-colors"
              >
                Edit Template
              </Link>
            </div>
          ))}
        </div>
      )}

      {activeTab === "test" && (
        <div className="max-w-xl dash-card p-5 text-center">
          <div className="w-16 h-16 bg-[var(--dash-canvas)] rounded-full flex items-center justify-center mx-auto mb-4 border border-[var(--dash-hairline)]">
            <Send className="w-8 h-8 text-[var(--ink-600)]" />
          </div>
          <h2 className="text-xl font-bold text-[var(--ink-950)] mb-2">Send Test Email</h2>
          <p className="text-sm text-[var(--ink-500)] mb-6">Verify that your SMTP configuration is working correctly.</p>
          
          <div className="flex gap-2">
            <input 
              type="email" 
              value={testEmail} 
              onChange={e => setTestEmail(e.target.value)} 
              placeholder="Enter your email address" 
              className="flex-1 border border-[var(--dash-hairline)] rounded-none p-3 outline-none focus:border-[var(--ink-950)]" 
            />
            <button 
              onClick={handleSendTest} 
              className="px-6 carbon-btn-primary"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
