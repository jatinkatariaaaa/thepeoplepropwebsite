"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Code, Variable } from "lucide-react";
import { toast } from "sonner";

export default function TemplateEditorPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;
  const router = useRouter();

  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const res = await fetch("/api/admin/email");
        const data = await res.json();
        const t = data.templates?.find((x: any) => x.slug === slug);
        
        if (t) {
          setTemplate(t);
          setSubject(t.subject || "");
          setBodyHtml(t.body_html || "");
          setIsActive(t.is_active);
        } else {
          toast.error("Template not found");
          router.push("/admin/email");
        }
      } catch (e) {
        toast.error("Failed to load template");
      } finally {
        setLoading(false);
      }
    };
    fetchTemplate();
  }, [slug, router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/email", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "template",
          slug,
          subject,
          body_html: bodyHtml,
          is_active: isActive,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      toast.success("Template saved successfully");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-12 text-center text-[var(--ink-400)]">Loading editor...</div>;
  if (!template) return null;

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/email" className="p-2 bg-white border border-[var(--dash-hairline)] rounded-xl hover:bg-[var(--dash-canvas)] transition-colors">
            <ArrowLeft className="w-5 h-5 text-[var(--ink-600)]" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[var(--ink-950)]">{template.name}</h1>
            <p className="text-[13px] text-[var(--ink-500)] font-mono">{slug}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? "bg-emerald-500" : "bg-gray-300"}`}>
              <input type="checkbox" className="sr-only" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? "translate-x-6" : "translate-x-1"}`} />
            </div>
            <span className="text-sm font-semibold text-[var(--ink-950)]">{isActive ? "Active" : "Inactive"}</span>
          </label>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-ink text-[13px] font-semibold text-white transition-colors hover:bg-ink-800 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Template"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Editor Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="dash-card p-5">
            <div className="mb-6">
              <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Email Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-[var(--dash-hairline)] rounded-xl p-3 text-sm outline-none focus:border-[var(--ink-950)] bg-[var(--dash-canvas)] font-mono"
              />
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Code className="w-4 h-4 text-[var(--ink-500)]" />
                <label className="text-sm font-semibold text-[var(--ink-950)]">HTML Body</label>
              </div>
              <textarea
                value={bodyHtml}
                onChange={(e) => setBodyHtml(e.target.value)}
                className="w-full border border-[var(--dash-hairline)] rounded-xl p-4 text-[13px] font-mono outline-none focus:border-[var(--ink-950)] bg-[var(--ink-950)] text-emerald-400 min-h-[500px]"
                spellCheck="false"
              />
            </div>
          </div>
        </div>

        {/* Variables Info */}
        <div className="space-y-6">
          <div className="dash-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Variable className="w-5 h-5 text-[var(--ink-600)]" />
              <h2 className="text-lg font-bold text-[var(--ink-950)]">Variables</h2>
            </div>
            <p className="text-[13px] text-[var(--ink-500)] mb-4">
              You can use these variables in the Subject and HTML Body. They will be replaced dynamically when sending.
            </p>
            
            <div className="space-y-3">
              {(template.variables || []).map((v: string) => (
                <div key={v} className="p-3 bg-[var(--dash-canvas)] border border-[var(--dash-hairline)] rounded-xl">
                  <p className="font-mono text-[13px] font-bold text-[var(--ink-950)]">{`{{${v}}}`}</p>
                </div>
              ))}
              {(!template.variables || template.variables.length === 0) && (
                <p className="text-sm text-center text-[var(--ink-400)] py-4 border border-dashed rounded-xl border-[var(--dash-hairline)]">
                  No specific variables configured for this template.
                </p>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-[var(--dash-hairline)]">
              <p className="text-[12px] font-bold text-[var(--ink-400)] uppercase tracking-wider mb-2">Global Variables</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center"><code className="text-[11px] bg-gray-100 px-1 rounded">{"{{user_name}}"}</code></div>
                <div className="flex justify-between items-center"><code className="text-[11px] bg-gray-100 px-1 rounded">{"{{user_email}}"}</code></div>
                <div className="flex justify-between items-center"><code className="text-[11px] bg-gray-100 px-1 rounded">{"{{app_url}}"}</code></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
